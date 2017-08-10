<?php

namespace addons\shipment\models;

use addons\master\product\models\GProductSku;
use addons\master\product\models\GProductType;
use addons\purchase\models\PuPurchaseDetail;
use addons\users\models\UUserInfo;
use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\swoole\db\ActiveRecord;
use yii\swoole\helpers\ArrayHelper;

/**
 * @SWG\Definition(
 *   definition="ShTrackingDetail",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="TRACKING_DETAIL_ID", type="integer",description="发运跟踪明细ID"),
 *           @SWG\Property(property="TRACKING_ID", type="integer",description="发运跟踪ID"),
 *           @SWG\Property(property="DISPATCH_NOTE_ID", type="integer",description="发运单ID"),
 *           @SWG\Property(property="PU_ORDER_CD", type="string",description="采购单号"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="PSKU_CODE", type="string",description="SKU"),
 *           @SWG\Property(property="GOODS_DESCRIBE", type="string",description="货描"),
 *           @SWG\Property(property="SHIPMENT_NUMBER", type="integer",description="发运数量"),
 *           @SWG\Property(property="ARECIPIENT_NUM", type="integer",description="已收货数量"),
 *           @SWG\Property(property="ACTUALS_ERVICE_AT",type="integer",format="int32",description="实际送达时间"),
 *           @SWG\Property(property="PU_MONEY",  type="double",description="采购单价"),
 *           @SWG\Property(property="CLEARANCE_MONEY",  type="double",description="清关价格"),
 *           @SWG\Property(property="GNUMBER",  type="double",description="件数"),
 *           @SWG\Property(property="NET_WEIGHT",  type="double",description="净重"),
 *           @SWG\Property(property="GROSS_WEIGHT",  type="double",description="毛重"),
 *           @SWG\Property(property="VOLUME",  type="double",description="体积"),
 *           @SWG\Property(property="TRACK_NO",  type="string",description="跟踪号"),
 *           @SWG\Property(property="DETAIL_REMARKS",  type="string",description="备注"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="ADJUSTMENT_NUMBER",type="integer",description="调整数量"),
 *           @SWG\Property(property="PU_MONEY_ID",  type="integer",description="采购币种"),
 *           @SWG\Property(property="CLEARANCE_MONEY_ID",  type="integer",description="清关币种"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class ShTrackingDetail extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sh_tracking_detail';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PSKU_ID','TRACKING_ID', 'DISPATCH_NOTE_ID', 'SHIPMENT_NUMBER', 'ARECIPIENT_NUM', 'ACTUALS_ERVICE_AT',  'CREATED_AT', 'UPDATED_AT','ADJUSTMENT_NUMBER'
                , 'PU_MONEY_ID', 'CLEARANCE_MONEY_ID', 'UUSER_ID', 'CUSER_ID'], 'integer'],
            [['PU_MONEY', 'CLEARANCE_MONEY', 'NET_WEIGHT', 'GROSS_WEIGHT', 'VOLUME','GNUMBER'], 'number'],
            [['PU_ORDER_CD'], 'string', 'max' => 30],
            [['PSKU_CODE'], 'string', 'max' => 20],
            [['GOODS_DESCRIBE', 'DETAIL_REMARKS'], 'string', 'max' => 255],
            [['TRACK_NO'], 'string', 'max' => 100],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'TRACKING_DETAIL_ID' => Yii::t('shipment', '发运跟踪明细ID'),
            'TRACKING_ID' => Yii::t('shipment', '发运跟踪ID'),
            'DISPATCH_NOTE_ID' => Yii::t('shipment', '发运单ID'),
            'PU_ORDER_CD' => Yii::t('shipment', '采购单号'),
            'PSKU_ID' => Yii::t('shipment', 'SKU ID'),
            'PSKU_CODE' => Yii::t('shipment', 'SKU编码'),
            'GOODS_DESCRIBE' => Yii::t('shipment', '货描'),
            'SHIPMENT_NUMBER' => Yii::t('shipment', '发运数量'),
            'ARECIPIENT_NUM' => Yii::t('shipment', '已收货数量'),
            'ACTUALS_ERVICE_AT' => Yii::t('shipment', '实际送达时间'),
            'PU_MONEY' => Yii::t('shipment', '采购单价'),
            'CLEARANCE_MONEY' => Yii::t('shipment', '清关价格'),
            'GNUMBER' => Yii::t('shipment', '件数'),
            'NET_WEIGHT' => Yii::t('shipment', '净重'),
            'GROSS_WEIGHT' => Yii::t('shipment', '毛重'),
            'VOLUME' => Yii::t('shipment', '体积'),
            'TRACK_NO' => Yii::t('shipment', '跟踪号'),
            'DETAIL_REMARKS' => Yii::t('shipment', '备注'),
            'CREATED_AT' => Yii::t('shipment', '制单日期'),
            'UPDATED_AT' => Yii::t('shipment', '更新时间'),
            'ADJUSTMENT_NUMBER' => Yii::t('shipment', '调整数量'),
            'PU_MONEY_ID' => Yii::t('shipment', '采购币种'),
            'CLEARANCE_MONEY_ID' => Yii::t('shipment', '清关币种'),
            'UUSER_ID' => Yii::t('shipment', '更新人ID'),
            'CUSER_ID' => Yii::t('shipment', '创建人ID'),
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

    //创建人
    public function getU_userinfo()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'CUSER_ID'])->alias('u');
    }

    //更新人
    public function getU_userinfos()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'UUSER_ID']);
    }

    //物流跟踪主表
    public function getSh_tracking()
    {
        return $this->hasOne(ShTracking::className(), ['TRACKING_ID' => 'TRACKING_ID']);
    }

    //SKU且关联通用SKU
    public function getG_product_sku()
    {
        return $this->hasOne(GProductSku::className(), ['PSKU_ID' => 'PSKU_ID'])->joinWith(['g_currency_skus']);
    }

    //发运单
    public function getSh_dispatch_note()
    {
        return $this->hasOne(ShDispatchNote::className(), ['DISPATCH_NOTE_ID' => 'DISPATCH_NOTE_ID']);
    }

    //采购订单明细
    public function getPu_purchase_detail()
    {
        return $this->hasOne(PuPurchaseDetail::className(), ['PU_PURCHASE_CD' => 'PU_ORDER_CD', 'PSKU_ID' => 'PSKU_ID']);
    }

    /**
     * 发运跟踪明细查询的操作
     * before_AIndex 查询前
     * after_AIndex 查询后
     */
    public function before_AIndex($body, $class = null)
    {
        if($goodsType=ArrayHelper::remove($body,'goodsType')){
            $val = GProductType::find()->select(['PRODUCT_TYPE_ID'])->where(['<>', 'DELETED_STATE', 1])->andFilterWhere(['or', ['like', 'SYSTEM_NAME_CN', $goodsType], ['like', 'SYSTEM_NAMER_CN', $goodsType], ['like', 'SYSTEM_NAME_EN', $goodsType], ['like', 'SYSTEM_NAMER_EN', $goodsType]])->column();
            //相关分类信息
            if ($val) {
                $body['andFilterWhere'][] = "FIND_IN_SET(SUBSTRING_INDEX(PRODUCT_TYPE_PATH,',',-1),:PRODUCT_TYPE_PATH)";
                $body['addParams'] = [':PRODUCT_TYPE_PATH' => implode(',', $val)];
            }
        }
        return parent::before_AIndex($body); // TODO: Change the autogenerated stub
    }
}
