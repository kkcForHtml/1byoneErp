<?php
namespace addons\tools\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\db\ActiveRecord;
/**
 * This is the model class for table "x_amazon_reportrequest".
 *
 * @property integer $ID
 * @property integer $ACCOUNT_ID
 * @property string $REPORT_REQUESTID
 * @property integer $REPORT_TYPE
 * @property integer $START_DATE
 * @property integer $END_DATE
 * @property integer $STATUS
 * @property integer $SUBMITTED_DATE
 * @property integer $UPDATED_AT
 */
class XAmazonReportrequest extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'x_amazon_reportrequest';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ACCOUNT_ID', 'REPORT_REQUESTID'], 'required'],
            [['ACCOUNT_ID', 'REPORT_TYPE', 'START_DATE', 'END_DATE', 'STATUS', 'SUBMITTED_DATE', 'UPDATED_AT'], 'integer'],
            [['REPORT_REQUESTID'], 'string', 'max' => 25],
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
            'REPORT_REQUESTID' => Yii::t('tools', '报告请求ID'),
            'REPORT_TYPE' => Yii::t('tools', '报告类型'),
            'START_DATE' => Yii::t('tools', '数据起始日期'),
            'END_DATE' => Yii::t('tools', '数据结束日期'),
            'STATUS' => Yii::t('tools', '报告请求状态1未处理2已处理'),
            'SUBMITTED_DATE' => Yii::t('tools', '报告请求日期'),
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