<?php

namespace addons\purchase\models;

use addons\master\product\models\GProductSku;
use addons\users\models\UUserInfo;
use yii\db\Query;
use yii\swoole\db\ActiveRecord;
use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;

/**
 * @SWG\Definition(
 *   definition="PuQctables",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="QCTABLES_ID", type="integer",description="采购计划ID"),
 *           @SWG\Property(property="PU_ORDER_CD", type="string",description="采购单号"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="PSKU_CODE", type="string",description="SKU"),
 *           @SWG\Property(property="PURCHASE_DETAIL_ID", type="integer",description="采购订单明细ID"),
 *           @SWG\Property(property="PSKU_NAME_CN", type="string",description="产品名称"),
 *           @SWG\Property(property="TCHEDULING_NUMBER", type="integer",description="此次排程数量"),
 *           @SWG\Property(property="DELIVERY_AT",type="integer",format="int32",description="交货日期"),
 *           @SWG\Property(property="INSPECTION_AT",type="integer",format="int32",description="验货日期"),
 *           @SWG\Property(property="EACH_BOX_NUMBER",  type="integer",description="每箱箱数"),
 *           @SWG\Property(property="FCL_NUMBER",  type="integer",description="装箱数"),
 *           @SWG\Property(property="FCL_LONG",  type="double",description="箱长(CM)"),
 *           @SWG\Property(property="FCL_WIDE",  type="double",description="箱宽(CM)"),
 *           @SWG\Property(property="FCL_HIGH",  type="double",description="箱高(CM)"),
 *           @SWG\Property(property="FCL_BOX_WEIGHT",  type="double",description="箱重(KG)"),
 *           @SWG\Property(property="FCL_NET_WEIGHT",  type="double",description="净重(KG)"),
 *           @SWG\Property(property="FCL_GROSS_WEIGHT",  type="double",description="毛重(KG)"),
 *           @SWG\Property(property="TAILBOX_NUMBER",  type="integer",description="尾箱数"),
 *           @SWG\Property(property="TAILBOX_BNUMBER",  type="integer",description="尾箱每箱数量"),
 *           @SWG\Property(property="TAILBOX_LONG",  type="double",description="尾箱长(CM)"),
 *           @SWG\Property(property="TAILBOX_WIDE",  type="double",description="尾箱宽(CM)"),
 *           @SWG\Property(property="TAILBOX_HIGH",  type="double",description="尾箱高(CM)"),
 *           @SWG\Property(property="TAILBOX_WEIGHT",  type="double",description="尾净重(KG)"),
 *           @SWG\Property(property="TAILBOX_NETWEIGHT",  type="double",description="尾毛重(KG)"),
 *           @SWG\Property(property="AUDIT_STATE", type="integer",description="是否审核"),
 *           @SWG\Property(property="DELETED_STATE", type="integer",description="是否删除"),
 *           @SWG\Property(property="INSPECTION_STATE", type="integer",description="验货状态"),
 *           @SWG\Property(property="QCTABLES_REMARKS",  type="string",description="备注"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="CLOSING_STATE",type="integer",format="int32",description="是否关账，0：未关账 1：已关账"),
 *           @SWG\Property(property="INSPECTION_ID",type="integer",description="验货员ID"),
 *           @SWG\Property(property="AUTITOR_ID",type="integer",description="审核人ID"),
 *           @SWG\Property(property="CUSER_ID",type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID",type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class PuQctables extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'pu_qctables';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PSKU_ID', 'TCHEDULING_NUMBER', 'AUDIT_STATE', 'PURCHASE_DETAIL_ID', 'DELETED_STATE', 'DELIVERY_AT', 'INSPECTION_AT', 'EACH_BOX_NUMBER', 'TAILBOX_NUMBER',
                'TAILBOX_BNUMBER', 'INSPECTION_STATE', 'CREATED_AT', 'UPDATED_AT', 'CLOSING_STATE', 'INSPECTION_ID', 'AUTITOR_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['FCL_NUMBER', 'FCL_LONG', 'FCL_WIDE', 'FCL_HIGH', 'FCL_BOX_WEIGHT', 'FCL_NET_WEIGHT', 'FCL_GROSS_WEIGHT', 'TAILBOX_LONG', 'TAILBOX_WIDE', 'TAILBOX_HIGH', 'TAILBOX_WEIGHT', 'TAILBOX_NETWEIGHT'], 'number'],
            [['PU_ORDER_CD'], 'string', 'max' => 30],
            [['PSKU_CODE'], 'string', 'max' => 20],
            [['PSKU_NAME_CN'], 'string', 'max' => 128],
            [['QCTABLES_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'QCTABLES_ID' => Yii::t('purchase', '品检信息ID'),
            'PU_ORDER_CD' => Yii::t('purchase', '采购单号'),
            'PSKU_ID' => Yii::t('purchase', '产品SKU ID'),
            'PSKU_CODE' => Yii::t('purchase', 'SKU编码'),
            'PURCHASE_DETAIL_ID' => Yii::t('purchase', '采购订单明细ID'),
            'PSKU_NAME_CN' => Yii::t('purchase', '产品名称'),
            'TCHEDULING_NUMBER' => Yii::t('purchase', '此次排程数量'),
            'AUDIT_STATE' => Yii::t('purchase', '单据状态，1.未审核、2.已审核'),
            'DELETED_STATE' => Yii::t('purchase', '是否删除,1：删除 0：未删除'),
            'DELIVERY_AT' => Yii::t('purchase', '交货日期'),
            'INSPECTION_AT' => Yii::t('purchase', '验货日期'),
            'EACH_BOX_NUMBER' => Yii::t('purchase', '每箱箱数'),
            'FCL_NUMBER' => Yii::t('purchase', '装箱数'),
            'FCL_LONG' => Yii::t('purchase', '箱长(CM)'),
            'FCL_WIDE' => Yii::t('purchase', '箱宽(CM)'),
            'FCL_HIGH' => Yii::t('purchase', '箱高(CM)'),
            'FCL_BOX_WEIGHT' => Yii::t('purchase', '箱重(KG)'),
            'FCL_NET_WEIGHT' => Yii::t('purchase', '净重(KG)'),
            'FCL_GROSS_WEIGHT' => Yii::t('purchase', '毛重(KG)'),
            'TAILBOX_NUMBER' => Yii::t('purchase', '尾箱数'),
            'TAILBOX_BNUMBER' => Yii::t('purchase', '尾箱每箱数量'),
            'TAILBOX_LONG' => Yii::t('purchase', '尾箱长(CM)'),
            'TAILBOX_WIDE' => Yii::t('purchase', '尾箱宽(CM)'),
            'TAILBOX_HIGH' => Yii::t('purchase', '尾箱高(CM)'),
            'TAILBOX_WEIGHT' => Yii::t('purchase', '尾净重(KG)'),
            'TAILBOX_NETWEIGHT' => Yii::t('purchase', '尾毛重(KG)'),
            'INSPECTION_STATE' => Yii::t('purchase', '验货状态'),
            'QCTABLES_REMARKS' => Yii::t('purchase', '备注'),
            'CREATED_AT' => Yii::t('purchase', '创建时间'),
            'UPDATED_AT' => Yii::t('purchase', '修改时间'),
            'CLOSING_STATE' => Yii::t('purchase', '是否关账，0：未关账 1：已关账'),
            'INSPECTION_ID' => Yii::t('purchase', '验货员ID'),
            'AUTITOR_ID' => Yii::t('purchase', '审核人ID'),
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

    //验货员编码
    public function getU_userinfo_uic()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'INSPECTION_ID'])->alias('uic')->select(['*', 'STAFF_NAME_CN' => (new Query())->from('u_staff_info usi')->select(['STAFF_NAME_CN'])->where('usi.STAFF_ID = uic.STAFF_ID')]);
    }

    //采购订单
    public function getPu_purchase()
    {
        return $this->hasOne(PuPurchase::className(), ['PU_PURCHASE_CD' => 'PU_ORDER_CD'])->joinWith(['pa_partner', 'o_organisation_o']);
    }

    //采购订单明细
    public function getPu_purchase_detail()
    {
        return $this->hasOne(PuPurchaseDetail::className(), ['PURCHASE_DETAIL_ID' => 'PURCHASE_DETAIL_ID']);
    }

    //产品
    public function getG_product_sku()
    {
        return $this->hasOne(GProductSku::className(), ['PSKU_ID' => 'PSKU_ID']);
    }
}
