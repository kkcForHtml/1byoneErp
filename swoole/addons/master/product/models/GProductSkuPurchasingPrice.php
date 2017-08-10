<?php

namespace addons\master\product\models;

use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;

use addons\master\partint\models\PaPartner;
use addons\master\basics\models\BMoney;

/**
 * @SWG\Definition(
 *   definition="GProductSkuPurchasingPrice",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="PURCHASING_PRICE_ID", type="integer",description="采购价格ID"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="PRODUCT_SKU_MOQ", type="integer",format="int32",description="最小起订量"),
 *           @SWG\Property(property="UNIT_PRICE", type="string",description="价格"),
 *           @SWG\Property(property="DEFAULTS", type="integer",format="int32",description="是否有效,1:Y 0：N"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="PARTNER_ID", type="integer",description="供应商ID"),
 *           @SWG\Property(property="MONEY_ID", type="integer",description="币种ID"),
 *			 @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class GProductSkuPurchasingPrice extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'g_product_sku_purchasing_price';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PRODUCT_SKU_MOQ', 'PSKU_ID', 'PURCHASING_PRICE_STATE', 'CREATED_AT', 'UPDATED_AT', 'PARTNER_ID', 'MONEY_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['UNIT_PRICE'], 'number'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'PURCHASING_PRICE_ID' => Yii::t('product', '采购价格ID'),
            'PSKU_ID' => Yii::t('product', '产品SKU ID'),
            'PRODUCT_SKU_MOQ' => Yii::t('product', '最小起订量'),
            'UNIT_PRICE' => Yii::t('product', '价格'),
            'PURCHASING_PRICE_STATE' => Yii::t('product', '是否有效,1:Y 0：N'),
            'CREATED_AT' => Yii::t('product', '创建时间'),
            'UPDATED_AT' => Yii::t('product', '修改时间'),
            'PARTNER_ID' => Yii::t('product', '供应商ID'),
            'MONEY_ID' => Yii::t('product', '币种ID'),
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

    // 供应商(合作伙伴)
    public function getPa_partner()
    {
        return $this->hasOne(PaPartner::className(), ['PARTNER_ID' => 'PARTNER_ID']);
    }

    //币种
    public function getB_money()
    {
        return $this->hasOne(BMoney::className(), ['MONEY_ID' => 'MONEY_ID']);
    }
}
