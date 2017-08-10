<?php

namespace addons\purchase\models;

use addons\users\models\UUserInfo;
use Yii;
use yii\swoole\rest\ResponeModel;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;

/**
 * @SWG\Definition(
 *   definition="PuPaymentDetail",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="PAYMENT_DETAIL_ID", type="integer",description="付款申请明细ID"),
 *           @SWG\Property(property="PAYMENT_ID", type="integer",description="付款申请ID"),
 *           @SWG\Property(property="PAYMENT_CD", type="string",description="付款申请单号"),
 *           @SWG\Property(property="PU_PURCHASE_CD",  type="string",description="采购订单号"),
 *           @SWG\Property(property="PURCHASE_DETAIL_ID",  type="integer",description="采购订单明细ID"),
 *           @SWG\Property(property="THIS_AMOUNT", type="double",description="本次申付金额"),
 *           @SWG\Property(property="THIS_PAID_AMOUNT", type="double",description="本次实付金额"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="CUSER_ID",type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID",type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class PuPaymentDetail extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'pu_payment_detail';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PAYMENT_CD', 'PU_PURCHASE_CD', 'PURCHASE_DETAIL_ID', 'THIS_AMOUNT'], 'required'],
            [['PURCHASE_DETAIL_ID', 'PAYMENT_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['THIS_AMOUNT', 'THIS_PAID_AMOUNT'], 'number'],
            [['PAYMENT_CD', 'PU_PURCHASE_CD'], 'string', 'max' => 30],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'PAYMENT_DETAIL_ID' => Yii::t('purchase', '付款申请明细ID'),
            'PAYMENT_ID' => Yii::t('purchase', '付款申请ID'),
            'PAYMENT_CD' => Yii::t('purchase', '付款申请单号'),
            'PU_PURCHASE_CD' => Yii::t('purchase', '采购订单号'),
            'PURCHASE_DETAIL_ID' => Yii::t('purchase', '采购订单明细ID'),
            'THIS_AMOUNT' => Yii::t('purchase', '本次申付金额'),
            'THIS_PAID_AMOUNT' => Yii::t('purchase', '本次实付金额'),
            'CUSER_ID' => Yii::t('purchase', '创建人ID'),
            'UUSER_ID' => Yii::t('purchase', '更新人ID'),
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

    public $realation = ['pu_purchase_detail' => ['PURCHASE_DETAIL_ID' => 'PURCHASE_DETAIL_ID']];

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

    //采购订单明细
    public function getPu_purchase_detail()
    {
        return $this->hasOne(PuPurchaseDetail::className(), ['PURCHASE_DETAIL_ID' => 'PURCHASE_DETAIL_ID']);
    }

    //付款申请单
    public function getPu_payment()
    {
        return $this->hasOne(PuPayment::className(), ['PAYMENT_CD' => 'PAYMENT_CD'])->joinWith(['pa_user']);
    }

    //采购订单明细,带出采购主表
    public function getPu_purchase_detail_1()
    {
        return $this->hasOne(PuPurchaseDetail::className(), ['PURCHASE_DETAIL_ID' => 'PURCHASE_DETAIL_ID'])->alias('p')->joinWith('pu_purchase_1');
    }

    /**
     * 付款申请创建后的操作
     * after_AUpdate 创建后后
     */
    public function after_ACreate($body, $class = null)
    {
        if (isset($body['PU_PURCHASE_CD']) && isset($body['PURCHASE_DETAIL_ID'])) {
            $mPuPurchaseDetail = PuPurchaseDetail::find()->where(['and', ['=', 'PU_PURCHASE_CD', $body['PU_PURCHASE_CD']], ['=', 'PURCHASE_DETAIL_ID', $body['PURCHASE_DETAIL_ID']]])->one();
            if ($mPuPurchaseDetail != "") {
                $mPuPurchaseDetail->THIS_APPLY_AMOUNT = $mPuPurchaseDetail->THIS_APPLY_AMOUNT + $body['THIS_AMOUNT'];
                $mPuPurchaseDetail->save();
            }
        }

        return [$this::ACTION_NEXT, $body];
    }

}
