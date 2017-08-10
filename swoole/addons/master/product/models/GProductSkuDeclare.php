<?php

namespace addons\master\product\models;

use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;
/**
 * @SWG\Definition(
 *   definition="GProductSkuDeclare",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="SKU_FILES_ID", type="integer",description="资料SKU ID"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="CUSTOMS_CODE", type="string",description="海关编码"),
 *           @SWG\Property(property="CUSTOMS_NAME", type="string",description="报关品名"),
 *           @SWG\Property(property="MATERIAL", type="string",description="材质"),
 *           @SWG\Property(property="REPORTING_ELEMENTS", type="string",description="申报要素"),
 *           @SWG\Property(property="VOLTAGE", type="string",description="电压"),
 *           @SWG\Property(property="PURPOSE", type="string",description="用途"),
 *           @SWG\Property(property="POWER", type="string",description="功率"),
 *           @SWG\Property(property="BATTERY_CAPACITY", type="string",description="电池容量"),
 *           @SWG\Property(property="DECLARE_REMARKS", type="string",description="备注"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="UNIT_ID", type="integer",description="申报单位ID"),
 *			 @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class GProductSkuDeclare extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'g_product_sku_declare';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['CREATED_AT','PSKU_ID', 'UPDATED_AT', 'UNIT_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['CUSTOMS_CODE'], 'string', 'max' => 20],
            [['CUSTOMS_NAME', 'MATERIAL', 'REPORTING_ELEMENTS', 'PURPOSE'], 'string', 'max' => 100],
            [['VOLTAGE', 'POWER', 'BATTERY_CAPACITY'], 'string', 'max' => 10],
            [['DECLARE_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'SKU_FILES_ID' => Yii::t('product', '报关SKU ID'),
            'PSKU_ID' => Yii::t('product', '产品SKU ID'),
            'CUSTOMS_CODE' => Yii::t('product', '海关编码'),
            'CUSTOMS_NAME' => Yii::t('product', '报关品名'),
            'MATERIAL' => Yii::t('product', '材质'),
            'REPORTING_ELEMENTS' => Yii::t('product', '申报要素'),
            'VOLTAGE' => Yii::t('product', '电压'),
            'PURPOSE' => Yii::t('product', '用途'),
            'POWER' => Yii::t('product', '功率'),
            'BATTERY_CAPACITY' => Yii::t('product', '电池容量'),
            'DECLARE_REMARKS' => Yii::t('product', '备注'),
            'CREATED_AT' => Yii::t('product', '创建时间'),
            'UPDATED_AT' => Yii::t('product', '修改时间'),
            'UNIT_ID' => Yii::t('product', '申报单位ID'),
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

}
