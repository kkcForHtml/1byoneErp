<?php

namespace addons\master\product\models;

use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;

/**
 * @SWG\Definition(
 *   definition="GProductSkuPacking",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="SKU_FILES_ID", type="integer",description="资料SKU ID"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="PRODUCT_LONG", type="integer",format="int32",description="产品长度(CM)"),
 *           @SWG\Property(property="PRODUCT_WIDE", type="integer",format="int32",description="产品宽度(CM)"),
 *           @SWG\Property(property="PRODUCT_HIGH", type="integer",format="int32",description="产品高度(CM)"),
 *           @SWG\Property(property="PRODUCT_WEIGHT", type="integer",format="int32",description="产品重量(KG)"),
 *           @SWG\Property(property="GIFT_BOX_LONG", type="integer",format="int32",description="彩盒长度(CM)"),
 *           @SWG\Property(property="GIFT_BOX_WIDE", type="integer",format="int32",description="彩盒宽度(CM)"),
 *           @SWG\Property(property="GIFT_BOX_HIGH", type="integer",format="int32",description="彩盒高度(CM)"),
 *           @SWG\Property(property="PRODUCT_GIFT_WEIGHT", type="integer",format="int32",description="产品+彩盒重量(KG)"),
 *           @SWG\Property(property="PACKING_LONG", type="integer",format="int32",description="装箱长度(CM)"),
 *           @SWG\Property(property="PACKING_WIDE", type="integer",format="int32",description="装箱宽度(CM)"),
 *           @SWG\Property(property="PACKING_HIGH", type="integer",format="int32",description="装箱高度"),
 *           @SWG\Property(property="PACKING_NUMBER", type="integer",format="int32",description="装箱数量(台/每箱)"),
 *           @SWG\Property(property="NET_WEIGHT", type="integer",format="int32",description="净重(产品+配件)(KG)"),
 *           @SWG\Property(property="GROSS_WEIGHT", type="integer",format="int32",description="毛重（KG）"),
 *           @SWG\Property(property="CABINET_NUMBER", type="integer",format="int32",description="整柜数量"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *			 @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class GProductSkuPacking extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'g_product_sku_packing';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PRODUCT_LONG','PSKU_ID', 'PRODUCT_WIDE', 'PRODUCT_HIGH', 'PRODUCT_WEIGHT', 'GIFT_BOX_LONG', 'GIFT_BOX_WIDE', 'GIFT_BOX_HIGH', 'PRODUCT_GIFT_WEIGHT', 'PACKING_LONG', 'PACKING_WIDE', 'PACKING_HIGH', 'NET_WEIGHT', 'GROSS_WEIGHT', 'CABINET_NUMBER'], 'number'],
            [['PACKING_NUMBER', 'CREATED_AT', 'UPDATED_AT', 'CUSER_ID', 'UUSER_ID'], 'integer'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'SKU_FILES_ID' => Yii::t('product', '资料SKU ID'),
            'PSKU_ID' => Yii::t('product', '产品SKU ID'),
            'PRODUCT_LONG' => Yii::t('product', '产品长度(CM)'),
            'PRODUCT_WIDE' => Yii::t('product', '产品宽度(CM)'),
            'PRODUCT_HIGH' => Yii::t('product', '产品高度(CM)'),
            'PRODUCT_WEIGHT' => Yii::t('product', '产品重量(KG)'),
            'GIFT_BOX_LONG' => Yii::t('product', '彩盒长度(CM)'),
            'GIFT_BOX_WIDE' => Yii::t('product', '彩盒宽度(CM)'),
            'GIFT_BOX_HIGH' => Yii::t('product', '彩盒高度(CM)'),
            'PRODUCT_GIFT_WEIGHT' => Yii::t('product', '产品+彩盒重量(KG)'),
            'PACKING_LONG' => Yii::t('product', '装箱长度(CM)'),
            'PACKING_WIDE' => Yii::t('product', '装箱宽度(CM)'),
            'PACKING_HIGH' => Yii::t('product', '装箱高度(CM)'),
            'PACKING_NUMBER' => Yii::t('product', '装箱数量(台/每箱)'),
            'NET_WEIGHT' => Yii::t('product', '净重(产品+配件)(KG)'),
            'GROSS_WEIGHT' => Yii::t('product', '毛重（KG）'),
            'CABINET_NUMBER' => Yii::t('product', '整柜数量'),
            'CREATED_AT' => Yii::t('product', '创建时间'),
            'UPDATED_AT' => Yii::t('product', '修改时间'),
            'CUSER_ID' => Yii::t('product', '创建人ID'),
            'UUSER_ID' => Yii::t('product', '更新人ID'),
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
}
