<?php

namespace addons\users\models;

use Yii;

use addons\master\product\models\GProductType;
/**
 * This is the model class for table "u_user_category".
 */

/**
 * @SWG\Definition(
 *   definition="UUserCategory",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="USER_CATEGORY_ID", type="integer",description="用户品类分配ID"),
 *           @SWG\Property(property="USER_INFO_ID", type="string",description="用户ID"),
 *           @SWG\Property(property="PRODUCT_TYPE_ID", type="integer",description="产品分类ID")
 *       )
 *   }
 * )
 */
class UUserCategory extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'u_user_category';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PRODUCT_TYPE_ID','USER_INFO_ID'], 'integer'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'USER_CATEGORY_ID' => Yii::t('users', '用户品类分配ID'),
            'PRODUCT_TYPE_ID' => Yii::t('users', '产品分类ID'),
            'USER_INFO_ID' => Yii::t('users', '用户ID'),
        ];
    }

    public function getP_category()
    {
        return $this->hasOne(GProductType::className(), ['PRODUCT_TYPE_ID' => 'PRODUCT_TYPE_ID'])->select(['bigc.PRODUCT_TYPE_ID', 'bigc.SYSTEM_NAME_CN','bigc.SYSTEM_NAMER_CN'])->alias('bigc')->joinWith(["g_product_types_1"]);
    }

}
