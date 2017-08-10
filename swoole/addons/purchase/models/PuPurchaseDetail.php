<?php

namespace addons\purchase\models;

use addons\master\basics\models\BAccount;
use addons\master\product\models\GProductSku;
use addons\master\basics\models\BUnit;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\swoole\db\ActiveRecord;
use addons\master\product\models\GProductSkuPacking;
use Yii;

/**
 *
 * @SWG\Definition(
 *   definition="PuPurchaseDetail",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="PURCHASE_DETAIL_ID", type="integer",description="采购订单明细ID"),
 *           @SWG\Property(property="PU_PURCHASE_ID", type="integer",description="采购订单ID"),
 *           @SWG\Property(property="PU_PLAN_ID", type="integer",description="采购计划ID"),
 *           @SWG\Property(property="PU_PURCHASE_CD", type="string",description="采购单号"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="PSKU_CODE", type="string",description="SKU编码"),
 *           @SWG\Property(property="PSKU_NAME_CN", type="string",description="产品名称"),
 *           @SWG\Property(property="PURCHASE", type="integer",description="数量"),
 *           @SWG\Property(property="COMMI_PERIOD",type="integer",format="int32",description="承诺交期"),
 *           @SWG\Property(property="DEMAND_AT",type="integer",format="int32",description="需求日期"),
 *           @SWG\Property(property="FNSKU",  type="string",description="产品条码"),
 *           @SWG\Property(property="PLATFORM_SKU",  type="string",description="平台SKU"),
 *           @SWG\Property(property="DETAIL_REMARKS",  type="string",description="备注"),
 *           @SWG\Property(property="RGOODS_NUMBER",  type="integer",description="已收货数量"),
 *           @SWG\Property(property="RGOODS_AMOUNT",  type="double",description="已付款金额"),
 *           @SWG\Property(property="DELIVERY_METHOD",  type="string",description="提货方式"),
 *           @SWG\Property(property="INSPECTION_STATE",  type="integer",description="验货状态:1.通过 2.返工 3.未验货"),
 *           @SWG\Property(property="INSPECTION_NUMBER",  type="integer",description="已验数量"),
 *           @SWG\Property(property="SCHEDULING_NUMBER",  type="integer",description="已排程数量"),
 *           @SWG\Property(property="EACH_NUMBER",  type="double",description="每箱箱数"),
 *           @SWG\Property(property="FCL_NUMBER",  type="double",description="整箱数"),
 *           @SWG\Property(property="FCL_LONG",  type="double",description="整箱-长"),
 *           @SWG\Property(property="FCL_WIDE",  type="double",description="整箱-宽"),
 *           @SWG\Property(property="FCL_HIGH",  type="double",description="整箱-高"),
 *           @SWG\Property(property="GROSS_WEIGHT",  type="double",description="整箱-毛重"),
 *           @SWG\Property(property="FCL_NET_WEIGHT",  type="double",description="整箱-净重"),
 *           @SWG\Property(property="TAILBOX_BNUMBER",  type="integer",description="尾箱每箱数量"),
 *           @SWG\Property(property="TAILBOX_NUMBER",  type="integer",description="尾箱数"),
 *           @SWG\Property(property="TAILBOX_LONG",  type="integer",description="尾箱-长"),
 *           @SWG\Property(property="TAILBOX_WIDE",  type="integer",description="尾箱-宽"),
 *           @SWG\Property(property="TAILBOX_HIGH",  type="integer",description="尾箱-高"),
 *           @SWG\Property(property="TAILBOX_WEIGHT",  type="integer",description="尾箱-毛重"),
 *           @SWG\Property(property="TAILBOX_NETWEIGHT",  type="integer",description="尾箱-净重"),
 *           @SWG\Property(property="SHIPPED_QUANTITY",  type="integer",description="已发运数量"),
 *           @SWG\Property(property="NOT_TAX_UNITPRICE",  type="double",description="不含税单价"),
 *           @SWG\Property(property="NOT_TAX_AMOUNT",  type="double",description="不含税金额"),
 *           @SWG\Property(property="TAX_UNITPRICE",  type="double",description="含税单价"),
 *           @SWG\Property(property="TAX_AMOUNT",  type="double",description="含税金额"),
 *           @SWG\Property(property="TAX_RATE",  type="double",description="税率"),
 *           @SWG\Property(property="ACCOUNT_ID", type="integer",description="账户ID"),
 *           @SWG\Property(property="ITSWHSEPLA_QUANTITY", type="integer",description="自营仓计划中数量"),
 *           @SWG\Property(property="SUWHSEPLA_QUANTITY", type="integer",description="供应商仓计划中数量"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="UNIT_ID",type="integer",description="单位ID"),
 *           @SWG\Property(property="CHANNEL_ID",type="integer",description="平台ID"),
 *           @SWG\Property(property="CUSER_ID",type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID",type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class PuPurchaseDetail extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'pu_purchase_detail';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PSKU_CODE', 'UNIT_ID', 'PURCHASE', 'TAX_RATE', 'TAX_UNITPRICE'], 'required'],
            [['PSKU_ID', 'ITSWHSEPLA_QUANTITY', 'SUWHSEPLA_QUANTITY', 'PU_PLAN_ID', 'PURCHASE', 'COMMI_PERIOD', 'DEMAND_AT',
                'RGOODS_NUMBER', 'INSPECTION_STATE', 'INSPECTION_NUMBER', 'SCHEDULING_NUMBER', 'TAILBOX_BNUMBER', 'TAILBOX_NUMBER',
                'SHIPPED_QUANTITY', 'CREATED_AT', 'UPDATED_AT', 'ACCOUNT_ID', 'PU_PURCHASE_ID', 'UNIT_ID', 'CHANNEL_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['RGOODS_AMOUNT', 'THIS_APPLY_AMOUNT', 'FCL_NUMBER', 'FCL_LONG', 'FCL_WIDE', 'FCL_HIGH', 'GROSS_WEIGHT', 'FCL_NET_WEIGHT', 'TAILBOX_LONG', 'EACH_NUMBER', 'TAILBOX_WIDE', 'TAILBOX_HIGH', 'TAILBOX_WEIGHT', 'TAILBOX_NETWEIGHT', 'NOT_TAX_UNITPRICE', 'NOT_TAX_AMOUNT', 'TAX_UNITPRICE', 'TAX_AMOUNT', 'TAX_RATE'], 'number'],
            [['PURCHASE'], 'number', 'max' => 2147483647],
            [['NOT_TAX_AMOUNT'], 'number', 'max' => 9999999999.99],
            [['TAX_AMOUNT'], 'number', 'max' => 9999999999.99],
            [['PU_PURCHASE_CD', 'FNSKU'], 'string', 'max' => 30],
            [['PSKU_CODE', 'PLATFORM_SKU',], 'string', 'max' => 20],
            [['PSKU_NAME_CN'], 'string', 'max' => 128],
            [['DETAIL_REMARKS'], 'string', 'max' => 255],
            [['DELIVERY_METHOD'], 'string', 'max' => 100],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'PURCHASE_DETAIL_ID' => Yii::t('purchase', '采购订单明细ID'),
            'PU_PURCHASE_ID' => Yii::t('purchase', '采购订单ID'),
            'PU_PLAN_ID' => Yii::t('purchase', '采购计划ID'),
            'PU_PURCHASE_CD' => Yii::t('purchase', '采购单号'),
            'PSKU_ID' => Yii::t('purchase', '产品SKU ID'),
            'PSKU_CODE' => Yii::t('purchase', 'SKU编码'),
            'PSKU_NAME_CN' => Yii::t('purchase', '产品名称'),
            'PURCHASE' => Yii::t('purchase', '数量'),
            'COMMI_PERIOD' => Yii::t('purchase', '承诺交期'),
            'DEMAND_AT' => Yii::t('purchase', '需求日期'),
            'FNSKU' => Yii::t('purchase', '产品条码'),
            'PLATFORM_SKU' => Yii::t('purchase', '平台SKU'),
            'DETAIL_REMARKS' => Yii::t('purchase', '备注'),
            'RGOODS_NUMBER' => Yii::t('purchase', '已收货数量'),
            'RGOODS_AMOUNT' => Yii::t('purchase', '已付款金额'),
            'THIS_APPLY_AMOUNT' => Yii::t('purchase', '已申付金额'),
            'DELIVERY_METHOD' => Yii::t('purchase', '提货方式'),
            'INSPECTION_STATE' => Yii::t('purchase', '验货状态:1.通过 2.返工 3.未验货'),
            'INSPECTION_NUMBER' => Yii::t('purchase', '已验数量'),
            'SCHEDULING_NUMBER' => Yii::t('purchase', '已排程数量'),
            'EACH_NUMBER' => Yii::t('purchase', '每箱箱数'),
            'FCL_NUMBER' => Yii::t('purchase', '整箱数'),
            'FCL_LONG' => Yii::t('purchase', '整箱-长'),
            'FCL_WIDE' => Yii::t('purchase', '整箱-宽'),
            'FCL_HIGH' => Yii::t('purchase', '整箱-高'),
            'GROSS_WEIGHT' => Yii::t('purchase', '整箱-毛重'),
            'FCL_NET_WEIGHT' => Yii::t('purchase', '整箱-净重'),
            'TAILBOX_BNUMBER' => Yii::t('purchase', '尾箱每箱数量'),
            'TAILBOX_NUMBER' => Yii::t('purchase', '尾箱数'),
            'TAILBOX_LONG' => Yii::t('purchase', '尾箱-长'),
            'TAILBOX_WIDE' => Yii::t('purchase', '尾箱-宽'),
            'TAILBOX_HIGH' => Yii::t('purchase', '尾箱-高'),
            'TAILBOX_WEIGHT' => Yii::t('purchase', '尾箱-毛重'),
            'TAILBOX_NETWEIGHT' => Yii::t('purchase', '尾箱-净重'),
            'SHIPPED_QUANTITY' => Yii::t('purchase', '已发运数量'),
            'NOT_TAX_UNITPRICE' => Yii::t('purchase', '不含税单价'),
            'NOT_TAX_AMOUNT' => Yii::t('purchase', '不含税金额'),
            'TAX_UNITPRICE' => Yii::t('purchase', '含税单价'),
            'TAX_AMOUNT' => Yii::t('purchase', '含税金额'),
            'TAX_RATE' => Yii::t('purchase', '税率'),
            'ACCOUNT_ID' => Yii::t('purchase', '账户ID'),
            'ITSWHSEPLA_QUANTITY' => Yii::t('purchase', '自营仓计划中数量'),
            'SUWHSEPLA_QUANTITY' => Yii::t('purchase', '供应商仓计划中数量'),
            'CREATED_AT' => Yii::t('purchase', '创建时间'),
            'UPDATED_AT' => Yii::t('purchase', '修改时间'),
            'CHANNEL_ID' => Yii::t('purchase', '平台ID'),
            'UNIT_ID' => Yii::t('purchase', '单位ID'),
            'CUSER_ID' => Yii::t('purchase', '创建人ID'),
            'UUSER_ID' => Yii::t('purchase', '更新人ID'),
        ];
    }

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

    public static function addQuery(&$query, $alias)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            #组织权限
            $query->andWhere([$alias . '.PSKU_ID' => Yii::$app->session->get('product_id') ?: null]);
        }
    }

    //产品sku,关联映射表
    public function getG_product_sku()
    {
        return $this->hasOne(GProductSku::className(), ['PSKU_ID' => 'PSKU_ID'])->joinWith(['g_product_sku_fnsku1', 'g_product_sku_price']);
    }


    //单位
    public function getB_unit()
    {
        return $this->hasOne(BUnit::className(), ['UNIT_ID' => 'UNIT_ID'])->select(['b_unit.UNIT_ID', 'b_unit.UNIT_NAME_CN']);
    }

    //交货日期
    public function getPu_qctables()
    {
        return $this->hasOne(PuQctables::className(), ['PURCHASE_DETAIL_ID' => 'PURCHASE_DETAIL_ID'])->select(['pu_qctables.PSKU_ID', 'pu_qctables.DELIVERY_AT']);
    }

    //账号
    public function getB_account()
    {
        return $this->hasOne(BAccount::className(), ['ACCOUNT_ID' => 'ACCOUNT_ID']);
    }

    //装箱主数据
    public function getG_product_sku_packing()
    {
        return $this->hasOne(GProductSkuPacking::className(), ['PSKU_ID' => 'PSKU_ID']);
    }

    //品鉴信息
    public function getPu_qctabless()
    {
        return $this->hasMany(PuQctables::className(), ['PURCHASE_DETAIL_ID' => 'PURCHASE_DETAIL_ID'])->onCondition(['pqc.DELETED_STATE' => 0])->alias('pqc')->joinWith(['u_userinfo_uic'])->orderBy('pqc.AUDIT_STATE asc,pqc.INSPECTION_AT desc');
    }

    //采购单，关联伙伴，货币，采购跟进人，采购组织，需求组织
    public function getPu_purchase()
    {
        return $this->hasOne(PuPurchase::className(), ['PU_PURCHASE_CD' => 'PU_PURCHASE_CD'])
//            ->select(['pu_purchase.PU_PURCHASE_CD','pu_purchase.PARTNER_CODE','pu_purchase.ORDER_STATE','pu_purchase.MONEY_CODE','pu_purchase.ORGANISATION_CODE','pu_purchase.DORGANISATION_CODE','pu_purchase.FUPUSER_CODE','pu_purchase.DELETED_STATE'])
            ->joinWith(['pa_partner', 'b_money', 'u_userinfo_g', 'o_organisation', 'o_organisation_o', 'b_channel']);
    }

    //采购订单主表，无其他关联
    public function getPu_purchase_1()
    {
        return $this->hasOne(PuPurchase::className(), ['PU_PURCHASE_CD' => 'PU_PURCHASE_CD'])->alias('pu');
    }

    //采购订单主表，关联供应商,平台
    public function getPurchase_partner_channel()
    {
        return $this->hasOne(PuPurchase::className(), ['PU_PURCHASE_CD' => 'PU_PURCHASE_CD'])->joinWith(['pa_partner', 'b_channel']);
    }

    public function after_ACreate($body, $class = null)
    {
        #发运单id存在则
        if (isset($body['DISPATCH_NOTE_ID'])) {
            $set = array('INTERNAL_PURCHASING_CD' => $this->PU_PURCHASE_CD, 'INTERNAL_PURCHASING_ID' => $this->PURCHASE_DETAIL_ID);
            $where = array('DISPATCH_NOTE_ID' => $body['DISPATCH_NOTE_ID']);
            Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\dispatchLogic', 'addDispatchNote'], [$set, $where]]);
        }
        return parent::after_ACreate($body, $class); // TODO: Change the autogenerated stub
    }

    public function before_ACreate($body, $class = null)
    {
        if (isset($body['TAX_UNITPRICE'])) {
            if (floatval($body['TAX_UNITPRICE']) == 0) {
                $body['TAX_AMOUNT'] = 0;;
            }
        }
        if (isset($body['NOT_TAX_UNITPRICE'])) {
            if (floatval($body['NOT_TAX_UNITPRICE']) == 0) {
                $body['NOT_TAX_AMOUNT'] = 0;;
            }
        }
        return parent::before_ACreate($body, $class); // TODO: Change the autogenerated stub
    }

    public function before_AUpdate($body, $class = null)
    {
        if (isset($body['TAX_UNITPRICE'])) {
            if (floatval($body['TAX_UNITPRICE']) == 0) {
                $body['TAX_AMOUNT'] = 0;;
            }
        }
        if (isset($body['NOT_TAX_UNITPRICE'])) {
            if (floatval($body['NOT_TAX_UNITPRICE']) == 0) {
                $body['NOT_TAX_AMOUNT'] = 0;;
            }
        }
        return parent::before_AUpdate($body, $class); // TODO: Change the autogenerated stub
    }


}
