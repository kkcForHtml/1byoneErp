<?php

namespace addons\master\product\models;

use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;

use addons\master\partint\models\PaPartner;

/**
 * @SWG\Definition(
 *   definition="GProductSkuSupplier",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="SKU_SUPPLIER_ID", type="integer",description="产品SKU供应商ID"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="DEFAULTS",type="integer",format="int32",description="默认,0:N  1:Y"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="PARTNER_ID", type="integer",description="供应商ID"),
 *			 @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class GProductSkuSupplier extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'g_product_sku_supplier';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['CREATED_AT', 'PSKU_ID', 'UPDATED_AT', 'DEFAULTS', 'PARTNER_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'SKU_SUPPLIER_ID' => Yii::t('product', '产品SKU供应商ID'),
            'PSKU_ID' => Yii::t('product', '产品SKU ID'),
            'CREATED_AT' => Yii::t('product', '创建时间'),
            'UPDATED_AT' => Yii::t('product', '修改时间'),
            'DEFAULTS' => Yii::t('product', '默认,0:N  1:Y'),
            'PARTNER_ID' => Yii::t('product', '供应商ID'),
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

    public function getPa_partner()
    {
        return $this->hasOne(PaPartner::className(), ['PARTNER_ID' => 'PARTNER_ID']);
    }

    /**
     * 供应商删除前后的操作
     * before_ADelete 前
     * after_ADelete 后
     */
    public function before_ADelete($body, $class = null)
    {
        if (count($body) > 0) {
            $id = [];
            $PARTNER_CODE = [];
            foreach ($body as $item) {
                if ($item['PSKU_ID']) {
                    $id[] = $item['PSKU_ID'];
                    $PARTNER_CODE[] = $item['PARTNER_ID'];
                }
            }
            $GProductSkuPurchasingPriceID = GProductSkuPurchasingPrice::find()->select(['PURCHASING_PRICE_ID'])->where(['PSKU_ID' => $id, 'PARTNER_ID' => $PARTNER_CODE])->column();
            GProductSkuPurchasingPrice::deleteAll(['PURCHASING_PRICE_ID' => $GProductSkuPurchasingPriceID]);
        }
        return parent::before_ADelete($body, $class); // TODO: Change the autogenerated stub
    }
}
