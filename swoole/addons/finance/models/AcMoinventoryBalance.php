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
 *   definition="AcMoinventoryBalance",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="MOINVENTORY_BALANCE_ID", type="integer",description="全月平均库存结余ID"),
 *           @SWG\Property(property="ACCOUNTING_PERIOD_ID", type="integer",description="会计期间ID"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="PSKU_CODE", type="string",description="SKU编码"),
 *           @SWG\Property(property="START_AT",  type="integer",description="起始时间"),
 *           @SWG\Property(property="END_AT",  type="integer",description="截止时间"),
 *           @SWG\Property(property="INITIAL_QUANTITY",  type="integer",description="期初数量"),
 *           @SWG\Property(property="INITIAL_AMOUNT", type="string",description="期初金额"),
 *           @SWG\Property(property="CWAREHOUSING_QUANTITY",  type="integer",description="本期入库数量"),
 *           @SWG\Property(property="CWAREHOUSING_AMOUNT",type="string",description="本期入库金额"),
 *           @SWG\Property(property="UNIT_COST",type="string",description="单位成本"),
 *           @SWG\Property(property="CBALANCE_NUMBER",  type="integer",description="本期结余数量"),
 *           @SWG\Property(property="CBALANCE_MONEY",  type="string",description="本期结余金额"),
 *           @SWG\Property(property="DELETED_STATE",  type="integer",description="是否删除,1：删除 0：未删除"),
 *           @SWG\Property(property="CREATED_AT",  type="integer",description="创建日期"),
 *           @SWG\Property(property="UPDATED_AT",  type="integer",description="更新时间"),
 *           @SWG\Property(property="WAREHOUSE_ID",  type="integer",description="仓库ID"),
 *           @SWG\Property(property="ORGANISATION_ID",  type="integer",description="组织架构ID"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class AcMoinventoryBalance extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'ac_moinventory_balance';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PSKU_ID','ACCOUNTING_PERIOD_ID', 'START_AT', 'END_AT', 'INITIAL_QUANTITY', 'CWAREHOUSING_QUANTITY','QWAREHOUSING_QUANTITY', 'CBALANCE_NUMBER',
                'DELETED_STATE', 'CREATED_AT', 'UPDATED_AT', 'WAREHOUSE_ID', 'ORGANISATION_ID', 'UUSER_ID', 'CUSER_ID'], 'integer'],
            [['INITIAL_AMOUNT', 'CWAREHOUSING_AMOUNT', 'UNIT_COST', 'CBALANCE_MONEY'], 'number'],
            [['PSKU_CODE'], 'string', 'max' => 20],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'MOINVENTORY_BALANCE_ID' => Yii::t('finance', '全月平均库存结余ID'),
            'ACCOUNTING_PERIOD_ID' => Yii::t('finance', '会计期间ID'),
            'PSKU_ID' => Yii::t('finance', 'SKU ID'),
            'PSKU_CODE' => Yii::t('finance', 'SKU编码'),
            'START_AT' => Yii::t('finance', '起始时间'),
            'END_AT' => Yii::t('finance', '截止时间'),
            'INITIAL_QUANTITY' => Yii::t('finance', '期初数量'),
            'INITIAL_AMOUNT' => Yii::t('finance', '期初金额'),
            'CWAREHOUSING_QUANTITY' => Yii::t('finance', '本期入库数量'),
            'CWAREHOUSING_AMOUNT' => Yii::t('finance', '本期入库金额'),
            'QWAREHOUSING_QUANTITY' => Yii::t('finance', '本期出库数量'),
            'UNIT_COST' => Yii::t('finance', '单位成本'),
            'CBALANCE_NUMBER' => Yii::t('finance', '本期结余数量'),
            'CBALANCE_MONEY' => Yii::t('finance', '本期结余金额'),
            'DELETED_STATE' => Yii::t('finance', '是否删除,1：删除 0：未删除'),
            'CREATED_AT' => Yii::t('finance', '创建日期'),
            'UPDATED_AT' => Yii::t('finance', '更新时间'),
            'WAREHOUSE_ID' => Yii::t('finance', '仓库ID'),
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
