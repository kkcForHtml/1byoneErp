<?php

/**
 * Created by PhpStorm.
 * User: Fable
 * Date: 2017/6/1
 * Time: 17:22
 */
namespace addons\inventory\modellogic;

use addons\inventory\models\SkAdjustment;
use addons\master\product\models\GProductSku;
use Yii;
use addons\inventory\models\SkPendingStorage;
use yii\base\Object;
use yii\db\Expression;
use yii\db\Query;
use yii\swoole\rest\CreateExt;
use yii\swoole\rest\DeleteExt;
use yii\swoole\rest\UpdateExt;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\db\DBHelper;
use yii\swoole\modellogic\BaseLogic;

class PendstorageLogic extends BaseLogic
{
    public static $modelClass = 'addons\inventory\models\SkPendingStorage';

    /**
     * GetPendingStorage
     * 查询待入库数据
     * @param $select @返回字段
     * @param $where @查询条件
     * */
    public static function GetPendingStorage($select = [], $where)
    {
        if (count($select) == 0) {
            return SkPendingStorage::find()->where($where)->asArray()->all();
        } else {
            return SkPendingStorage::find()->select($select)->where($where)->asArray()->all();
        }
    }

    //确认入库
    public static function ConfirmInventory($paramArray)
    {
        $respone = new ResponeModel();

        if (isset($paramArray['batchMTC'])) {
            $data = $paramArray['batchMTC'];

            $transaction = Yii::$app->db->beginTransaction();

            //确认入库
            $ids = array();

            $new_data = array();
            foreach ($data as $value) {

                if ($value['THE_RECEIVE_NUMBERT'] > 0) {

                    if (isset($value['NOTE_ID']))
                        $condition['NOTE_ID'] = $value['NOTE_ID'];

                    $condition['PENDING_STORAGE_ID'] = $value['PENDING_STORAGE_ID'];

                    $skuPendStr = self::getPendstorage($condition);

                    if ($skuPendStr) {
                        $skuPendStr['RECEIVE_NUMBER'] += $value['THE_RECEIVE_NUMBERT'];
                        if (isset($value['ACTUAL_AT']))
                            $skuPendStr['ACTUAL_AT'] = $value['ACTUAL_AT'];
                        $res = self::updatePendstorage($skuPendStr);
                    }

                    $skuPendStr['THE_RECEIVE_NUMBERT'] = $value['THE_RECEIVE_NUMBERT'];

                    if ($skuPendStr['IMPORT_STATE'] == 1) {

                        //TODO 回写发运跟踪单详情已发运数量
                        $param[0]['DISPATCH_NOTE_ID'] = $skuPendStr['NOTE_ID'];
                        $param[0]['PSKU_ID'] = $skuPendStr['PSKU_ID'];
                        $param[0]['ARECIPIENT_NUM'] = $value['THE_RECEIVE_NUMBERT'];
                        Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\trackingdetailLogic', 'updateTdnumber'], [$param]]);
                        //获取发运跟踪明细表
                        $td_condition['DISPATCH_NOTE_ID'] = $skuPendStr['NOTE_ID'];
                        $td_condition['PSKU_ID'] = $skuPendStr['PSKU_ID'];
                        $trackingDetail = Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\trackingdetailLogic', 'getTrackingDetail'], [[], $td_condition]]);
                        //更新发运跟踪明细实际送达时间
                        $td_data['ACTUALS_ERVICE_AT'] = $value['ACTUAL_AT'];
                        Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\trackingdetailLogic', 'updateTrackingDetail'], [$td_data, $td_condition]]);

                        //获取发运跟踪单
                        $t_condition['TRACKING_ID'] = $trackingDetail['TRACKING_ID'];
                        $tracking = Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\trackingdetailLogic', 'getTracking'], [[], $t_condition]]);
                        $tracking['ACTUAL_SERVICE_AT'] = $value['ACTUAL_AT'];
                        $tracking['PLAN_STATE'] = 2;
                        Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\trackingdetailLogic', 'UpdateTracking'], [array($tracking)]]);

                        //获取发运单信息
                        $disCondition['DISPATCH_NOTE_ID'] = $skuPendStr['NOTE_ID'];
                        $skuPendStr['dispatch'] = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\shipment\modellogic\dispatchLogic', 'search_dispatch_one'], [$disCondition]]);


                    } elseif ($skuPendStr['IMPORT_STATE'] == 2) {

                        //TODO 回写调拨计划明细 修改为已收货
                        $condition_all['ALLOCATION_ID'] = $skuPendStr['NOTE_ID'];
                        $condition_all['ETPSKU_ID'] = $skuPendStr['PSKU_ID'];
                        $update_data['ALLOCATIONS_STATE'] = 2;
                        Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic', 'updateAllocationDetail'], [$update_data, $condition_all]]);

                        //获取调拨计划
                        $all_condition['sk_allocation.ALLOCATION_ID'] = $skuPendStr['NOTE_ID'];
                        $skuPendStr['sk_allocation'] = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic', 'getAllocation'], [$all_condition]]);

                        //回写调拨跟踪明细数量
                        if ($value['ALLOCATION_DETAIL_ID']) {
                            $condition_sh_de['ALLOCATION_DETAIL_ID'] = $value['ALLOCATION_DETAIL_ID'];
                        } else {
                            $condition_sh_de['SALLOCATION_DETAIL_ID'] = $skuPendStr['sk_allocation']['sk_allocation_detail'][0]['ALLOCATION_DETAIL_ID'];
                        }
                        $update_data_sh_de['ARECIPIENT_NUM'] = $skuPendStr['RECEIVE_NUMBER'];
                        Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic', 'updateShallocationDetail'], [$update_data_sh_de, $condition_sh_de]]);

                        //获取调拨跟踪
                        $condition_sh_detail = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic', 'getShAllocationDetail'], [$condition_sh_de]]);

                        $condition_sh_all['ALLOCATION_ID'] = $condition_sh_detail['ALLOCATION_ID'];
                        $update_data_sh['ACTUAL_TRANSFER_AT'] = $skuPendStr['ACTUAL_AT'];
                        $update_data_sh['PLAN_STATE'] = 1;
                        Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic', 'updateShallocation'], [$update_data_sh, $condition_sh_all]]);

                    }

                    if (!$res) {
                        $transaction->rollBack();
                        throw new \Exception(Yii::t('inventory', 'Operation error'));
//                        throw new \Exception('操作错误!');
                    }
                }

                $new_data[] = $skuPendStr;
                $ids[] = $skuPendStr['PENDING_STORAGE_ID'];
            }
        }
        self::updatePendstorageStatus(array(), $ids);  //更改状态
        //TODO 调用生成调拨单
        $fiallcation_res = self::createFiallocation($new_data);

        if ($res && $fiallcation_res) {
            $transaction->commit();
            if (isset($paramArray['is_self_return']) && $paramArray['is_self_return'] == 1) {
                return true;
            } else {
                return $respone->setModel(200, 0, Yii::t('inventory', 'Successful operation!'), []);
//                return $respone->setModel(200, 0, "操作成功!", []);
            }
        } else {
            $transaction->rollBack();
            if (isset($paramArray['is_self_return']) && $paramArray['is_self_return'] == 1) {
                return false;
            } else {
                return $respone->setModel(200, 0, Yii::t('inventory', 'Operation error'), []);
//                return $respone->setModel(500, 0, "操作失败!", []);
            }
        }
    }


    /**
     * 取消入库
     */
    public static function CancelInventory($paramArray)
    {
        $respone = new ResponeModel();

        if (isset($paramArray['batchMTC'])) {
            $data = $paramArray['batchMTC'];

            $fiallocations = $data['selectFiall'];

            if (count($fiallocations) <= 0) {
                return $respone->setModel(200, 0, Yii::t('inventory', 'Please select details for storage!'), []);
            }

            $skupendst = SkPendingStorage::find()->where(['PENDING_STORAGE_ID' => $data['PENDING_STORAGE_ID']])->one();

            //获取调拨计划
            $all_condition['sk_allocation.ALLOCATION_ID'] = $skupendst['NOTE_ID'];
            $skuPendStr['sk_allocation'] = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic', 'getAllocation'], [$all_condition]]);

            if (!$skupendst)
                return $respone->setModel(200, 0, Yii::t('inventory', 'The incoming order does not exist!'), []);

            //开启事务
            $transaction = Yii::$app->db->beginTransaction();

            $num = 0;
            $rela_ids = array();
            foreach ($fiallocations as $val) {

                if ($val['PENDING_STORAGE_ID'] != $data['PENDING_STORAGE_ID']) {
                    $transaction->rollBack();
                    return $respone->setModel(200, 0, Yii::t('inventory', 'The selected order form and the details of the allocation sheet are inconsistent!'), []);
//                    return $respone->setModel(200,0, '所选入库单和详情调拨单不一致',[]);
                }

                $num += $val['sk_fiallocation_detail']['ALLOCATION_NUMBER'];

                $rela_ids[] = $val['STORAGE_RELATION_ID'];

                //TODO 调用调拨单反审核
                $val['sk_fiallocation']['ALLOCATION_STATE'] = 1;
                $val['sk_fiallocation']['authFlag'] = 2;
                $val['sk_fiallocation']['allow_back_review'] = 1;
                $val['sk_fiallocation']['ALLOCATION_AT'] = strtotime($val['sk_fiallocation']['ALLOCATION_AT']);
                $res = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\fiallocationLogic', 'Fiallocation'], [array($val['sk_fiallocation'])]]);

                //TODO 调用(调拨单和调拨单详情单)物理删除
                $del_fiallocation_condition = array('FIALLOCATION_ID' => $val['sk_fiallocation']['FIALLOCATION_ID']);
                Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\fiallocationLogic', 'delFiallcationReal'], [$del_fiallocation_condition]]);

            }

            if ($skupendst['IMPORT_STATE'] == 1) {

                //TODO 回写发运跟踪单详情已发运数量
                $param[0]['DISPATCH_NOTE_ID'] = $skupendst['NOTE_ID'];
                $param[0]['PSKU_CODE'] = $skupendst['PSKU_CODE'];
                $param[0]['PSKU_ID'] = $skupendst['PSKU_ID'];
                $param[0]['ARECIPIENT_NUM'] = -1 * $num;
                Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\trackingdetailLogic', 'updateTdnumber'], [$param]]);

                //获取发运跟踪明细表
                $td_condition['DISPATCH_NOTE_ID'] = $skupendst['NOTE_ID'];
                $td_condition['PSKU_ID'] = $skupendst['PSKU_ID'];
                $trackingDetail = Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\trackingdetailLogic', 'getTrackingDetail'], [[], $td_condition]]);

                //获取发运跟踪单
                $t_condition['TRACKING_ID'] = $trackingDetail['TRACKING_ID'];
                $tracking = Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\trackingdetailLogic', 'getTracking'], [[], $t_condition]]);

                if (($num + $param[0]['ARECIPIENT_NUM']) == 0) {
                    $tracking['ACTUAL_SERVICE_AT'] = null;
                    $trackingDetailData['ACTUALS_ERVICE_AT'] = null;

                    Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\trackingdetailLogic', 'updateTrackingDetail'], [$trackingDetailData, $td_condition]]);
                } else {
                    $tracking['ACTUALS_ERVICE_AT'] = $skupendst['ACTUAL_AT'];
                }

                $tracking['PLAN_STATE'] = 1;
                Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\trackingdetailLogic', 'UpdateTracking'], [array($tracking)]]);

            } elseif ($skupendst['IMPORT_STATE'] == 2) {

                //TODO 回写调拨计划明细 修改为未收货
                $condition['ALLOCATION_ID'] = $skupendst['NOTE_ID'];
                $condition['ETPSKU_ID'] = $skupendst['PSKU_ID'];
                $update_data['ALLOCATIONS_STATE'] = 1;
                Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic', 'updateAllocationDetail'], [$update_data, $condition]]);

                //获取调拨计划
                $all_condition['sk_allocation.ALLOCATION_ID'] = $skupendst['NOTE_ID'];
                $sk_allocation = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic', 'getAllocation'], [$all_condition]]);

                //回写调拨跟踪明细数量
                if ($skupendst['ALLOCATION_DETAIL_ID']) {
                    $condition_sh_de['ALLOCATION_DETAIL_ID'] = $skupendst['ALLOCATION_DETAIL_ID'];
                } else {
                    $condition_sh_de['SALLOCATION_DETAIL_ID'] = $sk_allocation['sk_allocation_detail'][0]['ALLOCATION_DETAIL_ID'];
                }

                //获取调拨跟踪数量明细
                $sh_allocation_detail = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic', 'getShAllocationDetail'], [$condition_sh_de]]);
                $update_data_sh_de['ARECIPIENT_NUM'] = $sh_allocation_detail['ARECIPIENT_NUM'] - $num;

                Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic', 'updateShallocationDetail'], [$update_data_sh_de, $condition_sh_de]]);

                //获取调拨跟踪
                $condition_sh_detail = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic', 'getShAllocationDetail'], [$condition_sh_de]]);

                $condition_sh_all['ALLOCATION_ID'] = $condition_sh_detail['ALLOCATION_ID'];
                if (($sh_allocation_detail['ARECIPIENT_NUM'] - $num) <= 0) {
                    $update_data_sh['ACTUAL_TRANSFER_AT'] = '';
                }
                $update_data_sh['PLAN_STATE'] = 2;
                Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic', 'updateShallocation'], [$update_data_sh, $condition_sh_all]]);

            }

            //修改待入库列表已收货数量
            $skupendst->RECEIVE_NUMBER -= $num;
            $saveRes = $skupendst->save();

            //更新待入库记录状态
            self::updatePendstorageStatus(array(), array($data['PENDING_STORAGE_ID']));

            //删除中间表数据
            $delRelationRes = Yii::$app->db->createCommand()->delete('sk_pending_stroage_relation', ['in', 'STORAGE_RELATION_ID', $rela_ids])->execute();

            if ($saveRes && $delRelationRes) {
                $transaction->commit();
                return $respone->setModel(200, 0, Yii::t('inventory', 'Successful operation!'), []);
//                return $respone->setModel(200, 0, '操作成功!', []);
            } else {
                $transaction->rollBack();
                return $respone->setModel(500, 0, Yii::t('inventory', 'Operation error'), []);
//                return $respone->setModel(500, 0, '操作失败!', []);
            }
        }
    }

    /**
     * 校验是否更改待入库记录状态
     */
    public static function updatePendstorageStatus($paramArray = array(), $ids = array())
    {
        if (isset($paramArray)) {
            foreach ($paramArray as $value) {
                $ids[] = $value['PENDING_STORAGE_ID'];
            }
        }

        $update_str = " `HANDLER_ID` =  " . Yii::$app->getUser()->getIdentity()->USER_INFO_ID;

        if (isset($ids) && count($ids) > 0) {
            foreach ($ids as $id) {
                //更新为已收货
                $sql = "update `sk_pending_storage` set `PLAN_STATE` = 2 ," . $update_str . " where `PENDING_STORAGE_ID`  = " . $id . " and `SHIPMENT_NUMBER`<= (`RECEIVE_NUMBER` + `ADJUSTMENT_NUMBER` )";

                $connection = \Yii::$app->db;
                $command = $connection->createCommand($sql);
                $res = $command->execute();

                //更新为正在收货
                $sql = "update `sk_pending_storage` set `PLAN_STATE` = 1 ," . $update_str . " where `PENDING_STORAGE_ID`= " . $id . "  and (`SHIPMENT_NUMBER` > (`RECEIVE_NUMBER`+`ADJUSTMENT_NUMBER`) and `RECEIVE_NUMBER`>0)";

                $connection = \Yii::$app->db;
                $command = $connection->createCommand($sql);
                $res1 = $command->execute();

                //更新为未收货
                $update_str .= " and  `ACTUAL_AT` = null";
                $sql = " update `sk_pending_storage` set `PLAN_STATE` = 0 ," . $update_str . " where `PENDING_STORAGE_ID` = " . $id . " and  `RECEIVE_NUMBER` = 0 ";

                $connection = \Yii::$app->db;
                $command = $connection->createCommand($sql);
                $res2 = $command->execute();
            }
        }
    }


    /**
     * 创建调拨单
     */
    public static function createFiallocation($post)
    {
        foreach ($post as $val) {
            $item = array();
            $condition = array();
            $item[0]['ORGANISATION_ID'] = $val['PRGANISATION_ID'];
            $item[0]['ALLOCATION_AT'] = $val['ACTUAL_AT'];
            $item[0]['ETWAREHOUSE_ID'] = $val['ETWAREHOUSE_ID'];     //调出仓库 ID
            $item[0]['ATWAREHOUSE_ID'] = $val['ATWAREHOUSE_ID'];     //调入仓库 ID
            $item[0]['ALLOCATION_STATE'] = 2;
            $item[0]['ALLOCATION_REMARKS'] = '';
            $item[0]['ALLOCATION_REMARKS'] = '';
            $item[0]['DELETED_STATE'] = 0;
            $item[0]['SYSTEM_GENERATION'] = 1;
            $item[0]['CLOSING_STATE'] = 0;

            $detail['ATSKU_CODE'] = $val['PSKU_CODE'];
            $detail['PSKU_ID'] = $val['PSKU_ID'];

            if ($val['IMPORT_STATE'] == 1) {
                if ($val['dispatch']['IMPORT_STATE'] == 1) {
                    $condition['PURCHASE_DETAIL_ID'] = $val['dispatch']['PU_ORDER_ID'];
                    $purchase = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getPurchaseDetail'], [$condition, array()]]);
                    if ($purchase) {
                        $detail['UNIT_ID'] = $purchase[0]['UNIT_ID'];
                        $detail['PSKU_ID'] = $detail['PSKU_ID'] ? $detail['PSKU_ID'] : $purchase[0]['PSKU_ID'];
                    } else {
                        throw new \Exception(Yii::t('inventory', '数据缺陷:发运单对应的采购单明细不存在'));
                    }
                } elseif ($val['dispatch']['IMPORT_STATE'] == 2) {
                    $condition['ADJUSTMENT_DETAIL_ID'] = $val['dispatch']['PU_ORDER_ID'];
                    $adjustment = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\AdjustmentLogic', 'getSkAdjustmentDetail'], [$condition, array()]]);
                    if ($adjustment) {
                        $detail['UNIT_ID'] = $adjustment[0]['UNIT_ID'];
                        $detail['PSKU_ID'] = $detail['PSKU_ID'] ? $detail['PSKU_ID'] : $adjustment[0]['PSKU_ID'];
                    } else {
                        throw new \Exception(Yii::t('inventory', '数据缺陷:发运单对应的库存调整单明细不存在'));
                    }
                } else {
                    throw new \Exception(Yii::t('inventory', '发运单-意外的发运类型'));
                }

                $detail['DISPATCH_NOTE_ID_GOAL'] = $val['dispatch']['DISPATCH_NOTE_ID'];
                $item[0]['DISPATCH_NOTE_ID_GOAL'] = $val['dispatch']['DISPATCH_NOTE_ID'];

            } elseif ($val['IMPORT_STATE'] == 2) {
                $detail['UNIT_ID'] = $val['sk_allocation']['sk_allocation_detail'][0]['UNIT_ID'];
                $detail['PSKU_ID'] = $detail['PSKU_ID'] ? $detail['PSKU_ID'] : $val['sk_allocation']['sk_allocation_detail'][0]['ETPSKU_ID'];
            }

            $skuInfo = GProductSku::find()->where(array('PSKU_ID' => $detail['PSKU_ID']))->asArray()->one();
            $detail['TDRODUCT_DE'] = $skuInfo['PSKU_NAME_CN'];
            $detail['ALLOCATION_NUMBER'] = $val['THE_RECEIVE_NUMBERT'];
            $detail['ETWAREHOUSE_ID'] = $val['ETWAREHOUSE_ID'];
            $detail['ATWAREHOUSE_ID'] = $val['ATWAREHOUSE_ID'];
            $detail['ALLOCATION_REMARKS'] = '';

            $item[0]['sk_fiallocation_detail'][0] = $detail;

            //$skf_res = Yii::$app->db->createCommand()->insert('sk_fiallocation', $item)->execute();

            $result = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\fiallocationLogic', 'addFiallocationReturn'], [$item]]);
            //审核调拨单
            $result['authFlag'] = 1;
            $result['ALLOCATION_STATE'] = 2;
            Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\fiallocationLogic', 'Fiallocation'], [array(0 => $result)]]);

            //添加关联表数据
            $relation['FIALLOCATION_ID'] = $result['FIALLOCATION_ID'];
            $relation['PENDING_STORAGE_ID'] = $val['PENDING_STORAGE_ID'];
            $relation['ETWAREHOUSE_ID'] = $val['ETWAREHOUSE_ID'];
            $relation['ATWAREHOUSE_ID'] = $val['ATWAREHOUSE_ID'];
            $relation['ORGANISATION_ID'] = $val['PRGANISATION_ID'];
            $relation['CREATE_AT'] = time();
            $relation_res = Yii::$app->db->createCommand()->insert('sk_pending_stroage_relation', $relation)->execute();
        }
        return true;
    }


    /**
     * addPendingStorage
     * 新增待入库
     * @param $data
     *
     * */
    public static function addPendingStorage($data)
    {

        foreach ($data as $dispatchModel) {
            $post = Yii::$app->getRequest()->getBodyParams();
            Yii::$app->getRequest()->setBodyParams($dispatchModel);
            $result = CreateExt::actionDo(new SkPendingStorage(), $dispatchModel);
            Yii::$app->getRequest()->setBodyParams($post);
            if ($result instanceof ResponeModel) {
                return $result;
            }
        }
    }

    /**
     * 新增待入库返回
     */
    public static function addPendingStorageReturn($data)
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        Yii::$app->getRequest()->setBodyParams($data);
        $result = CreateExt::actionDo(new SkPendingStorage(), $data);
        Yii::$app->getRequest()->setBodyParams($post);
        return $result;
    }

    /**
     * DelPendingStorage
     * 待入库删除接口
     * @param $data
     * @return bool
     * */
    public static function DelPendingStorage($data)
    {
        $dispatchModel = array("batch" => $data);
        $post = Yii::$app->getRequest()->getBodyParams();
        Yii::$app->getRequest()->setBodyParams($dispatchModel);
        $result = DeleteExt::actionDo(new SkPendingStorage(), $dispatchModel);
        Yii::$app->getRequest()->setBodyParams($post);
        if ($result instanceof ResponeModel) {
            return $result;
        }
    }

    /**
     * 待入库审核与反审核
     */
    public static function delPendingStorageReal($where)
    {
        return SkPendingStorage::deleteAll($where);
    }

    /**
     * 获取单条数据
     */
    public static function getPendstorage($condition)
    {
        return SkPendingStorage::find()->where($condition)->asArray()->one();
    }

    /**
     * updatePenddelivery
     * 反写待入库编辑
     * @param $str array @修改值
     * @param $where array @修改条件
     * */
    public static function updatePendstorage($data)
    {
        $dispatchModel = array("batch" => $data);
        $post = Yii::$app->getRequest()->getBodyParams();
        Yii::$app->getRequest()->setBodyParams($dispatchModel);
        $result = UpdateExt::actionDo(new SkPendingStorage(), $dispatchModel);
        Yii::$app->getRequest()->setBodyParams($post);
        return $result;
    }

    //自定义index方法 收货差异表
    public static function indexReceiveDifferenceReport($post)
    {
        $res = new ResponeModel();
        //1 为初始 2 为查询
        $isInit = array_key_exists('isInit', $post) && $post['isInit'] ? $post['isInit'] : 1;
        //初始化没有任何参数的情况下不查询数据
        if ($isInit == 1) {
            return $res->setModel('200', 0, Yii::t('inventory', 'Successful operation!'), [], ['totalCount' => 0]);
        }
        $result = self::receiveDifferenceReport($post);
        $limit = array_key_exists('limit', $post) && $post['limit'] ? $post['limit'] : "20";
        $page = array_key_exists('page', $post) && $post['page'] ? $post['page'] : "1";
        //分页
        list($total, $data) = DBHelper::SearchList($result, ['limit' => $limit], $page - 1);
        $data = self::formatDisplay($data);
        return $res->setModel('200', 0, Yii::t('inventory', 'Successful operation!'), $data, ['totalCount' => $total]);
    }

    //收货差异表
    public static function receiveDifferenceReport($post)
    {
        $parameter = self::formatString($post);

        $result = self::getReceiveDifferenceReport($parameter);

        return $result->select("t.*,bw.WAREHOUSE_NAME_CN")->orderby("t.ACTUAL_AT asc");
    }

    //格式化参数
    public static function formatString($post)
    {
        $dataArray = array();
        $dataArray['organization'] = array_key_exists('organization', $post) && $post['organization'] ? $post['organization'] : "";//组织
        $dataArray['warehouseType'] = array_key_exists('warehouseType', $post) && $post['warehouseType'] ? $post['warehouseType'] : "";//仓库
        $dataArray['sku'] = array_key_exists('sku', $post) && $post['sku'] ? $post['sku'] : "";//SKU
        $dataArray['channel'] = array_key_exists('channel', $post) && $post['channel'] ? $post['channel'] : "";//平台
        $dataArray['adjustment1'] = array_key_exists('adjustment1', $post) && $post['adjustment1'] ? $post['adjustment1'] : false;//调整后差异
        $dataArray['adjustment2'] = array_key_exists('adjustment2', $post) && $post['adjustment2'] ? $post['adjustment2'] : false;//调整后差异
        $dataArray['adjustment3'] = array_key_exists('adjustment3', $post) && $post['adjustment3'] ? $post['adjustment3'] : false;//调整后差异
        $dataArray['accessOrg'] = "";
        $dataArray['product_id'] = "";
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            $dataArray['accessOrg'] = Yii::$app->session->get('organization') ? Yii::$app->session->get('organization') : "";//组织权限
            $dataArray['product_id'] = Yii::$app->session->get('product_id') ? Yii::$app->session->get('product_id') : "";//大分类权限
        }

        return $dataArray;
    }

    //收货差异表
    public static function getReceiveDifferenceReport($parameter)
    {
        //调拨计划
        $data1 = (new Query())->from('sk_pending_storage sps')
            ->select(new Expression("sa.ALLOCATION_CD AS NOTE_CD,sps.*"))
            ->innerJoin('sk_allocation sa', 'sa.ALLOCATION_ID = sps.NOTE_ID')
            //取消待入库状态'sps.PLAN_STATE' => 1 正在收货的 改为 接收数量 - 发运数量 > 0
            ->where(['and', ['sps.IMPORT_STATE' => 2], ['sps.CLOSING_STATE' => 0], ['>', '(sps.SHIPMENT_NUMBER - sps.RECEIVE_NUMBER)', 0]]);
        //发运单
        $data2 = (new Query())->from('sk_pending_storage sps')
            ->select(new Expression("sdn.KUKAI_NUMBER AS NOTE_CD,sps.*"))
            ->innerJoin('sh_dispatch_note sdn', 'sdn.DISPATCH_NOTE_ID = sps.NOTE_ID')
            //取消待入库状态'sps.PLAN_STATE' => 1 正在收货的 改为 接收数量 - 发运数量 > 0
            ->where(['and', ['sps.IMPORT_STATE' => 1], ['sps.CLOSING_STATE' => 0], ['>', '(sps.SHIPMENT_NUMBER - sps.RECEIVE_NUMBER)', 0]]);
        $data3 = $data1->union($data2, true);
        $data = (new Query())->from(['t' => $data3])->innerJoin('b_warehouse bw', 'bw.WAREHOUSE_ID = t.ATWAREHOUSE_ID');
        //收货差异表拼接andWhere
        $data = self::getReceiveDifferenceReportWhere($data, $parameter);

        return $data;
    }

    //收货差异表拼接andWhere
    public static function getReceiveDifferenceReportWhere($data, $parameter)
    {
        if ($parameter['warehouseType'] != "") {
            $data->andWhere(new Expression("FIND_IN_SET(t.ETWAREHOUSE_ID,'" . $parameter['warehouseType'] . "')"));
        }
        if ($parameter['channel'] != "") {
            $data->andWhere(new Expression("FIND_IN_SET(bw.CHANNEL_ID,'" . $parameter['channel'] . "')"));
        }
        if ($parameter['sku'] != "") {
            $data->andWhere(new Expression("FIND_IN_SET(t.PSKU_ID,'" . $parameter['sku'] . "')"));
        }
        if ($parameter['organization'] != "") {
            $data->andWhere(new Expression("FIND_IN_SET(t.PRGANISATION_ID,'" . $parameter['organization'] . "')"));
        }
        if ($parameter['adjustment1'] || $parameter['adjustment2'] || $parameter['adjustment3']) {
            $or = ["or"];
            if ($parameter['adjustment1']) {
                $or[] = ['=', '(t.RECEIVE_NUMBER-t.SHIPMENT_NUMBER+t.ADJUSTMENT_NUMBER)', 0];
            }
            if ($parameter['adjustment2']) {
                $or[] = ['<', '(t.RECEIVE_NUMBER-t.SHIPMENT_NUMBER+t.ADJUSTMENT_NUMBER)', 0];
            }
            if ($parameter['adjustment3']) {
                $or[] = ['>', '(t.RECEIVE_NUMBER-t.SHIPMENT_NUMBER+t.ADJUSTMENT_NUMBER)', 0];
            }
            $data->andWhere($or);
        }
        //添加组织和大分类过滤
        if ($parameter['accessOrg'] != "") {
            $data->andWhere(["t.PRGANISATION_ID" => $parameter['accessOrg']]);
        }
        if ($parameter['product_id'] != "") {
            $data->andWhere(["t.PSKU_ID" => $parameter['product_id']]);
        }
        return $data->DISTINCT();
    }

    //格式化显示数据
    public static function formatDisplay($data)
    {
        //组织编码

        $organisations = Yii::$app->rpc->create('organization')->send([['\addons\organization\modellogic\organizLogic', 'GetORGANISATION'], [['ORGANISATION_ID', 'ORGANISATION_NAME_CN']]])->recv();
        array_walk($data, function (&$v, $k, $paras) {
            $v['ORGANISATION_NAME'] = self::getCnByID($paras['organisation'], $v['PRGANISATION_ID'], 'ORGANISATION_ID', 'ORGANISATION_NAME_CN');
        }, ['organisation' => $organisations]);
        //获取库存调整单单号
        $data = self::getAdjustmentCD($data);
        return $data;
    }

    //获取库存调整单单号
    public static function getAdjustmentCD($data)
    {
        foreach ($data as $key => $value) {
            $mSkAdjustmentList = SkAdjustment::find()->where(['PENDING_STORAGE_ID' => $value['PENDING_STORAGE_ID'], 'DELETED_STATE' => 0])->all();
            $value['ADJUSTMENT_CD'] = "";
            foreach ($mSkAdjustmentList as $key1 => $value1) {
                if ($value['ADJUSTMENT_CD'] != "") {
                    $value['ADJUSTMENT_CD'] = $value['ADJUSTMENT_CD'] . "," . $value1->ADJUSTMENT_CD;
                } else {
                    $value['ADJUSTMENT_CD'] = $value1->ADJUSTMENT_CD;
                }
            }
            $data[$key] = $value;
        }
        return $data;
    }

    //转换ID变成name
    public static function getCnByID($model, $ID, $model_where, $name)
    {
        if (count($model) > 0) {
            foreach ($model as $value) {
                if (count($ID) > 1 && count($model_where) > 1) {
                    if ($value[$model_where[0]] == $ID[0] && $value[$model_where[1]] == $ID[1]) {
                        return $value[$name];
                    }
                } else {
                    if ($value[$model_where] == $ID) {
                        return $value[$name];
                    }
                }
            }
        } else {
            return "";
        }
    }

    //收货差异表 差异调整按钮
    public static function receiveDifferenceAdjustment($post)
    {
        //创建库存调整单
        $result = self::createSkAdjustment($post);
        if ($result instanceof ResponeModel) {
            return $result;
        }
        //审核库存调整单
        $result = self::auditSkAdjustment($result);
        if ($result instanceof ResponeModel) {
            return $result;
        }
        //回写待入库调整数量
        $result = self::updateSelfPendstorage($post);
        if ($result instanceof ResponeModel) {
            return $result;
        }
        return Yii::t('inventory', 'Successful operation!');
    }

    //创建库存调整单
    public static function createSkAdjustment($data)
    {
        $createModel = self::formatSkAdjustmentData($data);
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\AdjustmentLogic', 'Create'], [["batchMTC" => $createModel]]]);
    }

    public static function formatSkAdjustmentData($data)
    {
        $modelTemp = [];
        foreach ($data as $key => $value) {
            $temp = [];
            $temp["PRGANISATION_ID"] = $value["PRGANISATION_ID"];
//            $temp["ADJUSTMENT_AT"] = time();
            $stringDate = date("Y-m-d", intval(time()));
            $temp["ADJUSTMENT_AT"] = strtotime($stringDate);
            $temp["ADJUSTMENT_REASON"] = 4;
            $temp["PLAN_STATE"] = 1;
            $temp["AWAREHOUSE_ID"] = $value["ETWAREHOUSE_ID"];
            $temp["ADJUSTMENT_REMARKS"] = $value["PENDING_REMARKS"];
            $temp["DELETED_STATE"] = 0;
            $temp["PENDING_STORAGE_ID"] = $value["PENDING_STORAGE_ID"];
            $temp["SYSTEM_GENERATION"] = 1;//系统生成单据
            $temp = self::formatSkAdjustmentDetailData($temp, $value);
            array_push($modelTemp, $temp);
        }
        return $modelTemp;
    }

    public static function formatSkAdjustmentDetailData($temp, $value)
    {
        $detailTemp = [];
        $detailTemp["PSKU_ID"] = $value["PSKU_ID"];
        $detailTemp["TDSKU_CODE"] = $value["PSKU_CODE"];
        $detailTemp["TDRODUCT_DE"] = $value["TDRODUCT_DE"];
        //TODO 仓库拿待入库列表的调出仓库
        $detailTemp["TDAREHOUSE_ID"] = $value["ETWAREHOUSE_ID"];
        $detailTemp["TDNUMBER"] = $value["ADJUSTMENT_NUMBER_UN"] * -1;
        $detailTemp["UNIT_PRICE"] = 0;
        $detailTemp["TDMONEY"] = 0;
        $mGProductSku = GProductSku::find()->where(['PSKU_ID' => $detailTemp["PSKU_ID"]])->one();
        if ($mGProductSku) {
            $detailTemp["UNIT_ID"] = $mGProductSku->UNIT_ID;
        }
        $temp["sk_adjustment_detail"] = [];
        array_push($temp["sk_adjustment_detail"], $detailTemp);
        return $temp;
    }

    //审核库存调整单
    public static function auditSkAdjustment($data)
    {
        $mRoleUser = Yii::$app->user->getIdentity();
        foreach ($data as $key => $value) {
            $value["AUTITO_ID"] = $mRoleUser->getId();
            $value["AUTITO_AT"] = time();
            $value["authFlag"] = 1;
            $value["PLAN_STATE"] = 2;
            $data[$key] = $value;
        }
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\AdjustmentLogic', 'Update'], [["batchMTC" => $data]]]);
    }

    //回写待入库调整数量
    public static function updateSelfPendstorage($data)
    {
        foreach ($data as $key => $value) {
            $value["ADJUSTMENT_NUMBER"] = $value["ADJUSTMENT_NUMBER"] + $value["ADJUSTMENT_NUMBER_UN"];
            $data[$key] = $value;
        }
        return self::Update(['batchMTC' => $data]);
    }

    /**
     * 编辑待出库信息
     */
    public static function updateAllPendstorage($set, $where)
    {
        return SkPendingStorage::updateAll($set, $where);
    }
}