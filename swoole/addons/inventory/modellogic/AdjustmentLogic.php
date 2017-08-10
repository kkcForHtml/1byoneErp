<?php

/**
 * Created by PhpStorm.
 * User: Fable
 * Date: 2017/6/1
 * Time: 17:22
 */

namespace addons\inventory\modellogic;

use addons\inventory\models\SkAllocationDetail;
use addons\shipment\models\ShAllocationDetail;
use addons\shipment\models\ShTrackingDetail;
use Yii;
use addons\inventory\models\SkAdjustment;
use addons\inventory\models\SkAdjustmentDetail;
use yii\swoole\modellogic\BaseLogic;
use \yii\swoole\rest\ResponeModel;

class AdjustmentLogic extends BaseLogic
{
    public static $modelClass = 'addons\inventory\models\SkAdjustment';

    /**
     * setAdjustmentDetail
     * 修改库存调整明细
     * @param array $where @修改条件
     * @param array $setr @修改的值
     * @return bool
     * */
    public static function setAdjustmentDetail($where, $setr)
    {
        return SkAdjustmentDetail::updateAll($setr, $where);
    }

    /**
     * getSkAdjustment
     * 获取库存调整明细
     * @access public
     * @param $where
     * @param $select
     * @return array
     * */
    public static function getSkAdjustment($where, $select = [])
    {
        if (count($select) == 0) {
            return SkAdjustment::find()->where($where)->asArray()->all();
        } else {
            return SkAdjustment::find()->select($select)->where($where)->asArray()->all();
        }

    }

    /**
     * getSkAdjustmentDetail
     * 获取库存调整明细
     * @access public
     * @param $where
     * @param $select
     * @return array
     * */
    public static function getSkAdjustmentDetail($where, $select = [])
    {
        if (count($select) == 0) {
            return SkAdjustmentDetail::find()->where($where)->asArray()->all();
        } else {
            return SkAdjustmentDetail::find()->select($select)->where($where)->asArray()->all();
        }

    }

    /**
     * 处理审核库存调整单
     */
    public static function checkSkuInventory($postarray)
    {
        $respone = new ResponeModel();
        $respone = new ResponeModel();
        $returnArray['flag'] = true;
        $placeidarr = array();
        $authFlag = $postarray[0]['authFlag'];
        $PLAN_STATE = $postarray[0]['planState'];

        foreach ($postarray as $post) {
            array_push($placeidarr, $post['ADJUSTMENT_ID']);
        }

        $con['ADJUSTMENT_ID'] = $placeidarr;
        if ($authFlag == 2 && $PLAN_STATE == 0) {
            $adjustMents = SkAdjustment::findAll($con);

            foreach ($adjustMents as $adj) {
                if ($adj['SYSTEM_GENERATION'] == 1) {
//                    return $respone->setModel(500,0,'单据:'.$adj['ADJUSTMENT_CD'].'是系统单据,不允许反审核',[]);
                    return $respone->setModel(500, 0, $adj['ADJUSTMENT_CD'] . Yii::t('inventory', 'The system automatically generated documents can not be reverse audited'), []);
                }
            }
        }

        $skadjustmentDetails = SkAdjustmentDetail::findAll($con);
        $skuarray = [];
        //计算整合对应仓的对应SKU数量
        foreach ($skadjustmentDetails as $detail) {
            if (!array_key_exists($detail->TDAREHOUSE_ID, $skuarray)) {

                $skuarray[$detail->TDAREHOUSE_ID] = array();
            }
            if (array_key_exists($detail->PSKU_ID, $skuarray[$detail->TDAREHOUSE_ID])) {
                $skuarray[$detail->TDAREHOUSE_ID][$detail->PSKU_ID] += $detail->TDNUMBER;
            } else {
                $skuarray[$detail->TDAREHOUSE_ID][$detail->PSKU_ID] = $detail->TDNUMBER;
            }
        }

        $condition = [];
        //查询库存
        foreach ($skuarray as $key => $value) {

            foreach ($value as $k => $v) {
                $condition['s.WAREHOUSE_ID'] = $key;
                $condition['s.PSKU_CODE'] = $k;
                $skuInventory = (new \yii\db\Query())
                    ->select('*')
                    ->from('sk_instant_inventory as s')
                    ->leftJoin("g_product_sku as g", "g.PSKU_CODE = g.PSKU_CODE")
                    ->where($condition)
                    ->one();

                if ($authFlag == 1 && $PLAN_STATE == 2) {
                    $v = $v;
                } else if ($authFlag == 2 && $PLAN_STATE == 1) {
                    //反审核
                    $v = (-1) * $v;
                }

                //小于即时库存
                if ($skuInventory['INSTANT_NUMBER'] < $v && $v > 0 && $skuInventory['INSTANT_NUMBER']) {
                    $returnArray['flag'] = false;
                    $returnArray['type'] = 2;
                    $returnArray['sku'] = $k;
                    return $respone->setModel(200, 0, Yii::t('inventory', 'Query was successful!'), $returnArray);
                }
            }

        }
        return $respone->setModel(200, 0, Yii::t('inventory', 'Query was successful!'), $returnArray);
    }

    /**
     * 检测是否关联待入库单
     */
    public static function checkAboutPendst($post)
    {

        $condition['PENDING_STORAGE_ID'] = $post['PENDING_STORAGE_ID'];
        $pendStorage = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PendstorageLogic', 'getPendstorage'], [$condition]]);

        $details = SkAdjustmentDetail::find()->where(['ADJUSTMENT_ID' => $post['ADJUSTMENT_ID']])->asArray()->all();

        foreach ($details as $detail) {
            $num = 0;
            if ($post['authFlag'] == 1 && $post['PLAN_STATE'] == 2) {
                $num = $detail['TDNUMBER'] * (-1);
            } else if ($post['authFlag'] == 2 && $post['PLAN_STATE'] == 1) {
                //反审核
                $num = $detail['TDNUMBER'];
            }

            if ($pendStorage['IMPORT_STATE'] == 1) {
                //TODO 调用发运跟踪明细修改接口 修改【调拨数量】
                $where['DISPATCH_NOTE_ID'] = $pendStorage['NOTE_ID'];
//                $where['PSKU_CODE'] = $pendStorage['PSKU_CODE'];
//                $where['ARECIPIENT_NUM'] = $num;
//                Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\trackingdetailLogic', 'updateTdnumber'], [[$paramy]]]);
                self::updateShTrackingDetail($where,$num);
            } elseif ($pendStorage['IMPORT_STATE'] == 2) {
                //TODO 调用调拨计划明细  修改【调拨数量】
                $where['ALLOCATION_ID'] = $pendStorage['NOTE_ID'];
                $where['ETSKU_CODE'] = $pendStorage['PSKU_CODE'];
                $where['ETPSKU_ID'] = $pendStorage['PSKU_ID'];
                //Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic', 'updateAllocationDetail'], [$paramy,$where]]);
                self::updateShAllocationDetail($where,$num);
            }
        }
    }

    //更新发运跟踪明细的调整数量
    public static function updateShTrackingDetail($where,$num)
    {
        $mShTrackingDetail = ShTrackingDetail::find()->where(['DISPATCH_NOTE_ID' => $where['DISPATCH_NOTE_ID']])->one();
            if($mShTrackingDetail){
                $mShTrackingDetail->ADJUSTMENT_NUMBER += $num;
                $mShTrackingDetail->save();
            }
    }

    //更新调拨跟踪明细的调整数量
    public static function updateShAllocationDetail($where,$num)
    {
        $mSkAllocationDetail = SkAllocationDetail::find()->where(["ALLOCATION_ID"=>$where["ALLOCATION_ID"],"ETPSKU_ID"=>$where["ETPSKU_ID"]])->one();
        if($mSkAllocationDetail){
            $mShAllocationDetail = ShAllocationDetail::find()->where(['SALLOCATION_DETAIL_ID'=>$mSkAllocationDetail->ALLOCATION_DETAIL_ID])->one();
            if($mShAllocationDetail){
                $mShAllocationDetail->ADJUSTMENT_NUMBER += $num;
                $mShAllocationDetail->save();
            }
        }
    }

    /**
     * 更新
     */
    public static function deleteAdj($data)
    {
        foreach ($data as $row) {
            $condition['ADJUSTMENT_ID'] = $row['ADJUSTMENT_ID'];
            SkAdjustment::updateAll($row, $condition);
            SkAdjustmentDetail::deleteAll($condition);
        }
        $repose = new ResponeModel();
        return $repose->setModel(200, 0, '操作成功', array());
    }

}