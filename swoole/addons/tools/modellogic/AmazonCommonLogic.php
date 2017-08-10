<?php
/**
 * Created by PhpStorm.
 * User: hm
 * Date: 2017/5/18
 * Time: 13:35
 */
namespace addons\tools\modellogic;
use addons\tools\models\XAmazonGrablogs;
use Yii;
use addons\tools\mws\RequestClient;
use yii\swoole\db\Query;
use yii\httpclient\Exception;
use yii\swoole\rest\CreateExt;
class AmazonCommonLogic {

    const TYPE_ORDER = 1;//订单
    const TYPE_ITEM = 2;//明细
    const PARSE_STATUS_NO = 1;//不可解析
    const PARSE_STATUS_YES = 2;//可解析
    const GRAB_INTERVAL = 3600;//抓取订单时间间隔
    const GRAB_ITEM_LIMIT = 30;//抓取明细数量限制

    /**
     * 返回请求服务
     * @param $account
     * @param $config
     * @return RequestClient
     */
    public static function getRequestServer($account,$config){
        $config['ServiceURL'] = $account['MURL'].$config['ServiceUrlSuffix'];
        return new RequestClient($account['MwsAKey'],$account['MwsSKey'],$config);
    }

    /**
     * 根据账号ID获取账号信息
     * @param $id
     * @return mixed
     */
    public static function getAccountInfoById($id){
        return Yii::$app->rpc->create('basics')->sendAndrecv([['\addons\master\basics\modellogic\accountLogic','getAccount'],[['ACCOUNT_STATE'=>1,'ACCOUNT_ID' => $id]]]);
    }

    /**
     * 获取账号信息
     * @param array $accountIds
     * @return mixed
     */
    public static function getAccountList($accountIds = array()){
        $accountIds = $accountIds?$accountIds:[3,5];
        return Yii::$app->rpc->create('basics')->sendAndrecv([['\addons\master\basics\modellogic\accountLogic','getAccountList'],[['ACCOUNT_STATE'=>1,'ACCOUNT_ID' => $accountIds]]]);
    }

    /**
     * 获取抓取订单的起始时间ISO 8601 (GMT)
     * @param $accountId
     * @return false|null|string
     */
    public static function getCreatedAfterById($accountId){
        $createdAfter = (new Query())->from('x_amazon_admin')
            ->select('Max(PURCHASE_DATE)')
            ->where(['ACCOUNT_ID' => $accountId])
            ->scalar();
        return date_format(date_create('@'. ($createdAfter?$createdAfter:strtotime(date('Y-m-d',strtotime('-2 day'))))), 'c');
    }

    /**
     * 获取抓取订单的截止时间ISO 8601 (GMT)
     * @param $createdAfter
     * @return false|string
     */
    public static function getCreatedBefore($createdAfter){
        $createdBefore = strtotime($createdAfter) + self::GRAB_INTERVAL;
        $nowTime = time()-120;
        $createdBefore = $createdBefore>$nowTime?$nowTime:$createdBefore;
        return date_format(date_create('@'. $createdBefore), 'c');
    }

    /**
     * 返回要抓取明细的订单AmazonOrders
     * @param     $accountId
     * @param int $limit
     * @return array|\yii\db\ActiveRecord[]
     */
    public static function getAmazonOrders($accountId,$limit = self::GRAB_ITEM_LIMIT){
        return (new Query())->from('x_amazon_admin')
            ->select('ACCOUNT_ID,AMAZON_ORDER_ID')
            ->where(['TYPE' => self::TYPE_ORDER,'ACCOUNT_ID'=>$accountId])
            ->limit($limit)
            ->all();
    }

    /**
     * 返回要抓取明细的订单AmazonOrder
     * @param $amazonOrderId
     * @return mixed
     */
    public static function getAmazonOrderById($amazonOrderId){
        return (new Query())->from('x_amazon_admin')
            ->select('ACCOUNT_ID,AMAZON_ORDER_ID')
            ->where(['AMAZON_ORDER_ID'=>$amazonOrderId])
            ->one();
    }

    /**
     * 脚本运行情况
     * @param $start
     * @param $end
     * @return string
     */
    public static function _scriptExecInfo($start,$end){
        $time = $end['time']-$start['time'];
        $memory = $end['memory']-$start['memory'];
        return '本次脚本执行耗时：'.$time.'s,占用内存：'.$memory.'MB';
    }

    /**
     * 取时间
     * @return string
     */
    public static function getMicroTime(){
        list($u_sec,$sec) = explode(" ",microtime());
        $num = ((float)$u_sec+(float)$sec);
        return sprintf("%.4f",$num);
    }

    /**
     * 取内存占用情况
     * @return string
     */
    public static function getMemoryUsage() {
        return (!function_exists('memory_get_usage')) ? '0' : round(memory_get_usage()/1024/1024, 2).'MB';
    }

    /**
     * SimpleXMLElement Object 2 Array
     * @param $obj
     * @return array
     */
    public static function _toArray($obj) {
        if(is_object($obj)) $obj = get_object_vars($obj);
        if(is_array($obj)){
            foreach($obj as $k=>$v){
                $obj[$k] = self::_toArray($v);
            }
        }
        return $obj;
    }

    /**
     * 请求API日志信息
     * @param $type
     * @param $accountId
     * @param $startAt
     * @param $endAt
     * @param $logs
     */
    public static function grabLogs($type,$accountId,$startAt,$endAt,$logs){
        $message = self::formatDateTime($startAt).'|'.
            self::formatDateTime($endAt).'|'.
            $accountId.'|'.
            $logs;
        CreateExt::actionDo(new XAmazonGrablogs(),['TYPE'=>$type,'START_AT'=>$startAt,'END_AT'=>$endAt,'MESSAGE'=>$message]);
    }

    /**
     * 格式化日期
     * @param $time
     * @return false|string
     */
    public static function formatDateTime($time){
        return $time?date_format(date_timestamp_set(new \DateTime(), $time)->setTimezone(new \DateTimeZone('PRC')), 'Y-m-d H:i:s'):'';
    }

    /**
     * 获取请求API的服务状态
     * @param $service
     * @param $account
     * @param $config
     * @return bool
     * @throws Exception
     */
    public static function getServiceStatus($service,$account,$config){
        if(!($service instanceof RequestClient)){
            $service = self::getRequestServer($account,$config);
        }
        try{
            $data = $service->requestExe(['Action'=>'GetServiceStatus','SellerId'=>$account['MERCHANTID']]);
            $status = isset($data['GetServiceStatusResult']['Status'])?$data['GetServiceStatusResult']['Status']:null;
            if(!($status&&($status=='GREEN'||$status=='GREEN_I'))){
               throw new Exception('Network environment poor');
            }
        }catch(Exception $e){
            throw $e;
        }
    }
}