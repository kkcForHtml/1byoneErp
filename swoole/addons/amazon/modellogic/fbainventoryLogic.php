<?php
/**
 * Created by PhpStorm.
 * User: erp
 * Date: 2017/6/23
 * Time: 16:28
 */

namespace addons\amazon\modellogic;

use addons\amazon\models\FbaFulfillmentError;
use addons\amazon\models\FbaFulfillmentInventory;
use Yii;
use yii\swoole\rest\ResponeModel;

class fbainventoryLogic
{
    public static $modelClass = 'addons\amazon\models\FbaFulfillmentInventory';

    /**
     * FBA自动收货-定时读表
     */
    public static function autoReceive(){
        $DBlist = FbaFulfillmentInventory::find()->where(['=', 'STATUS', '1'])->all();   //读取未匹配的记录
        if($DBlist){
            foreach($DBlist as $item){
                $item->STATUS = 2;  //状态标为已匹配
                $item->save();
                $result =  self::receiveByItem($item);  //收货
                if($result){
                    //入库失败，加入异常表
                    $err = new FbaFulfillmentError();
                    $err->FBA_FULFILLMENT_ID = $item->ID;
                    $err->ERROR_MESSAGE = $result;
                    $err->RETRY_TIMES = 0;
                    $err->insert();
                }
            }
        }
        return true;
    }

    /**
     * 根据一条亚马逊收货记录，进行确认入库
     * @param $item
     * @return MSG
     */
    public static function receiveByItem($item){
        $dispatchDB = self::getDispatch($item->ACCOUNT_ID, $item->FBA_SHIPMENT_ID, $item->PSKU_CODE);   //查询发运单
        if(!$dispatchDB){
            return '没有找到对应的发运单';
        }
        $pendStorageDB = self::getPendstorage($dispatchDB);    //根据发运单读取待入库记录
        if(!$pendStorageDB){
            return '没有找到对应的待入库记录';
        }
        $list = self::allotNumber($pendStorageDB, $item->QUANTITY); //将数量分配到入库单
        if(empty($list)){
            return '收货数量与待入库单的未接收数量匹配失败';
        }
        $data = self::pickData($list, $item->RECEIVED_DATE); //拼装确认入库的数据
        $result = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PendstorageLogic','ConfirmInventory'],[$data]]); //进行确认入库操作
        if(!$result){
            return '确认入库操作失败';
        }
        return '';
    }

    /**
     * 查询发运单
     * @param $ACCOUNT_ID   -账号id
     * @param $FBA_SHIPMENT_ID   -FBA id
     * @param $PSKU_CODE -产品sku(需求国sku)
     * @return array
     */
    public static function getDispatch($ACCOUNT_ID, $FBA_SHIPMENT_ID, $PSKU_CODE){
        $account = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\accountLogic', 'getAccountOne'], [['=', 'ACCOUNT_ID', $ACCOUNT_ID]]])->recv(); //获取账号信息,取得组织编码
        $dispatchWhere = ['ORGANISATION_CODE' => $account['ORGANIZE_CODE'], 'FBA_ID' => $FBA_SHIPMENT_ID, 'DEMANDSKU_CODE' => $PSKU_CODE, 'PLAN_STATE' => 2];  //查询发运单条件，根据组织，FBAID，产品SKU，并且已审核的
        return Yii::$app->rpc->create('shipment')->send([['\addons\shipment\modellogic\dispatchLogic', 'search_dispatch'], [$dispatchWhere]])->recv(); //查询发运单
    }

    /**
     * 根据发运单查询待入库记录
     * @param $dispatchDB
     * @return array
     */
    public static function getPendstorage($dispatchDB){
        $id = array();
        foreach($dispatchDB as $item){
            $id[] = $item['DISPATCH_NOTE_ID'];
        }
        $where = ['and', ['=', 'IMPORT_STATE', 1], ['in', 'NOTE_ID', $id], ['<>', 'PLAN_STATE', 2]];    //条件
        return Yii::$app->rpc->create('shipment')->send([['\addons\inventory\modellogic\PendstorageLogic', 'GetPendingStorage'], [[],$where]])->recv(); //查询待入库记录
    }

    /**
     * 拼装确认入库接口所需的数据
     * @param $list
     * @return array
     */
    public static function pickData($list, $time){
        $data = array();
        foreach($list as $k => $v){
            $data[$k]['THE_RECEIVE_NUMBERT'] = $v['THE_RECEIVE_NUMBERT'];   //本次收货数量
            $data[$k]['PENDING_STORAGE_ID'] = $v['PENDING_STORAGE_ID']; //待入库id
            $data[$k]['ACTUAL_AT'] = $time;     //实际收货日期
        }
        return ['batchMTC' => $data, 'is_self_return' => 1];
    }

    /**
     * 分配收货数量到一个或多个待入库单
     * @param $pendStorageDB
     * @param $num
     * @return array
     */
    public static function allotNumber($pendStorageDB, $num){
        $list = array();
        foreach($pendStorageDB as $k => $v){
            if($num > 0){
                $DBnum = $v['SHIPMENT_NUMBER'] - $v['RECEIVE_NUMBER'];  //未接收数量
                $list[$k] = $v;
                if($num > $DBnum){
                    $list[$k]['THE_RECEIVE_NUMBERT'] = $DBnum;  //本次接收数量=未接收数量
                    $num -= $DBnum;     //收货数量相应减少
                }else{
                    $list[$k]['THE_RECEIVE_NUMBERT'] = $num;  //本次接收数量=收货数量
                    $num = 0;           //收货数量分配完
                }
            }
        }
        if($num == 0){  //分配完
            return $list;
        }
        return array();
    }


}