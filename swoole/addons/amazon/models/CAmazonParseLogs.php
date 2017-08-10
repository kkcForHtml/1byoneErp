<?php
namespace addons\amazon\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\db\ActiveRecord;
/**
 * This is the model class for table "c_amazon_parselogs".
 *
 * @property integer $ID
 * @property string $AMAZON_ORDER_ID
 * @property string $ERROR_MESSAGE
 * @property integer $UPDATED_AT
 */
class CAmazonParseLogs extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'c_amazon_parselogs';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['TYPE', 'TYPE_ID'], 'required'],
            [['TYPE_ID'], 'string', 'max' => 20],
            [['ERROR_MESSAGE'], 'string'],
            [['CREATE_AT','TYPE','ERROR_TYPE','MARK_STATUS'], 'integer'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ID' => Yii::t('amazon', '主键ID'),
            'TYPE' => Yii::t('amazon','类型'),
            'ERROR_TYPE' => Yii::t('amazon','错误类型'),
            'TYPE_ID' => Yii::t('amazon','类型对应的记录id'),
            'ERROR_MESSAGE' => Yii::t('amazon', '日志信息'),
            'MARK_STATUS' => Yii::t('amazon','处理状态0-无须处理 1-待处理 2-已处理'),
            'CREATE_AT' => Yii::t('amazon', '添加时间'),
        ];
    }

    public function behaviors()
    {
        return [
            [
                'class' => TimestampBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CREATE_AT']
                ]
            ]
        ];
    }
}