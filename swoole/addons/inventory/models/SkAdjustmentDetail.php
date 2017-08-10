<?php

namespace addons\inventory\models;

use yii\swoole\db\ActiveRecord;
use Yii;

use addons\master\basics\models\BUnit;
use addons\master\product\models\GProductSku;
use addons\inventory\models\SkAdjustment;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;


/**
 * @SWG\Definition(
 *   definition="SkAdjustmentDetail",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="ADJUSTMENT_DETAIL_ID", type="integer",description="库存调整单明细ID"),
 *           @SWG\Property(property="ADJUSTMENT_ID",type="integer",format="int32",description="库存调整单ID"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="TDSKU_CODE", type="string",description="SKU编码"),
 *           @SWG\Property(property="TDRODUCT_DE", type="string",description="产品说明"),
 *           @SWG\Property(property="TDNUMBER",type="integer",format="int32",description="数量"),
 *           @SWG\Property(property="PLA_QUANTITY",type="integer",format="int32",description="计划中数量"),
 *           @SWG\Property(property="SHIPPED_QUANTITY",type="integer",format="int32",description="已发运数量"),
 *           @SWG\Property(property="UNIT_PRICE", type="double",description="单价"),
 *           @SWG\Property(property="TDMONEY", type="double",description="金额"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="制单日期"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="更新时间"),
 *           @SWG\Property(property="UNIT_ID",  type="integer",description="单位ID"),
 *           @SWG\Property(property="MONEY_ID",  type="integer",description="币种ID"),
 *           @SWG\Property(property="TDAREHOUSE_ID",  type="integer",description="调整仓库"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class SkAdjustmentDetail extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_adjustment_detail';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PSKU_ID', 'SHIPPED_QUANTITY', 'PLA_QUANTITY', 'ADJUSTMENT_ID', 'TDNUMBER', 'CREATED_AT', 'UPDATED_AT',
                'UNIT_ID', 'MONEY_ID', 'TDAREHOUSE_ID', 'UUSER_ID', 'CUSER_ID','TDAREHOUSE_ID'], 'integer'],
            [['UNIT_PRICE', 'TDMONEY'], 'number'],
            [['TDSKU_CODE'], 'string', 'max' => 20],
            [['TDRODUCT_DE'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ADJUSTMENT_DETAIL_ID' => Yii::t('inventory', '库存调整单明细ID'),
            'ADJUSTMENT_ID' => Yii::t('inventory', '库存调整单ID'),
            'PSKU_ID' => Yii::t('inventory', 'SKU ID'),
            'TDSKU_CODE' => Yii::t('inventory', 'SKU编码'),
            'TDRODUCT_DE' => Yii::t('inventory', '产品说明'),
            'TDNUMBER' => Yii::t('inventory', '数量'),
            'PLA_QUANTITY' => Yii::t('inventory', '计划中数量'),
            'SHIPPED_QUANTITY' => Yii::t('inventory', '已发运数量'),
            'UNIT_PRICE' => Yii::t('inventory', '单价'),
            'TDMONEY' => Yii::t('inventory', '金额'),
            'CREATED_AT' => Yii::t('inventory', '制单日期'),
            'UPDATED_AT' => Yii::t('inventory', '更新时间'),
            'UNIT_ID' => Yii::t('inventory', '单位ID'),
            'MONEY_ID' => Yii::t('inventory', '币种ID'),
            'TDAREHOUSE_ID' => Yii::t('inventory', '调整仓库'),
            'UUSER_ID' => Yii::t('inventory', '更新人ID'),
            'CUSER_ID' => Yii::t('inventory', '创建人ID'),
        ];
    }

    //关联
    public function getSk_adjustment()
    {
        return $this->hasOne(SkAdjustment::className(), ['ADJUSTMENT_ID' => 'ADJUSTMENT_ID']);
    }

    //单位
    public function getB_unit()
    {
        return $this->hasOne(BUnit::className(), ['UNIT_ID' => 'UNIT_ID']);
    }

    //SKU
    public function getG_product_sku()
    {
        return $this->hasOne(GProductSku::className(), ['PSKU_ID' => 'PSKU_ID']);
    }


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
            ],
        ];
    }
}
