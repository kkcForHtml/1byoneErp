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
class AmazonGrabOrderLogic extends AmazonCommonLogic{

    /**
     * requestClient Config
     * @var array
     */
    private static $_config = ['ServiceUrlSuffix'=>'/Orders/2013-09-01','ServiceVersion' => '2013-09-01','MWSClientVersion' => '2017-02-22'];

    private static $_times;

    public static function getOrders($con = array()){
        $start = time();//开始执行
        $account = isset($con['Account'])?$con['Account']:[];
        if(!$account||!isset($account['ACCOUNT_ID']))return false;
        $service = self::getRequestServer($account,self::$_config);
        try{
            self::$_times = 0;
            self::_matchCondition($con,$account);
            $oc = OrderMws::getInit();
            $param = $oc->listOrders($con);
            $data = $service->requestExe($param);
            $nextToken = self::_extractNextToken($account,$data);
            self::_listOrdersByNextToken($account,$service,$nextToken);
            $log = 'finish!';
        }catch(Exception $e){
            $log = $e->getMessage();
        }
        self::grabLogs(1,$account['ACCOUNT_ID'],$start,time(),$log);
    }

    /**
     * 匹配请求参数
     * @param $con
     * @param $account
     */
    private static function _matchCondition(&$con,$account){
        $con['CreatedAfter'] = isset($con['CreatedAfter'])?$con['CreatedAfter']:self::getCreatedAfterById($account['ACCOUNT_ID']);
        $con['CreatedBefore'] = isset($con['CreatedBefore'])?$con['CreatedBefore']:self::getCreatedBefore($con['CreatedAfter']);
        $con['SellerId'] = $account['MERCHANTID'];
        $con['MarketplaceId'] = [$account['MwsMP']];
        $con['OrderStatus'] = ['Unshipped','PartiallyShipped','Shipped','InvoiceUnconfirmed','Canceled','Unfulfillable'];
    }

    /**
     * 提取订单NextToken
     * @param      $account
     * @param      $data
     * @param bool $flag
     * @return null
     */
    private static function _extractNextToken($account,$data,$flag=false){
        $_str = $flag?'ListOrdersByNextTokenResult':'ListOrdersResult';
        $response = ['Account'=>$account];
        $response['Order'] = isset($data[$_str]['Orders']['Order'])?$data[$_str]['Orders']['Order']:[];
        AmazonQueueLogic::extractResponse($response);
//        self::_extractResponse($response);//正式用队列
        return isset($data[$_str]['NextToken'])?$data[$_str]['NextToken']:null;
    }

    /**
     * getListOrdersByNextToken
     * @param $account
     * @param $service
     * @param $nextToken
     * @return bool
     */
    private static function _listOrdersByNextToken($account,$service,$nextToken){
        self::$_times++;
        if(self::$_times > 5){
            return false;
        }
        if(!$nextToken){
            return false;
        }
        if(!($service instanceof RequestClient)){
            $service = self::getRequestServer($account,self::$_config);
        }
        $oc = OrderMws::getInit();
        $param = $oc->listOrdersByNextToken(['SellerId'=>$account['MERCHANTID'],'NextToken'=>$nextToken]);
        $data = $service->requestExe($param);
        $nextToken = self::_extractNextToken($account,$data,true);
        self::_listOrdersByNextToken($account,$service,$nextToken);
    }

    /**
     * 消息队列处理数据
     * @param $response
     */
    private static function _extractResponse($response){
        Yii::$app->queue->pushOn(['addons\tools\modellogic\AmazonQueueLogic','extractResponse'],$response,'queue_AmazonGrabOrders');
    }
}