<?php

namespace addons\finance\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\swoole\db\ActiveRecord;

/**
 *
 * @SWG\Definition(
 *   definition="SkLibraryRecord",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="LIBRARY_RECORD_ID", type="integer",description="出入库记录ID"),
 *           @SWG\Property(property="ORDER_CD", type="string",description="单号"),
 *           @SWG\Property(property="ORGANISATION_ID", type="integer",description="组织ID"),
 *           @SWG\Property(property="ORDER_TYPE", type="integer",description="单据类型:1入库单，2出库单 3 库存调整单 4 调拨（调出） 5调拨（调入）"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="SKU ID"),
 *           @SWG\Property(property="PSKU_CODE", type="string",description="SKU编码"),
 *           @SWG\Property(property="WAREHOUSE_ID",  type="integer",description="仓库ID"),
 *           @SWG\Property(property="NUMBERS",  type="integer",description="数量"),
 *           @SWG\Property(property="UNITPRICE",  type="integer",description="单价"),
 *           @SWG\Property(property="CREATED_AT", type="integer",description="操作日期"),
 *           @SWG\Property(property="ORDER_AT", type="integer",description="单据日期"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="操作人")
 *       )
 *   }
 * )
 */
class SkLibraryRecord extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_library_record';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ORDER_TYPE', 'NUMBERS', 'CREATED_AT','ORDER_AT', 'ORGANISATION_ID', 'WAREHOUSE_ID', 'UUSER_ID', 'PSKU_ID'], 'integer'],
            [['UNITPRICE'], 'number'],
            [['ORDER_CD'], 'string', 'max' => 30],
            [['PSKU_CODE'], 'string', 'max' => 20],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'LIBRARY_RECORD_ID' => Yii::t('finance', '出入库记录ID'),
            'ORDER_CD' => Yii::t('finance', '单号'),
            'ORGANISATION_ID' => Yii::t('finance', '组织ID'),
            'ORDER_TYPE' => Yii::t('finance', '单据类型:1入库单，2出库单 3 库存调整单 4 调拨（调出） 5调拨（调入）'),
            'PSKU_ID' => Yii::t('finance', 'SKU ID'),
            'PSKU_CODE' => Yii::t('finance', 'SKU编码'),
            'WAREHOUSE_ID' => Yii::t('finance', '仓库ID'),
            'NUMBERS' => Yii::t('finance', '数量'),
            'UNITPRICE' => Yii::t('finance', '单价'),
            'CREATED_AT' => Yii::t('finance', '操作日期'),
            'ORDER_AT' => Yii::t('finance', '单据日期'),
            'UUSER_ID' => Yii::t('finance', '操作人'),
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
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CREATED_AT'],
                ],
            ],
            [
                'class'=>OperatorBehaviors::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['UUSER_ID'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UUSER_ID'],
                ],
            ]
        ];
    }
}
