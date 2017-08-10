<?php

namespace addons\shipment\models;

use addons\master\basics\models\BChannel;
use addons\master\basics\models\BWarehouse;
use addons\master\partint\models\PaPartner;
use addons\master\product\models\GProductSku;
use addons\master\product\models\GProductSkuDeclare;
use addons\organization\models\OOrganisation;
use addons\purchase\models\PuPurchaseDetail;
use addons\users\models\UUserInfo;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\CustomBehaviors;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\swoole\db\ActiveRecord;
use Yii;
use yii\swoole\db\Query;
use yii\swoole\rest\ResponeModel;


/**
 *
 * @SWG\Definition(
 *   definition="ShDispatchNote",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="DISPATCH_NOTE_ID", type="integer",description="发运单ID"),
 *           @SWG\Property(property="PU_ORDER_ID", type="integer",description="关联来源ID：采购订单明细，库存调整单明细"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="PSKU_CODE", type="string",description="SKU"),
 *           @SWG\Property(property="TRANSPORT_MODE", type="integer",description="运输方式：1：空运  2：海运  3：龙舟海运，4：快递,5：陆运"),
 *           @SWG\Property(property="KUKAI_NUMBER", type="string",description="空海次数"),
 *           @SWG\Property(property="DEMANDSKU_CODE", type="string",description="需求国SKU "),
 *           @SWG\Property(property="DEMANDSKU_ID", type="integer",description="需求国SKU ID"),
 *           @SWG\Property(property="ACTUAL_SHIPM_NUM",  type="integer",description="实际发运数量"),
 *           @SWG\Property(property="FBA_ID",  type="string",description="FBA ID"),
 *           @SWG\Property(property="PAYMENT_TERM",  type="string",description="PAYMENT TERM"),
 *           @SWG\Property(property="ACTUAL_SHIPM_AT",type="integer",format="int32",description="实际发运日期"),
 *           @SWG\Property(property="MARKUP_RATIO", type="integer",description="加价比例"),
 *           @SWG\Property(property="CUSTOMS_PRICE",  type="string",description="报关价格"),
 *           @SWG\Property(property="MONEY_ID",  type="integer",description="报关币种"),
 *           @SWG\Property(property="TARIFF",  type="string",description="关税"),
 *           @SWG\Property(property="VALUE_ADDED_TAX",  type="string",description="增值税"),
 *           @SWG\Property(property="EXPECTED_SERVICE_AT",type="integer",format="int32",description="预计送达日期"),
 *           @SWG\Property(property="PO_NUMBER",type="string",description="PO号"),
 *           @SWG\Property(property="FNSKU",type="string",description="产品条码"),
 *           @SWG\Property(property="URGENT_ORDER",type="integer",description="紧急单据：1:是 2:否"),
 *           @SWG\Property(property="DISPATCH_REMARKS",type="string",description="备注"),
 *           @SWG\Property(property="PlAN_SHIPMENT_AT",type="integer",description="计划发运日期"),
 *           @SWG\Property(property="TRANSITW_SHIPMENTS",type="integer",description="中转仓出货数"),
 *           @SWG\Property(property="SUPPLIER_SHIPMENTS",type="integer",description="供应商出货数"),
 *           @SWG\Property(property="PLAN_STATE", type="integer",description="单据状态:1.未审核、2.已审核"),
 *           @SWG\Property(property="IMPORT_STATE", type="integer",description="数据来源:1.采购订单明细,2.库存调整单明细 99.导入"),
 *           @SWG\Property(property="DELETED_STATE", type="integer",description="是否删除,1：删除 0：未删除"),
 *           @SWG\Property(property="AUTITO_AT",type="integer",format="int32",description="审核时间"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建(下单)时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="CLOSING_STATE",type="integer",format="int32",description="是否关账，0：未关账 1：已关账"),
 *           @SWG\Property(property="PURCHASING_WAREHOUSING_CD", type="string",description="采购入库单号"),
 *           @SWG\Property(property="INTERNAL_SALES_CD", type="string",description="内部销售订单号"),
 *           @SWG\Property(property="INTERNAL_PURCHASING_CD", type="string",description="内部采购订单号"),
 *           @SWG\Property(property="INTERNAL_SALESTH_CD", type="string",description="内部销售出库单号"),
 *           @SWG\Property(property="INTERNAL_PURCHASINGST_CD", type="string",description="内部采购入库单号"),
 *           @SWG\Property(property="ALLOCATION_ONTHEWAY_CD", type="string",description="调拨单(在途)号"),
 *           @SWG\Property(property="ALLOCATION_GOAL_CD", type="string",description="调拨单(目的)号"),
 *           @SWG\Property(property="PURCHASING_WAREHOUSING_ID",type="integer",format="int32",description="采购入库单明细ID"),
 *           @SWG\Property(property="INTERNAL_SALES_ID",type="integer",format="int32",description="内部销售订单明细ID"),
 *           @SWG\Property(property="INTERNAL_PURCHASING_ID",type="integer",format="int32",description="内部采购订单明细ID"),
 *           @SWG\Property(property="INTERNAL_SALESTH_ID",type="integer",format="int32",description="内部销售出库单明细ID"),
 *           @SWG\Property(property="INTERNAL_PURCHASINGST_ID",type="integer",format="int32",description="内部采购入库单明细ID"),
 *           @SWG\Property(property="ALLOCATION_ONTHEWAY_ID",type="integer",format="int32",description="调拨单(在途)明细ID"),
 *           @SWG\Property(property="ALLOCATION_GOAL_ID",type="integer",format="int32",description="调拨单(目的)明细ID"),
 *           @SWG\Property(property="LAST_NUM",  type="integer",description="尾箱数"),
 *           @SWG\Property(property="TAILBOX_LONG",  type="number",description="尾箱-长"),
 *           @SWG\Property(property="TAILBOX_WIDE",  type="number",description="尾箱-宽"),
 *           @SWG\Property(property="TAILBOX_HIGH",  type="number",description="尾箱-高"),
 *           @SWG\Property(property="TAILBOX_NETWEIGHT",  type="number",description="尾箱-毛重"),
 *           @SWG\Property(property="TAILBOX_WEIGHT",  type="number",description="尾箱-净重"),
 *           @SWG\Property(property="FCL_LONG",  type="number",description="整箱长"),
 *           @SWG\Property(property="FCL_WIDE",  type="number",description="整箱宽"),
 *           @SWG\Property(property="FCL_HIGH",  type="number",description="整箱高"),
 *           @SWG\Property(property="GROSS_WEIGHT",  type="number",description="整箱毛重"),
 *           @SWG\Property(property="FCL_NET_WEIGHT",  type="number",description="整箱净重"),
 *           @SWG\Property(property="PACKING_NUMBER",  type="integer",description="装箱数量(台/每箱)"),
 *           @SWG\Property(property="TAILBOX_BNUMBER",  type="integer",description="尾箱每箱数量"),
 *           @SWG\Property(property="FCL_NUM",  type="number",description="整箱数"),
 *           @SWG\Property(property="PLA_QUANTITY",  type="integer",description="计划发运数量"),
 *           @SWG\Property(property="CHANNEL_ID",  type="integer",description="平台ID"),
 *           @SWG\Property(property="WAREHOUSE_ID",  type="integer",description="目的仓"),
 *           @SWG\Property(property="ORGANISATION_ID",  type="integer",description="需求组织"),
 *           @SWG\Property(property="DELIVER_WARID",  type="integer",description="发货仓库"),
 *           @SWG\Property(property="AUTITOR_ID",  type="integer",description="审核人ID"),
 *           @SWG\Property(property="PARTNER_ID",  type="integer",description="供应商ID"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class ShDispatchNote extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sh_dispatch_note';
    }

    public $ORGANISATION_PID = null;

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PLA_QUANTITY', 'TAILBOX_BNUMBER', 'PACKING_NUMBER', 'LAST_NUM', 'PURCHASING_WAREHOUSING_ID', 'INTERNAL_SALES_ID', 'INTERNAL_PURCHASING_ID',
                'INTERNAL_SALESTH_ID', 'INTERNAL_PURCHASINGST_ID', 'ALLOCATION_ONTHEWAY_ID', 'ALLOCATION_GOAL_ID', 'PSKU_ID', 'DEMANDSKU_ID', 'URGENT_ORDER',
                'PlAN_SHIPMENT_AT', 'TRANSITW_SHIPMENTS', 'SUPPLIER_SHIPMENTS', 'PU_ORDER_ID', 'TRANSPORT_MODE', 'ACTUAL_SHIPM_NUM', 'ACTUAL_SHIPM_AT', 'MARKUP_RATIO',
                'EXPECTED_SERVICE_AT', 'PLAN_STATE', 'DELETED_STATE', 'IMPORT_STATE', 'AUTITO_AT', 'CREATED_AT', 'CLOSING_STATE', 'CHANNEL_ID', 'WAREHOUSE_ID',
                'ORGANISATION_ID', 'DELIVER_WARID', 'AUTITOR_ID', 'PARTNER_ID', 'UUSER_ID', 'CUSER_ID', 'MONEY_ID'], 'integer'],
            [['FCL_NUM', 'FCL_LONG', 'FCL_WIDE', 'FCL_HIGH', 'GROSS_WEIGHT', 'FCL_NET_WEIGHT', 'CUSTOMS_PRICE', 'TARIFF', 'VALUE_ADDED_TAX', 'TAILBOX_LONG', 'TAILBOX_WIDE', 'TAILBOX_HIGH', 'TAILBOX_NETWEIGHT', 'TAILBOX_WEIGHT'], 'number'],
            [['PSKU_CODE', 'KUKAI_NUMBER', 'PO_NUMBER', 'DEMANDSKU_CODE', 'UPDATED_AT', 'FBA_ID',], 'string', 'max' => 20],
            [['FNSKU', 'PURCHASING_WAREHOUSING_CD', 'INTERNAL_SALES_CD', 'ALLOCATION_GOAL_CD', 'ALLOCATION_ONTHEWAY_CD', 'INTERNAL_PURCHASINGST_CD', 'INTERNAL_SALESTH_CD', 'INTERNAL_PURCHASING_CD', 'PAYMENT_TERM'], 'string', 'max' => 30],
            [['DISPATCH_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'DISPATCH_NOTE_ID' => Yii::t('shipment', '发运单ID'),
            'PU_ORDER_ID' => Yii::t('shipment', '关联来源ID：采购订单明细，库存调整单明细'),
            'PSKU_ID' => Yii::t('shipment', 'SKU ID'),
            'PSKU_CODE' => Yii::t('shipment', 'SKU编码'),
            'TRANSPORT_MODE' => Yii::t('shipment', '运输方式：1：空运  2：海运  3：龙舟海运，4：快递,5：陆运'),
            'KUKAI_NUMBER' => Yii::t('shipment', '空海次数'),
            'DEMANDSKU_CODE' => Yii::t('shipment', '需求国SKU'),
            'DEMANDSKU_ID' => Yii::t('shipment', '需求国SKU ID'),
            'ACTUAL_SHIPM_NUM' => Yii::t('shipment', '实际发运数量'),
            'FBA_ID' => Yii::t('shipment', 'FBA ID'),
            'PAYMENT_TERM' => Yii::t('shipment', 'PAYMENT TERM'),
            'ACTUAL_SHIPM_AT' => Yii::t('shipment', '实际发运日期'),
            'MARKUP_RATIO' => Yii::t('shipment', '加价比例'),
            'CUSTOMS_PRICE' => Yii::t('shipment', '报关价格'),
            'MONEY_ID' => Yii::t('shipment', '报关币种ID'),
            'TARIFF' => Yii::t('shipment', '关税'),
            'VALUE_ADDED_TAX' => Yii::t('shipment', '增值税'),
            'EXPECTED_SERVICE_AT' => Yii::t('shipment', '预计送达日期'),
            'PO_NUMBER' => Yii::t('shipment', 'PO号'),
            'FNSKU' => Yii::t('shipment', '产品条码'),
            'URGENT_ORDER' => Yii::t('shipment', '紧急单据：1:是 2:否'),
            'DISPATCH_REMARKS' => Yii::t('shipment', '备注'),
            'PlAN_SHIPMENT_AT' => Yii::t('shipment', '计划发运日期'),
            'TRANSITW_SHIPMENTS' => Yii::t('shipment', '中转仓出货数'),
            'SUPPLIER_SHIPMENTS' => Yii::t('shipment', '供应商出货数'),
            'PLAN_STATE' => Yii::t('shipment', '单据状态:1.未审核、2.已审核'),
            'DELETED_STATE' => Yii::t('shipment', '是否删除:1：删除 0：未删除'),
            'IMPORT_STATE' => Yii::t('shipment', '数据来源:1.采购订单明细,2.库存调整单明细 99.导入'),
            'AUTITO_AT' => Yii::t('shipment', '审核时间'),
            'CREATED_AT' => Yii::t('shipment', '制单日期'),
            'UPDATED_AT' => Yii::t('shipment', '更新时间'),
            'CLOSING_STATE' => Yii::t('shipment', '是否关账，0：未关账 1：已关账'),
            'PURCHASING_WAREHOUSING_CD' => Yii::t('shipment', '采购入库单号'),
            'INTERNAL_SALES_CD' => Yii::t('shipment', '内部销售订单号'),
            'INTERNAL_PURCHASING_CD' => Yii::t('shipment', '内部采购订单号'),
            'INTERNAL_SALESTH_CD' => Yii::t('shipment', '内部销售出库单号'),
            'INTERNAL_PURCHASINGST_CD' => Yii::t('shipment', '内部采购入库单号'),
            'ALLOCATION_ONTHEWAY_CD' => Yii::t('shipment', '调拨单(在途)号'),
            'ALLOCATION_GOAL_CD' => Yii::t('shipment', '调拨单(目的)号'),
            'PURCHASING_WAREHOUSING_ID' => Yii::t('shipment', '采购入库单明细ID'),
            'INTERNAL_SALES_ID' => Yii::t('shipment', '内部销售订单明细ID'),
            'INTERNAL_PURCHASING_ID' => Yii::t('shipment', '内部采购订单明细ID'),
            'INTERNAL_SALESTH_ID' => Yii::t('shipment', '内部销售出库单明细ID'),
            'INTERNAL_PURCHASINGST_ID' => Yii::t('shipment', '内部采购入库单明细ID'),
            'ALLOCATION_ONTHEWAY_ID' => Yii::t('shipment', '调拨单(在途)明细ID'),
            'ALLOCATION_GOAL_ID' => Yii::t('shipment', '调拨单(目的)明细ID'),
            'LAST_NUM' => Yii::t('shipment', '尾箱数'),
            'TAILBOX_LONG' => Yii::t('shipment', '尾箱长'),
            'TAILBOX_WIDE' => Yii::t('shipment', '尾箱宽'),
            'TAILBOX_HIGH' => Yii::t('shipment', '尾箱高'),
            'TAILBOX_NETWEIGHT' => Yii::t('shipment', '尾箱毛重'),
            'TAILBOX_WEIGHT' => Yii::t('shipment', '尾箱净重'),
            'FCL_LONG' => Yii::t('shipment', '整箱长'),
            'FCL_WIDE' => Yii::t('shipment', '整箱宽'),
            'FCL_HIGH' => Yii::t('shipment', '整箱高'),
            'GROSS_WEIGHT' => Yii::t('shipment', '整箱毛重'),
            'FCL_NET_WEIGHT' => Yii::t('shipment', '整箱净重'),
            'PACKING_NUMBER' => Yii::t('shipment', '装箱数量(台/每箱)'),
            'TAILBOX_BNUMBER' => Yii::t('shipment', '尾箱每箱数量'),
            'FCL_NUM' => Yii::t('shipment', '整箱数'),
            'PLA_QUANTITY' => Yii::t('shipment', '计划发运数量'),
            'CHANNEL_ID' => Yii::t('shipment', '平台ID'),
            'WAREHOUSE_ID' => Yii::t('shipment', '目的仓'),
            'ORGANISATION_ID' => Yii::t('shipment', '需求组织'),
            'DELIVER_WARID' => Yii::t('shipment', '发货仓库'),
            'AUTITOR_ID' => Yii::t('shipment', '审核人ID'),
            'PARTNER_ID' => Yii::t('shipment', '供应商ID'),
            'UUSER_ID' => Yii::t('shipment', '更新人ID'),
            'CUSER_ID' => Yii::t('shipment', '创建人ID'),
        ];
    }

    public static function addQuery(&$query, $alias)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            #组织权限
            $query->andWhere([$alias . '.ORGANISATION_ID' => Yii::$app->session->get('organization') ?: null]);
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


    /** 关联查询-创建人 **/
    public function getU_userinfo()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'CUSER_ID'])->alias('u');
    }

    /** 关联查询-更新人 **/
    public function getU_userinfos()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'UUSER_ID']);
    }

    /** 关联查询-需求组织 **/
    public function getO_organisation()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'ORGANISATION_ID'])->alias('o')->select(['ORGANISATION_NAME_CN', 'ORGANISATION_ID']);
    }

    /** 关联查询-平台 **/
    public function getB_channel()
    {
        return $this->hasOne(BChannel::className(), ['CHANNEL_ID' => 'CHANNEL_ID'])->alias('c')->select(['CHANNEL_ID', 'CHANNEL_NAME_CN', 'CHANNEL_ABBREVIATION']);
    }

    /** 关联查询-仓库 目的仓 **/
    public function getB_warehouse()
    {
        return $this->hasOne(BWarehouse::className(), ['WAREHOUSE_ID' => 'WAREHOUSE_ID'])->alias('w')->select(['WAREHOUSE_ID', 'WAREHOUSE_NAME_CN']);
    }

    /** 关联查询-产品SKU **/
    public function getG_product_sku()
    {
        return $this->hasOne(GProductSku::className(), ['PSKU_ID' => 'PSKU_ID'])->alias('g')->select(['PSKU_CODE', 'PSKU_ID', 'PSKU_NAME_CN', 'PSKU_NAME_EN', 'AMAZON_SIZE_ID']);
    }

    /** 关联查询-报关SKU **/
    public function getG_product_sku_declare()
    {
        return $this->hasOne(GProductSkuDeclare::className(), ['PSKU_ID' => 'PSKU_ID'])->alias('g1')
            ->select(['PSKU_CODE', 'PSKU_ID', 'CUSTOMS_NAME', 'UNIT_ID', 'REPORTING_ELEMENTS', 'CUSTOMS_ID']);
    }

    /** 关联查询-供应商 **/
    public function getPa_partner()
    {
        return $this->hasOne(PaPartner::className(), ['PARTNER_ID' => 'PARTNER_ID'])->alias('pa')->select(['PARTNER_ID', 'PARTNER_NAME_CN', 'PARTNER_ANAME_CN']);
    }

    /** 关联查询-库存调整单或者采购订单 **/
    public function getPu_purchase_detail()
    {
        $DELIVERY = (new Query())->select(['DELIVERY_AT'])->from('pu_qctables')
            ->where(['and', 'PSKU_ID = pu.PSKU_ID', 'PU_ORDER_CD = pu.PU_PURCHASE_CD', 'INSPECTION_AT <= unix_timestamp(now())'])
            ->orderBy('INSPECTION_AT desc')
            ->limit('0,1');

        //"andwhere":["or",["=","IMPORT_STATE",1]],
        return $this->hasOne(PuPurchaseDetail::className(), ['PURCHASE_DETAIL_ID' => 'PU_ORDER_ID'])->onCondition(['IMPORT_STATE' => 1])->alias('pu')
            ->select(['PURCHASE_DETAIL_ID', 'PU_PURCHASE_CD', 'EACH_NUMBER', 'FCL_LONG', 'FCL_WIDE', 'FCL_HIGH', 'GROSS_WEIGHT', 'FCL_NET_WEIGHT',
                'TAX_UNITPRICE', 'UNIT_ID', 'TAX_AMOUNT', 'INSPECTION_STATE', 'RGOODS_NUMBER', 'FNSKU', 'DELIVERY_AT' => $DELIVERY
            ]);
    }

    /**
     * before_AUpdate
     * 编辑前
     * @param $body
     * @param $class
     * @return parent
     * @throws
     * */
    public function before_AUpdate($body, $class = null)
    {
        $respone = new ResponeModel();
        #1.判断是否有ID
        if (!isset($body['DISPATCH_NOTE_ID'])) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('shipment', 'The conditions are incomplete and no operation is allowed!'), [$body])];
//            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('shipment', '条件不完整，禁止操作！'), [$body])];
        }
        $noteDB = static::find()->where(array('DISPATCH_NOTE_ID' => $body['DISPATCH_NOTE_ID']))->asArray()->one();
        #2.判断数据是否存在
        if (count($noteDB) <= 0) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('shipment', 'The current document does not exist and is forbidden to operate!'), [$body])];
//            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('shipment', '当前单据不存在，禁止操作！'), [$body])];
        }
        #4.判断是否是删除操作
        if (isset($body['edit_type'])) {
            if ($body['edit_type'] == '3') {
                #4-1 审核中的单据禁止删除操作
                if ($noteDB['PLAN_STATE'] == '2') {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('shipment', 'The current document has been audited and cannot be operated on!'), [$body])];
//                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('shipment', '当前单据处于已审核状态，禁止删除操作！'), [$body])];
                }
                #4-2 将计划发运数量根据仓库从采购订单或者库存调整单的中转仓计划数量或者供应商计划数量栏位减去。
                $WriteBack[0]['PU_ORDER_ID'] = $noteDB['PU_ORDER_ID'];// 来源单据ID
                $WriteBack[0]['IMPORT_STATE'] = $noteDB['IMPORT_STATE'];// 来源单据类型1采购2库存调整
                $WriteBack[0]['TRANSITW_SHIPMENTS'] = $noteDB['TRANSITW_SHIPMENTS'];// 中转仓数量
                $WriteBack[0]['SUPPLIER_SHIPMENTS'] = $noteDB['SUPPLIER_SHIPMENTS'];// 供应商仓数量
                $WriteBack[0]['increase_decrease'] = '2';
                Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\dispatchLogic', 'Calculation'], $WriteBack]);

            } else {
                #5.判断会计期间

                #6.判断是否是审核操作

                #7.判断是否是反审核操作
                if ($body['edit_type'] == '2') {
                    if ($noteDB['PLAN_STATE'] == '1') {
                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('shipment', 'This operation cannot be performed because the current document is not audited!'), [$body])];
//                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('shipment', '当前单据处于未审核状态，禁止反审核！'), [$body])];
                    }
                    $transaction = Yii::$app->db->beginTransaction();
                    try {
                        $ReverseAudit = Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\dispatchLogic', 'ReverseAudit'], [$noteDB]]);
                        if ($ReverseAudit !== 1) {
                            $transaction->rollBack();
                            return [static::ACTION_RETURN, $respone->setModel(500, 0, $ReverseAudit, [$body])];
                        }
                        $transaction->commit();
                    } catch (\Exception $e) {
                        $transaction->rollBack();
                        throw $e;
                    }

                    //清理外键字段
                    $body['PURCHASING_WAREHOUSING_CD'] = "";
                    $body['INTERNAL_SALES_CD'] = "";
                    $body['INTERNAL_PURCHASING_CD'] = "";
                    $body['INTERNAL_SALESTH_CD'] = "";
                    $body['INTERNAL_PURCHASINGST_CD'] = "";
                    $body['ALLOCATION_ONTHEWAY_CD'] = "";
                    $body['ALLOCATION_GOAL_CD'] = "";

                    $body['PURCHASING_WAREHOUSING_ID'] = "";
                    $body['INTERNAL_SALES_ID'] = "";
                    $body['INTERNAL_PURCHASING_ID'] = "";
                    $body['INTERNAL_SALESTH_ID'] = "";
                    $body['INTERNAL_PURCHASINGST_ID'] = "";
                    $body['ALLOCATION_ONTHEWAY_ID'] = "";
                    $body['ALLOCATION_GOAL_ID'] = "";
                    //审核人清空
                    $body['AUTITO_ID'] = '';
                    //审核时间清空
                    $body['AUTITO_AT'] = '';
                }
            }

        }
        return parent::before_AUpdate($body, $class); // TODO: Change the autogenerated stub
    }

    /** 将生成发运单的数量加到对应采购订单明细中、库存调整单明细中的计划中的数量。 **/
    public function after_ACreate($body, $class = null)
    {
        $WriteBack[0]['PU_ORDER_ID'] = $this->PU_ORDER_ID;// 来源单据ID
        $WriteBack[0]['IMPORT_STATE'] = $this->IMPORT_STATE;// 来源单据类型1采购2库存调整
        $WriteBack[0]['TRANSITW_SHIPMENTS'] = $this->TRANSITW_SHIPMENTS;// 中转仓数量
        $WriteBack[0]['SUPPLIER_SHIPMENTS'] = $this->SUPPLIER_SHIPMENTS;// 采购师数量
        $WriteBack[0]['increase_decrease'] = '1';
        Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\dispatchLogic', 'Calculation'], $WriteBack]);

        return parent::after_ACreate($body, $class); // TODO: Change the autogenerated stub
    }
}
