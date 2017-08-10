<?php

namespace addons\tools\models;

use Yii;
use yii\swoole\db\ActiveRecord;

/**
 * This is the model class for table "c_amazon_inventory".
 *
 * @property integer $ID
 * @property string $SELLER_SKU
 * @property string $FNSKU
 * @property string $ORGANIZE_CODE
 * @property string $ASIN
 * @property string $CONDITION
 * @property integer $TOTAL_SUPPLY_QUANTITY
 * @property integer $IN_STOCK_SUPPLY_QUANTITY
 * @property string $EARLIEST_AVAILABILITY
 * @property string $SUPPLY_DETAIL
 * @property integer $CREATE_AT
 * @property integer $UPDATE_AT
 */
class CAmazoninventory extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'c_amazon_inventory';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['SELLER_SKU', 'FNSKU'], 'required'],
            [['TOTAL_SUPPLY_QUANTITY', 'IN_STOCK_SUPPLY_QUANTITY', 'CREATE_AT', 'UPDATE_AT','ORGANIZE_ID'], 'integer'],
            [['SELLER_SKU', 'FNSKU', 'ASIN'], 'string', 'max' => 50],
            [['CONDITION', 'SUPPLY_DETAIL'], 'string', 'max' => 255],
            [['EARLIEST_AVAILABILITY'], 'string', 'max' => 30],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ID' => Yii::t('tools', '记录id'),
            'SELLER_SKU' => Yii::t('tools', '商品的卖家SKU'),
            'FNSKU' => Yii::t('tools', 'SKU亚马逊配送中心的唯一编码'),
            'ORGANIZE_CODE' => Yii::t('tools', '组织编码'),
            'ASIN' => Yii::t('tools', '商品的亚马逊标准识别号'),
            'CONDITION' => Yii::t('tools', '商品的状况'),
            'TOTAL_SUPPLY_QUANTITY' => Yii::t('tools', '亚马逊物流供应链中的商品总量'),
            'IN_STOCK_SUPPLY_QUANTITY' =>Yii::t('tools', '当前位于的商品数量'),
            'EARLIEST_AVAILABILITY' => Yii::t('tools', '库存可供应取货的最早日期'),
            'SUPPLY_DETAIL' => Yii::t('tools', '亚马逊物流供应链'),
            'CREATE_AT' => Yii::t('tools', '创建时间'),
            'UPDATE_AT' => Yii::t('tools', '更新时间'),
            'ORGANIZE_ID' => Yii::t('tools', '组织ID'),
        ];
    }
}