<?php

namespace addons\inventory\models;

use Yii;

/**
 * @SWG\Definition(
 *   definition="SkGoodsRejected",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="GOODS_REJECTED_ID", type="integer",description="退货确认表ID"),
 *           @SWG\Property(property="ALLOCATION_DETAIL_ID",type="integer",description="调拨计划单明细ID"),
 *           @SWG\Property(property="PSKU_NAME_CN", type="string",description="产品名称"),
 *           @SWG\Property(property="PU_PURCHASE_CD", type="string",description="内部采购订单号"),
 *           @SWG\Property(property="STORAGE_CD", type="integer",description="内部采购入库单号"),
 *           @SWG\Property(property="STORAGE_AT",type="integer",description="入库日期"),
 *           @SWG\Property(property="STORAGE_DNUMBER", type="integer",format="int32",description="入库数量"),
 *           @SWG\Property(property="GOREJECTED_NUMBER", type="integer",format="int32",description="退货数量"),
 *           @SWG\Property(property="WAREHOUSING_PRICE",type="number",description="入库单价"),
 *           @SWG\Property(property="WAREHOUSING_AMOUNT",type="number",description="入库金额")
 *       )
 *   }
 * )
 */
class SkGoodsRejected extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_goods_rejected';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ALLOCATION_DETAIL_ID', 'PURCHASE_DETAIL_ID', 'STORAGE_DETAIL_ID', 'STORAGE_AT', 'STORAGE_DNUMBER', 'GOREJECTED_NUMBER'], 'integer'],
            [['WAREHOUSING_PRICE', 'WAREHOUSING_AMOUNT'], 'number'],
            [['PSKU_NAME_CN'], 'string', 'max' => 128],
            [['PU_PURCHASE_CD', 'STORAGE_CD'], 'string', 'max' => 30],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'GOODS_REJECTED_ID' => Yii::t('inventory', '退货确认表ID'),
            'ALLOCATION_DETAIL_ID' => Yii::t('inventory', '调拨计划单明细ID'),
            'PSKU_NAME_CN' => Yii::t('inventory', '产品名称'),
            'PU_PURCHASE_CD' => Yii::t('inventory', '内部采购订单号'),
            'PURCHASE_DETAIL_ID' => Yii::t('inventory', '内部采购订单明细id'),
            'STORAGE_CD' => Yii::t('inventory', '内部采购入库单号'),
            'STORAGE_DETAIL_ID' => Yii::t('inventory', '内部采购入库明细ID'),
            'STORAGE_AT' => Yii::t('inventory', '入库日期'),
            'STORAGE_DNUMBER' => Yii::t('inventory', '入库数量'),
            'GOREJECTED_NUMBER' => Yii::t('inventory', '退货数量'),
            'WAREHOUSING_PRICE' => Yii::t('inventory', '入库单价'),
            'WAREHOUSING_AMOUNT' => Yii::t('inventory', '入库金额'),
        ];
    }
}
