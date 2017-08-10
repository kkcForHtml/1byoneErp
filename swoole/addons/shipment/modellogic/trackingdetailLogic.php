<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/6/12 0012
 * Time: 10:51
 */

namespace addons\shipment\modellogic;

use addons\purchase\modellogic\ptrackLogic;
use addons\shipment\models\ShTracking;
use addons\shipment\models\ShTrackingDetail;
use Yii;
use yii\db\Expression;
use yii\db\Query;
use yii\swoole\rest\UpdateExt;
use yii\swoole\rest\CreateExt;
use yii\swoole\rest\ResponeModel;
use yii\swoole\db\DBHelper;
use yii\swoole\modellogic\BaseLogic;
use yii\web\ServerErrorHttpException;

class trackingdetailLogic extends BaseLogic
{
    public static $modelClass = 'addons\shipment\models\ShTrackingDetail';

    //index方法 发运查询
    public static function indexCustom($post)
    {
        $res = new ResponeModel();
        //1 为初始 2 为查询
        $isInit = array_key_exists('isInit', $post) && $post['isInit'] ? $post['isInit'] : 1;
        //初始化没有任何参数的情况下不查询数据
        if ($isInit == 1) {
            return $res->setModel('200', 0, Yii::t('shipment', 'Successful operation!'), [], ['totalCount' => 0]);
        }
        $result = self::inventoryQuery($post);
        $limit = array_key_exists('limit', $post) && $post['limit'] ? $post['limit'] : "20";
        $page = array_key_exists('page', $post) && $post['page'] ? $post['page'] : "1";
        //分页
        list($total, $data) = DBHelper::SearchList($result, ['limit' => $limit], $page - 1);
        return $res->setModel('200', 0, Yii::t('shipment', 'Successful operation!'), $data, ['totalCount' => $total]);
    }

    //发运查询
    public static function inventoryQuery($post)
    {
        $parameter = self::formatString($post);

        $result = self::getInventoryQuery($parameter);

        return $result;
    }

    //格式化参数
    public static function formatString($post)
    {
        $dataArray = array();
        $dataArray['planFrom'] = array_key_exists('planFrom', $post) && $post['planFrom'] ? $post['planFrom'] : "";//计划日期
        $dataArray['planTo'] = array_key_exists('planTo', $post) && $post['planTo'] ? $post['planTo'] : "";
        $dataArray['searchOrganization'] = array_key_exists('searchOrganization', $post) && $post['searchOrganization'] ? $post['searchOrganization'] : "";//国家
        $dataArray['searchShipType'] = array_key_exists('searchShipType', $post) && $post['searchShipType'] ? $post['searchShipType'] : "";//运输方式
        $dataArray['searchCNumber'] = array_key_exists('searchCNumber', $post) && $post['searchCNumber'] ? $post['searchCNumber'] : "";//次数
        $dataArray['searchActualShipFrom'] = array_key_exists('searchActualShipFrom', $post) && $post['searchActualShipFrom'] ? $post['searchActualShipFrom'] : "";//实际发运日期
        $dataArray['searchActualShipTo'] = array_key_exists('searchActualShipTo', $post) && $post['searchActualShipTo'] ? $post['searchActualShipTo'] : "";
        $dataArray['searchExpectedServiceFrom'] = array_key_exists('searchExpectedServiceFrom', $post) && $post['searchExpectedServiceFrom'] ? $post['searchExpectedServiceFrom'] : "";//预计送达日期
        $dataArray['searchExpectedServiceTo'] = array_key_exists('searchExpectedServiceTo', $post) && $post['searchExpectedServiceTo'] ? $post['searchExpectedServiceTo'] : "";
        $dataArray['searchAutualServiceFrom'] = array_key_exists('searchAutualServiceFrom', $post) && $post['searchAutualServiceFrom'] ? $post['searchAutualServiceFrom'] : "";//实际送达日期
        $dataArray['searchAutualServiceTo'] = array_key_exists('searchAutualServiceTo', $post) && $post['searchAutualServiceTo'] ? $post['searchAutualServiceTo'] : "";
        $dataArray['searchCabinetNo'] = array_key_exists('searchCabinetNo', $post) && $post['searchCabinetNo'] ? $post['searchCabinetNo'] : "";//柜号
        $dataArray['searchTrackNo'] = array_key_exists('searchTrackNo', $post) && $post['searchTrackNo'] ? $post['searchTrackNo'] : "";//提单号/追踪号
        $dataArray['searchPurchaseCD'] = array_key_exists('searchPurchaseCD', $post) && $post['searchPurchaseCD'] ? $post['searchPurchaseCD'] : "";//采购订单
        $dataArray['searchSKU'] = array_key_exists('searchSKU', $post) && $post['searchSKU'] ? $post['searchSKU'] : "";//SKU
        $dataArray['searchSmallType'] = array_key_exists('searchSmallType', $post) && $post['searchSmallType'] ? $post['searchSmallType'] : "";//小分类
        $dataArray['accessOrg'] = "";
        $dataArray['category'] = "";
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            $dataArray['accessOrg'] = Yii::$app->session->get('organization') ? Yii::$app->session->get('organization') : "";//组织权限
            $dataArray['category'] = Yii::$app->session->get('categoryd') ? Yii::$app->session->get('categoryd') : "";//大分类权限
        }

        return $dataArray;
    }

    //查询语句
    public static function getInventoryQuery($parameter)
    {
        $data = (new Query())->from('sh_tracking_detail stdl')
            ->select(new Expression("FROM_UNIXTIME(st.PLAN_AT,'%Y-%m-%d') AS PLAN_AT,
                DATEDIFF(FROM_UNIXTIME(st.ACTUAL_SHIPM_AT),FROM_UNIXTIME(st.PLAN_AT)) AS PLANDATE,
                FROM_UNIXTIME(st.ACTUAL_SHIPM_AT,'%Y-%m-%d') AS ACTUAL_SHIPM_AT,
                DATEDIFF(FROM_UNIXTIME(stdl.ACTUALS_ERVICE_AT),FROM_UNIXTIME(st.ACTUAL_SHIPM_AT)) AS TRANSPORTDATE,
                FROM_UNIXTIME(st.EXPECTED_SERVICE_AT,'%Y-%m-%d') AS EXPECTED_SERVICE_AT,
                FROM_UNIXTIME(stdl.ACTUALS_ERVICE_AT,'%Y-%m-%d') AS ACTUALS_ERVICE_AT,
                DATEDIFF(FROM_UNIXTIME(stdl.ACTUALS_ERVICE_AT),FROM_UNIXTIME(st.PLAN_AT)) AS LOGISTICSDATE,
                bc.CHANNEL_NAME_CN,
                oo.ORGANISATION_NAME_CN,
                bat.ACCOUNT,
                pdshiptype.D_NAME_CN AS TRANSPORT_MODE,
                bwt.WAREHOUSE_NAME_CN AS WAREHOUSETO,
                st.CNUMBER,
                pdsize.D_NAME_CN AS AMAZON_SIZE_NAME,
                gpts.SYSTEM_NAME_CN,
                stdl.PU_ORDER_CD,
                stdl.PSKU_CODE,
                stdl.GOODS_DESCRIBE,
                stdl.SHIPMENT_NUMBER,
                stdl.GNUMBER,
                pdins.D_NAME_CN AS INSPECTION_NAME,
                FROM_UNIXTIME(ppdl.COMMI_PERIOD,'%Y-%m-%d') AS COMMI_PERIOD,
                COALESCE(bwf.WAREHOUSE_NAME_CN,'供应商仓') AS WAREHOUSEFROM,
                pdship.D_NAME_CN AS SHIPMENT_NAME,
                ppdl.FNSKU AS OLDFNSKU,
                sdn.FNSKU AS NEWFNSKU,
                stdl.DETAIL_REMARKS"))
            ->leftJoin('sh_tracking st', 'st.TRACKING_ID = stdl.TRACKING_ID')
            ->leftJoin('pu_purchase_detail ppdl', 'ppdl.PU_PURCHASE_CD = stdl.PU_ORDER_CD AND ppdl.PSKU_ID = stdl.PSKU_ID')
            ->leftJoin('g_product_sku pds', 'pds.PSKU_ID = stdl.PSKU_ID')
            ->leftJoin('g_product_type gpts', 'gpts.PRODUCT_TYPE_ID = SUBSTRING_INDEX(pds.PRODUCT_TYPE_PATH,\',\',-1)')
            ->leftJoin('g_product_type gptb', 'gptb.PRODUCT_TYPE_ID = SUBSTRING_INDEX(pds.PRODUCT_TYPE_PATH,\',\',1)')
            ->leftJoin('sh_dispatch_note sdn', 'sdn.DISPATCH_NOTE_ID = stdl.DISPATCH_NOTE_ID')
            ->leftJoin('b_channel bc', 'bc.CHANNEL_ID = st.CHANNEL_ID')
            ->leftJoin('o_organisation oo', 'oo.ORGANISATION_ID = st.ORGANISATION_ID')
            ->leftJoin('b_warehouse bwt', 'bwt.WAREHOUSE_ID = st.WAREHOUSE_ID')
            ->leftJoin('b_warehouse bwf', 'bwf.WAREHOUSE_ID = sdn.DELIVER_WARID')
            ->leftJoin('b_account bat', 'bat.ACCOUNT_ID = ppdl.ACCOUNT_ID')
            ->leftJoin('p_dictionary pdins', 'pdins.D_VALUE = ppdl.INSPECTION_STATE AND pdins.D_GROUP = \'INSPECTION_STATE\'')
            ->leftJoin('p_dictionary pdsize', 'pdsize.D_VALUE = pds.AMAZON_SIZE_ID AND pdsize.D_GROUP = \'PRODUCT_SKU\'')
            ->leftJoin('p_dictionary pdship', 'pdship.D_VALUE = st.PLAN_STATE AND pdship.D_GROUP = \'PU_TRACKING\'')
            ->leftJoin('p_dictionary pdshiptype', 'pdshiptype.D_VALUE = st.TRANSPORT_MODE AND pdshiptype.D_GROUP = \'TRANSPORTS\'')
            ->groupBy('stdl.TRACKING_DETAIL_ID');

        //库存调整单拼接andWhere
        $data = self::getInventoryQueryWhere($data, $parameter);

        return $data;
    }

    public static function getInventoryQueryWhere($data, $parameter)
    {
        if ($parameter['planFrom'] != "") {
            $data->andWhere([">", "st.PLAN_AT", $parameter['planFrom']]);
        }
        if ($parameter['planTo'] != "") {
            $data->andWhere(["<", "st.PLAN_AT", $parameter['planTo']]);
        }
        if ($parameter['searchShipType'] != "") {
            $data->andWhere(["=", "st.TRANSPORT_MODE", $parameter['searchShipType']]);
        }
        if ($parameter['searchCNumber'] != "") {
            $data->andWhere(["like", "st.CNUMBER", $parameter['searchCNumber']]);
        }
        if ($parameter['searchActualShipFrom'] != "") {
            $data->andWhere([">", "st.ACTUAL_SHIPM_AT", $parameter['searchActualShipFrom']]);
        }
        if ($parameter['searchActualShipTo'] != "") {
            $data->andWhere(["<", "st.ACTUAL_SHIPM_AT", $parameter['searchActualShipTo']]);
        }
        if ($parameter['searchExpectedServiceFrom'] != "") {
            $data->andWhere([">", "st.EXPECTED_SERVICE_AT", $parameter['searchExpectedServiceFrom']]);
        }
        if ($parameter['searchExpectedServiceTo'] != "") {
            $data->andWhere(["<", "st.EXPECTED_SERVICE_AT", $parameter['searchExpectedServiceTo']]);
        }
        if ($parameter['searchAutualServiceFrom'] != "") {
            $data->andWhere([">", "stdl.ACTUALS_ERVICE_AT", $parameter['searchAutualServiceFrom']]);
        }
        if ($parameter['searchAutualServiceTo'] != "") {
            $data->andWhere(["<", "stdl.ACTUALS_ERVICE_AT", $parameter['searchAutualServiceTo']]);
        }
        if ($parameter['searchCabinetNo'] != "") {
            $data->andWhere(["like", "st.CABINET_NO", $parameter['searchCabinetNo']]);
        }
        if ($parameter['searchTrackNo'] != "") {
            $data->andWhere(["like", "st.TRACK_NO", $parameter['searchTrackNo']]);
        }
        if ($parameter['searchPurchaseCD'] != "") {
            $data->andWhere(["like", "stdl.PU_ORDER_CD", $parameter['searchPurchaseCD']]);
        }
        if ($parameter['searchSKU'] != "") {
            $data->andWhere(["like", "stdl.PSKU_ID", $parameter['searchSKU']]);
        }
        if ($parameter['searchSmallType'] != "") {
            $data->andWhere(["=", "gpts.PRODUCT_TYPE_ID", $parameter['searchSmallType']]);
        }
        if ($parameter['searchOrganization'] != "") {
            $data->andWhere(["=", "st.ORGANISATION_ID", $parameter['searchOrganization']]);
        }
        //添加组织和大分类过滤
        if ($parameter['accessOrg'] != "") {
            $data->andWhere(["st.ORGANISATION_ID" => $parameter['accessOrg']]);
        }
        if ($parameter['category'] != "") {
            $data->andWhere(["gptb.PRODUCT_TYPE_ID" => $parameter['category']]);
        }
        return $data;
    }

    //导出
    public static function exportPi($post)
    {
        $result = self::inventoryQuery($post);

        if (empty($result)) {
            throw new ServerErrorHttpException(Yii::t('shipment', 'No data!'));
        }
        $exportData = $result->all();

        $firstLine = ['计划日期',
            '计划天数',
            '实际发运日期',
            '运输天数',
            '预计送达时间',
            '实际送达时间',
            '物流总天数',
            '平台',
            '国家',
            '帐号',
            '运输方式',
            '目的仓',
            '次数',
            '亚马逊尺寸',
            '小分类',
            '采购单号',
            'SKU',
            '货描',
            '出运数量',
            '箱数',
            '验货状态',
            '交货日期',
            '发货仓库',
            '发运状态',
            '原条码',
            '最终条码',
            '备注'];
        //ptrackLogic::exportExcel($exportData, '发运查询-' . date("Y-m-j"), '发运查询', $firstLine);
        Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\ptrackLogic', 'exportExcel'], [$exportData, '发运查询-' . date("Y-m-j"), '发运查询', $firstLine]]);
    }

    /**
     * addTracking
     * 新增发运跟踪
     * @param $data
     *
     * */
    public static function addTracking($data)
    {
        foreach ($data as $dispatchModel) {
            $post = Yii::$app->getRequest()->getBodyParams();
            Yii::$app->getRequest()->setBodyParams($dispatchModel);
            $result = CreateExt::actionDo(new ShTracking(), $dispatchModel);
            Yii::$app->getRequest()->setBodyParams($post);
            if ($result instanceof ResponeModel) {
                return $result;
            }
        }
    }

    /**发运单明细 已收货数量
     * @param $paramArray
     * @return array
     */
    public static function updateTdnumber($paramArray)
    {
        foreach ($paramArray as $param) {
            $ShDispatchNote = ShTrackingDetail::find()->where(['DISPATCH_NOTE_ID' => $param['DISPATCH_NOTE_ID'], 'PSKU_ID' => $param['PSKU_ID']])->one();
            if ($ShDispatchNote) {
                $ShDispatchNote->ARECIPIENT_NUM += $param['ARECIPIENT_NUM'];
                $ShDispatchNote->save();
            }
        }
    }

    /**
     * 获取发运跟踪详情
     */
    public static function getTrackingDetail($select=array(),$where=array()){
        $result = ShTrackingDetail::find()->where($where)->select($select)->asArray()->one();
        return $result;
    }

    /*
     * 更新发运跟踪详情
     */
    public static function updateTrackingDetail($param,$where){
        return ShTrackingDetail::updateAll($param,$where);
    }

    /*
     * 获取发运跟踪单
     */
    public static function getTracking($select,$where){
        $result = ShTracking::find()->where($where)->select($select)->asArray()->one();
        return $result;
    }

    /*
     * 更新发运跟踪单
     */
    public static function UpdateTracking($data){
        $dispatchModel = array("batch" => $data);
        $post = Yii::$app->getRequest()->getBodyParams();
        Yii::$app->getRequest()->setBodyParams($dispatchModel);
        $result = UpdateExt::actionDo(new ShTracking(), $dispatchModel);
        Yii::$app->getRequest()->setBodyParams($post);
        if ($result instanceof ResponeModel) {
            return $result;
        }
    }
}