<?php
namespace addons\tools\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\db\ActiveRecord;
/**
 * This is the model class for table "x_amazon_admin".
 *
 * @property integer $ID
 * @property string  $ACCOUNT_ID
 * @property string  $AMAZON_ORDER_ID
 * @property integer $PURCHASE_DATE
 * @property integer $TYPE
 * @property integer $UPDATED_AT
 * @property integer $CREATED_AT
 */
class XAmazonAdmin extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'x_amazon_admin';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ACCOUNT_ID', 'AMAZON_ORDER_ID', 'PURCHASE_DATE'], 'required'],
            [['ACCOUNT_ID','PURCHASE_DATE', 'TYPE', 'CREATED_AT', 'UPDATED_AT'], 'integer'],
            [['AMAZON_ORDER_ID'], 'string', 'max' => 20],
            [['AMAZON_ORDER_ID'], 'unique'],
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
            'AMAZON_ORDER_ID' => Yii::t('tools', '亚马逊销售ID'),
            'PURCHASE_DATE' => Yii::t('tools', '创建订单的日期'),
            'TYPE' => Yii::t('tools', '数据类型1.订单2.明细'),
            'CREATED_AT' => Yii::t('tools', '创建时间'),
            'UPDATED_AT' => Yii::t('tools', '更新时间'),
        ];
    }

    public function behaviors()
    {
        return [
            [
                'class'      => TimestampBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CREATED_AT', 'UPDATED_AT'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UPDATED_AT']
                ]
            ]
        ];
    }
}