<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/17 0017
 * Time: 9:10
 */
namespace addons\organization\modellogic;

use addons\finance\models\AcAccountingPeriod;
use addons\inventory\models\SkInstantInventory;
use addons\inventory\models\SkStockInitialise;
use addons\inventory\models\SkStockInitialiseDetail;
use yii\swoole\modellogic\BaseLogic;
use addons\organization\models\OOrganisation;
use yii\swoole\db\Query;
use yii\swoole\rest\ResponeModel;
use yii\swoole\db\DBHelper;
use Yii;

class organizLogic extends BaseLogic
{
    public static $modelClass = 'addons\organization\models\OOrganisation';

    /**
     * 获取组织架构数据
     * $item 指定读取字段值 ，逗号隔开
     * ['ORGANISATION_CODE','ORGANISATION_NAME_CN']
     * */
    public static function GetORGANISATION($item = [])
    {
        if (count($item) <= 0) {
            $item = '*';
        }
        return OOrganisation::find()->select($item)->asArray()->all();

    }

    /**
     * 获取组织架构数据
     * @param $select
     * @param $where
     * return array
     * */
    public static function GetORGANISATIONIEN($select = [], $where = [])
    {
        if (count($select) == 0) {
            return OOrganisation::find()->where($where)->asArray()->all();
        } else {
            $info = OOrganisation::find()->select($select)->where($where)->asArray()->all();
            return $info;
        }
    }

    /**
     * GetORGANISATIONRM
     * 查询组织架构表
     * {"where":["and",["<>","ORGANISATION_STATE",0],["like","ORGANISATION_BUSINESS","1"]],"limit":0}
     * */
    public static function GetORGANISATIONRM($post)
    {
        if (isset($post['where'])) {
            $tset = (new Query())->from('o_organisation')->where($post['where']);
            //分页
            $limit = array_key_exists('limit', $post) && $post['limit'] ? $post['limit'] : "20";
            $page = array_key_exists('page', $post) && $post['page'] ? $post['page'] : "1";
            list($total, $data) = DBHelper::SearchList($tset, ['limit' => $limit], $page - 1);
            $res = new ResponeModel();
            return $res->setModel('200', 0, Yii::t('organization', 'Successful operation!'), $data, ['totalCount' => $total]);
        }
    }

    /*
     * 结束初始化
     * */
    public static function organistionEndInit($post)
    {
        $res = new ResponeModel();
        //TODO 先执行更新操作
        $result = self::Update(['batchMTC' => [$post]]);
        if ($result instanceof ResponeModel) {
            return $result;
        }
        $timeTemp = $post['STARTUP_TIME'];
        //TODO 出入库总表和及时库存共通
        $mSkStockInitialiseList = SkStockInitialise::find()->where(['ORGANISATION_ID' => $post['ORGANISATION_ID'], 'DELETED_STATE' => 0])->asArray()->all();
        if (isset($mSkStockInitialiseList) && count($mSkStockInitialiseList) > 0) {
            $errorMsg = "";
            $skStockInitialiseID = [];
            foreach ($mSkStockInitialiseList as $key => $mSkStockInitialiseTemp) {
                $skStockInitialiseID[] = $mSkStockInitialiseTemp['STOCK_INITIALISE_ID'];
                if ($mSkStockInitialiseTemp['ORDER_STATE'] == 1) {
                    $errorMsg = "The organization's inventory initialization sheet contains unaudited documents and is not allowed to perform the current operation!";
                }
            }
            if ($errorMsg != "") {
                return $res->setModel('500', 0, Yii::t('organization', $errorMsg), [], ['totalCount' => 0]);
            }
            SkStockInitialise::updateAll(['INIT_STATE'=>1],['STOCK_INITIALISE_ID'=>$skStockInitialiseID]);
            $paramArray = static::getParamarray($mSkStockInitialiseList, $timeTemp);
            Yii::$app->rpc->create('inventory')->sendAndrecv([['addons\inventory\modellogic\instantInventoryLogic', 'skuInventory'], [new OOrganisation(), $paramArray]]);
        }
        //TODO 关账 因为关账涉及到法人主体 所以不在这里做关账操作
        /*$mAcAccountingPeriodList = AcAccountingPeriod::find()
            ->where(['and', ['ORGANISATION_ID' => $post['ORGANISATION_ID']], ['ACCOUNTING_STATE' => 1], ['DELETED_STATE' => 0], ['<', 'END_AT', $timeTemp]])
            ->orderBy("YEARS ASC,ACCOUNTING_PERIOD ASC")->asArray()->all();
        if (isset($mAcAccountingPeriodList) && count($mAcAccountingPeriodList) > 0) {
            foreach ($mAcAccountingPeriodList as $key => $mAcAccountingPeriodTemp) {
                $result = Yii::$app->rpc->create('finance')->sendAndrecv([['\addons\finance\modellogic\accountingperiodLogic', 'closeAc'], [["ACCOUNTING_PERIOD_ID" => [$mAcAccountingPeriodTemp['ACCOUNTING_PERIOD_ID']]]]]);
                if ($result instanceof ResponeModel) {
                    return $result;
                }
            }
        } else {
            return $res->setModel('500', 0, Yii::t('organization', 'The accounting period was not opened!'), [], ['totalCount' => 0]);
        }*/
        return Yii::t("organization", "Successful operation!");
    }

    //出入库总表和及时库存共通
    public static function getParamarray($post, $timeTemp)
    {
        $paramArray = array();
        foreach ($post as $item) {
            $paramArray = static::buildArray($paramArray, $item, $timeTemp);
        }
        return $paramArray;
    }

    public static function buildArray($paramArray, $item, $timeTemp)
    {
        //如果是审核/反审核
        $arr = [];
        $arr['ORDER_CD'] = $item['STOCK_INITIALISE_CD'];
        $details = SkStockInitialiseDetail::find()
            ->where(['STOCK_INITIALISE_ID' => $item['STOCK_INITIALISE_ID']])
            ->asArray()
            ->all();
        $arr['AUTH_FLAG'] = 1;//审核为1，反审核为0
        $data = [];
        foreach ($details as $detail) {
            $o_arr = [];
            $o_arr['WAREHOUSE_ID'] = $item['WAREHOUSE_ID'];
            $o_arr['ORGANISATION_ID'] = $item['ORGANISATION_ID'];
            $o_arr['PSKU_ID'] = $detail['PSKU_ID'];
            $o_arr['PSKU_CODE'] = $detail['PSKU_CODE'];
            $o_arr['ORDER_TYPE'] = 99;//99初始化数据
            $o_arr['ORDER_CD'] = $item['STOCK_INITIALISE_CD'];
            $o_arr['ORDER_AT'] = $timeTemp - 24 * 3600;
            $o_arr['UNITPRICE'] = $detail['COPST_PRICE'];
            $o_arr['NUMBERS'] = $detail['PURCHASE'];
            $o_arr['INSTANT_NUMBER'] = $o_arr['NUMBERS'];
            array_push($data, $o_arr);
        }
        $arr['DATA'] = $data;
        array_push($paramArray, $arr);
        return $paramArray;
    }
}