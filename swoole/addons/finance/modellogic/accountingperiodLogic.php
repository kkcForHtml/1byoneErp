<?php
namespace addons\finance\modellogic;

/**
 * Created by PhpStorm.
 * User: erp
 * Date: 2017/5/25
 * Time: 15:00
 */
use addons\finance\models\AcInventoryAge;
use addons\finance\models\AcMoinventoryBalance;
use addons\finance\models\SkLibraryRecord;
use addons\inventory\models\SkAdjustment;
use addons\inventory\models\SkFiallocation;
use addons\inventory\models\SkPlacing;
use addons\inventory\models\SkStorage;
use addons\purchase\models\PuPurchase;
use addons\sales\models\CrSalesOrder;
use yii\db\Expression;
use yii\db\Query;
use yii\swoole\helpers\ArrayHelper;
use yii\swoole\modellogic\BaseLogic;
use addons\finance\models\AcAccountingPeriod;
use yii\swoole\rest\CreateExt;
use yii\swoole\rest\ResponeModel;
use yii\swoole\db\DBHelper;
use Yii;
use yii\web\ServerErrorHttpException;

class accountingperiodLogic extends BaseLogic
{
    public static $modelClass = 'addons\finance\models\AcAccountingPeriod';

    //导出
    public static function exportPi($post)
    {
        $post['export'] = true;
        $parameter = self::formatString($post);

        $result = self::getStockLedgerData($parameter);

        $exportData = $result['data'];
        foreach ($exportData as $key => $value) {
            unset($exportData[$key]['PSKU_ID']);
            unset($exportData[$key]['NUMBERS']);
            unset($exportData[$key]['CSKU_ID']);
            unset($exportData[$key]['ORGANISATION_ID']);
        }

        $firstLine = ['期间', '组织', '通用SKU', 'SKU', '期初结余库存', '本期入库数量', '本期出库数量', '期末结余数量'];
        Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\ptrackLogic', 'exportExcel'], [$exportData, '库存台帐-' . date("Y-m-j"), '库存台帐', $firstLine]]);
    }

    //自定义index方法 库存台账
    public static function indexCustom($post)
    {
        $res = new ResponeModel();
        $parameter = self::formatString($post);
        //初始化没有任何参数的情况下不查询数据,1 为初始 2 为查询
        if ($parameter['isInit'] == 1) {
            return $res->setModel('200', 0, Yii::t('finance', 'Successful operation!'), [], ['totalCount' => 0]);
        }
        $result = self::getStockLedgerData($parameter);
        return $res->setModel('200', 0, Yii::t('finance', 'Successful operation!'), $result['data'], ['totalCount' => $result['total']]);
    }

    public static function getStockLedgerData($parameter)
    {
        $mAcAccountingPeriodExists = AcAccountingPeriod::find()
            ->where(['YEARS' => $parameter['years'], 'ACCOUNTING_PERIOD' => $parameter['accountingPeriod'], 'ACCOUNTING_STATE' => 0, 'DELETED_STATE' => 0])->exists();
        if ($mAcAccountingPeriodExists) {
            //取自库存台帐
            $result = self::inventoryAccount($parameter);
        } else {
            //取自出入库总表
            $result = self::libraryRecord($parameter);
        }
        return $result;
    }

    //库存台帐
    public static function inventoryAccount($parameter)
    {
        $resultTemp = self::getInventoryBalance($parameter);
        $result = ['data' => [], 'total' => 0];
        if ($parameter['export']) {
            $result['data'] = $resultTemp->all();
        } else {
            list($total, $data) = DBHelper::SearchList($resultTemp, ['limit' => $parameter['limit']], $parameter['page'] - 1);
            $result = ['data' => $data, 'total' => $total];
        }
        return $result;
    }

    //格式化参数
    public static function formatString($post)
    {
        $dataArray = array();
        $dataArray['isInit'] = array_key_exists('isInit', $post) && $post['isInit'] ? $post['isInit'] : 1;
        $dataArray['limit'] = array_key_exists('limit', $post) && $post['limit'] ? $post['limit'] : "20";
        $dataArray['page'] = array_key_exists('page', $post) && $post['page'] ? $post['page'] : "1";
        $dataArray['years'] = array_key_exists('years', $post) && $post['years'] ? $post['years'] : "";//年度
        $dataArray['accountingPeriod'] = array_key_exists('accountingPeriod', $post) && $post['accountingPeriod'] ? $post['accountingPeriod'] : "";//会计期间
        $dataArray['accountingPeriodStart'] = "";
        $dataArray['accountingPeriodEnd'] = "";
        if ($dataArray['years'] != "" && $dataArray['accountingPeriod'] != "") {
            $stringDate = $dataArray['years'] . '-' . $post['accountingPeriod'] . '-01';
            $dataArray['accountingPeriodStart'] = strtotime($stringDate) - 1;
            if (((int)$post['accountingPeriod']) + 1 > 12) {
                $stringDate = (((int)$post['years']) + 1) . '-01-01';
            } else {
                $stringDate = $dataArray['years'] . '-' . (((int)$post['accountingPeriod']) + 1) . '-01';
            }
            $dataArray['accountingPeriodEnd'] = strtotime($stringDate) - 1;
        }
        $dataArray['organization'] = array_key_exists('organization', $post) && $post['organization'] ? $post['organization'] : "";//组织
        $dataArray['channel'] = array_key_exists('channel', $post) && $post['channel'] ? $post['channel'] : "";//平台
        $dataArray['warehouse'] = array_key_exists('warehouse', $post) && $post['warehouse'] ? $post['warehouse'] : "";//仓库
        $dataArray['sku'] = array_key_exists('sku', $post) && $post['sku'] ? $post['sku'] : "";//SKU
        $dataArray['smallType'] = array_key_exists('smallType', $post) && $post['smallType'] ? $post['smallType'] : "";//小分类
        $dataArray['accessOrg'] = "";
        $dataArray['product_id'] = "";
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            $dataArray['accessOrg'] = Yii::$app->session->get('organization') ? Yii::$app->session->get('organization') : "";//组织权限
            $dataArray['product_id'] = Yii::$app->session->get('product_id') ? Yii::$app->session->get('product_id') : "";//大分类权限
        }
        $dataArray['export'] = array_key_exists('export', $post) && $post['export'] ? $post['export'] : false;//是否为导出
        return $dataArray;
    }

    //查询会计期间表获取全月平均库存结余表信息
    public static function getInventoryBalance($parameter)
    {
        $data = (new Query())->from('ac_moinventory_balance amb')
            ->select(new Expression("CONCAT(aap.YEARS,'年',aap.ACCOUNTING_PERIOD,'期') AS PERIOD,
                oo.ORGANISATION_NAME_CN,
                gcs.CSKU_CODE,
                amb.PSKU_CODE,
                amb.INITIAL_QUANTITY,
                amb.CWAREHOUSING_QUANTITY,
                amb.QWAREHOUSING_QUANTITY,
                amb.CBALANCE_NUMBER"))
            ->leftJoin('ac_accounting_period aap', 'aap.ACCOUNTING_PERIOD_ID = amb.ACCOUNTING_PERIOD_ID')
            ->leftJoin('o_organisation oo', 'oo.ORGANISATION_ID = amb.ORGANISATION_ID')
            ->leftJoin('g_product_sku gps', 'gps.PSKU_ID = amb.PSKU_ID')
            ->leftJoin('g_currency_sku gcs', 'gcs.CSKU_ID = gps.CSKU_ID')
            ->leftJoin('g_product_type gpts', 'gpts.PRODUCT_TYPE_ID = SUBSTRING_INDEX(gps.PRODUCT_TYPE_PATH,\',\',-1)')
            //->leftJoin('g_product_type gptb', 'gptb.PRODUCT_TYPE_ID = SUBSTRING_INDEX(gps.PRODUCT_TYPE_PATH,\',\',1)')
            ->leftJoin('b_warehouse bw', 'bw.WAREHOUSE_ID = amb.WAREHOUSE_ID')
            ->groupBy("amb.MOINVENTORY_BALANCE_ID")
            ->orderby("amb.PSKU_ID ASC");

        //库存调整单拼接andWhere
        return self::getInventoryBalanceWhere($data, $parameter);
    }

    //全月平均库存结余表信息拼接andWhere
    public static function getInventoryBalanceWhere($data, $parameter)
    {
        if ($parameter['years'] != "" && $parameter['accountingPeriod'] != "") {
            $data->andWhere(['and', ['=', 'aap.YEARS', $parameter['years']], ['=', 'aap.ACCOUNTING_PERIOD', $parameter['accountingPeriod']]]);
        }
        if ($parameter['channel'] != "") {
            $data->andWhere(new Expression("FIND_IN_SET(bw.CHANNEL_ID,'" . $parameter['channel'] . "')"));
        }
        if ($parameter['warehouse'] != "") {
            $data->andWhere(new Expression("FIND_IN_SET(bw.WAREHOUSE_ID,'" . $parameter['warehouse'] . "')"));
        }
        if ($parameter['sku'] != "") {
            $data->andWhere(new Expression("FIND_IN_SET(amb.PSKU_ID,'" . $parameter['sku'] . "')"));
        } else {
            if ($parameter['smallType'] != "") {
                $data->andWhere(["gpts.PRODUCT_TYPE_ID" => $parameter['smallType']]);
            }
        }
        if ($parameter['organization'] != "") {
            $data->andWhere(new Expression("FIND_IN_SET(aap.ORGANISATION_ID,'" . $parameter['organization'] . "')"));
        }
        //添加组织和大分类过滤
        if ($parameter['accessOrg'] != "") {
            $data->andWhere(["aap.ORGANISATION_ID" => $parameter['accessOrg']]);
        }
        if ($parameter['product_id'] != "") {
            $data->andWhere(["gps.PSKU_ID" => $parameter['product_id']]);
        }
        return $data->DISTINCT();
    }

    //出入库总表
    public static function libraryRecord($parameter)
    {
        if ($parameter['accountingPeriodStart'] == "" || $parameter['accountingPeriodEnd'] == "") {
            return ['data' => [], 'total' => 0];
        }
        $data = [];
        $parameter['period'] = $parameter['years'] . '年' . $parameter['accountingPeriod'] . '期';

        //查询月底出入库总数
        $data['end'] = self::getLibraryRecord(['and',
            ['NOT IN', 'slr.ORDER_TYPE', [4, 5]],//过滤 4 调拨（调出） 5调拨（调入）
            ['<=', 'slr.ORDER_AT', $parameter['accountingPeriodEnd']]], $parameter, true);
        //获取月底出入库有记录的组织和产品ID,提高查询SQL的效率
        $parameter['orgSkuArray'] = self::getOrgAndSkuID($data['end']);

        //查询月初出入库总数
        $data['start'] = self::getLibraryRecord(['and',
            ['NOT IN', 'slr.ORDER_TYPE', [4, 5]], //过滤 4 调拨（调出） 5调拨（调入）
            ['<=', 'slr.ORDER_AT', $parameter['accountingPeriodStart']]], $parameter, false);

        //查询本期入库总数
        $data['in'] = self::getLibraryRecord(['and',
            ['>=', 'slr.ORDER_AT', $parameter['accountingPeriodStart']],
            ['<=', 'slr.ORDER_AT', $parameter['accountingPeriodEnd']],
            ['or', ['slr.ORDER_TYPE' => [99]],
                ['and', ['slr.ORDER_TYPE' => 1], ['>', 'slr.NUMBERS', 0]],//蓝字入库单
                ['and', ['slr.ORDER_TYPE' => 2], ['>', 'slr.NUMBERS', 0]],//红字出库单
                ['and', ['slr.ORDER_TYPE' => 3], ['>', 'slr.NUMBERS', 0]]//正数调整单
            ]], $parameter, false);

        //查询本期出库总数
        $data['out'] = self::getLibraryRecord(['and',
            ['>=', 'slr.ORDER_AT', $parameter['accountingPeriodStart']],
            ['<=', 'slr.ORDER_AT', $parameter['accountingPeriodEnd']],
            ['or', ['and', ['slr.ORDER_TYPE' => 1], ['<', 'slr.NUMBERS', 0]],//红字入库单
                ['and', ['slr.ORDER_TYPE' => 2], ['<', 'slr.NUMBERS', 0]],//蓝字出库单
                ['and', ['slr.ORDER_TYPE' => 3], ['<', 'slr.NUMBERS', 0]]//负数调整单
            ]], $parameter, false);
        return self::getLibraryRecordData($data);
    }

    //合并月初，月尾，入库，出库
    public static function getLibraryRecordData($data)
    {
        $dataTemp = ['data' => [], 'total' => $data['end']['total']];
        foreach ($data['end']['data'] as $keyEnd => $valueEnd) {
            $valueEnd['INITIAL_QUANTITY'] = 0;
            $valueEnd['CWAREHOUSING_QUANTITY'] = 0;
            $valueEnd['QWAREHOUSING_QUANTITY'] = 0;
            $valueEnd['CBALANCE_NUMBER'] = (int)$valueEnd['NUMBERS'];
            foreach ($data['start']['data'] as $keyStart => $valueStart) {
                if ($valueEnd['PSKU_ID'] == $valueStart['PSKU_ID'] && $valueEnd['ORGANISATION_ID'] == $valueStart['ORGANISATION_ID']) {
                    $valueEnd['INITIAL_QUANTITY'] += $valueStart['NUMBERS'];
                }
            }
            foreach ($data['in']['data'] as $keyIn => $valueIn) {
                if ($valueEnd['PSKU_ID'] == $valueIn['PSKU_ID'] && $valueEnd['ORGANISATION_ID'] == $valueIn['ORGANISATION_ID']) {
                    $valueEnd['CWAREHOUSING_QUANTITY'] += $valueIn['NUMBERS'];
                }
            }
            foreach ($data['out']['data'] as $keyOut => $valueOut) {
                if ($valueEnd['PSKU_ID'] == $valueOut['PSKU_ID'] && $valueEnd['ORGANISATION_ID'] == $valueOut['ORGANISATION_ID']) {
                    $valueEnd['QWAREHOUSING_QUANTITY'] += $valueOut['NUMBERS'];
                }
            }
            $valueEnd['QWAREHOUSING_QUANTITY'] = $valueEnd['QWAREHOUSING_QUANTITY'] * -1;
            $data['end']['data'][$keyEnd] = $valueEnd;
        }
        $dataTemp['data'] = $data['end']['data'];
        return $dataTemp;
    }

    public static function getLibraryRecord($where, $parameter, $flag = false)
    {
        $data = (new Query())->from('sk_library_record slr')
            ->select(new Expression("'" . $parameter['period'] . "' AS PERIOD,
                slr.ORGANISATION_ID,
                oo.ORGANISATION_NAME_CN,
                gcs.CSKU_CODE,
                gcs.CSKU_ID,
                slr.PSKU_CODE,
                slr.PSKU_ID,
                SUM(slr.NUMBERS) AS NUMBERS"))
            ->leftJoin('o_organisation oo', 'oo.ORGANISATION_ID = slr.ORGANISATION_ID')
            ->leftJoin('g_product_sku gps', 'gps.PSKU_ID = slr.PSKU_ID')
            ->leftJoin('g_currency_sku gcs', 'gcs.CSKU_ID = gps.CSKU_ID')
            ->leftJoin('g_product_type gpts', 'gpts.PRODUCT_TYPE_ID = SUBSTRING_INDEX(gps.PRODUCT_TYPE_PATH,\',\',-1)')
            //->leftJoin('g_product_type gptb', 'gptb.PRODUCT_TYPE_ID = SUBSTRING_INDEX(gps.PRODUCT_TYPE_PATH,\',\',1)')
            ->leftJoin('b_warehouse bw', 'bw.WAREHOUSE_ID = slr.WAREHOUSE_ID')
            ->where($where)
            ->groupBy(new Expression("slr.ORGANISATION_ID,
                oo.ORGANISATION_NAME_CN,
                gcs.CSKU_CODE,
                gcs.CSKU_ID,
                slr.PSKU_CODE,
                slr.PSKU_ID"))
            ->orderby("slr.ORDER_AT ASC")
            ->distinct(true);
        //出入库总表拼接andWhere
        $data = self::getLibraryRecordWhere($data, $parameter);
        if ($flag && $parameter['export'] == false) {
            list($total, $data) = DBHelper::SearchList($data, ['limit' => $parameter['limit']], $parameter['page'] - 1);
            $temp = ['data' => $data, 'total' => $total];
        } else {
            $temp = ['data' => $data->all(), 'total' => 0];
        }
        return $temp;
    }

    //出入库总表拼接andWhere
    public static function getLibraryRecordWhere($data, $parameter)
    {
        if (isset($parameter['orgSkuArray']) && $parameter['orgSkuArray'] != null) {
            if (isset($parameter['orgSkuArray']['ORGANISATION_ID']) && $parameter['orgSkuArray']['ORGANISATION_ID'] != "") {
                $data->andWhere(["slr.ORGANISATION_ID" => $parameter['orgSkuArray']['ORGANISATION_ID']]);
            }
            if (isset($parameter['orgSkuArray']['PSKU_ID']) && $parameter['orgSkuArray']['PSKU_ID'] != "") {
                $data->andWhere(["slr.PSKU_ID" => $parameter['orgSkuArray']['PSKU_ID']]);
            }
        }
        if ($parameter['channel'] != "") {
            $data->andWhere(new Expression("FIND_IN_SET(bw.CHANNEL_ID,'" . $parameter['channel'] . "')"));
        }
        if ($parameter['warehouse'] != "") {
            $data->andWhere(new Expression("FIND_IN_SET(bw.WAREHOUSE_ID,'" . $parameter['warehouse'] . "')"));
        }
        if ($parameter['sku'] != "") {
            $data->andWhere(new Expression("FIND_IN_SET(slr.PSKU_ID,'" . $parameter['sku'] . "')"));
        } else {
            if ($parameter['smallType'] != "") {
                $data->andWhere(["gpts.PRODUCT_TYPE_ID" => $parameter['smallType']]);
            }
        }
        if ($parameter['organization'] != "") {
            $data->andWhere(new Expression("FIND_IN_SET(slr.ORGANISATION_ID,'" . $parameter['organization'] . "')"));
        }
        //添加组织和大分类过滤
        if ($parameter['accessOrg'] != "") {
            $data->andWhere(["slr.ORGANISATION_ID" => $parameter['accessOrg']]);
        }
        if ($parameter['product_id'] != "") {
            $data->andWhere(["slr.PSKU_ID" => $parameter['product_id']]);
        }
        return $data->DISTINCT();
    }

    public static function getOrgAndSkuID($data)
    {
        $temp = [];
        foreach ($data['data'] as $key => $value) {
            $temp['ORGANISATION_ID'][] = $value['ORGANISATION_ID'];
            $temp['PSKU_ID'][] = $value['PSKU_ID'];
        }
        return $temp;
    }

}