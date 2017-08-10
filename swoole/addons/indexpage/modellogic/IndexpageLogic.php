<?php
namespace addons\indexpage\modellogic;

use addons\inventory\models\SkAdjustment;
use addons\inventory\models\SkAllocation;
use addons\inventory\models\SkFiallocation;
use addons\inventory\models\SkPendingDelivery;
use addons\inventory\models\SkPendingStorage;
use addons\inventory\models\SkPlacing;
use addons\inventory\models\SkStockInitialise;
use addons\inventory\models\SkStorage;
use addons\purchase\models\PuPayment;
use addons\purchase\models\PuPlan;
use addons\purchase\models\PuPurchase;
use addons\purchase\models\PuQctables;
use addons\shipment\models\ShDispatchNote;
use Yii;
use yii\db\Expression;
use yii\swoole\db\Query;

/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/7/4 0004
 * Time: 9:48
 */
class IndexpageLogic
{
    /*//自定义index方法
    public static function indexCustom($post)
    {
        $pendingSchedule = self::pendingSchedule();
        return $pendingSchedule;
    }*/

    //代办事项
    public static function pendingSchedule($post)
    {
        $test = array();
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        $access = [];
        $access["accessOrg"] = "";
        $access["product_id"] = "";
        if ($str) {
            $access['accessOrg'] = Yii::$app->session->get('organization') ? Yii::$app->session->get('organization') : "";//组织权限
            $access['product_id'] = Yii::$app->session->get('product_id') ? Yii::$app->session->get('product_id') : "";//大分类权限
        }
        //采购计划
        $mPuPlan = (new Query())->from(['t' => PuPlan::tableName()])
            ->where(['t.PLAN_STATE' => 1, 't.DELETED_STATE' => 0]);
        $mPuPlan = self::concatPendingScheduleWhere($mPuPlan, $str, "t.DORGANISATION_ID", "t.PSKU_ID", $access);
        $test[Yii::t('indexpage', 'PuPlan')] = $mPuPlan->count();
        //采购订单
        $mPuPurchase = (new Query())->from(['t' => PuPurchase::tableName()])->leftJoin('pu_purchase_detail td', 't.PU_PURCHASE_ID = td.PU_PURCHASE_ID')
            ->where(['t.ORDER_STATE' => 1, 't.DELETED_STATE' => 0]);
        $mPuPurchase = self::concatPendingScheduleWhere($mPuPurchase, $str, "t.ORGANISATION_ID", "td.PSKU_ID", $access);
        $test[Yii::t('indexpage', 'PuPurchase')] = $mPuPurchase->select(new Expression("COUNT(DISTINCT t.PU_PURCHASE_ID)"))->scalar();
        //品检信息
        $mPuQctables = (new Query())->from(['t' => PuQctables::tableName()])->leftJoin('pu_purchase td', 't.PU_ORDER_CD = td.PU_PURCHASE_CD')
            ->where(['t.INSPECTION_STATE' => 3, 't.DELETED_STATE' => 0]);
        $mPuQctables = self::concatPendingScheduleWhere($mPuQctables, $str, "td.ORGANISATION_ID", "t.PSKU_ID", $access);
        $test[Yii::t('indexpage', 'PuQctables')] = $mPuQctables->select(new Expression("COUNT(DISTINCT t.QCTABLES_ID)"))->scalar();
        //调拨单
        $mSkFiallocation = (new Query())->from(['t' => SkFiallocation::tableName()])->leftJoin('sk_fiallocation_detail td', 't.FIALLOCATION_ID = td.FIALLOCATION_ID')
            ->where(['t.ALLOCATION_STATE' => 1, 't.DELETED_STATE' => 0]);
        $mSkFiallocation = self::concatPendingScheduleWhere($mSkFiallocation, $str, "t.ORGANISATION_ID", "td.PSKU_ID", $access);
        $test[Yii::t('indexpage', 'SkFiallocation')] = $mSkFiallocation->select(new Expression("COUNT(DISTINCT t.FIALLOCATION_ID)"))->scalar();
        //调拨计划单
        $mSkAllocation = (new Query())->from(['t' => SkAllocation::tableName()])->leftJoin('sk_allocation_detail td', 't.ALLOCATION_ID = td.ALLOCATION_ID')
            ->where(['t.ALLOCATION_STATE' => 1, 't.DELETED_STATE' => 0]);
        $mSkAllocation = self::concatPendingScheduleWhere($mSkAllocation, $str, "t.ARGANISATION_ID", "td.ATPSKU_ID", $access);
        $mSkAllocation = self::concatPendingScheduleWhere($mSkAllocation, $str, "t.ERGANISATION_ID", "td.ETPSKU_ID", $access);
        $test[Yii::t('indexpage', 'SkAllocation')] = $mSkAllocation->select(new Expression("COUNT(DISTINCT t.ALLOCATION_ID)"))->scalar();
        //库存调整单
        $mSkAdjustment = (new Query())->from(['t' => SkAdjustment::tableName()])->leftJoin('sk_adjustment_detail td', 't.ADJUSTMENT_ID = td.ADJUSTMENT_ID')
            ->where(['t.PLAN_STATE' => 1, 't.DELETED_STATE' => 0]);
        $mSkAdjustment = self::concatPendingScheduleWhere($mSkAdjustment, $str, "t.PRGANISATION_ID", "td.PSKU_ID", $access);
        $test[Yii::t('indexpage', 'SkAdjustment')] = $mSkAdjustment->select(new Expression("COUNT(DISTINCT t.ADJUSTMENT_ID)"))->scalar();
        //入库单
        $mSkStorage = (new Query())->from(['t' => SkStorage::tableName()])->leftJoin('sk_storage_detail td', 't.STORAGE_ID = td.STORAGE_ID')
            ->where(['t.ORDER_STATE' => 1, 't.DELETED_STATE' => 0]);
        $mSkStorage = self::concatPendingScheduleWhere($mSkStorage, $str, "t.ORGANISATION_ID", "td.PSKU_ID", $access);
        $test[Yii::t('indexpage', 'SkStorage')] = $mSkStorage->select(new Expression("COUNT(DISTINCT t.STORAGE_ID)"))->scalar();
        //出库单
        $mSkPlacing = (new Query())->from(['t' => SkPlacing::tableName()])->leftJoin('sk_placing_detail td', 't.PLACING_ID = td.PLACING_ID')
            ->where(['t.PLAN_STATE' => 1, 't.DELETED_STATE' => 0]);
        $mSkPlacing = self::concatPendingScheduleWhere($mSkPlacing, $str, "t.PRGANISATION_ID", "td.PSKU_ID", $access);
        $test[Yii::t('indexpage', 'SkPlacing')] = $mSkPlacing->select(new Expression("COUNT(DISTINCT t.PLACING_ID)"))->scalar();
        //待入库
        $mSkPendingStorage = (new Query())->from(['t' => SkPendingStorage::tableName()])
            ->where(['<>', 't.PLAN_STATE', 2]);
        $mSkPendingStorage = self::concatPendingScheduleWhere($mSkPendingStorage, $str, "t.PRGANISATION_ID", "t.PSKU_ID", $access);
        $test[Yii::t('indexpage', 'SkPendingStorage')] = $mSkPendingStorage->count();
        //待出库
        $mSkPendingDelivery = (new Query())->from(['t' => SkPendingDelivery::tableName()])
            ->where(['<>', 't.PLAN_STATE', 1]);
        $mSkPendingDelivery = self::concatPendingScheduleWhere($mSkPendingDelivery, $str, "t.PRGANISATION_ID", "t.PSKU_ID", $access);
        $test[Yii::t('indexpage', 'SkPendingDelivery')] = $mSkPendingDelivery->count();
        //发运单
        $mShDispatchNote = (new Query())->from(['t' => ShDispatchNote::tableName()])
            ->where(['t.PLAN_STATE' => 1, 't.DELETED_STATE' => 0]);
        $mShDispatchNote = self::concatPendingScheduleWhere($mShDispatchNote, $str, "t.ORGANISATION_ID", "t.PSKU_ID", $access);
        $test[Yii::t('indexpage', 'ShDispatchNote')] = $mShDispatchNote->count();
        //付款申请
        $mPuPayment = (new Query())->from(['t' => PuPayment::tableName()])
            ->leftJoin('pu_payment_detail td', 't.PAYMENT_ID = td.PAYMENT_ID')
            ->leftJoin('pu_purchase_detail tdd', 'td.PURCHASE_DETAIL_ID = tdd.PURCHASE_DETAIL_ID')
            ->where(['t.AUDIT_STATE' => 1, 't.DELETED_STATE' => 0]);
        $mPuPayment = self::concatPendingScheduleWhere($mPuPayment, $str, "t.PORGANISATION_ID", "tdd.PSKU_ID", $access);
        $test[Yii::t('indexpage', 'PuPayment')] = $mPuPayment->select(new Expression("COUNT(DISTINCT t.PAYMENT_ID)"))->scalar();
        //库存初始化单表
        $mSkStockInitialise = (new Query())->from(['t' => SkStockInitialise::tableName()])->leftJoin('sk_stock_initialise_detail td', 't.STOCK_INITIALISE_ID = td.STOCK_INITIALISE_ID')
            ->where(['t.ORDER_STATE' => 1, 't.DELETED_STATE' => 0]);
        $mSkStockInitialise = self::concatPendingScheduleWhere($mSkStockInitialise, $str, "t.ORGANISATION_ID", "td.PSKU_ID", $access);
        $test[Yii::t('indexpage', 'SkStockInitialise')] = $mSkStockInitialise->select(new Expression("COUNT(DISTINCT t.STOCK_INITIALISE_ID)"))->scalar();
        return $test;
    }

    public static function concatPendingScheduleWhere($sql, $str, $org, $product, $access)
    {
        if ($str) {
            $sql->andWhere([$org => $access["accessOrg"], $product => $access["product_id"]]);
        }
        return $sql;
    }
}