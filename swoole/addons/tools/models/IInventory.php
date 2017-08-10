<?php

namespace addons\tools\models;

use Yii;
use yii\swoole\db\ActiveRecord;

/**
 * This is the model class for table "i_inventory".
 *
 * @property integer $INVENTORY_ID
 * @property string $DATA
 * @property string $ORGANIZE_CODE
 * @property integer $ADD_DATETIME
 * @property integer $IS_PARSING
 */
class IInventory extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'i_inventory';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['DATA'], 'string'],
            [['ADD_DATETIME', 'IS_PARSING'], 'integer'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'INVENTORY_ID' => 'Inventory  ID',
            'DATA' =>  Yii::t('tools', '数据'),
            'ORGANIZE_CODE' => Yii::t('tools', '组织编码'),
            'ADD_DATETIME' => Yii::t('tools', '拉取时间'),
            'IS_PARSING' => Yii::t('tools', '是否已解析'),
        ];
    }
}