<?php

namespace addons\inventory\models;


use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;
use \yii\swoole\rest\ResponeModel;
use addons\organization\models\OOrganisation;
use addons\master\basics\models\BWarehouse;
use addons\master\basics\models\BUnit;
use addons\master\product\models\GProductSku;

/**
 * @SWG\Definition(
 *   definition="SkPlacingDetail",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="PLACING_DETAIL_ID", type="integer",description="出库单明细ID"),
 *           @SWG\Property(property="PLACING_ID", type="integer",description="出库单ID"),
 *           @SWG\Property(property="PLACING_CD", type="string",description="出库单号"),
 *           @SWG\Property(property="SALES_ORDER", type="string",description="销售订单"),
 *           @SWG\Property(property="SALES_ORDER_DETAIL_ID", type="integer",description="销售订单明细ID"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="PDSKU_CODE", type="string",description="SKU编码"),
 *           @SWG\Property(property="PRODUCT_DE", type="string",description="产品说明"),
 *           @SWG\Property(property="UNIT_ID", type="string",description="单位"),
 *           @SWG\Property(property="PDNUMBER", type="integer",description="数量"),
 *           @SWG\Property(property="UNIT_PRICE", type="number",description="单价"),
 *           @SWG\Property(property="NOT_TAX_AMOUNT", type="number",description="不含税金额"),
 *           @SWG\Property(property="PDWAREHOUSE_ID",type="string",description="出库仓库"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="制单日期"),
 *           @SWG\Property(property="UPDATED_AT", type="integer",description="更新时间"),
 *           @SWG\Property(property="UNIT_ID",  type="integer",description="单位ID"),
 *           @SWG\Property(property="PDWAREHOUSE_ID",  type="integer",description="出库仓库"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class SkPlacingDetail extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_placing_detail';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PDSKU_CODE'], 'required'],
            [['PSKU_ID', 'PLACING_DETAIL_ID', 'PLACING_ID', 'PDNUMBER', 'CREATED_AT', 'UPDATED_AT', 'SALES_ORDER_DETAIL_ID', 'UNIT_ID', 'PDWAREHOUSE_ID', 'UUSER_ID', 'UUSER_ID','RED_PLACING_DETAIL_ID'], 'integer'],
            [['PDSKU_CODE'], 'string', 'max' => 20],
            [['PLACING_CD','RED_PLACING_CD'], 'string', 'max' => 30],
            [['SALES_ORDER'], 'string', 'max' => 100],
            [['PDMONEY', 'UNIT_PRICE', 'TAX_RATE', 'NOT_TAX_UNITPRICE', 'NOT_TAX_AMOUNT'], 'number'], [['PRODUCT_DE'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'PLACING_DETAIL_ID' => Yii::t('inventory', '出库单明细ID'),
            'PLACING_ID' => Yii::t('inventory', '出库单ID'),
            'PLACING_CD' => Yii::t('inventory', '出库单号'),
            'RED_PLACING_CD' => Yii::t('inventory', '红字出库单号'),
            'RED_PLACING_DETAIL_ID' => Yii::t('inventory', '红字出库单明细ID'),
            'SALES_ORDER' => Yii::t('inventory', '销售订单单号'),
            'SALES_ORDER_DETAIL_ID' => Yii::t('inventory', '销售订单明细ID'),
            'PSKU_ID' => Yii::t('inventory', 'SKU ID'),
            'PDSKU_CODE' => Yii::t('inventory', 'SKU编码'),
            'PRODUCT_DE' => Yii::t('inventory', '产品说明'),
            'UNIT_ID' => Yii::t('inventory', '单位'),
            'PDNUMBER' => Yii::t('inventory', '数量'),
            'UNIT_PRICE' => Yii::t('inventory', '单价'),
            'TAX_RATE' => Yii::t('inventory', '税率'),
            'NOT_TAX_UNITPRICE' => Yii::t('inventory', '不含税单价'),
            'NOT_TAX_AMOUNT' => Yii::t('inventory', '不含税金额'),
            'PDMONEY' => Yii::t('inventory', '金额'),
            'PDWAREHOUSE_ID' => Yii::t('inventory', '出库仓库'),
            'CREATED_AT' => Yii::t('inventory', '制单日期'),
            'UPDATED_AT' => Yii::t('inventory', '更新时间'),
            'UNIT_ID' => Yii::t('inventory', '单位ID'),
            'PDWAREHOUSE_ID' => Yii::t('inventory', '出库仓库'),
            'UUSER_ID' => Yii::t('inventory', '更新人ID'),
            'CUSER_ID' => Yii::t('inventory', '创建人ID'),
        ];
    }


    public static function addQuery(&$query, $alias)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            #品类权限
            $query->andWhere([$alias . '.PSKU_ID' => Yii::$app->session->get('product_id') ?: null]);
        }
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


    //出库单
    public function getSk_placing()
    {
        return $this->hasOne(SkPlacing::className(), ['PLACING_ID' => 'PLACING_ID']);
    }

    //组织
    public function getO_organisationn()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'PRGANISATION_ID']);
    }

    //仓库
    public function getB_warehouse()
    {
        return $this->hasMany(BWarehouse::className(), ['WAREHOUSE_ID' => 'PWAREHOUSE_ID']);
    }


    //创建人
    public function getU_userinfoc()
    {
        return $this->hasOne(static::className(), ['USER_INFO_ID' => 'CUSER_ID'])->alias('c');
    }

    //更新人
    public function getU_userinfou()
    {
        return $this->hasOne(static::className(), ['USER_INFO_ID' => 'UUSER_ID'])->alias('u');
    }

    //单位
    public function getB_unit()
    {
        return $this->hasOne(BUnit::className(), ['UNIT_ID' => 'UNIT_ID']);
    }

    //SKU
    public function getG_product_sku()
    {
        return $this->hasOne(GProductSku::className(), ['PSKU_ID' => 'PSKU_ID']);
    }

    public $realation = ['b_warehouse' => ['WAREHOUSE_ID' => 'PWAREHOUSE_ID'], 'b_unit' => ['UNIT_ID' => 'UNIT_ID'], 'g_product_sku' => ['PSKU_ID' => 'PSKU_ID']];

    /**
     * 新增的操作
     * before_ACreate 新增前
     * after_ACreate 新增后
     */

    public function after_ACreate($body, $class = null)
    {

        #发运单id存在则
        if (isset($body['DISPATCH_NOTE_ID'])) {
            $set = array('INTERNAL_SALESTH_CD' => $this->PLACING_CD, 'INTERNAL_SALESTH_ID' => $this->PLACING_DETAIL_ID);
            $where = array('DISPATCH_NOTE_ID' => $body['DISPATCH_NOTE_ID']);
            Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\dispatchLogic', 'addDispatchNote'], [$set, $where]]);
        }
        return parent::after_ACreate($body, $class); // TODO: Change the autogenerated stub
    }
}
