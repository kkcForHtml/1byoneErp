<?php

namespace addons\inventory\models;

use Yii;
/**
 * @SWG\Definition(
 *   definition="SkInsiderTrading",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="INSIDER_TRADING_ID", type="integer",description="内部交易表ID"),
 *           @SWG\Property(property="ALLOCATION_DETAIL_ID",type="integer",description="调拨计划单明细ID"),
 *           @SWG\Property(property="PSKU_NAME_CN", type="string",description="产品名称"),
 *           @SWG\Property(property="I_NUMBER", type="integer",format="int32",description="数量"),
 *           @SWG\Property(property="MONEY_CODE", type="string",description="币种"),
 *           @SWG\Property(property="MONEY_ID", type="integer",description="币种ID"),
 *           @SWG\Property(property="I_PRICE",type="number",description="单价"),
 *           @SWG\Property(property="I_AMOUNT", type="number",description="金额")
 *       )
 *   }
 * )
 */
class SkInsiderTrading extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_insider_trading';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ALLOCATION_DETAIL_ID', 'I_NUMBER','MONEY_ID'], 'integer'],
            [['I_PRICE', 'I_AMOUNT'], 'number'],
            [['PSKU_NAME_CN'], 'string', 'max' => 128],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'INSIDER_TRADING_ID' => Yii::t('inventory', '内部交易表ID'),
            'ALLOCATION_DETAIL_ID' => Yii::t('inventory', '调拨计划单明细ID'),
            'PSKU_NAME_CN' => Yii::t('inventory', '产品名称'),
            'I_NUMBER' => Yii::t('inventory', '数量'),
            'I_PRICE' => Yii::t('inventory', '单价'),
            'I_AMOUNT' => Yii::t('inventory', '金额'),
            'MONEY_ID' => Yii::t('inventory', '币种ID'),
        ];
    }
}
