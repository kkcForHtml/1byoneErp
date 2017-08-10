<?php

namespace addons\master\product\models;

use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;

/**
 * @SWG\Definition(
 *   definition="GNextCycle",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="NEXT_CYCLE_ID", type="integer",description="下单周期ID"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="DELIVERY", type="integer",format="int32",description="交期(天)"),
 *           @SWG\Property(property="STOCKING", type="integer",format="int32",description="备货(天)"),
 *           @SWG\Property(property="SHELF_TIME", type="integer",format="int32",description="上架时间(天)"),
 *           @SWG\Property(property="TRANSPORT", type="integer",format="int32",description="运输(天)"),
 *           @SWG\Property(property="PLAN_TIME",type="integer",format="int32",description="计划时间(天)"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class GNextCycle extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'g_next_cycle';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['NEXT_CYCLE_ID', 'PSKU_ID', 'DELIVERY', 'STOCKING', 'SHELF_TIME', 'TRANSPORT', 'PLAN_TIME', 'CREATED_AT', 'UPDATED_AT','CUSER_ID','UUSER_ID'], 'integer'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'NEXT_CYCLE_ID' => Yii::t('product', '下单周期ID'),
            'PSKU_ID' => Yii::t('product', '产品SKU ID'),

            'DELIVERY' => Yii::t('product', '交期(天)'),
            'STOCKING' => Yii::t('product', '备货(天)'),
            'SHELF_TIME' => Yii::t('product', '上架时间(天)'),
            'TRANSPORT' => Yii::t('product', '运输(天)'),
            'PLAN_TIME' => Yii::t('product', '计划时间(天)'),
            'CREATED_AT' => Yii::t('product', '创建时间'),
            'UPDATED_AT' => Yii::t('product', '修改时间'),
            'CUSER_ID' => Yii::t('product', '创建人'),
            'UUSER_ID' => Yii::t('product', '更新人'),
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
