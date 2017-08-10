<?php

namespace addons\amazon\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\db\ActiveRecord;

/**
 * This is the model class for table "fba_fulfillment_inventory".
 *
 * @property integer $ID
 * @property integer $ACCOUNT_ID
 * @property string $FBA_SHIPMENT_ID
 * @property string $FULFILLMENT_CENTER_ID
 * @property integer $RECEIVED_DATE
 * @property string $FNSKU
 * @property string $PLATFORM_SKU
 * @property integer $QUANTITY
 * @property string $PRODUCT_NAME
 * @property integer $STATUS
 * @property integer $UPDATED_AT
 */
class FbaFulfillmentInventory extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'fba_fulfillment_inventory';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ACCOUNT_ID', 'RECEIVED_DATE', 'PSKU_ID', 'QUANTITY', 'STATUS', 'UPDATED_AT'], 'integer'],
            [['FBA_SHIPMENT_ID', 'FULFILLMENT_CENTER_ID', 'FNSKU'], 'string', 'max' => 30],
            [['PLATFORM_SKU'], 'string', 'max' => 20],
            [['PRODUCT_NAME'], 'string', 'max' => 500],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ID' => Yii::t('amazon', '主键ID'),
            'ACCOUNT_ID' => Yii::t('amazon', '账号ID'),
            'FBA_SHIPMENT_ID' => Yii::t('amazon', 'FBA发货ID'),
            'FULFILLMENT_CENTER_ID' => Yii::t('amazon', 'FBA收货中心ID'),
            'RECEIVED_DATE' => Yii::t('amazon', '收货日期'),
            'FNSKU' => Yii::t('amazon', 'FNSKU'),
            'PLATFORM_SKU' => Yii::t('amazon', '平台SKU'),
            'PSKU_ID' => Yii::t('amazon', 'SKU ID'),
            'QUANTITY' => Yii::t('amazon', '收货数量'),
            'PRODUCT_NAME' => Yii::t('amazon', '产品名称(英文)'),
            'STATUS' => Yii::t('amazon', '匹配状态1未匹配2已匹配3待处理(默认3待处理)'),
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
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UPDATED_AT'],
                ],
            ]
        ];
    }
}