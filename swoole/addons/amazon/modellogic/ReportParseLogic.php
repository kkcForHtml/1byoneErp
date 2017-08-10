<?php
namespace addons\amazon\modellogic;
use addons\amazon\models\CAmazonParseLogs;
use addons\amazon\models\FbaFulfillmentInventory;
use Yii;
use yii\swoole\db\Query;
use yii\swoole\rest\CreateExt;
class ReportParseLogic
{
    const PARSE_STATUS_PASS = 1;//解析成功
    const PARSE_STATUS_FAIL = 2;//解析失败
    const KEY_TYPE = 'type';//与AmazonParseLogic保持一致
    const KEY_DIR = 'dir';//与AmazonParseLogic保持一致
    const KEY_SUFFIX = 'suffix';//与AmazonParseLogic保持一致

    /**
     * 解析
     * @return bool
     */
    public static function parseReports(){
        $needParseReports = self::_getNeedParseReports();
        if(empty($needParseReports))return false;
        $writeBackIds = [];
        $reportTypeList = self::_reportTypeList();
        if(!is_array($reportTypeList)||empty($reportTypeList))return false;
        $accountList = self::_getAccountList();
        if(empty($accountList))return false;
        foreach($needParseReports as $parseReport){
            if($parseReportId = self::_parseReports($accountList,$reportTypeList,$parseReport)){
                array_push($writeBackIds,$parseReportId);
            }
        }
        !empty($writeBackIds) && self::_writeBackParseReports($writeBackIds);
    }

    /**
     * 解析报告
     * @param $accountList
     * @param $reportTypeList
     * @param $parseReport
     * @return bool|int
     */
    private static function _parseReports($accountList,$reportTypeList,$parseReport){
        if(!$parseReport['ID']||!$parseReport['REPORT_TYPE'])return false;
        if(!$parseReport['ACCOUNT_ID']||!array_key_exists($parseReport['ACCOUNT_ID'],$accountList))return false;
        if(!($reportTypeCode = self::_getReportTypeCode($reportTypeList,$parseReport['REPORT_TYPE'])))return false;
        $file = self::_getParseReportsFilePath($reportTypeCode[self::KEY_DIR],$parseReport['ACCOUNT_ID'],$parseReport['REPORT_ID'],$reportTypeCode[self::KEY_SUFFIX]);
        if(!is_file($file))return false;
        switch($parseReport['REPORT_TYPE']){
            case 2:
                $flag = self::_parseFulfillmentReports($parseReport,$file,$accountList[$parseReport['ACCOUNT_ID']]);
                break;
            default:
                $flag = 0;
                break;
        };
        return $flag;
    }

    /**
     * 解析FbaFulfillment
     * @param $parseReport
     * @param $file
     * @param $account
     * @return int
     */
    private static function _parseFulfillmentReports($parseReport,$file,$account){
        $fp = fopen($file,'r');
        $i = 0;
        $count = 0;
        while(!feof($fp)){
            $i++;
            $str = fgets($fp);
            $flag = $i>1&&self::_addFbaFulfillment($parseReport['ACCOUNT_ID'],$str,$account);
            $flag&&$count++;
        }
        fclose($fp);
        return $i==($count+1)?$parseReport['ID']:0;
    }

    /**
     * 添加FbaFulfillment
     * @param $accountId
     * @param $str
     * @param $account
     * @return bool
     */
    private static function _addFbaFulfillment($accountId,$str,$account){
        if(!$str)return false;
        $fbaFulfillment = self::_matchPSkuBySellerSku($accountId,$str,$account);
        if(isset($fbaFulfillment['flag'])&&$fbaFulfillment['flag'])return true;
        $re = CreateExt::actionDo(new FbaFulfillmentInventory(),$fbaFulfillment);
        if(!(isset($re['ID'])&&$re['ID']))return false;
        if(!(isset($fbaFulfillment['PSKU_ID'])&&$fbaFulfillment['PSKU_ID'])){
            $body = ['TYPE'=>5,
                     'ERROR_TYPE'=>1,
                     'TYPE_ID'=>strval($re['ID']),
                     'ERROR_MESSAGE'=>$account['ACCOUNT_ID'].'|'.$account['ORGANISATION_ID'].'|'.$fbaFulfillment['PLATFORM_SKU'],
                     'MARK_STATUS'=>1];
            CreateExt::actionDo(new CAmazonParseLogs(),$body);
        }
        return true;
    }

    /**
     * 检验FBA收发货
     * @param $accountId
     * @param $str
     * @param $account
     * @return array
     */
    private static function _matchPSkuBySellerSku($accountId,$str,$account){
        $temp = explode("\t",$str);
        $data = [];
        if(self::_existFbaFulfillment($accountId,$temp[5],$temp[6],strtotime($temp[0]),$temp[2])){
            $data['flag'] = true;
        }else{
            $data['ACCOUNT_ID'] = $accountId;
            $data['RECEIVED_DATE'] = strtotime($temp[0]);
            $data['FNSKU'] = $temp[1];
            $data['PLATFORM_SKU'] = $temp[2];
            $data['PRODUCT_NAME'] = $temp[3];
            $data['QUANTITY'] = $temp[4];
            $data['FBA_SHIPMENT_ID'] = $temp[5];
            $data['FULFILLMENT_CENTER_ID'] = str_replace(PHP_EOL, '', $temp[6]);
            $skuInfo = self::_getPSkuBySellerSku($data['PLATFORM_SKU'],$account['ACCOUNT_ID'],$account['ORGANISATION_ID']);
            if(isset($skuInfo['PSKU_ID'])&&$skuInfo['PSKU_ID']){
                $data['PSKU_ID'] = $skuInfo['PSKU_ID'];
                $data['STATUS'] = 1;
            }
        }
        return $data;
    }

    /**
     * 校验FbaFulfillment是否已经存在
     * @param $accountId
     * @param $fbaShipmentId
     * @param $fulfillmentCenterId
     * @param $receivedDate
     * @param $sku
     * @return bool
     */
    private static function _existFbaFulfillment($accountId,$fbaShipmentId,$fulfillmentCenterId,$receivedDate,$sku){
        return (new Query())->from('fba_fulfillment_inventory')->select('ID')
            ->where(['ACCOUNT_ID'=>$accountId,'FBA_SHIPMENT_ID'=>$fbaShipmentId,'FULFILLMENT_CENTER_ID'=>$fulfillmentCenterId,'RECEIVED_DATE'=>$receivedDate,'PLATFORM_SKU'=>$sku])
            ->scalar();
    }

    /**
     * 获取文件路径
     * @param $dir
     * @param $accountId
     * @param $reportId
     * @param $suffix
     * @return mixed
     */
    private static function _getParseReportsFilePath($dir,$accountId,$reportId,$suffix){
        $fileName = $dir.DIRECTORY_SEPARATOR.$accountId.'-'.$reportId.'.'.$suffix;
        return self::_parseReportsFilePath($fileName);
    }

    /**
     * 获取reportTypeCode
     * @param $reportTypeList
     * @param $reportType
     * @return null
     */
    private static function _getReportTypeCode($reportTypeList,$reportType){
        return array_key_exists($reportType,$reportTypeList)?$reportTypeList[$reportType]:null;
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
     * 获取需要解析的数据
     * @return mixed
     */
    private static function _getNeedParseReports(){
        return Yii::$app->rpc->create('tools')->sendAndrecv([['\addons\tools\modellogic\AmazonParseLogic','getNeedParseReports'],[]]);
    }

    /**
     * 回写解析状态
     * @param $writeBackIds
     */
    private static function _writeBackParseReports($writeBackIds){
        Yii::$app->rpc->create('tools')->sendAndrecv([['\addons\tools\modellogic\AmazonParseLogic','updateParseReportsStatus'],[$writeBackIds]]);
    }

    /**
     * 报告类型列表
     * @return array
     */
    private static function _reportTypeList(){
        return Yii::$app->rpc->create('tools')->sendAndrecv([['\addons\tools\modellogic\AmazonParseLogic','getReportTypeList'],[]]);
    }

    /**
     * 文件路径
     * @param $path
     * @return mixed
     */
    private static function _parseReportsFilePath($path){
        return Yii::$app->rpc->create('tools')->sendAndrecv([['\addons\tools\modellogic\AmazonParseLogic','getParseReportsFilePath'],[$path]]);
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
}