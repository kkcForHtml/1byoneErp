<?php
/**
 * Created by PhpStorm.
 * User: hm
 * Date: 2017/6/1
 * Time: 11:51
 */
namespace addons\tools\modellogic;
use addons\tools\models\XAmazonAdmin;
use addons\tools\models\XAmazonOrders;
use yii\swoole\db\Query;
use yii\swoole\rest\CreateExt;
class AmazonQueueLogic extends AmazonCommonLogic{
    /**
     * 提取订单数据
     * @param $response
     */
    public static function extractResponse($response){
        $responseOrder = isset($response['Order']['AmazonOrderId'])?[$response['Order']]:$response['Order'];
        foreach($responseOrder as $v){
            $order = self::_toArray($v);
            if(self::existOrders($order['AmazonOrderId'])){
                continue;
            }
            $_order = array();
            $_order['AMAZON_ORDER_ID'] = $order['AmazonOrderId'];
            $_order['ACCOUNT_ID'] = $response['Account']['ACCOUNT_ID'];
            $_order['ACCOUNT'] = $response['Account']['ACCOUNT'];
            $_order['PURCHASE_DATE'] = strtotime($order['PurchaseDate']);
            $_order['LAST_UPDATE_DATE'] = strtotime($order['LastUpdateDate']);
            $_order['ORDER_STATUS'] = $order['OrderStatus'];
            $_order['SELLER_ORDER_ID'] = $order['SellerOrderId'];
            $_order['SALES_CHANNEL'] = $order['SalesChannel'];
            $_order['FULFILLMENT_CHANNEL'] = $order['FulfillmentChannel'];
            $_order['SHIP_SERVICE_LEVEL'] = $order['ShipServiceLevel'];
            $_order['AMOUNT'] = isset($order['OrderTotal']['Amount'])?$order['OrderTotal']['Amount']:0;
            $_order['CURRENCY_CODE'] = isset($order['OrderTotal']['CurrencyCode'])?$order['OrderTotal']['CurrencyCode']:'';
            $_order['COUNTRY_CODE'] = isset($order['ShippingAddress']['CountryCode'])?$order['ShippingAddress']['CountryCode']:'';
            $_order['STATE_OR_REGION'] = isset($order['ShippingAddress']['StateOrRegion'])?$order['ShippingAddress']['StateOrRegion']:'';
            $_order['POSTAL_CODE'] = isset($order['ShippingAddress']['PostalCode'])?$order['ShippingAddress']['PostalCode']:'';
            unset($order);
            $_xAdmin = ['ACCOUNT_ID'=>$response['Account']['ACCOUNT_ID'],'AMAZON_ORDER_ID' => $_order['AMAZON_ORDER_ID'],'PURCHASE_DATE' => $_order['PURCHASE_DATE']];
            $_xOrders = ['AMAZON_ORDER_ID' => $_order['AMAZON_ORDER_ID'],'ORDER_CONTENT' => json_encode($_order)];
            $flag = CreateExt::actionDo(new XAmazonAdmin(),$_xAdmin);
            $flag&&CreateExt::actionDo(new XAmazonOrders(),$_xOrders);
        }
    }

    /**
     * 订单是否已经存在
     * @param $amazonOrderId
     * @return bool
     */
    private static function existOrders($amazonOrderId){
        return (new Query())->from('x_amazon_orders')
            ->where(['AMAZON_ORDER_ID'=>$amazonOrderId])
            ->exists();
    }

    /**
     * 提取明细数据
     * @param $response
     */
    public static function extractItemsResponse($response){
        $_xOrders = (new Query())->from('x_amazon_orders')
            ->where(['AMAZON_ORDER_ID' => $response['AmazonOrderId']])
            ->one();
        if($_xOrders){
            $orderItems = array();
            if(isset($response['OrderItem']['OrderItemId'])){
                $orderItems[0] = self::_covertItems($response['AmazonOrderId'],self::_toArray($response['OrderItem']));
            }else{
                foreach($response['OrderItem'] as $k=>$v){
                    $orderItems[$k] = self::_covertItems($response['AmazonOrderId'],self::_toArray($v));
                }
            }
            $_orderItems = isset($_xOrders['ITEM_CONTENT'])&&$_xOrders['ITEM_CONTENT']?json_decode($_xOrders['ITEM_CONTENT'],true):[];
            $items = array_merge($_orderItems,$orderItems);
            $status = $response['NextToken']?self::PARSE_STATUS_NO:self::PARSE_STATUS_YES;
            $flag = XAmazonOrders::updateAll(['ITEM_CONTENT'=>json_encode($items),'STATUS'=>$status],['ID' => $_xOrders['ID']]);
            $flag && XAmazonAdmin::updateAll(['TYPE'=>self::TYPE_ITEM],['AMAZON_ORDER_ID' => $response['AmazonOrderId'],'TYPE'=>self::TYPE_ORDER]);
        }
    }

    /**
     * 转换明细数据
     * @param $amazonOrderId
     * @param $orderItem
     * @return array
     */
    private static function _covertItems($amazonOrderId,$orderItem){
        $_orderItem = array();
        $_orderItem['AMAZON_ORDER_ID'] = $amazonOrderId;
        $_orderItem['ASIN'] = isset($orderItem['ASIN'])?$orderItem['ASIN']:'';
        $_orderItem['ORDER_ITEM_ID'] = isset($orderItem['OrderItemId'])?$orderItem['OrderItemId']:'';
        $_orderItem['SELLER_SKU'] = isset($orderItem['SellerSKU'])?$orderItem['SellerSKU']:'';
        $_orderItem['QUANTITY_SHIPPED'] = isset($orderItem['QuantityShipped'])?$orderItem['QuantityShipped']:0;
        $_orderItem['CURRENCY_CODE'] = isset($orderItem['ItemPrice']['CurrencyCode'])?$orderItem['ItemPrice']['CurrencyCode']:'';
        //订单商品的售价 等于商品售价乘以订购数量 请注意：不包括ShippingPrice 和GiftWrapPrice。
        $_orderItem['ITEM_PRICE'] = isset($orderItem['ItemPrice']['Amount'])?$orderItem['ItemPrice']['Amount']:0;
        //运费
        $shippingPrice = isset($orderItem['ShippingPrice']['Amount'])?$orderItem['ShippingPrice']['Amount']:0;
        //商品的礼品包装金额
        $giftWrapPrice = isset($orderItem['GiftWrapPrice']['Amount'])?$orderItem['GiftWrapPrice']['Amount']:0;
        $_orderItem['OTHER_PRICE'] = $shippingPrice + $giftWrapPrice;
        return $_orderItem;
    }

    /**
     * 提取财务数据
     * @param $response
     * TODO
     */
    public static function extractFinancialEventsResponse($response){
        $file = self::_getReportFilePath();
        foreach($response['FinancialEvents'] as $k=>$v){
            $item = self::_toArray($v);
            file_put_contents($file.DIRECTORY_SEPARATOR.$k.'.php','<?php return '.var_export($item,true).';');
        }
    }

    private static function _getReportFilePath(){
        $pathDir =  dirname(__DIR__).DIRECTORY_SEPARATOR.'modellogic'.DIRECTORY_SEPARATOR.'Financial';
        if(!is_dir($pathDir)){
            mkdir($pathDir,0777,true);
        }
        return $pathDir;
    }
}