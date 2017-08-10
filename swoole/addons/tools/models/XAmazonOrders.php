<?php

namespace addons\tools\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\db\ActiveRecord;
/**
 * This is the model class for table "x_amazon_orders".
 *
 * @property integer $ID
 * @property string $AMAZON_ORDER_ID
 * @property string $ORDER_CONTENT
 * @property string $ITEM_CONTENT
 * @property integer $STATUS
 * @property integer $UPDATED_AT
 */
class XAmazonOrders extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'x_amazon_orders';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['AMAZON_ORDER_ID'], 'required'],
            [['ORDER_CONTENT', 'ITEM_CONTENT'], 'string'],
            [['STATUS','UPDATED_AT'], 'integer'],
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
            'AMAZON_ORDER_ID' => Yii::t('tools', '亚马逊销售ID'),
            'ORDER_CONTENT' => Yii::t('tools', '订单内容'),
            'ITEM_CONTENT' => Yii::t('tools', '明细内容'),
            'STATUS' => Yii::t('tools', '解析状态1.不可解析2.可解析'),
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