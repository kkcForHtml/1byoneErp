<?php

namespace addons\tools\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;
/**
 * This is the model class for table "x_amazon_grablogs".
 *
 * @property integer $ID
 * @property integer $TYPE
 * @property integer $START_AT
 * @property integer $END_AT
 * @property string $MESSAGE
 * @property integer $CREATED_AT
 */
class XAmazonGrablogs extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'x_amazon_grablogs';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['TYPE', 'START_AT', 'END_AT', 'CREATED_AT'], 'integer'],
            [['MESSAGE'], 'string'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ID' => Yii::t('tools', '主键ID'),
            'TYPE' => Yii::t('tools', 'API类型1order2item3payment4report'),
            'START_AT' => Yii::t('tools', '开始执行时间'),
            'END_AT' => Yii::t('tools', '执行结束时间'),
            'MESSAGE' => Yii::t('tools', '日志信息'),
            'CREATED_AT' => Yii::t('tools', '创建时间'),
        ];
    }

    public function behaviors()
    {
        return [
            [
                'class' => TimestampBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CREATED_AT']
                ]
            ]
        ];
    }
}