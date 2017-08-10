<?php

namespace addons\master\basics\models;

use Yii;

/**
 * @SWG\Definition(
 *   definition="BSalesProductType",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"IP_ID"},
 *           @SWG\Property(property="CONTACT_ID", type="int",description="销售产品中间id"),
 *           @SWG\Property(property="ACCOUNT_ID", type="int",description="账号ID"),
 *           @SWG\Property(property="PRODUCT_TYPE_ID", type="int",description="产品分类ID")
 *       )
 *   }
 * )
 */
class BSalesProductType extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'b_sales_product_type';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ACCOUNT_ID', 'PRODUCT_TYPE_ID'], 'integer'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'CONTACT_ID' => Yii::t('basics', '销售产品中间id'),
            'ACCOUNT_ID' => Yii::t('basics', '账号ID'),
            'PRODUCT_TYPE_ID' => Yii::t('basics', '产品分类ID'),
        ];
    }
}
