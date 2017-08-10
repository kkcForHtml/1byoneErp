<?php
namespace addons\amazon\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\db\ActiveRecord;
/**
 *
 * @SWG\Definition(
 *   definition="CAmazonOrderDetail",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="ID", type="string",description="主键ID"),
 *           @SWG\Property(property="AMAZON_ORDER_ID", type="string",description="亚马逊销售ID"),
 *           @SWG\Property(property="ASIN", type="string",description="亚马逊识别号"),
 *           @SWG\Property(property="ORDER_ITEM_ID", type="string",description="订单商品ID"),
 *           @SWG\Property(property="QUANTITY_SHIPPED",type="integer",description="商品数量"),
 *           @SWG\Property(property="CURRENCY_ID",  type="integer",description="货币ID"),
 *           @SWG\Property(property="CURRENCY_CODE",  type="string",description="货币代码"),
 *           @SWG\Property(property="ITEM_PRICE",  type="string",description="商品售价"),
 *           @SWG\Property(property="OTHER_PRICE",  type="string",description="其他费用总和"),
 *           @SWG\Property(property="UPDATED_AT", type="integer",format="int32",,description="更新时间"),
 *       )
 *   }
 * )
 */

class CAmazonOrderDetail extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'c_amazon_order_detail';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ORDER_ITEM_ID', 'AMAZON_ORDER_ID'], 'required'],
            [['PSKU_ID','CURRENCY_ID','QUANTITY_SHIPPED', 'UPDATED_AT'], 'integer'],
            [['ITEM_PRICE', 'OTHER_PRICE'], 'number'],
            [['AMAZON_ORDER_ID', 'ORDER_ITEM_ID', 'SELLER_SKU'], 'string', 'max' => 20],
            [['ASIN'], 'string', 'max' => 15],
            [['CURRENCY_CODE'], 'string', 'max' => 10],
            [['ORDER_ITEM_ID'], 'unique'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ID' => Yii::t('amazon', '主键ID'),
            'AMAZON_ORDER_ID' => Yii::t('amazon', '亚马逊销售ID'),
            'ASIN' => Yii::t('amazon', '亚马逊识别号'),
            'ORDER_ITEM_ID' => Yii::t('amazon', '订单商品ID'),
            'SELLER_SKU' => Yii::t('amazon', '平台SKU'),
            'PSKU_ID' => Yii::t('amazon', 'SKU ID'),
            'QUANTITY_SHIPPED' => Yii::t('amazon', '商品数量'),
            'CURRENCY_ID' => Yii::t('amazon', '货币ID'),
            'CURRENCY_CODE' => Yii::t('amazon', '货币代码'),
            'ITEM_PRICE' => Yii::t('amazon', '商品售价'),
            'OTHER_PRICE' => Yii::t('amazon', '其他费用总和'),
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

    //主表
    public function getC_amazon_order()
    {
        return $this->hasOne(CAmazonOrder::className(), ['AMAZON_ORDER_ID' => 'AMAZON_ORDER_ID']);
    }
}