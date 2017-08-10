<?php

/**
 * Created by PhpStorm.
 * User: AM02
 * Date: 2017/5/3
 * Time: 15:38
 */

namespace addons\inventory\modellogic;

use addons\inventory\models\SkLibraryRecord;
use addons\master\basics\models\BWarehouse;
use addons\tools\models\CAmazoninventory;
use Yii;
use addons\inventory\models\SkInstantInventory;
use yii\queue\drives\RedisQueue;
use addons\purchase\models\PuPurchaseDetail;
use yii\swoole\db\ActiveRecord;
use yii\swoole\db\Query;
use yii\swoole\helpers\ArrayHelper;
use yii\swoole\rest\CreateExt;
use yii\swoole\rest\ResponeModel;
use yii\web\ServerErrorHttpException;

class instantInventoryLogic
{
    /**
     * 加入库存队列
     * @param $paramArray
     */
    public static function inventoryJob($paramArray)
    {

        if (count($paramArray) > 0) {
            Yii::$app->queue->pushOn([
                    "addons\\inventory\\modellogic\\instantInventoryLogic",//类名
                    "updateSkuInventory"//方法名
                ]
                , $paramArray, 'inventory');
        }

    }

    /**
     * 更新即时库存
     * @param $paramArray
     */
    public static function updateSkuInventory($model, $paramArray)
    {
        foreach ($paramArray as $param) {
            $si = SkInstantInventory::find()
                ->where(['WAREHOUSE_CODE' => $param['WAREHOUSE_CODE'], 'PSKU_CODE' => $param['PSKU_CODE']])
                ->one();
            if ($si) {
                $si->INSTANT_NUMBER += $param['INSTANT_NUMBER'];
                $si->save();
            }
        }
    }

    /**
     * 更新即时库存和库存总表
     * @param ActiveRecord $model
     * @param array $paramArray
     */
    public static function skuInventory(ActiveRecord $model, array $paramArray)
    {
        foreach ($paramArray as $item) {
            if ($item['AUTH_FLAG']) {
                self::_updateInventory($item['DATA']);
            } else {
                SkLibraryRecord::deleteAll(['ORDER_CD' => $item['ORDER_CD']]);
            }
        }
    }

    /**
     * 更新即时库存和库存总表操作
     * @param array $data
     * @param bool $authFlag
     */
    private static function _updateInventory(array $data, $authFlag = true)
    {
        foreach ($data as $param) {
            $c = SkInstantInventory::find()->where(['WAREHOUSE_ID' => $param['WAREHOUSE_ID'], 'PSKU_ID' => $param['PSKU_ID']])->count(0);
            if ($c > 0) {
                $si = SkInstantInventory::find()
                    ->where(['WAREHOUSE_ID' => $param['WAREHOUSE_ID'], 'PSKU_ID' => $param['PSKU_ID']])
                    ->one();
                $si->INSTANT_NUMBER += $param['INSTANT_NUMBER'];
            } else {
                $si = new SkInstantInventory();
                $arr = [];
                $arr['ORGANISATION_ID'] = $param['ORGANISATION_ID'];
                $arr['PSKU_ID'] = $param['PSKU_ID'];
                $arr['PSKU_CODE'] = $param['PSKU_CODE'];
                $arr['INSTANT_NUMBER'] = $param['INSTANT_NUMBER'];
                $arr['WAREHOUSE_ID'] = $param['WAREHOUSE_ID'];
                $si->setAttributes($arr);
            }
            $res = $flag = $si->save();
            $addres = CreateExt::actionDo(new SkLibraryRecord(), $param);
            $authFlag && $flag && $addres;
        }
    }

    /**
     * 入库单回写处理采购订单
     * @param $paramArray
     */
    public static function backDealPurchase($model, $paramArray)
    {
        if (count($paramArray) > 0) {
            foreach ($paramArray as $param) {
                if ($param['ORDER_TYPE'] == 1 || $param['ORDER_TYPE'] == 2) {
                    //单据类型是"采购入库"，或者是"内部采购入库"，更新采购明细的已收货数量
                    $puPurchaseDetail = PuPurchaseDetail::findOne(['PU_PURCHASE_CD' => $param['PU_ORDER_CD'], 'PSKU_CODE' => $param['PSKU_CODE']]);
                    $puPurchaseDetail->RGOODS_NUMBER += $param['INSTANT_NUMBER'];
                    if ($param['authFlag'] == 1 && $param['INSTANT_NUMBER'] < 0) {
                        //红字审核时，更新已验货数量
                        $puPurchaseDetail->INSPECTION_NUMBER += $param['INSTANT_NUMBER'];
                    }
                    $puPurchaseDetail->save();
                }
            }
        }
    }

    public static function checkInventory(array $post)
    {
        $response = new ResponeModel();
        $rules = ArrayHelper::remove($post, 'rules');
        if (!is_array($post) || ($rules) === null) {
            throw new ServerErrorHttpException(Yii::t('inventory', 'Parameter check failed'));
        }
        $re = ['flag' => true, 'sku' => ''];

        $items = ArrayHelper::remove($post, $rules['itemKey']);
        $skuIds = ArrayHelper::getColumn($items, $rules['skuKey']);
        $sum = ArrayHelper::sum($items, $rules['numKey'], $rules['skuKey']);
        $whCodes = ArrayHelper::remove($post, $rules['whKey']);
        $result = SkInstantInventory::find()->select(['INSTANT_NUMBER', 'WAREHOUSE_CODE', 'WAREHOUSE_ID', 'PSKU_ID'])
            ->where(['PSKU_ID' => $skuIds, $rules['whKey'] => $whCodes])
            ->asArray()
            ->all();

        foreach ($items as $item) {
            $flag = true;
            foreach ($result as $data) {
                if ($data['PSKU_ID'] == $item[$rules['skuKey']] && $data[$rules['whKey']] == $item[$rules['whKey']]) {
                    $flag = false;
                    if ($data['INSTANT_NUMBER'] + $sum[$data['PSKU_ID']] < 0) {
                        $re = ['flag' => false, 'sku' => $item[$rules['skuCode']]];
                        return $response->setModel(200, 0, Yii::t('inventory', 'Successful operation!'), $re);
                    }
                }
            }
            if ($flag && isset($sum[$rules['skuKey']]) && $sum[$rules['skuKey']] < 0) {
                $re = ['flag' => false, 'sku' => $item[$rules['skuCode']]];
                return $response->setModel(200, 0, Yii::t('inventory', 'Successful operation!'), $re);
            }
        }
        return $response->setModel(200, 0, Yii::t('inventory', 'Successful operation!'), $re);
    }

    public static function checkInventory1(array $post)
    {
        //排序
        ArrayHelper::multisort($post, ["WAREHOUSE_ID", "PSKU_ID"], [SORT_ASC, SORT_ASC]);
        //合并数量
        $data = self::sumInventoryNumber($post);
        //校验负库存
        return self::checkInventoryNumber($data);
    }

    public static function sumInventoryNumber(array $post)
    {
        $temp = [];
        $tempp = [];
        $WAREHOUSE_ID = "";
        $PSKU_ID = "";
        foreach ($post as $key => $value) {
            if ($value["WAREHOUSE_ID"] != $WAREHOUSE_ID || $value["PSKU_ID"] != $PSKU_ID) {
                if (count($tempp)) {
                    $temp["DATA"][] = $tempp;
                }
                $temp["WAREHOUSE_ID"][] = $value["WAREHOUSE_ID"];
                $temp["PSKU_ID"][] = $value["PSKU_ID"];
                $tempp["WAREHOUSE_ID"] = $value["WAREHOUSE_ID"];
                $tempp["PSKU_ID"] = $value["PSKU_ID"];
                $tempp["PSKU_CODE"] = $value["PSKU_CODE"];
                $tempp["NUMBER"] = 0;
                $WAREHOUSE_ID = $tempp["WAREHOUSE_ID"];
                $PSKU_ID = $tempp["PSKU_ID"];
            }
            $tempp["NUMBER"] += $value["NUMBER"];
        }
        $temp["DATA"][] = $tempp;
        return $temp;
    }

    public static function checkInventoryNumber(array $data)
    {
        //即时库存表
        $mSkInstantInventoryList = SkInstantInventory::find()->select(['INSTANT_NUMBER', 'WAREHOUSE_ID', 'PSKU_ID', 'PSKU_CODE', 'INSTANT_INVENTORY_ID'])
            ->where(["PSKU_ID" => $data["PSKU_ID"], "WAREHOUSE_ID" => $data["WAREHOUSE_ID"]])
            ->asArray()
            ->all();
        //亚马逊库存数据表
        $mCAmazoninventoryList = CAmazoninventory::find()->select(['IN_STOCK_SUPPLY_QUANTITY', 'PSKU_ID'])
            ->where(["PSKU_ID" => $data["PSKU_ID"], "STATUS" => 1])
            ->asArray()
            ->all();
        //所有仓库类型是 5且仓库所属平台类型是 amazon的仓库ID
        $mBWarehouseIDList = (new Query())
            ->select(['bw.WAREHOUSE_ID'])->from("b_warehouse bw")
            ->leftJoin("b_channel bc", "bc.CHANNEL_ID = bw.CHANNEL_ID")
            ->where(["bw.WAREHOUSE_TYPE_ID" => 5, "bc.PLATFORM_TYPE_ID" => 2])
            ->distinct(true)
            ->all();
        return self::verifyInventoryNumber($data, $mSkInstantInventoryList, $mCAmazoninventoryList, $mBWarehouseIDList);
    }

    public static function verifyInventoryNumber($data, $mSkInstantInventoryList, $mCAmazoninventoryList, $mBWarehouseIDList)
    {
        $re = ['flag' => true, 'sku' => ''];
        foreach ($data["DATA"] as $key => $value) {
            //入库不做校验
            if ($value["NUMBER"] <= 0) {
                $flag = false;
                $amzFlag = false;
                //若是当校验的仓库类型是 5：海外托管仓，且仓库所属平台类型是 amazon时，校验亚马逊库存数据表
                foreach ($mBWarehouseIDList as $key1 => $value1) {
                    if ($value1["WAREHOUSE_ID"] == $value["WAREHOUSE_ID"]) {
                        $amzFlag = true;
                        break;
                    }
                }
                if ($amzFlag) {
                    foreach ($mCAmazoninventoryList as $key1 => $value1) {
                        if ($value1["PSKU_ID"] == $value["PSKU_ID"] && (($value["NUMBER"] + $value1["IN_STOCK_SUPPLY_QUANTITY"]) >= 0)) {
                            $flag = true;
                            break;
                        }
                    }
                } else {
                    foreach ($mSkInstantInventoryList as $key1 => $value1) {
                        if ($value["WAREHOUSE_ID"] == $value1["WAREHOUSE_ID"] && $value["PSKU_ID"] == $value1["PSKU_ID"] && (($value["NUMBER"] + $value1["INSTANT_NUMBER"]) >= 0)) {
                            $flag = true;
                            break;
                        }
                    }
                }
                if (!$flag) {
                    $re["sku"] = $re["sku"] . "," . $value["PSKU_CODE"];
                }
            }
        }
        //格式化返回参数
        if ($re["sku"] != "") {
            $re["flag"] = false;
            $re["sku"] = substr($re["sku"], 1, strlen($re["sku"]));
        }
        return $re;
    }
}