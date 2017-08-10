<?php

namespace addons\inventory\models;

use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use yii\behaviors\AttributeBehavior;
use \yii\swoole\db\ActiveRecord;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\helpers\ArrayHelper;

use addons\organization\models\OOrganisation;
use addons\master\basics\models\BWarehouse;
use addons\master\partint\models\PaPartner;
use addons\inventory\models\SkAllocation;
use addons\users\models\UUserInfo;
use addons\master\basics\models\BUnit;
use addons\master\product\models\GProductSku;

/**
 * @SWG\Definition(
 *   definition="SkAllocationDetail",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="ALLOCATION_DETAIL_ID", type="integer",description="调拨计划单明细ID"),
 *           @SWG\Property(property="ALLOCATION_ID",type="integer",format="int32",description="调拨单ID"),
 *           @SWG\Property(property="ETPSKU_ID", type="integer",description="调入SKU ID"),
 *           @SWG\Property(property="ETSKU_CODE", type="string",description="调入SKU"),
 *           @SWG\Property(property="ATPSKU_ID", type="integer",description="调出SKU ID"),
 *           @SWG\Property(property="ATSKU_CODE", type="string",description="调出SKU"),
 *           @SWG\Property(property="TDRODUCT_DE", type="string",description="产品说明"),
 *           @SWG\Property(property="UNIT_CODE", type="string",description="单位"),
 *           @SWG\Property(property="TDNUMBER",type="integer",format="int32",description="数量"),
 *           @SWG\Property(property="UNIT_PRICE", type="double",description="单价"),
 *           @SWG\Property(property="TDMONEY", type="double",description="金额"),
 *           @SWG\Property(property="ALLOCATION_NUMBER", type="string",description="调拨数量"),
 *           @SWG\Property(property="ALLOCATION_REMARKS", type="string",description="备注"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="制单日期"),
 *           @SWG\Property(property="CUSER_CODE",type="string",description="制单人"),
 *           @SWG\Property(property="UUSER_CODE",type="string",description="更新人"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="更新时间"),
 *           @SWG\Property(property="ALLOCATIONS_STATE",type="integer",format="int32",description="调拨状态：0 未调拨  1 已发货 2已收货"),
 *           @SWG\Property(property="UNIT_ID",  type="integer",description="单位ID"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class SkAllocationDetail extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_allocation_detail';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ATPSKU_ID', 'ETPSKU_ID', 'ALLOCATION_ID', 'TDNUMBER', 'ALLOCATION_NUMBER', 'CREATED_AT', 'UPDATED_AT', 'ALLOCATIONS_STATE', 'UNIT_ID', 'UUSER_ID', 'CUSER_ID'], 'integer'],
            [['UNIT_PRICE', 'TDMONEY'], 'number'],
            [['ATSKU_CODE', 'ETSKU_CODE'], 'string', 'max' => 20],
            [['TDRODUCT_DE', 'ALLOCATION_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ALLOCATION_DETAIL_ID' => Yii::t('inventory', '调拨计划单明细ID'),
            'ALLOCATION_ID' => Yii::t('inventory', '调拨单ID'),
            'ATPSKU_ID' => Yii::t('purchase', '调出SKU ID'),
            'ATSKU_CODE' => Yii::t('inventory', '调出SKU'),
            'ETPSKU_ID' => Yii::t('purchase', '调入SKU ID'),
            'ETSKU_CODE' => Yii::t('inventory', '调入SKU'),
            'TDRODUCT_DE' => Yii::t('inventory', '产品说明'),
            'TDNUMBER' => Yii::t('inventory', '数量'),
            'UNIT_PRICE' => Yii::t('inventory', '单价'),
            'TDMONEY' => Yii::t('inventory', '金额'),
            'ALLOCATION_NUMBER' => Yii::t('inventory', '调拨数量'),
            'ALLOCATION_REMARKS' => Yii::t('inventory', '备注'),
            'CREATED_AT' => Yii::t('inventory', '创建时间'),
            'UPDATED_AT' => Yii::t('inventory', '修改时间'),
            'ALLOCATIONS_STATE' => Yii::t('inventory', '调拨状态：0 未调拨  1 已发货 2已收货'),
            'UNIT_ID' => Yii::t('inventory', '单位ID'),
            'UUSER_ID' => Yii::t('inventory', '更新人ID'),
            'CUSER_ID' => Yii::t('inventory', '创建人ID'),
        ];
    }

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
                'class' => OperatorBehaviors::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CUSER_ID', 'UUSER_ID'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UUSER_ID'],
                ],
            ]
        ];
    }

    //调拨单
    public function getSk_allocation()
    {
        return $this->hasOne(SkAllocation::className(), ['ALLOCATION_ID' => 'ALLOCATION_ID']);
    }

    //创建人
    public function getU_userinfoc()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'CUSER_ID'])->alias('c');
    }

    //更新人
    public function getU_userinfou()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'UUSER_ID'])->alias('u');
    }

    //SKU
    public function getG_product_sku()
    {
        return $this->hasOne(GProductSku::className(), ['PSKU_ID' => 'ATPSKU_ID'])->select(['PSKU_ID', 'PSKU_CODE', 'PSKU_NAME_CN']);
    }

    //单位
    public function getB_unit()
    {
        return $this->hasOne(BUnit::className(), ['UNIT_ID' => 'UNIT_ID'])->select(['UNIT_ID', 'UNIT_CODE', 'UNIT_NAME_CN']);
    }
}