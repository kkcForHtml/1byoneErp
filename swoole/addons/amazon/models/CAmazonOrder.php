<?php
namespace addons\amazon\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\db\ActiveRecord;
/**
 *
 * @SWG\Definition(
 *   definition="CAmazonOrder",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="ID", type="string",description="主键ID"),
 *           @SWG\Property(property="AMAZON_ORDER_ID", type="string",description="亚马逊销售ID"),
 *           @SWG\Property(property="ACCOUNT_ID", type="integer",description="账号ID"),
 *           @SWG\Property(property="ACCOUNT", type="string",description="账号"),
 *           @SWG\Property(property="PURCHASE_DATE", type="integer",description="购买时间"),
 *           @SWG\Property(property="LAST_UPDATE_DATE",type="integer",format="int32",description="订单最后更新日期"),
 *           @SWG\Property(property="ORDER_STATUS",  type="integer",description="订单状态"),
 *           @SWG\Property(property="SELLER_ORDER_ID",  type="string",description="卖家销售ID"),
 *           @SWG\Property(property="SALES_CHANNEL",  type="string",description="销售渠道"),
 *           @SWG\Property(property="FULFILLMENT_CHANNEL", type="string",description="配送方式"),
 *           @SWG\Property(property="SHIP_SERVICE_LEVEL",  type="string",description="货件服务水平"),
 *           @SWG\Property(property="CURRENCY_ID",  type="integer",description="货币代码"),
 *           @SWG\Property(property="CURRENCY_CODE",  type="string",description="货币代码"),
 *           @SWG\Property(property="AMOUNT", type="string",description="订单金额"),
 *           @SWG\Property(property="MARKETPLACEID", type="string",description="商城编码"),
 *           @SWG\Property(property="COUNTRY_ID",type="integer",description="国家代码"),
 *           @SWG\Property(property="STATE_OR_REGION",type="string",description="'省/自治区/直辖市或地区"),
 *           @SWG\Property(property="POSTAL_CODE",type="string",description="邮政编码"),
 *           @SWG\Property(property="PARSE_STATUS",type="integer",description="解析状态1成功2失败"),
 *           @SWG\Property(property="UPDATE_TIME",type="integer",format="int32",description="更新时间")
 *       )
 *   }
 * )
 */

class CAmazonOrder extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'c_amazon_order';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ACCOUNT_ID', 'AMAZON_ORDER_ID'], 'required'],
            [['ACCOUNT_ID','CURRENCY_ID','COUNTRY_ID','PURCHASE_DATE', 'LAST_UPDATE_DATE', 'ORDER_STATUS', 'PARSE_STATUS', 'UPDATED_AT'], 'integer'],
            [['AMOUNT'], 'number'],
            [['ACCOUNT'], 'string', 'max' => 30],
            [['AMAZON_ORDER_ID', 'SELLER_ORDER_ID', 'SALES_CHANNEL', 'FULFILLMENT_CHANNEL'], 'string', 'max' => 20],
            [['SHIP_SERVICE_LEVEL', 'POSTAL_CODE'], 'string', 'max' => 15],
            [['CURRENCY_CODE', 'COUNTRY_CODE'], 'string', 'max' => 10],
            [['STATE_OR_REGION'], 'string', 'max' => 50],
            [['AMAZON_ORDER_ID'], 'unique'],
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
            'ACCOUNT_ID' => Yii::t('amazon', '账号ID'),
            'ACCOUNT' => Yii::t('amazon', '账号'),
            'PURCHASE_DATE' => Yii::t('amazon', '订单创建日期'),
            'LAST_UPDATE_DATE' => Yii::t('amazon', '订单最后更新日期'),
            'ORDER_STATUS' => Yii::t('amazon', '订单状态'),
            'SELLER_ORDER_ID' => Yii::t('amazon', '卖家销售ID'),
            'SALES_CHANNEL' => Yii::t('amazon', '销售渠道'),
            'FULFILLMENT_CHANNEL' => Yii::t('amazon', '配送方式'),
            'SHIP_SERVICE_LEVEL' => Yii::t('amazon', '货件服务水平'),
            'AMOUNT' => Yii::t('amazon', '订单金额'),
            'CURRENCY_ID' => Yii::t('amazon', '货币ID'),
            'CURRENCY_CODE' => Yii::t('amazon', '货币代码'),
            'COUNTRY_ID' => Yii::t('amazon', '国家ID'),
            'COUNTRY_CODE' => Yii::t('amazon', '国家代码'),
            'STATE_OR_REGION' => Yii::t('amazon', '省/自治区/直辖市或地区'),
            'POSTAL_CODE' => Yii::t('amazon', '邮政编码'),
            'PARSE_STATUS' => Yii::t('amazon', '解析状态1成功2失败'),
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

    public $realation = ['c_amazon_order_detail' => ['AMAZON_ORDER_ID' => 'AMAZON_ORDER_ID']];

    //明细
    public function getC_amazon_order_detail()
    {
        return $this->hasMany(CAmazonOrderDetail::className(), ['AMAZON_ORDER_ID' => 'AMAZON_ORDER_ID']);
    }

}