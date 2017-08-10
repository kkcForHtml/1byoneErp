<?php

namespace addons\tools\models;

use Yii;

/**
 * This is the model class for table "qa_product_class".
 *
 * @property integer $PRODUCTC_ID
 * @property string $PRODUCTC_NAME_CN
 * @property string $PRODUCTC_NAME_EN
 * @property integer $D_PRODUCTC_ID
 * @property integer $PRODUCTC_STATE
 * @property integer $CREATED
 * @property integer $UPDATED
 * @property string $CUSER_CODE
 */
class QaProductClass extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'qa_product_class';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['D_PRODUCTC_ID', 'PRODUCTC_STATE', 'CREATED', 'UPDATED','CUSER_ID','UUSER_ID'], 'integer'],
            [['PRODUCTC_NAME_CN'], 'string', 'max' => 100],
            [['PRODUCTC_NAME_EN'], 'string', 'max' => 50],
            [['CUSER_CODE'], 'string', 'max' => 20],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'PRODUCTC_ID' => '问答分类ID',
            'PRODUCTC_NAME_CN' => '名称(中文)',
            'PRODUCTC_NAME_EN' => '名称(英文)',
            'D_PRODUCTC_ID' => '父级分类ID',
            'PRODUCTC_STATE' => '是否启用',
            'CREATED' => '创建时间',
            'UPDATED' => '修改时间',
            'CUSER_CODE' => '创建人',
            'CUSER_ID' => '创建人ID',
            'UUSER_ID' => '更新人ID',
        ];
    }

}
