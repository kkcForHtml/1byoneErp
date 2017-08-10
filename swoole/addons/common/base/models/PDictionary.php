<?php

namespace addons\common\base\models;

use Yii;

/**
 * This is the model class for table "p_dictionary".
 *
 * @property integer $D_ID
 * @property string $D_NAME_CN
 * @property string $D_NAME_EN
 * @property string $D_GROUP
 * @property integer $D_PID
 * @property integer $D_VALUE
 * @property integer $D_INDEX
 * @property integer $D_STATE
 * @property string $D_HTML
 * @property string $D_REMARKS
 */
class PDictionary extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'p_dictionary';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['D_ID', 'D_PID', 'D_VALUE', 'D_INDEX', 'D_STATE'], 'integer'],
            [['D_NAME_CN', 'D_NAME_EN', 'D_GROUP'], 'string', 'max' => 100],
            [['D_HTML', 'D_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'D_ID' => Yii::t('base', '字典组ID'),
            'D_NAME_CN' => Yii::t('base', '名称(中文)'),
            'D_NAME_EN' => Yii::t('base', '名称(英文)'),
            'D_GROUP' => Yii::t('base', '字典组'),
            'D_PID' => Yii::t('base', '父节点'),
            'D_VALUE' => Yii::t('base', '字典值'),
            'D_INDEX' => Yii::t('base', '字典排序'),
            'D_STATE' => Yii::t('base', '字典元素状态,1:启用，0:禁用'),
            'D_HTML' => Yii::t('base', 'html标签'),
            'D_REMARKS' => Yii::t('base', '字典说明'),
        ];
    }

    public function getGroup()
    {
        return $this->hasMany(static::className(), ['D_GROUP' => 'D_GROUP'])->alias('m');
    }
}
