<?php

namespace addons\master\product\models;

use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;

use addons\master\basics\models\BWarehouse;
use addons\master\basics\models\BChannel;
use addons\master\basics\models\BAccount;
/**
 * @SWG\Definition(
 *   definition="GProductSkuFnsku",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="PRODUCT_SKU_FNSKU_ID", type="integer",description="FNSKU ID"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="PRODUCT_LONG", type="string",description="平台编码"),
 *           @SWG\Property(property="PLATFORM_SKU", type="string",description="平台SKU"),
 *           @SWG\Property(property="ASIN", type="string",description="ASIN"),
 *           @SWG\Property(property="FNSKU", type="string",description="FNSKU"),
 *           @SWG\Property(property="NOTCONSALE", type="integer",format="int32",description="是否继续销售,1:Y 0:N"),
 *           @SWG\Property(property="DEFAULTS", type="integer",format="int32",description="默认,0:N  1:Y"),
 *           @SWG\Property(property="ACCOUNT_ID", type="integer",format="int32",description="账号ID"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="CHANNEL_ID", type="integer",description="平台ID"),
 *           @SWG\Property(property="WAREHOUSE_ID", type="integer",description="仓库ID"),
 *			 @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class GProductSkuFnsku extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'g_product_sku_fnsku';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['DEFAULTS','PSKU_ID', 'CREATED_AT', 'UPDATED_AT','ACCOUNT_ID','NOTCONSALE','CHANNEL_ID', 'WAREHOUSE_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [[ 'PLATFORM_SKU'], 'string', 'max' => 20],
            [['ASIN', 'FNSKU'], 'string', 'max' => 30],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'PRODUCT_SKU_FNSKU_ID' => Yii::t('product', 'FNSKU ID'),
            'PSKU_ID' => Yii::t('product', '产品SKU ID'),
            'PLATFORM_SKU' => Yii::t('product', '平台SKU'),
            'ASIN' => Yii::t('product', 'ASIN'),
            'FNSKU' => Yii::t('product', 'FNSKU'),
            'ACCOUNT_ID'=>Yii::t('product','账号ID'),
            'NOTCONSALE'=>Yii::t('product','是否继续销售,1:Y 0:N'),
            'DEFAULTS' => Yii::t('product', '默认,0:N  1:Y'),
            'CREATED_AT' => Yii::t('product', '创建时间'),
            'UPDATED_AT' => Yii::t('product', '修改时间'),
            'WAREHOUSE_ID' => Yii::t('product', '仓库ID'),
            'CHANNEL_ID' => Yii::t('product', '平台ID'),
            'CUSER_ID' => Yii::t('product', '创建人ID'),
            'UUSER_ID' => Yii::t('product', '更新人ID'),
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
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CREATED_AT', 'UPDATED_AT'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UPDATED_AT'],
                ],
            ],
            [
                'class' => OperatorBehaviors::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CUSER_ID', 'UUSER_ID'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UUSER_ID'],
                ],
            ]
        ];
    }

    //系统产品SKU
    public function getG_product_sku()
    {
        return $this->hasOne(GProductSku::className(), ['PSKU_ID' => 'PSKU_ID']);
    }

    //仓库信息
    public function getB_warehouse()
    {
        return $this->hasOne(BWarehouse::className(), ['WAREHOUSE_ID' => 'WAREHOUSE_ID']);
    }
    //平台信息
    public function getB_channel()
    {
        return $this->hasOne(BChannel::className(), ['CHANNEL_ID' => 'CHANNEL_ID']);
    }
    //账号
    public  function getB_account()
    {
        return $this->hasOne(BAccount::className(),['ACCOUNT_ID'=>'ACCOUNT_ID']);
    }

}
