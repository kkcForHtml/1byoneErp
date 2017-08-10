<?php

namespace addons\tools\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\db\ActiveRecord;
/**
 * This is the model class for table "x_amazon_reportload".
 *
 * @property integer $ID
 * @property integer $ACCOUNT_ID
 * @property string $REPORT_ID
 * @property string $REPORT_REQUESTID
 * @property integer $REPORT_TYPE
 * @property integer $REPORT_STATUS
 * @property integer $UPDATED_AT
 */
class XAmazonReportload extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'x_amazon_reportload';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ACCOUNT_ID', 'REPORT_ID', 'REPORT_REQUESTID'], 'required'],
            [['ACCOUNT_ID', 'REPORT_TYPE', 'REPORT_STATUS', 'UPDATED_AT'], 'integer'],
            [['REPORT_ID', 'REPORT_REQUESTID'], 'string', 'max' => 25],
            [['REPORT_ID'], 'unique'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ID' => Yii::t('tools', '主键ID'),
            'ACCOUNT_ID' => Yii::t('tools', '账号ID'),
            'REPORT_ID' => Yii::t('tools', '报告下载ID'),
            'REPORT_REQUESTID' => Yii::t('tools', '报告请求ID'),
            'REPORT_TYPE' => Yii::t('tools', '报告类型'),
            'REPORT_STATUS' => Yii::t('tools', '报告下载状态1未完成2完成'),
            'UPDATED_AT' => Yii::t('tools', '更新时间'),
        ];
    }

    public function behaviors()
    {
        return [
            [
                'class'      => TimestampBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['UPDATED_AT'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UPDATED_AT']
                ]
            ]
        ];
    }
}