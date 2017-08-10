<?php
/**
 * Created by PhpStorm.
 * User: hm
 * Date: 2017/7/25
 * Time: 13:35
 */
namespace addons\tools\modellogic;
use addons\tools\mws\MWSFinancesService\FinancesMws;
use Yii;
use addons\tools\mws\RequestClient;
use yii\httpclient\Exception;
class AmazonFinancialLogic extends AmazonCommonLogic{

    /**
     * requestClient Config
     * @var array
     */
    private static $_config = ['ServiceUrlSuffix'=>'/Finances/2015-05-01','ServiceVersion' => '2015-05-01','MWSClientVersion' => '2017-07-26'];
    
    public static function getFinances($con = array()){
        $start = time();//开始执行
        $account = isset($con['Account'])?$con['Account']:[];
        if(!$account||!isset($account['ACCOUNT_ID']))return false;
        $service = self::getRequestServer($account,self::$_config);
        try{
            self::_matchCondition($con,$account);
            $fm = FinancesMws::getInit();
            $param = $fm->listFinancialEvents($con);
            $data = $service->requestExe($param);
            $nextToken = self::_extractNextToken($account,$data);
            self::_listFinancialEventsByNextToken($account,$service,$nextToken);
            $log = 'finish!';
        }catch(Exception $e){
            $log = $e->getMessage();
        }
        self::grabLogs(3,$account['ACCOUNT_ID'],$start,time(),$log);
    }

    /**
     * 匹配参数
     * @param $con
     * @param $account
     */
    private static function _matchCondition(&$con,$account){
        $con['PostedAfter'] = isset($con['PostedAfter'])?$con['PostedAfter']:self::getCreatedAfterById($account['ACCOUNT_ID']);
        $con['PostedBefore'] = isset($con['PostedBefore'])?$con['PostedBefore']:self::getCreatedBefore($con['PostedAfter']);
        $con['SellerId'] = $account['MERCHANTID'];
    }

    /**
     * 提取NextToken
     * @param      $account
     * @param      $data
     * @param bool $flag
     * @return null
     */
    private static function _extractNextToken($account,$data,$flag=false){
        $_str = $flag?'ListFinancialEventsByNextTokenResult':'ListFinancialEventsResult';
        $response = ['Account'=>$account];
        $response['FinancialEvents'] = isset($data[$_str]['FinancialEvents'])?$data[$_str]['FinancialEvents']:[];
        AmazonQueueLogic::extractFinancialEventsResponse($response);
//        self::_extractFinancialEventsResponse($response);//正式用队列
        return isset($data[$_str]['NextToken'])?$data[$_str]['NextToken']:null;
    }

    /**
     * getListOrdersByNextToken
     * @param $account
     * @param $service
     * @param $nextToken
     * @return bool
     */
    private static function _listFinancialEventsByNextToken($account,$service,$nextToken){
        if(!$nextToken){
            return false;
        }
        if(!($service instanceof RequestClient)){
            $service = self::getRequestServer($account,self::$_config);
        }
        $fm = FinancesMws::getInit();
        $param = $fm->listFinancialEventsByNextToken(['SellerId'=>$account['MERCHANTID'],'NextToken'=>$nextToken]);
        $data = $service->requestExe($param);
        $nextToken = self::_extractNextToken($account,$data,true);
        self::_listFinancialEventsByNextToken($account,$service,$nextToken);
    }

    /**
     * 消息队列处理数据
     * @param $response
     */
    private static function _extractFinancialEventsResponse($response){
        Yii::$app->queue->pushOn(['addons\tools\modellogic\AmazonQueueLogic','extractFinancialEventsResponse'],$response,'queue_AmazonFinancialEvents');
    }
}