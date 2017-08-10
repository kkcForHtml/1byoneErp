<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/7/17 0017
 * Time: 13:37
 */

namespace addons\inventory\modellogic;

use Yii;
use yii\swoole\modellogic\BaseLogic;
use yii\swoole\rest\ResponeModel;
use yii\swoole\db\DBHelper;
use yii\db\Expression;
use yii\swoole\db\Query;

class storagedetailLogic extends BaseLogic
{
    public static $modelClass = 'addons\inventory\models\SkStorageDetail';

    public static function getHistoryStorage($post)
    {
        $res = new ResponeModel();
        $result = self::historyStorage($post);
        $limit = array_key_exists('limit', $post) && $post['limit'] ? $post['limit'] : "20";
        $page = array_key_exists('page', $post) && $post['page'] ? $post['page'] : "1";
        //分页
        list($total, $data) = DBHelper::SearchList($result, ['limit' => $limit], $page - 1);
        return $res->setModel('200', 0, Yii::t('inventory', 'Successful operation!'), $data, ['totalCount' => $total]);
    }

    //历史入库单
    public static function historyStorage($post)
    {
        $parameter = self::formatString($post);

        $result = self::GetHistoryStorageQuery($parameter);

        return $result;
    }

    //格式化参数
    public static function formatString($post)
    {
        $dataArray = array();

        $dataArray['searchCondtion'] = array_key_exists('searchCondtion', $post) && $post['searchCondtion'] ? $post['searchCondtion'] : "";//搜索条件
        $dataArray['existsID'] = array_key_exists('existsID', $post) && $post['existsID'] ? $post['existsID'] : "";//过滤已经存在的入库单明细ID
        $dataArray['partner'] = array_key_exists('partner', $post) && $post['partner'] ? $post['partner'] : "";//供应商
        $dataArray['organisation'] = array_key_exists('organisation', $post) && $post['organisation'] ? $post['organisation'] : "";//组织
        $dataArray['accessOrg'] = "";
        $dataArray['product_id'] = "";
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            $dataArray['accessOrg'] = Yii::$app->session->get('organization') ? Yii::$app->session->get('organization') : "";//组织权限
            $dataArray['product_id'] = Yii::$app->session->get('product_id') ? Yii::$app->session->get('product_id') : "";//大分类权限
        }
        return $dataArray;
    }

    //历史入库单SQL
    public static function GetHistoryStorageQuery($parameter)
    {
        $data = (new Query())->from('sk_storage_detail ssd')
            ->select(new Expression("
            ssd.STORAGE_CD,
            ssd.PU_ORDER_CD,
            ss.STORAGE_AT,
            ssd.PSKU_CODE,
            ssd.PSKU_ID,
            ssd.PSKU_NAME_CN,
            ssd.STORAGE_DNUMBER,
            ssd.STORAGE_DNUMBER +
            (
                SELECT
                    COALESCE(sum(ssdr.STORAGE_DNUMBER),0)
                FROM
                    sk_storage_detail ssdr
                INNER JOIN sk_storage ssr ON ssr.STORAGE_ID = ssdr.STORAGE_ID
                WHERE
                    ssdr.RED_STORAGE_DETAIL_ID = ssd.STORAGE_DETAIL_ID
                AND ssr.ORDER_STATE = 2
            ) AS USERFUL_NUMBER,
            ssd.STORAGE_DETAIL_ID,
            ssd.PURCHASE_DETAIL_ID,
            ssd.UNIT_ID,
            bu.UNIT_NAME_CN,
            ss.MONEY_ID,
            ssd.TAX_RATE,
            ssd.NOT_TAX_UNITPRICE,
            ssd.UNIT_PRICE"))
            ->leftJoin('sk_storage ss', 'ss.STORAGE_ID = ssd.STORAGE_ID')
            ->leftJoin('b_unit bu', 'bu.UNIT_ID = ssd.UNIT_ID')
            ->where(['and', ['ss.ORDER_STATE' => 2], ['>', 'ssd.STORAGE_DNUMBER', 0]])
            ->andWhere(new Expression("ssd.STORAGE_DNUMBER +
            (
                SELECT
                    COALESCE(sum(ssdr.STORAGE_DNUMBER),0)
                FROM
                    sk_storage_detail ssdr
                INNER JOIN sk_storage ssr ON ssr.STORAGE_ID = ssdr.STORAGE_ID
                WHERE
                    ssdr.RED_STORAGE_DETAIL_ID = ssd.STORAGE_DETAIL_ID
                AND ssr.ORDER_STATE = 2
            ) > 0"))
            ->orderby("ssd.STORAGE_AT DESC");

        //历史入库单SQL Where语句
        $data = self::GetHistoryStorageQueryWhere($data, $parameter);

        return $data;
    }

    //历史入库单SQL Where语句
    public static function GetHistoryStorageQueryWhere($data, $parameter)
    {
        if ($parameter['searchCondtion'] != "") {
            $data->andWhere(['or',
                ['like', 'ssd.STORAGE_CD', $parameter['searchCondtion']],
                ['like', 'ssd.PU_ORDER_CD', $parameter['searchCondtion']],
                ['like', 'ssd.PSKU_NAME_CN', $parameter['searchCondtion']],
                ['like', 'ssd.PSKU_CODE', $parameter['searchCondtion']]]);
        }
        if ($parameter['existsID'] != "") {
            $data->andWhere(['not in', 'ssd.PURCHASE_DETAIL_ID', $parameter['existsID']]);
        }
        if ($parameter['partner'] != "") {
            $data->andWhere(['ss.PARTNER_ID' => $parameter['partner']]);
        }
        if ($parameter['organisation'] != "") {
            $data->andWhere(['ss.ORGANISATION_ID' => $parameter['organisation']]);
        }
        //添加组织和大分类过滤
        if ($parameter['accessOrg'] != "") {
            $data->andWhere(["ss.ORGANISATION_ID" => $parameter['accessOrg']]);
        }
        if ($parameter['product_id'] != "") {
            $data->andWhere(["ssd.PSKU_ID" => $parameter['product_id']]);
        }
        return $data->DISTINCT();
    }
}