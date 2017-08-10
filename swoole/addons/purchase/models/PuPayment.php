<?php

namespace addons\purchase\models;

use addons\master\basics\models\BMoney;
use addons\master\partint\models\PaPartner;
use addons\organization\models\OOrganisation;
use addons\users\models\UUserInfo;
use Yii;
use yii\behaviors\AttributeBehavior;
use yii\swoole\behaviors\CustomBehaviors;
use yii\swoole\rest\ResponeModel;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;
use  addons\purchase\models\PuPurchaseDetail;


/**
 * @SWG\Definition(
 *   definition="PuPayment",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="PAYMENT_ID", type="integer",description="采购付款ID"),
 *           @SWG\Property(property="PAYMENT_CD", type="string",description="付款申请单单号"),
 *           @SWG\Property(property="PAYMENT_NUMBER",type="double",description="申请付款金额"),
 *           @SWG\Property(property="PAYMENT_AT",type="integer",format="int32",description="预计付款日期"),
 *           @SWG\Property(property="PAID_MONEY",  type="double",description="实付金额"),
 *           @SWG\Property(property="PAID_AT",  type="integer",format="int32",description="实付日期"),
 *           @SWG\Property(property="PAYMENT_REMARKS",  type="string",description="备注"),
 *           @SWG\Property(property="AUDIT_STATE", type="integer",description="单据状态:1：未审核 2：已审核"),
 *           @SWG\Property(property="PAYMENT_STATE", type="integer",description="付款状态:0：未付款  1：已付款"),
 *           @SWG\Property(property="DELETED_STATE", type="integer",description="是否删除,1：删除 0：未删除"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="AUTITO_AT",type="integer",format="int32",description="审核时间"),
 *           @SWG\Property(property="CLOSING_STATE",type="integer",format="int32",description="是否关账，0：未关账 1：已关账"),
 *           @SWG\Property(property="PORGANISATION_ID",type="integer",description="付款组织ID"),
 *           @SWG\Property(property="PARTNER_ID",type="integer",description="供应商ID"),
 *           @SWG\Property(property="PMONEY_ID",type="integer",description="付款币种ID"),
 *           @SWG\Property(property="PAMONEY_ID",type="integer",description="实付币种ID"),
 *           @SWG\Property(property="APPLICANT_ID",type="integer",description="申请人ID"),
 *           @SWG\Property(property="AUTITOR_ID",type="integer",description="审核人ID"),
 *           @SWG\Property(property="CUSER_ID",type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID",type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class PuPayment extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'pu_payment';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PORGANISATION_ID', 'PAYMENT_NUMBER', 'PARTNER_ID', 'PMONEY_ID'], 'required'],
            [['PAYMENT_NUMBER', 'PAID_MONEY'], 'number'],
            [['PAYMENT_AT', 'PAID_AT', 'AUDIT_STATE', 'PAYMENT_STATE', 'DELETED_STATE', 'CLOSING_STATE', 'CREATED_AT', 'UPDATED_AT', 'AUTITO_AT','PORGANISATION_ID',
                'PARTNER_ID','PMONEY_ID','PAMONEY_ID','APPLICANT_ID', 'AUTITOR_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['PAYMENT_CD'], 'string', 'max' => 30],
            [['PAYMENT_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'PAYMENT_ID' => Yii::t('purchase', '付款申请ID'),
            'PAYMENT_CD' => Yii::t('purchase', '付款申请单单号'),
            'PAYMENT_NUMBER' => Yii::t('purchase', '申请付款金额'),
            'PAID_MONEY' => Yii::t('purchase', '实付金额'),
            'PAYMENT_AT' => Yii::t('purchase', '预计付款日期'),
            'PAID_AT' => Yii::t('purchase', '实付日期'),
            'AUDIT_STATE' => Yii::t('purchase', '单据状态:1：已审 0：未审'),
            'PAYMENT_STATE' => Yii::t('purchase', '付款状态:0：未付款  1：已付款'),
            'DELETED_STATE' => Yii::t('purchase', '是否删除:1：删除 0：未删除'),
            'PAYMENT_REMARKS' => Yii::t('purchase', '备注'),
            'CLOSING_STATE' => Yii::t('purchase', '是否关账，0：未关账 1：已关账'),
            'CREATED_AT' => Yii::t('purchase', '创建时间'),
            'UPDATED_AT' => Yii::t('purchase', '修改时间'),
            'AUTITO_AT' => Yii::t('purchase', '审核时间'),
            'PORGANISATION_ID' => Yii::t('purchase', '付款组织ID'),
            'PARTNER_ID' => Yii::t('purchase', '供应商ID'),
            'PMONEY_ID' => Yii::t('purchase', '付款币种ID'),
            'PAMONEY_ID' => Yii::t('purchase', '实付币种ID'),
            'APPLICANT_ID' => Yii::t('purchase', '申请人ID'),
            'AUTITOR_ID' => Yii::t('purchase', '审核人ID'),
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
                'class' => AttributeBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => 'PAYMENT_CD',
                ],
                'value' => function ($event) {
                    return Yii::$app->rpc->create('base')->sendAndrecv([['addons\common\base\modellogic\CreateNO', 'createOrderNo'],
                        [5, $this->PORGANISATION_ID, 'PR']]);
                },
            ],
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
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CUSER_ID', 'UUSER_ID', 'APPLICANT_ID'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UUSER_ID'],
                ],
            ],
            [
                'class' => CustomBehaviors::className(),
                'beforeSaveConfig' =>
                    [
                        [
                            [
                                [true]
                            ],
                            [
                                'base' =>
                                    [
                                        [['addons\common\base\modellogic\refuseLogic', 'refuse'],
                                            [
                                                'PAYMENT_AT',
                                                'PORGANISATION_ID',
                                                'CLOSING_STATE',
                                                ['addWhere' => []]
                                            ]
                                        ]
                                    ]
                            ],
                        ]
                    ]
            ]
        ];
    }

    public static function addQuery(&$query, $alias)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if($str){
            $query->andWhere([$alias . '.PORGANISATION_ID' => Yii::$app->session->get('organization') ?: null]);
        }
    }

    public $realation = ['pu_payment_detail' => ['PAYMENT_CD' => 'PAYMENT_CD','PAYMENT_ID'=>'PAYMENT_ID']];

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

    //组织编码
    public function getO_organisation()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' =>'PORGANISATION_ID' ])->select(['ORGANISATION_ID', 'ORGANISATION_NAME_CN']);
    }

    //付款币种编码
    public function getP_money()
    {
        return $this->hasOne(BMoney::className(), ['MONEY_ID' =>'PMONEY_ID' ])->select(['pm.MONEY_ID', 'pm.MONEY_NAME_CN'])->alias('pm');
    }
    //实付币种编码
    public function getPa_money()
    {
        return $this->hasOne(BMoney::className(), ['MONEY_ID' =>'PAMONEY_ID' ])->select(['pam.MONEY_ID', 'pam.MONEY_NAME_CN'])->alias('pam');
    }
    //供应商
    public function getPa_partner()
    {
        return $this->hasOne(PaPartner::className(), ['PARTNER_ID' =>'PARTNER_ID' ])->select(['pa.PARTNER_ID', 'pa.PARTNER_NAME_CN','pa.PARTNER_ANAME_CN'])->alias('pa');
    }
    //申请人
    public function getPa_user()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' =>'APPLICANT_ID' ])->select(['puser.USER_INFO_ID', 'puser.STAFF_ID','puser.ORGANISATION_ID'])->alias('puser')->joinWith(['u_staffinfo','o_organisation']);
    }
    //审核人
    public function getAutit_user()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' =>'AUTITOR_ID' ])->select(['atuser.USER_INFO_ID', 'atuser.STAFF_ID','atuser.ORGANISATION_ID'])->alias('atuser')->joinWith('u_staffinfo2');
    }
    //付款申请明细
    public function getPu_payment_detail()
    {
        return $this->hasMany(PuPaymentDetail::className(), ['PAYMENT_CD' => 'PAYMENT_CD'])->joinWith(['pu_purchase_detail']);
    }
    //付款申请明细，带出采购明细，采购明细带出采购主表
    public function getPu_payment_detail_1()
    {
        return $this->hasMany(PuPaymentDetail::className(), ['PAYMENT_CD' => 'PAYMENT_CD'])->alias('pay1')->joinWith(['pu_purchase_detail_1']);
    }

    /**
     * 付款申请修改
     * before_AUpdate 修改前
     */
    public function before_AUpdate($body, $class = null)
    {
        $errorMsg = '';
        if(isset($body['edit_type'])){
            switch($body['edit_type']){
                case 1: //审核
                    $errorMsg = $this->_audit($body);
                    if(isset($body['EXCHANGERATE'])){
                        $this-> _updatepo($body);
                    }
                    //更新审核时间、审核人
                    $body['AUTITOR_ID'] = $this->_get_user_id();
                    $body['AUTITO_AT'] = time();
                    break;
                case 2: //反审核
                    $errorMsg = $this->_reaudit($body);
                    break;
                case 3: //确认付款
                    $errorMsg = $this->_confirm_payment($body);
                    //检验通过，同时回写采购明细的实付金额
                    if($errorMsg == '' && isset($body['pu_payment_detail'])) {
                        $paid_money = 0;
                        foreach ($body['pu_payment_detail'] as $key => $value) {
                            $purchaseDetailDB = PuPurchaseDetail::find()->select(['PURCHASE_DETAIL_ID', 'RGOODS_AMOUNT'])->where(['PURCHASE_DETAIL_ID' => $value['PURCHASE_DETAIL_ID']])->asArray()->one();
                            $purchaseDetailDB['RGOODS_AMOUNT'] += $value['THIS_PAID_AMOUNT'];
                            $value['THIS_PAID_AMOUNT'] = $value['THIS_PAID_AMOUNT']*$body['EXCHANGERATE'];
                            $body['pu_payment_detail'][$key] = $value;
                            $body['pu_payment_detail'][$key]['pu_purchase_detail'] = $purchaseDetailDB;
                            $paid_money += $value['THIS_PAID_AMOUNT'];
                        }
                        $body['PAID_MONEY'] =  count($body['pu_payment_detail']) ? $paid_money : $body['PAID_MONEY']; //有明细时，付款申请主表的实付金额等于明细本次实付金额总和
                    }
                    $body['PAID_AT'] = isset($body['PAID_AT']) && $body['PAID_AT'] ? $body['PAID_AT'] : time(); //付款时间未指定则默认为当前时间
                    break;
                case 4: //修改付款
                    $errorMsg = $this->_modify_payment($body);
                    //检验通过，同时回写采购明细的实付金额
                    if($errorMsg == '' && isset($body['pu_payment_detail'])) {
                        foreach ($body['pu_payment_detail'] as $key => $value) {
                            $purchaseDetailDB = PuPurchaseDetail::find()->select(['PURCHASE_DETAIL_ID', 'RGOODS_AMOUNT'])->where(['PURCHASE_DETAIL_ID' => $value['PURCHASE_DETAIL_ID']])->asArray()->one();
                            $purchaseDetailDB['RGOODS_AMOUNT'] -= $value['THIS_PAID_AMOUNT'];
                            $body['pu_payment_detail'][$key]['pu_purchase_detail'] = $purchaseDetailDB; //回写采购明细的已申付
                            $body['pu_payment_detail'][$key]['THIS_PAID_AMOUNT'] = null;   //付款明细的实付金额重置为0
                        }
                    }
                    $body['PAID_MONEY'] = null;    //付款申请主表的实付金额为0
                    $body['PAMONEY_ID'] = null; //清空实付币种
                    $body['PAID_AT'] = null;    //清空付款时间
                    break;
                case 5: //删除，主表逻辑删除，字表物理删除，同时回写采购订单的“已申付金额”
                    $errorMsg = $this->_delete_data($body);
                    if($errorMsg == ''){    //校验通过
                        $paymentDB = static::find()->where(['PAYMENT_ID' => $body['PAYMENT_ID']])->one();
                        if (count($paymentDB->pu_payment_detail) > 0) {
                            //回写采购订单的“已申付金额”
                            foreach ($paymentDB->pu_payment_detail as $value) {
                                $mPuPurchaseDetail = $value->pu_purchase_detail;
                                $mPuPurchaseDetail->THIS_APPLY_AMOUNT -= $value->THIS_AMOUNT;
                                $mPuPurchaseDetail->save();
                            }
                            //删除子表
                            PuPaymentDetail::deleteAll(['=', 'PAYMENT_CD', $paymentDB['PAYMENT_CD']]);
                        }
                    }
                    break;

            }
        }else{
        //保存 （新增或修改）
            //有ID 修改操作
            if(isset($body['PAYMENT_ID']) && $body['PAYMENT_ID']){
//                $this->getDirtyAttributes();
                $errorMsg = $this->_save_edit($body);
                //表头申付、实付金额取明细合计
                $this-> _updatepo($body);
            }else{  //新增

            }
        }

        if($errorMsg != ''){
            $respone = new ResponeModel();
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', $errorMsg), [$body])];
        }
        return parent::before_AUpdate($body, $class); // TODO: Change the autogenerated stub
    }

    //根据变更后的币种调整各种金额
    public function _updatepo(&$body){
        $paymentDB = static::find()->where(['PAYMENT_ID' => $body['PAYMENT_ID']])->one();
        $paymentDetail = $paymentDB->pu_payment_detail;
        if (count($paymentDetail) > 0) {
            $THIS_AMOUNTS = $THIS_PAID_AMOUNTS = 0;
            foreach ($paymentDetail as $key=> $value) {
                if($body['PMONEY_ID'] != $paymentDB->PMONEY_ID){
                    self::_update_purchase($body['PMONEY_ID'], $body['EXCHANGERATE'], $value['PU_PURCHASE_CD']);  //币种改变时，回写采购订单
                }

                $value['THIS_AMOUNT']  *= $body['EXCHANGERATE'];
                $value['THIS_PAID_AMOUNT'] *= $body['EXCHANGERATE'];
                $THIS_AMOUNTS += $value['THIS_AMOUNT'];
                $THIS_PAID_AMOUNTS += $value['THIS_PAID_AMOUNT'];
                $paymentDetail[$key] = $value;
                $value->save();
            }
            $body['PAYMENT_NUMBER'] = $THIS_AMOUNTS;
            $body['PAID_MONEY'] = $THIS_PAID_AMOUNTS;
        }

    }
    //回写采购订单
    public static function _update_purchase($PMONEY_ID, $EXCHANGERATE, $PU_PURCHASE_CD){
        $purchaseOrderDB = PuPurchase::find()->where(['PU_PURCHASE_CD' => $PU_PURCHASE_CD])->one();
        $poDetailDB = $purchaseOrderDB->pu_purchase_detail;
        $ORDER_AMOUNTS = 0;
        if(count($poDetailDB) > 0){
            foreach($poDetailDB as $item){
                $item['TAX_UNITPRICE'] = round($item['TAX_UNITPRICE'] * $EXCHANGERATE, 2);    //含税单价 = 原含税单价 * 汇率
                $item['TAX_AMOUNT'] = $item['TAX_UNITPRICE'] * $item['PURCHASE'];          //含税金额 = 含税单价 * 数量
                $item['NOT_TAX_UNITPRICE'] = round($item['TAX_UNITPRICE'] / (1 + $item['TAX_RATE']), 2);  //不含税单价 = 含税单价 / (1 + 税率)
                $item['NOT_TAX_AMOUNT'] = $item['NOT_TAX_UNITPRICE'] * $item['PURCHASE'];   //不含税金额 = 不含税金额 * 数量
                $item['RGOODS_AMOUNT'] = round($item['RGOODS_AMOUNT'] * $EXCHANGERATE, 2);   // 已付金额
                $item['THIS_APPLY_AMOUNT'] = round($item['THIS_APPLY_AMOUNT'] * $EXCHANGERATE, 2);   //已申付金额
                $ORDER_AMOUNTS += $item['TAX_AMOUNT'];  //主表总金额
                $item->save();
            }
        }
        $purchaseOrderDB['MONEY_ID'] = $PMONEY_ID;
        $purchaseOrderDB['ORDER_AMOUNT'] = $ORDER_AMOUNTS;
        $purchaseOrderDB->save();
    }

    //审核校验
    public function _audit($body){
        if(!isset($body['PAYMENT_ID']) || !$body['PAYMENT_ID'] || !isset($body['AUDIT_STATE']) || $body['AUDIT_STATE'] != '2'
            || !isset($body['PORGANISATION_ID']) || !$body['PORGANISATION_ID'] || !isset($body['PAYMENT_AT']) || !$body['PAYMENT_AT'])
        {
//            return '请填写完整条件！';
            return 'Please fill in the complete condition!';
        }
        return '';
    }
    //反审核校验
    public function _reaudit($body){
        if(!isset($body['PAYMENT_ID']) || !$body['PAYMENT_ID'] || !isset($body['AUDIT_STATE']) || $body['AUDIT_STATE'] != '1'
            || !isset($body['PORGANISATION_ID']) || !$body['PORGANISATION_ID'] || !isset($body['PAYMENT_AT']) || !$body['PAYMENT_AT'])
        {
//            return '请填写完整条件！';
            return 'Please fill in the complete condition!';
        }
        //检验是否已付款
        $PuPaymentDB = static::find()->where(['PAYMENT_ID'=>$body['PAYMENT_ID'], 'PAYMENT_STATE'=>1])->exists();
        if($PuPaymentDB){
//            return '当前单据已付款，不能反审核！';
            return 'This document cannot be executed without payment of the current document!';
        }
        return '';
    }
    //确认付款校验
    public function _confirm_payment($body){
        if(!isset($body['PAYMENT_ID']) || !$body['PAYMENT_ID'] || !isset($body['PAYMENT_STATE']) || $body['PAYMENT_STATE'] != '1'){
//            return  '请填写完整条件！';
            return  'Please fill in the complete condition!';
        }
        //检验是否未审核/已付款
        $PuPaymentDB = static::find()->where(['PAYMENT_ID'=>$body['PAYMENT_ID'], 'AUDIT_STATE'=>2, 'PAYMENT_STATE'=>0])->exists();
        if(!$PuPaymentDB){  //未审核或已付款，不能操作
//            return  '单据状态无法进行此操作';
            return  'This operation cannot be performed if the current document is not audited or has been paid!';
        }
        return '';
    }
    //修改付款校验
    public function _modify_payment($body){
        if(!isset($body['PAYMENT_ID']) || !$body['PAYMENT_ID'] || !isset($body['PAYMENT_STATE']) || $body['PAYMENT_STATE'] != '0'){
//            return  '请填写完整条件！';
            return  'Please fill in the complete condition!';
        }
        //检验是否未审核/未付款
        $PuPaymentDB = static::find()->where(['PAYMENT_ID'=>$body['PAYMENT_ID'], 'AUDIT_STATE'=>2, 'PAYMENT_STATE'=>1])->exists();
        if(!$PuPaymentDB){  //未审核或未付款，不能操作
//            return '单据状态无法进行此操作';
            return 'This operation cannot be performed if the current document is not audited or unpaid!';
        }
        return '';
    }
    //保存编辑校验
    public function _save_edit($body){
        if(!isset($body['PORGANISATION_ID']) || !$body['PORGANISATION_ID'] || !isset($body['PAYMENT_AT']) || !$body['PAYMENT_AT']
            || !isset($body['PARTNER_ID']) || !$body['PARTNER_ID'] || !isset($body['PMONEY_ID']) || !$body['PMONEY_ID'])
        {
            //return '请填写完整条件！';
            return 'Please fill in the complete condition!';
        }
        //检验单据状态
        $paymentDB = static::find()->where(['PAYMENT_ID'=>$body['PAYMENT_ID'], 'AUDIT_STATE'=>'2'])->exists();
        if($paymentDB){     //已审核，不能修改
//            return  '单据状态无法进行此操作';
            return  'The current document has been audited and cannot be operated on!';
        }
        return '';
    }
    //删除校验
    public function _delete_data($body){
        if(!isset($body['PAYMENT_ID']) || !$body['PAYMENT_ID'] || !isset($body['DELETED_STATE']) || $body['DELETED_STATE'] != '1' /*|| !isset($body['PAYMENT_CD']) || !$body['PAYMENT_CD']*/){
            //return  '请填写完整条件！';
            return  'Please fill in the complete condition!';
        }
        //检验单据状态
        $paymentDB = static::find()->where(['PAYMENT_ID'=>$body['PAYMENT_ID'], 'AUDIT_STATE'=>'2'])->exists();
        if($paymentDB){     //已审核，不能修改
//            return  '单据状态无法进行此操作';
            return  'The current document has been audited and cannot be operated on!';
        }
        return '';
    }
    //获取当前用户编码
    public function _get_user_id(){
        $user = Yii::$app->getUser();
        return $user && !$user->isGuest ? $user->getIdentity()->USER_INFO_ID : '1';
    }



}