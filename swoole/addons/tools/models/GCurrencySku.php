<?php

namespace addons\tools\models;

use Yii;

/**
 * This is the model class for table "g_currency_sku".
 *
 * @property integer $CSKU_ID
 * @property string $CSKU_CODE
 * @property string $UNIT_CODE
 * @property string $CSKU_NAME_CN
 * @property string $CSKU_NAME_EN
 * @property integer $PRODUCT_TYPE_ID
 * @property integer $CSKU_STATE
 * @property integer $DELETED_STATE
 * @property integer $UPDATED_AT
 * @property integer $CREATED_AT
 */
class GCurrencySku extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'g_currency_sku';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PRODUCT_TYPE_ID', 'CSKU_STATE', 'DELETED_STATE', 'UPDATED_AT', 'CREATED_AT'], 'integer'],
            [['CSKU_CODE', 'UNIT_CODE'], 'string', 'max' => 20],
            [['CSKU_NAME_CN'], 'string', 'max' => 128],
            [['CSKU_NAME_EN'], 'string', 'max' => 50],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'CSKU_ID' => '通用SKU ID',
            'CSKU_CODE' => '通用SKU编码',
            'UNIT_CODE' => '单位编码',
            'CSKU_NAME_CN' => '名称(中文)',
            'CSKU_NAME_EN' => '名称(英文)',
            'PRODUCT_TYPE_ID' => '产品分类ID',
            'CSKU_STATE' => '是否有效,1:Y（有效）0：N（无效）',
            'DELETED_STATE' => '是否删除,1：删除 0：未删除',
            'UPDATED_AT' => '修改时间',
            'CREATED_AT' => '创建时间',
        ];
    }
}
