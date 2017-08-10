<?php
namespace addons\finance\modellogic;

/**
 * Created by PhpStorm.
 * User: erp
 * Date: 2017/5/25
 * Time: 15:00
 */
use Yii;
use yii\swoole\modellogic\BaseLogic;
use yii\swoole\rest\ResponeModel;
use yii\swoole\db\DBHelper;
use yii\db\Expression;
use yii\swoole\db\Query;
use yii\web\ServerErrorHttpException;

class libraryrecordLogic extends BaseLogic
{
    public static $modelClass = 'addons\finance\models\SkLibraryRecord';

    //自定义index方法 库存往来报告
    public static function indexCustom($post)
    {
        $res = new ResponeModel();
        //1 为初始 2 为查询
        $isInit = array_key_exists('isInit', $post) && $post['isInit'] ? $post['isInit'] : 1;
        //初始化没有任何参数的情况下不查询数据
        if ($isInit == 1) {
            return $res->setModel('200', 0, Yii::t('finance', 'Successful operation!'), [], ['totalCount' => 0]);
        }
        $result = self::libraryRecord($post);
        $limit = array_key_exists('limit', $post) && $post['limit'] ? $post['limit'] : "20";
        $page = array_key_exists('page', $post) && $post['page'] ? $post['page'] : "1";
        //分页
        list($total, $data) = DBHelper::SearchList($result, ['limit' => $limit], $page - 1);
        $data = self::formatDisplay($data, false);
        return $res->setModel('200', 0, Yii::t('finance', 'Successful operation!'), $data, ['totalCount' => $total]);
    }

    //导出
    public static function exportPi($post)
    {
        $result = self::libraryRecord($post);

        $exportData = $result->all();

        $exportData = self::formatDisplay($exportData, true);
        $firstLine = ['组织', '仓库', '小分类', 'SKU', '交易类型', '交易单号', '日期', '数量', '单位', '平台'];
        Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\ptrackLogic', 'exportExcel'], [$exportData, '存货往来报告-' . date("Y-m-j"), '存货往来报告', $firstLine]]);
    }

    //存货往来报告
    public static function libraryRecord($post)
    {
        $parameter = self::formatString($post);

        $result = self::getLibraryRecord($parameter);

        return $result;
    }

    //格式化参数
    public static function formatString($post)
    {
        $dataArray = array();
        $dataArray['timeFrom'] = array_key_exists('timeFrom', $post) && $post['timeFrom'] ? $post['timeFrom'] : "";//起始日期
        $dataArray['timeTo'] = array_key_exists('timeTo', $post) && $post['timeTo'] ? $post['timeTo'] : "";//截止日期
        $dataArray['organization'] = array_key_exists('organization', $post) && $post['organization'] ? $post['organization'] : "";//组织
        $dataArray['warehouseType'] = array_key_exists('warehouseType', $post) && $post['warehouseType'] ? $post['warehouseType'] : "";//仓库
        $dataArray['sku'] = array_key_exists('sku', $post) && $post['sku'] ? $post['sku'] : "";//SKU
        $dataArray['smallType'] = array_key_exists('smallType', $post) && $post['smallType'] ? $post['smallType'] : "";//小分类
        $dataArray['channel'] = array_key_exists('channel', $post) && $post['channel'] ? $post['channel'] : "";//平台
        $dataArray['orderType'] = array_key_exists('orderType', $post) && $post['orderType'] ? $post['orderType'] : "";//交易类型
        $dataArray['accessOrg'] = "";
        $dataArray['product_id'] = "";
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            $dataArray['accessOrg'] = Yii::$app->session->get('organization') ? Yii::$app->session->get('organization') : "";//组织权限
            $dataArray['product_id'] = Yii::$app->session->get('product_id') ? Yii::$app->session->get('product_id') : "";//大分类权限
        }

        return $dataArray;
    }

    //出入库记录表
    public static function getLibraryRecord($parameter)
    {
        $data = (new Query())->from('sk_library_record slr')
            ->select("slr.LIBRARY_RECORD_ID,
                slr.ORGANISATION_ID,
                bw.WAREHOUSE_NAME_CN AS WAREHOUSE_NAME,
                gpts.SYSTEM_NAME_CN AS SMALLPLA_NAME,
                slr.PSKU_CODE,
                slr.ORDER_TYPE,
                slr.ORDER_CD,
                slr.ORDER_AT,
                slr.NUMBERS,
                gps.UNIT_ID,
                bc.CHANNEL_NAME_CN AS CHANNEL_NAME")
            ->leftJoin('g_product_sku gps', 'gps.PSKU_ID = slr.PSKU_ID')
            ->leftJoin('g_product_type gpts', 'gpts.PRODUCT_TYPE_ID = SUBSTRING_INDEX(gps.PRODUCT_TYPE_PATH,\',\',-1)')
            //->leftJoin('g_product_type gptb', 'gptb.PRODUCT_TYPE_ID = SUBSTRING_INDEX(gps.PRODUCT_TYPE_PATH,\',\',1)')
            ->leftJoin('b_warehouse bw', 'bw.WAREHOUSE_ID = slr.WAREHOUSE_ID')
            ->leftJoin('b_channel bc', 'bc.CHANNEL_ID = bw.CHANNEL_ID')
            ->orderby("slr.ORDER_AT ASC");

        //库存调整单拼接andWhere
        $data = self::getLibraryRecordWhere($data, $parameter);

        return $data;
    }

    //库存调整单拼接andWhere
    public static function getLibraryRecordWhere($data, $parameter)
    {
        if ($parameter['timeFrom'] != "") {
            $data->andWhere(['>=', 'slr.ORDER_AT', $parameter['timeFrom']]);
        }
        if ($parameter['timeTo'] != "") {
            $data->andWhere(['<=', 'slr.ORDER_AT', $parameter['timeTo']]);
        }
        if ($parameter['warehouseType'] != "") {
            $data->andWhere(new Expression("FIND_IN_SET(bw.WAREHOUSE_ID,'" . $parameter['warehouseType'] . "')"));
        }
        if ($parameter['channel'] != "") {
            $data->andWhere(new Expression("FIND_IN_SET(bw.CHANNEL_ID,'" . $parameter['channel'] . "')"));
        }
        if ($parameter['sku'] != "") {
            $data->andWhere(new Expression("FIND_IN_SET(slr.PSKU_ID,'" . $parameter['sku'] . "')"));
        } else {
            if ($parameter['smallType'] != "") {
                $data->andWhere(["gpts.PRODUCT_TYPE_ID" => $parameter['smallType']]);
            }
        }
        if ($parameter['orderType'] != "") {
            $data->andWhere(new Expression("FIND_IN_SET(slr.ORDER_TYPE,'" . $parameter['orderType'] . "')"));
        }
        if ($parameter['organization'] != "") {
            $data->andWhere(new Expression("FIND_IN_SET(slr.ORGANISATION_ID,'" . $parameter['organization'] . "')"));
        }
        //添加组织和大分类过滤
        if ($parameter['accessOrg'] != "") {
            $data->andWhere(["slr.ORGANISATION_ID" => $parameter['accessOrg']]);
        }
        if ($parameter['product_id'] != "") {
            $data->andWhere(["gps.PSKU_ID" => $parameter['product_id']]);
        }
//        GProductSku::addQuery($data,'gps');
        return $data->DISTINCT();
    }

    //格式化显示数据
    public static function formatDisplay($data, $orderType)
    {
        //字典表
        $dictionaries = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\baseLogic', 'getdictionary'], [['D_NAME_CN', 'D_GROUP', 'D_VALUE'], ['INVENTORYREPORT']]])->recv();
        //组织编码
        $organisations = Yii::$app->rpc->create('organization')->send([['\addons\organization\modellogic\organizLogic', 'GetORGANISATION'], [['ORGANISATION_ID', 'ORGANISATION_NAME_CN']]])->recv();
        //单位编码
        $units = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\basicsLogic', 'getunit'], [['UNIT_ID', 'UNIT_NAME_CN']]])->recv();
        array_walk($data, function (&$v, $k, $paras) {
            $v['ORGANISATION_ID'] = self::getCnByID($paras['organisation'], $v['ORGANISATION_ID'], 'ORGANISATION_ID', 'ORGANISATION_NAME_CN');
            $v['ORDER_AT'] = $v['ORDER_AT'] ? date('Y-m-d', $v['ORDER_AT']) : '';
            $v['UNIT_ID'] = self::getCnByID($paras['unit'], $v['UNIT_ID'], 'UNIT_ID', 'UNIT_NAME_CN');
        }, ['organisation' => $organisations, 'unit' => $units, 'dictionary' => $dictionaries]);
        if ($orderType) {
            array_walk($data, function (&$v, $k, $paras) {
                $v['ORDER_TYPE'] = self::getCnByID($paras['dictionary'], ['INVENTORYREPORT', $v['ORDER_TYPE']], ['D_GROUP', 'D_VALUE'], 'D_NAME_CN');
            }, ['dictionary' => $dictionaries]);
        }
        foreach ($data as $key => $value) {
            unset($data[$key]['LIBRARY_RECORD_ID']);
        }
        return $data;
    }

    //转换ID变成name
    public static function getCnByID($model, $ID, $model_where, $name)
    {
        if (count($model) > 0) {
            foreach ($model as $value) {
                if (count($ID) > 1 && count($model_where) > 1) {
                    if ($value[$model_where[0]] == $ID[0] && $value[$model_where[1]] == $ID[1]) {
                        return $value[$name];
                    }
                } else {
                    if ($value[$model_where] == $ID) {
                        return $value[$name];
                    }
                }
            }
        } else {
            return "";
        }
    }


}