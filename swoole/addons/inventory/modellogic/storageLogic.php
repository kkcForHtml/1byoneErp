<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/24 0024
 * Time: 15:02
 */
namespace addons\inventory\modellogic;

use addons\inventory\models\SkInstantInventory;
use addons\purchase\models\PuPurchaseDetail;
use Yii;
use addons\inventory\models\SkStorage;
use addons\inventory\models\SkStorageDetail;
use alexgx\phpexcel\PhpExcel;
use yii\db\Expression;
use yii\db\Query;
use yii\swoole\helpers\ArrayHelper;
use yii\swoole\rest\CreateExt;
use yii\swoole\rest\ResponeModel;
use yii\swoole\rest\UpdateExt;
use yii\web\ServerErrorHttpException;
use yii\swoole\modellogic\BaseLogic;

class storageLogic extends BaseLogic
{
    public static $modelClass = 'addons\inventory\models\SkStorage';

    /**
     *采购入库反审核成功后针对入库单据操作
     *1.入库单修改删除字段
     *2.入库单明细删除
     *@$StorageArray
     */
    public static function setStorageOper($StorageArray)
    {
        SkStorage::updateAll(['DELETED_STATE' => $StorageArray['DELETED_STATE']], ['STORAGE_ID' => $StorageArray['STORAGE_ID']]);
        SkStorageDetail::deleteAll(array('STORAGE_ID' => $StorageArray['STORAGE_ID']));
    }

    /**
     *采购入库物理删除
     */
    public static function delStorage($where)
    {
        $res = SkStorage::updateAll(array('DELETED_STATE' => 1), $where);

        $storageDetail_ids = SkStorageDetail::find()->where($where)->select('STORAGE_DETAIL_ID')->asArray()->all();

        $detail_res = SkStorageDetail::deleteAll(array('STORAGE_DETAIL_ID' => $storageDetail_ids));

        return $res && $detail_res;
    }

    /**
     * getStorage
     * 入库单主表查询
     * @param $select array
     * @param $where array
     * @return array
     *
     */
    public static function getStorage($select, $where)
    {
        if (count($select) == 0) {
            return SkStorage::find()->where($where)->asArray()->all();
        } else {
            return SkStorage::find()->select($select)->where($where)->asArray()->all();
        }
    }

    /**
     * getStorage
     * 入库单主表及子表结构查询
     * @param $where array
     * @return array
     *
     */
    public static function getStorageDelisc($where)
    {
        $test = (new Query())->from('sk_storage')->where($where)->one();
        $test_d = (new Query())->from('sk_storage_detail')->where(['STORAGE_ID' => $test['STORAGE_ID']])->all();
        $test['sk_storage_detail'] = $test_d;
        return $test;
    }

    /**
     * getStorageID
     * 通过采购订单单号查询出入库单主表信息
     * @param $where array
     * @return array
     *
     */
    public static function getStorageID($where)
    {
        $query = (new Query())->from('sk_storage T1')
            ->select(['T1.*'])
            ->leftJoin('sk_storage_detail T2', 'T2.STORAGE_ID = T1.STORAGE_ID')
            ->where(array('T2.PU_ORDER_CD' => $where))
            ->distinct()
            ->all();

        return $query;
    }

    /**入库单导出
     * @param $post
     * @return string
     */
    public static function export($post)
    {
        $post['search'] = ArrayHelper::getValue($post, 'search');

        $con = ["and", ["or", ["like", "og.ORGANISATION_NAME_CN", $post['search']],
            ["like", "w.WAREHOUSE_NAME_CN", $post['search']],
            ["like", "s.STORAGE_CD", $post['search']]], "s.DELETED_STATE=0"];

        //获取入库单明细数据
        $storageDetailDB = (new \yii\db\Query())
            ->select('s.STORAGE_CD,og.ORGANISATION_NAME_CN,pa.PARTNER_ANAME_CN,s.STORAGE_AT,w.WAREHOUSE_NAME_CN,sd.PU_ORDER_CD,sku.PSKU_CODE,sku.PSKU_NAME_CN,bu.UNIT_NAME_CN,sd.STORAGE_DNUMBER,sd.UNIT_PRICE
                ,sd.STORAGE_DMONEY,m.MONEY_NAME_CN,s.ORDER_TYPE,s.ORDER_STATE,s.AUTITO_AT,a.USERNAME AS AUTHNAME,c.USERNAME AS CREATNAME,s.CLOSING_STATE,s.STORAGE_REMARKS')
            ->from('sk_storage_detail sd')
            ->leftJoin("sk_storage s", "sd.STORAGE_ID = s.STORAGE_ID")
            ->leftJoin("pa_partner pa", "pa.PARTNER_ID = s.PARTNER_ID")
            ->leftJoin("o_organisation og", "s.ORGANISATION_ID = og.ORGANISATION_ID")
            ->leftJoin("b_warehouse w", "sd.SWAREHOUSE_ID = w.WAREHOUSE_ID")
            ->leftJoin("b_unit bu", "sd.UNIT_ID = bu.UNIT_ID")
//            ->leftJoin("g_product_sku sku", "sd.PSKU_ID = sku.PSKU_ID and sku.ORGAN_ID_DEMAND = s.ORGANISATION_ID")
            ->leftJoin("g_product_sku sku", 'sd.PSKU_ID = sku.PSKU_ID')
            ->leftJoin("u_user_info c", "sd.CUSER_ID = c.USER_INFO_ID")
            ->leftJoin("u_user_info a", "s.AUTITO_ID = a.USER_INFO_ID")
            ->leftJoin("b_money m", "s.MONEY_ID = m.MONEY_ID")
            ->groupBy('STORAGE_DETAIL_ID')
            ->where($con);
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            $storageDetailDB->andWhere(['s.ORGANISATION_ID' => Yii::$app->session->get('organization')]);
            $storageDetailDB->andWhere(['sd.PSKU_ID' => Yii::$app->session->get('product_id')]);
        }
        $storageDetails = $storageDetailDB->all();
        //拼装返回导出数据
        $array = static::Assemble($storageDetails);

        //导出excel2007
        static::export_excel($array);

    }

    public static function Assemble($storageDetails)
    {
        $Pu = [];//数据拼装
        foreach ($storageDetails as $key => $value) {
            $Pu[$key] = [];

            $Pu[$key][] = $value['STORAGE_CD'];
            $Pu[$key][] = $value['ORGANISATION_NAME_CN'];
            $Pu[$key][] = $value['PARTNER_ANAME_CN'];
            $Pu[$key][] = $value['STORAGE_AT'] == null ? "" : date("Y-m-j", $value['STORAGE_AT']);
            $Pu[$key][] = $value['WAREHOUSE_NAME_CN'];
            $Pu[$key][] = $value['PU_ORDER_CD'];
            $Pu[$key][] = $value['PSKU_CODE'];
            $Pu[$key][] = $value['PSKU_NAME_CN'];
            $Pu[$key][] = $value['UNIT_NAME_CN'];
            $Pu[$key][] = $value['STORAGE_DNUMBER'];
            $Pu[$key][] = $value['UNIT_PRICE'];
            $Pu[$key][] = $value['STORAGE_DMONEY'];
            $Pu[$key][] = $value['MONEY_NAME_CN'];;
            if ($value['ORDER_TYPE'] == 1) {
                $type = "采购入库";
            } elseif ($value['ORDER_TYPE'] == 2) {
                $type = "内部采购入库";
            } else {
                $type = "其他入库";
            }
            $Pu[$key][] = $type;
            $Pu[$key][] = $value['ORDER_STATE'] == 1 ? '未审核' : '已审核';
            $Pu[$key][] = $value['AUTITO_AT'] == null ? "" : date("Y-m-j", $value['AUTITO_AT']);
            $Pu[$key][] = $value['AUTHNAME'];
            $Pu[$key][] = $value['CREATNAME'];
            $Pu[$key][] = $value['CLOSING_STATE'] == '0' ? '未关账' : '已关账';
            $Pu[$key][] = $value['STORAGE_REMARKS'];


        }
        return $Pu;
    }

    /**
     * 导出excel
     * php office
     * */
    public static function export_excel($list)
    {
        $filePrefix = '入库单据-' . date("Y-m-j");
        $fileSuffix = '.xlsx';
        $file = \Yii::createObject([
            'class' => 'yii\swoole\files\ExcelFile',
            'fileOptions' => ['suffix' => $fileSuffix],
            'sheets' => [

                'Active Users' => [
                    'data' => $list,
                    'titles' => [
                        'A' => '入库单号',
                        'B' => '组织',
                        'C' => '供应商',
                        'D' => '入库日期',
                        'E' => '入库仓库',
                        'F' => '采购订单',
                        'G' => 'SKU',
                        'H' => '产品名称',
                        'I' => '单位',
                        'J' => '数量',
                        'K' => '单价',
                        'L' => '金额',
                        'M' => '币种',
                        'N' => '单据类型',
                        'O' => '单据状态',
                        'P' => '审核时间',
                        'Q' => '审核人',
                        'R' => '制单人',
                        'S' => '是否关账',
                        'T' => '备注'


                    ],
                ],

            ],
        ]);
        $phpExcel = $file->getWorkbook();
        $phpExcel->getSheet()->getRowDimension(1)->setRowHeight(20);
        //所有垂直居中
        $phpExcel->getSheet()->getStyle('A1:BF' . (count($list) + 1))->getAlignment()->setVertical(\PHPExcel_Style_Alignment::VERTICAL_CENTER);
        //设置单元格边框
        $phpExcel->getSheet()->getStyle('A1:BF' . (count($list) + 1))->getBorders()->getAllBorders()->setBorderStyle(\PHPExcel_Style_Border::BORDER_THIN);
        //设置第一列的字体大小
        $phpExcel->getSheet()->getStyle("A1:BF1")->getFont()->setSize(12);
        //第一行字体加粗
        $phpExcel->getSheet()->getStyle("A1:BF1")->getFont()->setBold(true);

        $phpExcel->getSheet()->getDefaultColumnDimension()->setWidth(10);//设置单元格宽度

        $file->send($filePrefix . $fileSuffix);
    }

    /**
     * addStorage
     * 新增入库单
     * @param $data
     * @return bool
     * */
    public static function addStorage($data)
    {

        foreach ($data as $dispatchModel) {
            $post = Yii::$app->getRequest()->getBodyParams();
            Yii::$app->getRequest()->setBodyParams($dispatchModel);
            $result = CreateExt::actionDo(new SkStorage(), $dispatchModel);
            Yii::$app->getRequest()->setBodyParams($post);
            if ($result instanceof ResponeModel) {
                return $result;
            }
        }


    }

    /**
     * StorageAuditing
     * 审核入库单
     * @param $data
     * @return bool
     * */
    public static function StorageAuditing($data)
    {
        $dispatchModel = array("batchMTC" => $data);
        $post = Yii::$app->getRequest()->getBodyParams();
        Yii::$app->getRequest()->setBodyParams($dispatchModel);
        $result = UpdateExt::actionDo(new SkStorage(), $dispatchModel);
        Yii::$app->getRequest()->setBodyParams($post);
        if ($result instanceof ResponeModel) {
            return $result;
        }
    }

    /**红字入库单 校验库存
     * @param $postarray
     * @return array
     */
    public static function checkSkuInventory($postarray)
    {

        $respone = new ResponeModel();
        $returnArray['flag'] = true;
        $placeidarr = array();

        //校验会计期间
        foreach ($postarray as $post) {
            if (!isset($post['orderclassify'])) {
                $returnArray['flag'] = false;
                return $respone->setModel(500, 0, Yii::t('inventory', 'The orderclassify parameter cannot be null!'), $returnArray);
//                return $respone->setModel(500, 0, "orderclassify参数不能为空", $returnArray);
            }
            switch ($post['orderclassify']) {
                case 2:
                    $idAttribute = "STORAGE_ID";
                    $cdAttribute = "STORAGE_CD";
                    $warehouseAttribute = "SWAREHOUSE_CODE";
                    $model = "addons\\inventory\\models\\SkStorageDetail";
                    $skucodeAttribute = "PSKU_CODE";
                    $skuNumberAttribute = "STORAGE_DNUMBER";
                    break;
                case 3:
                    $idAttribute = "PLACING_ID";
                    $cdAttribute = "PLACING_CD";
                    $warehouseAttribute = "PDWAREHOUSE_CODE";
                    $model = "addons\\inventory\\models\\SkPlacingDetail";
                    $skucodeAttribute = "PDSKU_CODE";
                    $skuNumberAttribute = "PDNUMBER";

                    break;
                case 6:
                    $idAttribute = "FIALLOCATION_ID";
                    $cdAttribute = "FIALLOCATION_CD";
                    $warehouseAttribute = $post["warehouseAttribute"];
                    $model = "addons\\inventory\\models\\SkFiallocationDetail";
                    $skucodeAttribute = "ATSKU_CODE";
                    $skuNumberAttribute = "ALLOCATION_NUMBER";

                    break;
            }

            array_push($placeidarr, isset($post[$idAttribute]) ? $post[$idAttribute] : 0);
            if (array_key_exists("PRE_ORDER_AT", $post)) {
                /*暂时屏蔽会计校验
                $result = Yii::$app->rpc->create('finance')->sendAndrecv([['\addons\finance\modellogic\accountingperiodLogic', 'accounting_period_method'], [$post['ORGANISATION_CODE'], $post['PRE_ORDER_AT']]]);
                if (!$result) {
                    $returnArray['flag'] = false;
                    $returnArray['type'] = 1;
                    $returnArray[$cdAttribute] = isset($post[$cdAttribute]) ? $post[$cdAttribute] : "";

                    return $respone->setModel(200, 0, "查询成功", $returnArray);
                }
                */
            }
        }
        if (!array_key_exists("ONLY_CHECK_DATE", $post)) {
            //若是还需要校验SKU库存的
            $con[$idAttribute] = $placeidarr;

            $Details = $model::findAll($con);


            $skuarray = [];
            //计算整合对应仓的对应SKU数量
            foreach ($Details as $detail) {
                if (!array_key_exists($detail->$warehouseAttribute, $skuarray)) {

                    $skuarray[$detail->$warehouseAttribute] = array();
                }
                if (array_key_exists($detail->$skucodeAttribute, $skuarray[$detail->$warehouseAttribute])) {
                    $skuarray[$detail->$warehouseAttribute][$detail->$skucodeAttribute] += $detail->$skuNumberAttribute;
                } else {
                    $skuarray[$detail->$warehouseAttribute][$detail->$skucodeAttribute] = $detail->$skuNumberAttribute;
                }

            }

            $condition = [];
            //查询库存
            foreach ($skuarray as $key => $value) {

                foreach ($value as $k => $v) {
                    $condition['s.WAREHOUSE_CODE'] = $key;
                    $condition['s.PSKU_CODE'] = $k;
                    $skuInventory = (new \yii\db\Query())
                        ->select('*')
                        ->from('sk_instant_inventory as s')
                        ->leftJoin("g_product_sku as g", "g.PSKU_CODE = g.PSKU_CODE")
                        ->where($condition)
                        ->one();

                    //小于即时库存
                    if ($skuInventory['INSTANT_NUMBER'] < $v && $v > 0) {
                        $returnArray['flag'] = false;
                        $returnArray['type'] = 2;
                        $returnArray['sku'] = $skuInventory['PSKU_NAME_CN'] ? $skuInventory['PSKU_NAME_CN'] : $k;
                        return $respone->setModel(200, 0, Yii::t('inventory', 'Query was successful!'), $returnArray);
//                        return $respone->setModel(200, 0, "查询成功", $returnArray);
                    }
                }
            }
            return $respone->setModel(200, 0, Yii::t('inventory', 'Query was successful!'), $returnArray);
//            return $respone->setModel(200, 0, "查询成功", $returnArray);
        }
        return $respone->setModel(200, 0, Yii::t('inventory', 'Query was successful!'), array('flag' => false, 'type' => 0));
    }

    //审核与反审核校验
    public static function auditReaudit($post)
    {
        $respone = new ResponeModel();
        $ORDER_STATE = array_key_exists('ORDER_STATE', $post) && $post['ORDER_STATE'] ? $post['ORDER_STATE'] : "";//单据状态
        $data = [];
        $data["flag"] = 1;
        return $respone->setModel(200, 0, Yii::t('inventory', 'Successful operation!'), self::checkAuditOrRedit($data, $post, $ORDER_STATE));
    }

    public static function checkAuditOrRedit($data, $post, $ORDER_STATE)
    {
        $id = self::getStorageIDByData($post);
        //查询关账
        $data = self::checkClosingState($data, $id);
        //校验负库存
        $data = self::checkInstantInventory($data, $post, $ORDER_STATE);
        return $data;
    }

    //check即时库存
    public static function checkInstantInventory($data, $post, $ORDER_STATE)
    {
        $multiply = $ORDER_STATE == 2 ? 1 : -1;
        $temp = [];
        foreach ($post['batchMTC'] as $key => $value) {
            $tempp = [];
            $tempp["WAREHOUSE_ID"] = $value["SWAREHOUSE_ID"];
            $tempp["PSKU_ID"] = $value["PSKU_ID"];
            $tempp["PSKU_CODE"] = $value["PSKU_CODE"];
            $tempp["NUMBER"] = $value["STORAGE_DNUMBER"] * $multiply;
            $temp[$key] = $tempp;
        }
        $result = Yii::$app->rpc->create('inventory')->sendAndrecv([['addons\inventory\modellogic\instantInventoryLogic', 'checkInventory1'], [$temp]]);
        if ($result["flag"] == false) {
            $data["instant_inventory"] = $result["sku"];
            $data["flag"] = 3;
        }
        return $data;
    }

    //check关账
    public static function checkClosingState($data, $id)
    {
        $mStorageList = SkStorage::find()->where(["STORAGE_ID" => $id])->all();
        foreach ($mStorageList as $key => $value) {
            if ($value->CLOSING_STATE == 1) {
                $data["flag"] = 2;
            }
        }
        return $data;
    }

    //获取纯ID
    public static function getStorageIDByData($post)
    {
        $data = [];
        foreach ($post['batchMTC'] as $key => $value) {
            $data[] = $value["STORAGE_ID"];
        }
        return $data;
    }

    //出入库总表和及时库存共通
    public static function getParamarray($post)
    {
        $paramArray = array();
        if (isset($post['batchMTC']) && count($post['batchMTC']) > 0) {
            foreach ($post['batchMTC'] as $item) {
                $paramArray = static::buildArray($paramArray, $item);
            }
        } else {
            $paramArray = static::buildArray($paramArray, $post);
        }
        return $paramArray;
    }

    public static function buildArray($paramArray, $item)
    {
        //如果是审核/反审核
        //审核  调出仓库减库存，调入仓库加库存
        //反审核  调入仓库减库存，调出仓库加库存
        if (isset($item['authFlag'])) {
            $arr = [];
            $arr['ORDER_CD'] = $item['STORAGE_CD'];
            $details = SkStorageDetail::find()
                ->where(['STORAGE_ID' => $item['STORAGE_ID']])
                ->asArray()
                ->all();
            $arr['AUTH_FLAG'] = $item['authFlag'] == 1 ? 1 : 0;//审核为1，反审核为0
            $data = [];
            foreach ($details as $detail) {
                $o_arr = [];
                $o_arr['WAREHOUSE_ID'] = $detail['SWAREHOUSE_ID'];
                $o_arr['ORGANISATION_ID'] = $item['ORGANISATION_ID'];
                $o_arr['PSKU_ID'] = $detail['PSKU_ID'];
                $o_arr['PSKU_CODE'] = $detail['PSKU_CODE'];
                $o_arr['ORDER_TYPE'] = 1;
                $o_arr['ORDER_CD'] = $item['STORAGE_CD'];
                $o_arr['ORDER_AT'] = $item['STORAGE_AT'];
                $o_arr['UNITPRICE'] = $detail['UNIT_PRICE'];
                if ($item['authFlag'] == 1) {
                    $o_arr['NUMBERS'] = $detail['STORAGE_DNUMBER'];
                    $o_arr['INSTANT_NUMBER'] = $o_arr['NUMBERS'];
                } else {
                    $o_arr['NUMBERS'] = $detail['STORAGE_DNUMBER'] * -1;
                    $o_arr['INSTANT_NUMBER'] = $o_arr['NUMBERS'];
                }
                array_push($data, $o_arr);
            }
            $arr['DATA'] = $data;
            array_push($paramArray, $arr);
        }
        return $paramArray;
    }

    //保存操作
    public static function updateCustom($post)
    {
        $ORDER_STATE = array_key_exists('ORDER_STATE', $post) && $post['ORDER_STATE'] ? $post['ORDER_STATE'] : "";//单据状态
        if ($ORDER_STATE == "") {
            throw new ServerErrorHttpException(Yii::t('inventory', 'Document status is unknown.'));
        }
        return self::saveAuditOrReaudit($post, $ORDER_STATE);
    }

    //审核&&反审核
    public static function saveAuditOrReaudit($post, $flag)
    {
        $response = new ResponeModel();
        //检查单据审核状态
        $result = self::checkAuditState($post, $flag);
        if (!$result) {
            if ($flag == 1) {
                return $response->setModel(500, 0, Yii::t("inventory", "This operation cannot be performed because the current document is not audited!"), [$post]);
            } else {
                return $response->setModel(500, 0, Yii::t("inventory", "The current document has been audited and cannot be operated on!"), [$post]);
            }
        }
        //修改单据状态并且返回采购明细ID
        $post = self::changeStateAndGetID($post, $flag);
        //更新入库单, 审核加保存操作，反审核只更改单据单据状态
        if ($flag == 1) {
            SkStorage::updateAll(["ORDER_STATE" => $flag], ["STORAGE_ID" => $post["storage_id"]]);
        } else {
            $result = self::Update($post);
            if ($result instanceof ResponeModel) {
                return $result;
            }
        }
        //出入库总表和及时库存共通
        $paramArray = static::getParamarray($post);

        Yii::$app->rpc->create('inventory')->sendAndrecv([['addons\inventory\modellogic\instantInventoryLogic', 'skuInventory'], [new SkStorage(), $paramArray]]);

        //更新采购订单收货记录
        $result = self::updatePurchaseDetail($post['purchaseDetailArray']);
        if ($result instanceof ResponeModel) {
            return $result;
        }
        return Yii::t('inventory', 'Successful operation!');
    }

    //检查状态
    public static function checkAuditState($post, $flag)
    {
        $state = true;
        foreach ($post["batchMTC"] as $key => $value) {
            $model = SkStorage::find()->where(["STORAGE_ID" => $value["STORAGE_ID"]])->one();
            if ($model->ORDER_STATE == $flag) {
                $state = false;
            }
        }
        return $state;
    }

    //修改单据状态并且返回采购明细ID
    public static function changeStateAndGetID($post, $flag)
    {
        $multiply = $flag == 2 ? 1 : -1;
        $purchaseDetailArray = [];
        $storage_id = [];
        foreach ($post["batchMTC"] as $key => $value) {
            $value['ORDER_STATE'] = $flag;
            $storage_id[] = $value["STORAGE_ID"];
            foreach ($value['sk_storage_detail'] as $key1 => $value1) {
                $purchaseDetailArray[] = ['PURCHASE_DETAIL_ID' => $value1['PURCHASE_DETAIL_ID'],
                    'STORAGE_DNUMBER' => $value1['STORAGE_DNUMBER'] * $multiply,
                    'red' => $value1['RED_STORAGE_DETAIL_ID'] ? true : false];
            }
        }
        $post['purchaseDetailArray'] = $purchaseDetailArray;
        $post['storage_id'] = $storage_id;
        return $post;
    }

    //更新采购订单收货记录
    public static function updatePurchaseDetail($purchaseDetailArray)
    {
        $updateModel = [];
        foreach ($purchaseDetailArray as $key => $value) {
            $model = PuPurchaseDetail::find()->where(["PURCHASE_DETAIL_ID" => $value["PURCHASE_DETAIL_ID"]])->asArray()->one();
            $model["RGOODS_NUMBER"] = floatval($model["RGOODS_NUMBER"]) + floatval($value["STORAGE_DNUMBER"]);
            //红字入库单需要更新已验数量
            if($value["red"]){
                $model["INSPECTION_NUMBER"] = floatval($model["INSPECTION_NUMBER"]) + floatval($value["STORAGE_DNUMBER"]);
            }
            $updateModel[] = $model;
        }
        $update = ["batchMTC" => $updateModel];
        return Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchasedetailLogic', 'Update'], [$update]]);
    }
}