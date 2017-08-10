<?php
/**
 * Created by PhpStorm.
 * User: hm
 * Date: 2017/5/18
 * Time: 13:35
 */
namespace addons\tools\modellogic;
use Yii;
use addons\tools\mws\RequestClient;
use addons\tools\mws\MarketplaceWebServiceOrders\OrderMws;
use yii\httpclient\Exception;
class AmazonGrabItemLogic extends AmazonCommonLogic{

    /**
     * requestClient Config
     * @var array
     */
    private static $_config = ['ServiceUrlSuffix'=>'/Orders/2013-09-01','ServiceVersion' => '2013-09-01','MWSClientVersion' => '2017-02-22'];
    
    public static function getItems($con = array()){
        $start = time();//开始执行
        $account = isset($con['Account'])?$con['Account']:[];
        if(!$account||!isset($account['ACCOUNT_ID']))return false;
        $service = self::getRequestServer($account,self::$_config);
        try{
            $amazonOrders = self::getAmazonOrders($account['ACCOUNT_ID']);
            foreach($amazonOrders as $amazonOrder){
                $oc = OrderMws::getInit();
                $param = $oc->listOrderItems(['SellerId'=>$account['MERCHANTID'],'AmazonOrderId'=>$amazonOrder['AMAZON_ORDER_ID']]);
                $data = $service->requestExe($param);
                $nextToken = self::_extractItemsNextToken($data);
                self::_listOrderItemsByNextToken($account,$service,$nextToken);
            }
            $log = 'finish!';
        }catch(Exception $e){
            $log = $e->getMessage();
        }
        self::grabLogs(2,$account['ACCOUNT_ID'],$start,time(),$log);
    }

    /**
     * 提取订单明细NextToken
     * @param      $data
     * @param bool $flag
     * @return null
     */
    private static function _extractItemsNextToken($data,$flag = false){
        $_str = $flag?'ListOrderItemsByNextTokenResult':'ListOrderItemsResult';
        $nextToken = isset($data[$_str]['NextToken'])?$data[$_str]['NextToken']:null;
        $response = ['AmazonOrderId'=>isset($data[$_str]['AmazonOrderId'])?$data[$_str]['AmazonOrderId']:null];
        $response['OrderItem'] = isset($data[$_str]['OrderItems']['OrderItem'])?$data[$_str]['OrderItems']['OrderItem']:null;
        $response['NextToken'] = $nextToken;
        AmazonQueueLogic::extractItemsResponse($response);
//        self::_extractItemsResponse($response);//正式用队列
        return $nextToken;
    }

    /**
     * getListOrderItemsByNextToken
     * @param $account
     * @param $service
     * @param $nextToken
     * @return bool
     */
    public static function _listOrderItemsByNextToken($account,$service,$nextToken){
        if(!$nextToken){
            return false;
        }
        if(!($service instanceof RequestClient)){
            $service = self::getRequestServer($account,self::$_config);
        }
        $oc = OrderMws::getInit();
        $param = $oc->listOrderItemsByNextToken(['SellerId'=>$account['MERCHANTID'],'NextToken'=>$nextToken]);
        $data = $service->requestExe($param);
        $nextToken = self::_extractItemsNextToken($data,true);
        self::_listOrderItemsByNextToken($account,$service,$nextToken);
    }

    /**
     * 消息队列处理数据
     * @param $response
     */
    private static function _extractItemsResponse($response){
        Yii::$app->queue->pushOn(['addons\tools\modellogic\AmazonQueueLogic','extractItemsResponse'],$response,'queue_AmazonGrabItems');
    }

    /**
     * get O ITEMS By ID
     * @param $amazonOrderId
     * @return bool
     */
    public static function getItemsByAId($amazonOrderId){
        $start = time();//开始执行
        $amazonOrder = self::getAmazonOrderById($amazonOrderId);
        $account = self::getAccountInfoById($amazonOrder['ACCOUNT_ID']);
        if(!$account)return false;
        $service = self::getRequestServer($account,self::$_config);
        try{
            $oc = OrderMws::getInit();
            $param = $oc->listOrderItems(['SellerId'=>$account['MERCHANTID'],'AmazonOrderId'=>$amazonOrderId]);
            $data = $service->requestExe($param);
            $nextToken = self::_extractItemsNextToken($data);
            self::_listOrderItemsByNextToken($account,$service,$nextToken);
            $log = 'finish!';
        }catch(Exception $e){
            $log = $e->getMessage();
        }
        self::grabLogs(9,$account['ACCOUNT_ID'],$start,time(),$log);
    }
}