<?php
/**
 * Created by PhpStorm.
 * User: hm
 * Date: 2017/5/18
 * Time: 13:35
 */
namespace addons\tools\modellogic;
use addons\tools\models\XAmazonOrders;
use addons\tools\models\XAmazonReportload;
use yii\swoole\db\Query;
class AmazonParseLogic {

    const PARSE_STATUS_YES = 2;//可解析
    const PARSE_STATUS_FINISH = 3;//解析完成
    const PARSE_ORDER_LIMIT = 500;
    const PARSE_REPORT_LIMIT = 2;
    const KEY_TYPE = 'type';
    const KEY_DIR = 'dir';
    const KEY_SUFFIX = 'suffix';

    /**
     * 取需要解析的数据
     * @param array $con
     * @return array
     */
    public static function getNeedParseOrders($con = array()){
         return (new Query())->from('x_amazon_orders')
             ->where(['STATUS'=>self::PARSE_STATUS_YES])
             ->andFilterWhere(['AMAZON_ORDER_ID'=>isset($con['AMAZON_ORDER_ID'])?$con['AMAZON_ORDER_ID']:''])
             ->orderBy('ID ASC')
             ->limit(isset($con['limit'])?$con['limit']:self::PARSE_ORDER_LIMIT)
             ->all();
    }

    /**
     * 更新订单解析状态
     * @param $writeBackIds
     */
    public static function updateParseOrdersStatus($writeBackIds){
        XAmazonOrders::updateAll(['STATUS'=>self::PARSE_STATUS_FINISH],['ID'=>$writeBackIds]);
    }

    /**
     * 取需要解析的报告
     * @param array $con
     * @return array|\yii\db\ActiveRecord[]
     */
    public static function getNeedParseReports($con = array()){
        return (new Query())->from('x_amazon_reportload')
            ->select('ID,ACCOUNT_ID,REPORT_ID,REPORT_TYPE')
            ->where(['REPORT_STATUS'=>self::PARSE_STATUS_YES])
            ->andFilterWhere(['ACCOUNT_ID'=>isset($con['ACCOUNT_ID'])?$con['ACCOUNT_ID']:''])
            ->andFilterWhere(['REPORT_ID'=>isset($con['REPORT_ID'])?$con['REPORT_ID']:''])
            ->andFilterWhere(['REPORT_TYPE'=>isset($con['REPORT_TYPE'])?$con['REPORT_TYPE']:''])
            ->limit(isset($con['limit'])?$con['limit']:self::PARSE_REPORT_LIMIT)
            ->all();
    }

    /**
     * 更新报告解析状态
     * @param $writeBackIds
     */
    public static function updateParseReportsStatus($writeBackIds){
        XAmazonReportload::updateAll(['REPORT_STATUS'=>self::PARSE_STATUS_FINISH],['ID'=>$writeBackIds]);
    }

    /**
     * 文件路径
     * @param $path
     * @return bool|string
     */
    public static function getParseReportsFilePath($path){
        $absolutePath = dirname(__DIR__).DIRECTORY_SEPARATOR.'mws/MarketplaceWebService/Response'.DIRECTORY_SEPARATOR.$path;
        if(!is_dir(dirname($absolutePath))||!is_file($absolutePath)){
            return false;
        }
        return $absolutePath;
    }

    /**
     * 报告类型列表
     * @return array
     */
    public static function getReportTypeList(){
        return [
            2=>[self::KEY_TYPE=>'_GET_FBA_FULFILLMENT_INVENTORY_RECEIPTS_DATA_',self::KEY_DIR=>'FbaFulfillment',self::KEY_SUFFIX=>'txt'],//亚马逊物流已收到库存报告
//            3=>[self::KEY_TYPE=>'_GET_V2_SETTLEMENT_REPORT_DATA_XML_',self::KEY_DIR=>'Settlement',self::KEY_SUFFIX=>'xml'],//结算报告
        ];
    }
}