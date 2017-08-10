<?php

namespace addons\inventory\models;

use addons\master\product\models\GProductSku;
use Yii;
use yii\swoole\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;

/**
 * @SWG\Definition(
 *   definition="SkStockInitialiseDetail",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="STOCK_INITIALISE_DETAIL_ID", type="integer",description="库存初始化单明细ID"),
 *           @SWG\Property(property="STOCK_INITIALISE_ID", type="integer",description="库存初始化单ID"),
 *           @SWG\Property(property="STOCK_INITIALISE_CD", type="string",description="库存初始化单单号"),
 *           @SWG\Property(property="PSKU_CODE", type="string",description="SKU编码"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="PURCHASE", type="integer",description="数量"),
 *           @SWG\Property(property="COPST_PRICE", type="number",description="单位成本"),
 *           @SWG\Property(property="CREATED_AT", type="integer",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT", type="integer",description="修改时间"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class SkStockInitialiseDetail extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_stock_initialise_detail';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['STOCK_INITIALISE_ID','STOCK_INITIALISE_CD','PSKU_CODE','PSKU_ID', 'PURCHASE'], 'required'],
            [['STOCK_INITIALISE_ID', 'PSKU_ID', 'PURCHASE', 'CREATED_AT', 'UPDATED_AT', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['COPST_PRICE'], 'number'],
            [['STOCK_INITIALISE_CD'], 'string', 'max' => 30],
            [['PSKU_CODE'], 'string', 'max' => 20],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'STOCK_INITIALISE_DETAIL_ID' => Yii::t('inventory', '库存初始化单明细ID'),
            'STOCK_INITIALISE_ID' => Yii::t('inventory', '库存初始化单ID'),
            'STOCK_INITIALISE_CD' => Yii::t('inventory', '库存初始化单单号'),
            'PSKU_CODE' => Yii::t('inventory', 'SKU编码'),
            'PSKU_ID' => Yii::t('inventory', '产品SKU ID'),
            'PURCHASE' => Yii::t('inventory', '数量'),
            'COPST_PRICE' => Yii::t('inventory', '单位成本'),
            'CREATED_AT' => Yii::t('inventory', '创建时间'),
            'UPDATED_AT' => Yii::t('inventory', '修改时间'),
            'CUSER_ID' => Yii::t('inventory', '创建人ID'),
            'UUSER_ID' => Yii::t('inventory', '更新人ID'),
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
            ],
        ];
    }


    //产品sku，带出单位
    public function getG_product_sku()
    {
        return $this->hasOne(GProductSku::className(), ['PSKU_ID' => 'PSKU_ID'])->select(['PSKU_ID', 'PSKU_CODE', 'PSKU_NAME_CN', 'g_product_sku.UNIT_ID'])->joinWith(['b_unit']);
    }



}
