<?php

namespace addons\inventory\models;


use Yii;


/**
 * @SWG\Definition(
 *   definition="SkInstantInventory",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="INSTANT_INVENTORY_ID", type="integer",description="即时库存ID"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="ORGANISATION_CODE", type="string",description="组织编码"),
 *           @SWG\Property(property="WAREHOUSE_CODE", type="string",description="仓库编码"),
 *           @SWG\Property(property="PSKU_CODE", type="string",description="SKU编码"),
 *           @SWG\Property(property="INSTANT_NUMBER", type="integer",description="数量"),
 *           @SWG\Property(property="WAREHOUSE_ID", type="integer",description="仓库ID"),
 *           @SWG\Property(property="ORGANISATION_ID", type="integer",description="组织")
 *       )
 *   }
 * )
 */
class SkInstantInventory extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_instant_inventory';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PSKU_CODE', 'WAREHOUSE_ID', 'INSTANT_NUMBER'], 'required'],
            [['PSKU_ID', 'INSTANT_INVENTORY_ID', 'WAREHOUSE_ID','ORGANISATION_ID'], 'integer'],
            [['INSTANT_NUMBER'], 'number', 'max' => 999999999],
            [['PSKU_CODE'], 'string', 'max' => 20],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'INSTANT_INVENTORY_ID' => Yii::t('inventory', '即时库存ID'),
            'PSKU_ID' => Yii::t('inventory', 'SKU ID'),
            'PSKU_CODE' => Yii::t('inventory', 'SKU编码'),
            'INSTANT_NUMBER' => Yii::t('inventory', '数量'),
            'WAREHOUSE_ID' => Yii::t('inventory', '仓库ID'),
            'ORGANISATION_ID' => Yii::t('inventory', '组织'),
        ];
    }


}
