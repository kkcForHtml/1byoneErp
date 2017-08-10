<?php
namespace addons\amazon\modellogic;
use Yii;
use yii\swoole\rest\CreateExt;
use addons\amazon\models\CAmazonOrder;
use addons\amazon\models\CAmazonParseLogs;
use yii\swoole\db\Query;
class OrderParseLogic
{
    const PARSE_STATUS_PASS = 1;//解析成功
    const PARSE_STATUS_FAIL = 2;//解析失败

    private static $_parseFail;

    /**
     * 解析
     */
    public static function parseOrders(){
        $needParseOrders = self::_getNeedParseOrders();
        if(empty($needParseOrders))return false;
        $accountList = self::_getAccountList();
        $statusList = self::_getStatusList();
        $moneyList = self::_getMoneyList();
        $areaList = self::_getAreaList();
        $writeBackIds = [];
        foreach($needParseOrders as $parseOrder){
            if($parseOrderId = self::_parseOrders($parseOrder,$accountList,$statusList,$moneyList,$areaList)){
                array_push($writeBackIds,$parseOrderId);
            }
        }
        !empty($writeBackIds) && self::_writeBackParseOrders($writeBackIds);
    }

    /**
     * 解析订单&明细
     * @param $parseOrder
     * @param $accountList
     * @param $statusList
     * @param $moneyList
     * @param $areaList
     * @return int
     */
    private static function _parseOrders($parseOrder,$accountList,$statusList,$moneyList,$areaList){
        $order = json_decode($parseOrder['ORDER_CONTENT'],true);
        $items = json_decode($parseOrder['ITEM_CONTENT'],true);
        if(!$order['ACCOUNT_ID']||!$accountList)return 0;
        if(!array_key_exists($order['ACCOUNT_ID'],$accountList))return 0;
        self::$_parseFail = false;
        self::_checkOrder($order,$statusList,$moneyList,$areaList);
        self::_checkItems($items,$accountList[$order['ACCOUNT_ID']],$moneyList);
        self::$_parseFail?$order['PARSE_STATUS'] = self::PARSE_STATUS_FAIL:'';
        $flag = self::_addOrderItems($order,$items);
        return $flag ? $parseOrder['ID'] : 0;
    }

    /**
     * 校验订单
     * @param $order
     * @param $statusList
     * @param $moneyList
     * @param $areaList
     */
    private static function _checkOrder(&$order,$statusList,$moneyList,$areaList){
        $order['ORDER_STATUS'] = self::_getStatus($order['ORDER_STATUS'],$statusList);
        $order['CURRENCY_CODE']&&array_key_exists($order['CURRENCY_CODE'],$moneyList)?$order['CURRENCY_ID'] = $moneyList[$order['CURRENCY_CODE']]:'';
        $order['COUNTRY_CODE']&&array_key_exists($order['COUNTRY_CODE'],$areaList)?$order['COUNTRY_ID'] = $areaList[$order['COUNTRY_CODE']]:'';
    }

    /**
     * 检验明细
     * @param $items
     * @param $account
     * @param $moneyList
     */
    private static function _checkItems(&$items,$account,$moneyList){
        array_walk($items,function (&$v) use($account,$moneyList){
            $v['CURRENCY_CODE']&&array_key_exists($v['CURRENCY_CODE'],$moneyList)?$v['CURRENCY_ID'] = $moneyList[$v['CURRENCY_CODE']]:'';
            $skuInfo = self::_getPSkuBySellerSku($v['SELLER_SKU'],$account['ACCOUNT_ID'],$account['ORGANISATION_ID']);
            if(!$skuInfo||empty($skuInfo['PSKU_ID'])){
                $body = ['TYPE'=>2,
                         'ERROR_TYPE'=>1,
                         'TYPE_ID'=>$v['AMAZON_ORDER_ID'],
                         'ERROR_MESSAGE'=>$account['ACCOUNT_ID'].'|'.$account['ORGANISATION_ID'].'|'.$v['SELLER_SKU'],
                         'MARK_STATUS'=>1];
                CreateExt::actionDo(new CAmazonParseLogs(),$body);
                self::$_parseFail = true;
            }else{
                $v['PSKU_ID'] = $skuInfo['PSKU_ID'];
            }
        });
    }

    /**
     * 更新订单&明细表
     * @param $order
     * @param $items
     * @return bool
     */
    private static function _addOrderItems($order,$items){
        if(self::_existParseOrder($order['AMAZON_ORDER_ID']))return true;
        $order['c_amazon_order_detail'] = $items;
        $flag = CreateExt::actionDo(new CAmazonOrder(),$order);
        return $flag ? true : false;
    }

    /**
     * 校验订单是否已经存在
     * @param $amazonOrderId
     * @return bool
     */
    private static function _existParseOrder($amazonOrderId){
        return (new Query())->from('c_amazon_order')
            ->where(['AMAZON_ORDER_ID'=>$amazonOrderId])
            ->exists();
    }

    /**
     * 匹配SKU
     * @param $sellerSku
     * @param $accountId
     * @param $orgId
     * @return mixed
     */
    private static function _getPSkuBySellerSku($sellerSku,$accountId,$orgId){
        return Yii::$app->rpc->create('product')->sendAndrecv([['\addons\master\product\modellogic\ProductskuLogic','getSkuInfoByPlatformSku'],[$sellerSku,$accountId,$orgId]]);
    }

    /**
     * 获取订单状态
     * @param $statusCode
     * @param $statusList
     * @return mixed
     */
    private static function _getStatus($statusCode,$statusList){
        $list = array_flip($statusList);
        return $list[$statusCode];
    }

    /**
     * 获取需要解析的订单数据
     * @return mixed
     */
    private static function _getNeedParseOrders(){
        return Yii::$app->rpc->create('tools')->sendAndrecv([['\addons\tools\modellogic\AmazonParseLogic','getNeedParseOrders'],[]]);
    }

    /**
     * 回写解析状态
     * @param $writeBackIds
     */
    private static function _writeBackParseOrders($writeBackIds){
        Yii::$app->rpc->create('tools')->sendAndrecv([['\addons\tools\modellogic\AmazonParseLogic','updateParseOrdersStatus'],[$writeBackIds]]);
    }

    /**
     * 获取地区列表(AREA_NAME_EN=>AREA_ID)
     * @return array
     */
    private static function _getAreaList(){
        $areaList = Yii::$app->rpc->create('basics')->sendAndrecv([['\addons\master\basics\modellogic\basicsLogic','getAreaList'],[['AREA_ID','AREA_NAME_EN']]]);
        $re = [];
        foreach($areaList as $item){
            $re[$item['AREA_NAME_EN']] = $item['AREA_ID'];
        }
        return $re;
    }

    /**
     * 获取币种列表(MONEY_CODE=>MONEY_ID)
     * @return array
     */
    private static function _getMoneyList(){
        $moneyList = Yii::$app->rpc->create('basics')->sendAndrecv([['\addons\master\basics\modellogic\basicsLogic','getMoneyList'],[['MONEY_ID','MONEY_CODE']]]);
        $re = [];
        foreach($moneyList as $item){
            $re[$item['MONEY_CODE']] = $item['MONEY_ID'];
        }
        return $re;
    }

    /**
     * 获取账号信息
     * @return array
     */
    private static function _getAccountList(){
        $accountList = Yii::$app->rpc->create('basics')->sendAndrecv([['\addons\master\basics\modellogic\accountLogic','getAccountList'],[['ACCOUNT_STATE'=>1]]]);
        $re = [];
        foreach($accountList as $item){
            $re[$item['ACCOUNT_ID']] = $item;
        }
        return $re;
    }

    /**
     * 获取订单状态列表(STATUS=>CODE)
     * @return array
     */
    private static function _getStatusList(){
        return [
            1 => 'PendingAvailability',
            2 => 'Pending',
            3 => 'Unshipped',
            4 => 'PartiallyShipped',
            5 => 'Shipped',
            6 => 'InvoiceUnconfirmed',
            7 => 'Canceled',
            8 => 'Unfulfillable'
        ];
    }
}