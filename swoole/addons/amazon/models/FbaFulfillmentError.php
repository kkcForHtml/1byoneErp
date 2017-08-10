<?php

namespace addons\amazon\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\db\ActiveRecord;

/**
 * This is the model class for table "fba_fulfillment_error".
 *
 * @property integer $ID
 * @property integer $FBA_FULFILLMENT_ID
 * @property string $ERROR_MESSAGE
 * @property integer $RETRY_TIMES
 * @property integer $UPDATED_AT
 */
class FbaFulfillmentError extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'fba_fulfillment_error';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['FBA_FULFILLMENT_ID'], 'required'],
            [['FBA_FULFILLMENT_ID', 'RETRY_TIMES', 'UPDATED_AT'], 'integer'],
            [['ERROR_MESSAGE'], 'string', 'max' => 500],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ID' => Yii::t('amazon', '主键ID'),
            'FBA_FULFILLMENT_ID' => Yii::t('amazon', 'FBA收货库存报告ID'),
            'ERROR_MESSAGE' => Yii::t('amazon', '异常信息'),
            'RETRY_TIMES' => Yii::t('amazon', '失败匹配次数'),
            'UPDATED_AT' => Yii::t('amazon', '更新时间'),
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
                    ActiveRecord::EVENT_BEFORE_INSERT => ['UPDATED_AT'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UPDATED_AT']
                ]
            ]
        ];
    }
}
