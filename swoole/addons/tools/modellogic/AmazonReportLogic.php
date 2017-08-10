<?php
/**
 * Created by PhpStorm.
 * User: hm
 * Date: 2017/5/18
 * Time: 13:35
 */
namespace addons\tools\modellogic;
use addons\tools\models\XAmazonReportload;
use addons\tools\models\XAmazonReportrequest;
use addons\tools\mws\RequestClient;
use addons\tools\mws\MarketplaceWebService\ReportMws;
use yii\swoole\db\Query;
use yii\httpclient\Exception;
use yii\swoole\rest\CreateExt;
class AmazonReportLogic extends AmazonCommonLogic{

    /**
     * requestClient Config
     * @var array
     */
    private static $_config = ['ServiceUrlSuffix'=>null,'ServiceVersion' => '2009-01-01','MWSClientVersion' => '2016-09-21','ProxyHost' => null,'ProxyPort' => -1];

    const GRAB_REPORT_INTERVAL = 86400; //起止时间间隔
    const KEY_TYPE = 'type';//与AmazonParseLogic保持一致
    const KEY_DIR = 'dir';//与AmazonParseLogic保持一致
    const KEY_SUFFIX = 'suffix';//与AmazonParseLogic保持一致
    /**
     * 第一步先报告请求ID
     * api:RequestReport
     * @param array $con
     * @return bool
     */
    public static function getRequestReport($con = array()){
        $start = time();//开始执行
        if(!self::_checkCon($con))return false;
        $account = $con['Account'];
        self::_matchCondition($con,$account);
        if(self::_existReportRequestId($con))return false;
        $service = self::getRequestServer($account,self::$_config);
        try{
            $rm = ReportMws::getInit();
            $param = $rm->requestReport($con);
            $data = $service->requestExe($param);
            self::_extractRequestReportResponse($account['ACCOUNT_ID'],$data);
            $log = 'finish!';
        }catch(Exception $e){
            $log = $e->getMessage();
        }
        self::grabLogs(4,$account['ACCOUNT_ID'],$start,time(),$log);
    }

    /**
     * 验证参数
     * @param $con
     * @return bool
     */
    private static function _checkCon($con){
        if(!isset($con['Account'])||!isset($con['Account']['ACCOUNT_ID']))return false;
        if(isset($con['reportType'])&&$con['reportType']){
            if(self::_getReportTypeCode($con['reportType'])){
                return true;
            }
        }
        return false;
    }

    /**
     * 匹配参数
     * @param $con
     * @param $account
     */
    private static function _matchCondition(&$con,$account){
        $con['StartDate'] = date_format(date_create('@'. (strtotime(isset($con['StartDate'])?$con['StartDate']:date('Y-m-d',strtotime('-2 day'))))), 'c');
        $con['EndDate'] = date_format(date_create('@'. (strtotime(isset($con['EndDate'])?$con['EndDate']:date('Y-m-d H:i:s',strtotime($con['StartDate'])+self::GRAB_REPORT_INTERVAL)))), 'c');
        $con['ReportType'] = self::_getReportTypeCode($con['reportType'])[self::KEY_TYPE];
        $con['Merchant'] = $account['MERCHANTID'];
        $con['MarketplaceIdList'] = [$account['MwsMP']];
    }

    /**
     * 校验报告请求ID是否已经存在
     * @param $con
     * @return bool
     */
    private static function _existReportRequestId($con){
        return (new Query())->from('x_amazon_reportrequest')
            ->where(['ACCOUNT_ID'=>$con['Account']['ACCOUNT_ID'],'START_DATE'=>strtotime($con['StartDate']),'END_DATE'=>strtotime($con['EndDate']),'REPORT_TYPE'=>$con['reportType']])
            ->exists();
    }

    /**
     * 提取报告请求ID
     * @param $accountId
     * @param $data
     * @return bool
     */
    private static function _extractRequestReportResponse($accountId,$data){
        if(!isset($data['RequestReportResult']['ReportRequestInfo'])){
            return false;
        }
        $response = $data['RequestReportResult']['ReportRequestInfo'];
        $res = [];
        $res['ACCOUNT_ID'] = $accountId;
        $res['REPORT_REQUESTID'] = $response['ReportRequestId'];
        $res['REPORT_TYPE'] = self::_getReportType($response['ReportType']);
        $res['START_DATE'] = strtotime($response['StartDate']);
        $res['END_DATE'] = strtotime($response['EndDate']);
        $res['SUBMITTED_DATE'] = strtotime($response['SubmittedDate']);
        CreateExt::actionDo(new XAmazonReportrequest(),$res);
    }

    /**
     * 第二步 报告下载ID
     * api GetReportRequestList
     * api GetReportRequestListByNextToken
     * @param array $con
     * @return bool
     */
    public static function getReportRequestList($con = array()){
        $start = time();//开始执行
        $account = isset($con['Account'])?$con['Account']:[];
        if(!$account||!isset($account['ACCOUNT_ID']))return false;
        $service = self::getRequestServer($account,self::$_config);
        try{
            $needDealReportRequestIds = self::_getNeedDealReportRequestIds($con);
            foreach($needDealReportRequestIds as $accountId=>$item){
                $rm = ReportMws::getInit();
                $param = $rm->getReportRequestList(['Merchant'=>$account['MERCHANTID'],'ReportRequestIdList'=>$item]);
                $data = $service->requestExe($param);
                $nextToken = self::_extractReportRequestListResponse($accountId,$data);
                self::_getReportRequestListByNextToken($account,$service,$nextToken);
            }
            $log = 'finish!';
        }catch(Exception $e){
            $log = $e->getMessage();
        }
        self::grabLogs(5,$account['ACCOUNT_ID'],$start,time(),$log);
    }

    /**
     * 取需要生成报告的报告请求IDs
     * @param $con
     * @return array
     */
    private static function _getNeedDealReportRequestIds($con){
        $req = (new Query())->from('x_amazon_reportrequest')
            ->select('ACCOUNT_ID,REPORT_REQUESTID')
            ->where(['STATUS'=>1,'ACCOUNT_ID'=>$con['Account']['ACCOUNT_ID']])
            ->andFilterWhere(['REPORT_REQUESTID'=>isset($con['reportRequestId'])?$con['reportRequestId']:''])
            ->andFilterWhere(['REPORT_TYPE'=>isset($con['reportType'])?$con['reportType']:''])
            ->limit(10)
            ->all();
        $res = [];
        foreach($req as $item){
            $res[$item['ACCOUNT_ID']][] = $item['REPORT_REQUESTID'];
        }
        return $res;
    }

    /**
     * 提取报告请求ID
     * @param      $accountId
     * @param      $data
     * @param bool $flag
     * @return null
     */
    private static function _extractReportRequestListResponse($accountId,$data,$flag = false){
        $_str = $flag?'GetReportRequestLisByNextTokenResult':'GetReportRequestListResult';
        $response = isset($data[$_str]['ReportRequestInfo'])?$data[$_str]['ReportRequestInfo']:null;
        if(isset($response['ReportRequestId'])){
            self::_checkReportRequestListResult($accountId,$response);
        }else{
            foreach($response as $v){
                $__response = self::_toArray($v);
                self::_checkReportRequestListResult($accountId,$__response);
            }
        }
        $hasNext = isset($data[$_str]['HasNext'])?$data[$_str]['HasNext']:null;
        return $hasNext&&isset($data[$_str]['NextToken'])?$data[$_str]['NextToken']:null;
    }

    /**
     * 校验报告请求是否完成
     * @param $accountId
     * @param $response
     */
    private static function _checkReportRequestListResult($accountId,$response){
        $status = $response['ReportProcessingStatus'];
        $response['ReportId'] = $status == '_DONE_'?$response['GeneratedReportId']:null;
        $response['ReportId']&&self::_storeReportRequestListResult($accountId,$response);
        ($status == '_CANCELLED_'||$status == '_DONE_NO_DATA_')&&self::_writeBackReportRequest($response['ReportRequestId'],3);
    }

    /**
     * 存储报告下载ID
     * @param $accountId
     * @param $response
     */
    private static function _storeReportRequestListResult($accountId,$response){
        if(self::_existReportId($response['ReportId'])){
            self::_writeBackReportRequest($response['ReportRequestId']);
        }else{
            $res = [];
            $res['ACCOUNT_ID'] = $accountId;
            $res['REPORT_ID'] = $response['ReportId'];
            $res['REPORT_REQUESTID'] = $response['ReportRequestId'];
            $res['REPORT_TYPE'] = self::_getReportType($response['ReportType']);
            $flag = CreateExt::actionDo(new XAmazonReportload(),$res);
            $flag&&self::_writeBackReportRequest($response['ReportRequestId']);
        }
    }

    /**
     * 校验报告下载ID是否已经存在
     * @param $reportId
     * @return bool
     */
    private static function _existReportId($reportId){
        return (new Query())->from('x_amazon_reportload')
            ->where(['REPORT_ID'=>$reportId])
            ->exists();
    }

    /**
     * 回写报告请求状态
     * @param     $reportRequestId
     * @param int $status 默认值2已处理
     */
    private static function _writeBackReportRequest($reportRequestId,$status = 2){
        XAmazonReportrequest::updateAll(['STATUS'=>$status],['REPORT_REQUESTID'=>$reportRequestId]);
    }

    /**
     * 请求报告NextToken处理
     * @param $account
     * @param $service
     * @param $nextToken
     * @return bool
     */
    public static function _getReportRequestListByNextToken($account,$service,$nextToken){
        if(!$nextToken){
            return false;
        }
        if(!($service instanceof RequestClient)){
            $service = self::getRequestServer($account,self::$_config);
        }
        $rm = ReportMws::getInit();
        $param = $rm->getReportRequestListByNextToken(['Merchant'=>$account['MERCHANTID'],'NextToken'=>$nextToken]);
        $data = $service->requestExe($param);
        $nextToken = self::_extractReportRequestListResponse($account['ACCOUNT_ID'],$data,true);
        self::_getReportRequestListByNextToken($account,$service,$nextToken);
    }

    /**
     * 报告下载ID（此接口可返回在过去 90 天内所创建的报告列表）
     * 》》》结算报告===
     * api GetReportList
     * api GetReportListByNextToken
     * @param array $con
     * @return bool
     */
    public static function getReportList($con = array())
    {
        $start = time();//开始执行
        if(!self::_checkCon($con))return false;
        $account = $con['Account'];
        self::_matchReportListCondition($con,$account);
        $service = self::getRequestServer($account,self::$_config);
        try{
            $rm = ReportMws::getInit();
            $param = $rm->getReportList($con);
            $data = $service->requestExe($param);
            $nextToken = self::_extractReportListResponse($account['ACCOUNT_ID'],$data);
            self::_getReportListByNextToken($account,$service,$nextToken);
            $log = 'finish!';
        }catch(Exception $e){
            $log = $e->getMessage();
        }
        self::grabLogs(6,$account['ACCOUNT_ID'],$start,time(),$log);
    }

    /**
     * 匹配参数
     * @param $con
     * @param $account
     */
    private static function _matchReportListCondition(&$con,$account){
        $con['AvailableFromDate'] = date_format(date_create('@'. (strtotime(isset($con['AvailableFromDate'])?$con['AvailableFromDate']:date('Y-m-d',strtotime('-2 day'))))), 'c');
        $con['AvailableToDate'] = date_format(date_create('@'. (strtotime(isset($con['AvailableToDate'])?$con['AvailableToDate']:date('Y-m-d H:i:s',strtotime($con['AvailableFromDate'])+self::GRAB_REPORT_INTERVAL)))), 'c');
        $con['ReportTypeList'] = [self::_getReportTypeCode($con['reportType'])[self::KEY_TYPE]];
        $con['Merchant'] = $account['MERCHANTID'];
        $con['Marketplace'] = $account['MwsMP'];
    }

    /**
     * 提取报告请求ID
     * @param      $accountId
     * @param      $data
     * @param bool $flag
     * @return null
     */
    private static function _extractReportListResponse($accountId,$data,$flag = false){
        $_str = $flag?'GetReportListByNextTokenResult':'GetReportListResult';
        $response = isset($data[$_str]['ReportInfo'])?$data[$_str]['ReportInfo']:null;
        if(!$response)return null;
        if(isset($response['ReportRequestId'])){
            isset($response['ReportId'])&&self::_storeReportRequestListResult($accountId,$response);
        }else{
            foreach($response as $v){
                $__response = self::_toArray($v);
                isset($__response['ReportId'])&&self::_storeReportRequestListResult($accountId,$__response);
            }
        }
        $hasNext = isset($data[$_str]['HasNext'])?$data[$_str]['HasNext']:null;
        return $hasNext&&isset($data[$_str]['NextToken'])?$data[$_str]['NextToken']:null;
    }

    /**
     * 请求报告NextToken处理
     * @param $account
     * @param $service
     * @param $nextToken
     * @return bool
     */
    public static function _getReportListByNextToken($account,$service,$nextToken){
        if(!$nextToken){
            return false;
        }
        if(!($service instanceof RequestClient)){
            $service = self::getRequestServer($account,self::$_config);
        }
        $oc = ReportMws::getInit();
        $param = $oc->getReportListByNextToken(['Merchant'=>$account['MERCHANTID'],'nextToken'=>$nextToken]);
        $data = $service->requestExe($param);
        $nextToken = self::_extractReportListResponse($account['ACCOUNT_ID'],$data,true);
        self::_getReportListByNextToken($account,$service,$nextToken);
    }

    /**
     * 第三步 下载报告
     * api GetReport
     * @param array $con
     * @return bool
     */
    public static function getReport($con = array()){
        $start = time();//开始执行
        $account = isset($con['Account'])?$con['Account']:[];
        if(!$account||!isset($account['ACCOUNT_ID']))return false;
        $needLoadReportId = self::_getNeedLoadReportId($con);
        if(!$needLoadReportId)return false;
        $service = self::getRequestServer($account,self::$_config);
        try{
            $rm = ReportMws::getInit();
            $param = $rm->getReport(['Merchant'=>$account['MERCHANTID'],'ReportId'=>$needLoadReportId['REPORT_ID']]);
            $reportTypeCode = self::_getReportTypeCode($needLoadReportId['REPORT_TYPE']);
            $fileName = $reportTypeCode[self::KEY_DIR].DIRECTORY_SEPARATOR.$account['ACCOUNT_ID'].'-'.$needLoadReportId['REPORT_ID'].'.'.$reportTypeCode[self::KEY_SUFFIX];
            $flag = $service->requestExe($param,$fileName);
            $flag&&XAmazonReportload::updateAll(['REPORT_STATUS'=>2],['ID'=>$needLoadReportId['ID']]);
            $log = 'finish!';
        }catch(Exception $e){
            $log = $e->getMessage();
        }
        self::grabLogs(7,$account['ACCOUNT_ID'],$start,time(),$log);
    }

    /**
     * 取需要下载报告的ID
     * @param $con
     * @return array|null|\yii\db\ActiveRecord
     */
    private static function _getNeedLoadReportId($con){
        return (new Query())->from('x_amazon_reportload')
            ->select('ID,REPORT_ID,REPORT_TYPE')
            ->where(['REPORT_STATUS'=>1,'ACCOUNT_ID'=>$con['Account']['ACCOUNT_ID']])
            ->andFilterWhere(['REPORT_ID'=>isset($con['reportId'])?$con['reportId']:''])
            ->andFilterWhere(['REPORT_TYPE'=>isset($con['reportType'])?$con['reportType']:''])
            ->one();
    }

    /**
     * 获取reportTypeCode
     * @param $reportType
     * @return mixed|null
     */
    private static function _getReportTypeCode($reportType){
        $reportTypeList = self::_reportTypeList();
        return array_key_exists($reportType,$reportTypeList)?$reportTypeList[$reportType]:null;
    }

    /**
     * 获取reportType
     * @param $reportTypeCode
     * @return int|null|string
     */
    private static function _getReportType($reportTypeCode){
        $reportTypeList = self::_reportTypeList();
        foreach($reportTypeList as $k=>$item){
            if($item[self::KEY_TYPE] == $reportTypeCode){
                return $k;
            }
        }
        return null;
    }

    /**
     * 返回报告类型列表
     * @return array
     */
    private static function _reportTypeList(){
        return AmazonParseLogic::getReportTypeList();
    }
}