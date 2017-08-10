<?php

namespace addons\finance\models;

use Yii;
use yii\swoole\db\ActiveRecord;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;

/**
 *
 *
 * @SWG\Definition(
 *   definition="AcInventoryAge",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="INVENTORY_AGE_ID", type="integer",description="历史库龄ID"),
 *           @SWG\Property(property="ACCOUNTING_PERIOD_ID", type="integer",description="会计期间ID"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="PSKU_CODE", type="string",description="SKU编码"),
 *           @SWG\Property(property="STORAGE_CD",  type="string",description="入库单号"),
 *           @SWG\Property(property="STORAGE_AT",  type="integer",description="入库时间"),
 *           @SWG\Property(property="INVENTORY_AGE",  type="integer",description="库龄"),
 *           @SWG\Property(property="STOCK_NUMBER", type="integer",description="库存数量"),
 *           @SWG\Property(property="END_AT", type="integer",description="截止时间"),
 *           @SWG\Property(property="DELETED_STATE",  type="integer",description="是否删除,1：删除 0：未删除"),
 *           @SWG\Property(property="CREATED_AT",type="integer",description="创建日期"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",description="更新时间"),
 *           @SWG\Property(property="ORGANISATION_ID",  type="integer",description="组织架构ID"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class AcInventoryAge extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'ac_inventory_age';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PSKU_ID','ACCOUNTING_PERIOD_ID', 'STORAGE_AT', 'INVENTORY_AGE', 'END_AT', 'DELETED_STATE', 'CREATED_AT', 'UPDATED_AT','STOCK_NUMBER', 'ORGANISATION_ID', 'UUSER_ID', 'CUSER_ID'], 'integer'],
            [[ 'PSKU_CODE'], 'string', 'max' => 20],
            [['STORAGE_CD'], 'string', 'max' => 30],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'INVENTORY_AGE_ID' => Yii::t('finance', '历史库龄ID'),
            'ACCOUNTING_PERIOD_ID' => Yii::t('finance', '会计期间ID'),
            'PSKU_ID' => Yii::t('finance', 'SKU ID'),
            'PSKU_CODE' => Yii::t('finance', 'SKU编码'),
            'STORAGE_CD' => Yii::t('finance', '入库单号'),
            'STORAGE_AT' => Yii::t('finance', '入库时间'),
            'INVENTORY_AGE' => Yii::t('finance', '库龄'),
            'STOCK_NUMBER' => Yii::t('finance', '库存数量'),
            'END_AT' => Yii::t('finance', '截止时间'),
            'DELETED_STATE' => Yii::t('finance', '是否删除,1：删除 0：未删除'),
            'CREATED_AT' => Yii::t('finance', '创建日期'),
            'UPDATED_AT' => Yii::t('finance', '更新时间'),
            'ORGANISATION_ID' => Yii::t('finance', '组织架构ID'),
            'UUSER_ID' => Yii::t('finance', '更新人ID'),
            'CUSER_ID' => Yii::t('finance', '创建人ID'),
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
                'class'=>OperatorBehaviors::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CUSER_ID','UUSER_ID'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UUSER_ID'],
                ],
            ]
        ];
    }
}
