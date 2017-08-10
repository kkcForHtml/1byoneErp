<?php

namespace addons\finance\models;
use addons\inventory\models\SkAdjustment;
use addons\inventory\models\SkAllocation;
use addons\inventory\models\SkFiallocation;
use addons\inventory\models\SkPendingStorage;
use addons\inventory\models\SkPlacing;
use addons\purchase\models\PuPayment;
use addons\purchase\models\PuPurchase;
use addons\sales\models\CrSalesOrder;
use yii\swoole\db\ActiveRecord;
use addons\organization\models\OOrganisation;
use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
/**
 *
 *
 * @SWG\Definition(
 *   definition="AcAccountingPeriod",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="ACCOUNTING_PERIOD_ID", type="integer",description="会计期间ID"),
 *           @SWG\Property(property="YEARS", type="integer",description="年度"),
 *           @SWG\Property(property="ACCOUNTING_PERIOD", type="integer",description="会计期间"),
 *           @SWG\Property(property="ACCOUNTING_STATE", type="integer",description="状态：0关闭，1开启"),
 *           @SWG\Property(property="START_AT", type="integer",description="起始时间"),
 *           @SWG\Property(property="END_AT", type="integer",description="截止时间"),
 *           @SWG\Property(property="DELETED_STATE", type="integer",description="是否删除,1：删除 0：未删除"),
 *           @SWG\Property(property="CREATED_AT", type="integer",description="创建日期"),
 *           @SWG\Property(property="UPDATED_AT", type="integer",description="更新时间"),
 *           @SWG\Property(property="ORGANISATION_ID",  type="integer",description="组织架构ID"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class AcAccountingPeriod extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'ac_accounting_period';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['YEARS', 'ACCOUNTING_PERIOD', 'ACCOUNTING_STATE', 'START_AT', 'END_AT', 'DELETED_STATE', 'CREATED_AT', 'UPDATED_AT', 'ORGANISATION_ID', 'UUSER_ID', 'CUSER_ID'], 'integer'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ACCOUNTING_PERIOD_ID' => Yii::t('finance', '会计期间ID'),
            'YEARS' => Yii::t('finance', '年度'),
            'ACCOUNTING_PERIOD' => Yii::t('finance', '会计期间'),
            'ACCOUNTING_STATE' => Yii::t('finance', '状态：0关闭，1开启'),
            'START_AT' => Yii::t('finance', '起始时间'),
            'END_AT' => Yii::t('finance', '截止时间'),
            'DELETED_STATE' => Yii::t('finance', '是否删除,1：删除 0：未删除'),
            'CREATED_AT' => Yii::t('finance', '创建日期'),
            'UPDATED_AT' => Yii::t('finance', '更新时间'),
            'ORGANISATION_ID' => Yii::t('finance', '组织架构ID'),
            'UUSER_ID' => Yii::t('finance', '更新人ID'),
            'CUSER_ID' => Yii::t('finance', '创建人ID'),
        ];
    }


    public $realation = [
        'o_organisation' => ['ORGANISATION_ID'=>'ORGANISATION_ID'],
        'pu_purchase' => ['ORGANISATION_ID'=>'ORGANISATION_ID'],
        'cr_sales_order' => ['CRGANISATION_ID'=>'ORGANISATION_ID'],
        'sk_pending_storage' => ['ORGANISATION_ID'=>'ORGANISATION_ID'],
        'sk_placing' => ['PRGANISATION_ID'=>'ORGANISATION_ID'],
        'sk_allocation' => ['ORGANISATION_ID'=>'ORGANISATION_ID'],
        'sk_fiallocation' => ['ORGANISATION_ID'=>'ORGANISATION_ID'],
        'sk_adjustment'=>['PRGANISATION_ID'=>'ORGANISATION_ID'],
        'su_payment' => ['ORGANISATION_ID'=>'ORGANISATION_ID'],
        ];
    /**
     * 新增修改前把指定字段值写入时间戳
     */
    public function behaviors()
    {
        return [
            [
                'class' => TimestampBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CREATED_AT', 'UPDATED_AT'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UPDATED_AT'],
                ],
            ],
            [
                'class'=>OperatorBehaviors::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CUSER_ID','UUSER_ID'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UUSER_ID'],
                ],
            ]
        ];
    }

    public static function addQuery(&$query, $alias)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            $query->andWhere([$alias . '.ORGANISATION_ID' => Yii::$app->session->get('organization') ?: null]);
        }
    }



    //全月平均库存结余表
    public function getAc_moinventory_balance()
    {
        return $this->hasMany(AcMoinventoryBalance::className(), ['ACCOUNTING_PERIOD_ID' => 'ACCOUNTING_PERIOD_ID'])->alias('u');
    }
    //与组织结构表的关系
    public function getO_organisation(){
        return $this->hasOne(OOrganisation::className(),['ORGANISATION_ID'=>'ORGANISATION_ID']);
    }
    //与采购订单的关系
    public function getPu_purchase(){
        return $this->hasMany(PuPurchase::className(),['ORGANISATION_ID'=>'ORGANISATION_ID']);
    }
    //与销售订单的关系
    public function getCr_sales_order(){
        return $this->hasMany(CrSalesOrder::className(),['ORGANISATION_ID'=>'ORGANISATION_ID']);
    }
    //与采购入库单的关系
    public function getSk_pending_storage(){
        return $this->hasMany(SkPendingStorage::className(),['ORGANISATION_ID'=>'ORGANISATION_ID']);
    }
    //与销售出库单的关系
    public function getSk_placing(){
        return $this->hasMany(SkPlacing::className(),['ORGANISATION_ID'=>'ORGANISATION_ID']);
    }
    //与库存调整单的关系
    public function getSk_allocation(){
        return $this->hasMany(SkAllocation::className(),['ORGANISATION_ID'=>'ORGANISATION_ID']);
    }
    //与调拨单的关系
    public function getSk_fiallocation(){
        return $this->hasMany(SkFiallocation::className(),['ORGANISATION_ID'=>'ORGANISATION_ID']);
    }
    //与付款申请表的关系
    public function getPu_payment(){
        return $this->hasMany(PuPayment::className(),['ORGANISATION_ID'=>'ORGANISATION_ID']);
    }
    //与库存调整单表的关系
    public function getSk_adjustment()
    {
        return $this->hasMany(SkAdjustment::className(), ['PRGANISATION_ID' => 'ORGANISATION_ID']);

    }

    //新增前
    public function before_ACreate($body, $class = null)
    {
        if(isset($this->START_AT)) {
            $this->START_AT = strtotime(date('Y-m-d 00:00:00', $this->START_AT));
        }
        if(isset($this->END_AT)) {
            $this->END_AT = strtotime(date('Y-m-d 23:59:59', $this->END_AT));
        }
        return [$this::ACTION_NEXT, $body];
    }




}

