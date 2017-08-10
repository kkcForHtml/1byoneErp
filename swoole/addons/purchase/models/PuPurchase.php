<?php

namespace addons\purchase\models;

use addons\master\basics\models\BChannel;
use addons\master\basics\models\BMoney;
use addons\master\partint\models\PaPartner;
use addons\organization\models\OOrganisation;
use addons\users\models\UUserInfo;
use Yii;
use yii\behaviors\AttributeBehavior;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\CustomBehaviors;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\swoole\db\ActiveRecord;
use yii\swoole\db\Query;
use yii\swoole\rest\ResponeModel;

/**
 *
 *
 * @SWG\Definition(
 *   definition="PuPurchase",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="PU_PURCHASE_ID", type="integer",description="采购订单ID"),
 *           @SWG\Property(property="PU_PURCHASE_CD", type="string",description="采购订单号"),
 *           @SWG\Property(property="SMETHOD",type="integer",description="结算方式"),
 *           @SWG\Property(property="ORDER_TYPE",type="integer",description="订单类型:1采购订单 2内部采购订单"),
 *           @SWG\Property(property="PLAN_TYPE",  type="integer",description="采购类型:1.翻单、2.首单、3.备品"),
 *           @SWG\Property(property="ORDER_REMARKS",  type="string",description="备注"),
 *           @SWG\Property(property="ORDER_STATE", type="integer",description="单据状态:1.未审核、2.已审核"),
 *           @SWG\Property(property="DELETED_STATE", type="integer",description="是否删除,1：删除 0：未删除"),
 *           @SWG\Property(property="PRE_ORDER_AT",type="integer",format="int32",description="下单时间"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="AUTITO_AT",type="integer",format="int32",description="审核时间"),
 *           @SWG\Property(property="CLOSING_STATE",type="integer",format="int32",description="是否关账，0：未关账 1：已关账"),
 *           @SWG\Property(property="SYSTEM_GENERATION",type="integer",format="int32",description="是否系统生成,0:否 1：是"),
 *           @SWG\Property(property="ORGANISATION_ID",type="integer",description="采购组织ID"),
 *           @SWG\Property(property="PARTNER_ID",type="integer",description="供应商ID"),
 *           @SWG\Property(property="MONEY_ID",type="integer",description="币种ID"),
 *           @SWG\Property(property="CHANNEL_ID",type="integer",description="平台ID"),
 *           @SWG\Property(property="FUPUSER_ID",type="integer",description="采购跟进人ID"),
 *           @SWG\Property(property="DORGANISATION_ID",type="integer",description="需求组织ID"),
 *           @SWG\Property(property="AUTITO_ID",type="integer",description="审核人ID"),
 *           @SWG\Property(property="CUSER_ID",type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID",type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class PuPurchase extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'pu_purchase';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['SMETHOD', 'PRE_ORDER_AT', 'ORGANISATION_ID', 'PARTNER_ID', 'MONEY_ID', 'CHANNEL_ID', 'DORGANISATION_ID'], 'required'],
            [['SYSTEM_GENERATION', 'PLAN_TYPE', 'SMETHOD', 'ORDER_TYPE', 'ORDER_STATE', 'DELETED_STATE', 'IMPORT_STATE', 'AUTITO_AT', 'CREATED_AT',
                'UPDATED_AT', 'PRE_ORDER_AT', 'CLOSING_STATE', 'ORGANISATION_ID', 'PARTNER_ID', 'MONEY_ID', 'CHANNEL_ID', 'FUPUSER_ID', 'DORGANISATION_ID', 'AUTITO_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['ORDER_AMOUNT'], 'number', 'max' => 9999999999.99],
            [['PU_PURCHASE_CD',], 'string', 'max' => 30],
            [['ORDER_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'PU_PURCHASE_ID' => Yii::t('purchase', '采购订单ID'),
            'PU_PURCHASE_CD' => Yii::t('purchase', '采购订单号'),
            'ORDER_AMOUNT' => Yii::t('purchase', '订单金额'),
            'SMETHOD' => Yii::t('purchase', '结算方式'),
            'ORDER_TYPE' => Yii::t('purchase', '订单类型:1采购订单 2内部采购订单'),
            'ORDER_STATE' => Yii::t('purchase', '单据状态:1.未审核、2.已审核'),
            'DELETED_STATE' => Yii::t('purchase', '是否删除:1：删除 0：未删除'),
            'IMPORT_STATE' => Yii::t('purchase', '数据来源:1.手工创建 2.采购计划下推'),
            'PLAN_TYPE' => Yii::t('purchase', '采购类型:1.翻单、2.首单、3.备品'),
            'ORDER_REMARKS' => Yii::t('purchase', '备注'),
            'AUTITO_AT' => Yii::t('purchase', '审核时间'),
            'PRE_ORDER_AT' => Yii::t('purchase', '下单时间'),
            'CREATED_AT' => Yii::t('purchase', '创建时间'),
            'UPDATED_AT' => Yii::t('purchase', '修改时间'),
            'CLOSING_STATE' => Yii::t('purchase', '是否关账，0：未关账 1：已关账'),
            'SYSTEM_GENERATION' => Yii::t('purchase', '是否系统生成,0:否 1：是'),
            'ORGANISATION_ID' => Yii::t('purchase', '采购组织ID'),
            'PARTNER_ID' => Yii::t('purchase', '供应商ID'),
            'MONEY_ID' => Yii::t('purchase', '币种ID'),
            'CHANNEL_ID' => Yii::t('purchase', '平台ID'),
            'FUPUSER_ID' => Yii::t('purchase', '采购跟进人ID'),
            'DORGANISATION_ID' => Yii::t('purchase', '需求组织ID'),
            'AUTITO_ID' => Yii::t('purchase', '审核人ID'),
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
                    ActiveRecord::EVENT_BEFORE_INSERT => 'PU_PURCHASE_CD',
                ],
                'value' => function ($event) {
                    return Yii::$app->rpc->create('base')->sendAndrecv([['addons\common\base\modellogic\CreateNO', 'createPO'],
                        [1, $this->ORGANISATION_ID, $this->DORGANISATION_ID, $this->CHANNEL_ID, $this->PLAN_TYPE == 3 ? 'SU' : '', $this->PARTNER_ID, $this->PRE_ORDER_AT]]);
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
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CUSER_ID', 'UUSER_ID'],
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
                                                'PRE_ORDER_AT',
                                                'ORGANISATION_ID',
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

    public $realation = ['pu_purchase_detail' => ['PU_PURCHASE_CD' => 'PU_PURCHASE_CD', 'PU_PURCHASE_ID' => 'PU_PURCHASE_ID']];

    public static function addQuery(&$query, $alias)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            #组织权限
            $query->andWhere([$alias . '.ORGANISATION_ID' => Yii::$app->session->get('organization') ?: null]);
            $query->andWhere([$alias . '.DORGANISATION_ID' => Yii::$app->session->get('organization') ?: null]);
        }
    }

    //采购组织编码
    public function getO_organisation()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'ORGANISATION_ID'])->select(['o_organisation.CONTACT', 'o_organisation.PHONE', 'o_organisation.FAX', 'o_organisation.ORGANISATION_ID', 'o_organisation.ORGANISATION_NAME_CN']);
    }

    //需求组织编码
    public function getO_organisation_o()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'DORGANISATION_ID'])->select(['o.ORGANISATION_ID', 'o.ORGANISATION_NAME_CN'])->alias('o');
    }

    //供应商编码
    public function getPa_partner()
    {
        return $this->hasOne(PaPartner::className(), ['PARTNER_ID' => 'PARTNER_ID'])->select(['PARTNER_ID', 'PARTNER_CODE', 'PARTNER_NAME_CN', 'PARTNER_ANAME_CN']);
    }

    //平台编码
    public function getB_channel()
    {
        return $this->hasOne(BChannel::className(), ['CHANNEL_ID' => 'CHANNEL_ID'])->select(['CHANNEL_ID', 'CHANNEL_NAME_CN', 'PLATFORM_TYPE_ID']);
    }

    //币种编码
    public function getB_money()
    {
        return $this->hasOne(BMoney::className(), ['MONEY_ID' => 'MONEY_ID'])->select(['MONEY_ID', 'MONEY_NAME_CN']);
    }

    //采购跟进人编码
    public function getU_userinfo_g()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'FUPUSER_ID'])->select(['*', 'STAFF_NAME_CN' => (new Query())->from('u_staff_info')->select(['STAFF_NAME_CN'])->where('u_staff_info.STAFF_ID = u_user_info.STAFF_ID')]);
    }

    //审核人
    public function getU_userinfo_a()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'AUTITO_ID'])->alias('a')->select(['*', 'STAFF_NAME_CN' => (new Query())->from('u_staff_info')->select(['STAFF_NAME_CN'])->where('u_staff_info.STAFF_ID = a.STAFF_ID')]);
    }

    //创建人
    public function getU_userinfo()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'CUSER_ID'])->alias('u')->select(['*', 'STAFF_NAME_CN' => (new Query())->from('u_staff_info')->select(['STAFF_NAME_CN'])->where('u_staff_info.STAFF_ID = u.STAFF_ID')]);
    }

    //更新人
    public function getU_userinfos()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'UUSER_ID'])->alias('us')->select(['*', 'STAFF_NAME_CN' => (new Query())->from('u_staff_info')->select(['STAFF_NAME_CN'])->where('u_staff_info.STAFF_ID = us.STAFF_ID')]);
    }

    //明细
    public function getPu_purchase_detail()
    {
        return $this->hasMany(PuPurchaseDetail::className(), ['PU_PURCHASE_CD' => 'PU_PURCHASE_CD'])->joinWith(['b_unit', 'g_product_sku']);
    }

    //明细
    public function getPu_purchase_detail_sum()
    {
        $THIS_AMOUNT = (new Query())->from('pu_payment_detail T1')->select(['SUM(T1.THIS_AMOUNT) as THIS_AMOUNT'])->where('pu_purchase_detail.PURCHASE_DETAIL_ID=T1.PURCHASE_DETAIL_ID');
        $THIS_PAID_AMOUNT = (new Query())->from('pu_payment_detail T1')->select(['SUM(T1.THIS_PAID_AMOUNT) as THIS_PAID_AMOUNT'])->where('pu_purchase_detail.PURCHASE_DETAIL_ID=T1.PURCHASE_DETAIL_ID');
        return $this->hasMany(PuPurchaseDetail::className(), ['PU_PURCHASE_CD' => 'PU_PURCHASE_CD'])->joinWith(['b_unit', 'g_product_sku'])->select(['pu_purchase_detail.*', 'THIS_AMOUNT' => $THIS_AMOUNT, 'THIS_PAID_AMOUNT' => $THIS_PAID_AMOUNT]);
    }

    //明细指定字段 - 导出需要
    public function getPu_purchase_detail_export()
    {
        return $this->hasMany(PuPurchaseDetail::className(), ['PU_PURCHASE_CD' => 'PU_PURCHASE_CD']);
    }


    /**
     * 修改的操作
     * before_AUpdate 修改前
     * after_AUpdate 修改后
     */

    public function before_AUpdate($body, $class = null)
    {
        $respone = new ResponeModel();

        $this->load($body, '');
        Yii::$app->BaseHelper->validate($this);

        //有ID 修改操作
        if (isset($body['PU_PURCHASE_ID']) && $body['PU_PURCHASE_ID']) {

            $PuPurchase = static::find()->where(['PU_PURCHASE_ID' => $body['PU_PURCHASE_ID']])->asArray()->one();

            //检验单据状态-排除反审核
            if ($PuPurchase['ORDER_STATE'] == '2') {
                if (isset($body['edit_type'])) {
                    if ($body['edit_type'] !== 3) {
                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', 'The current document has been audited and cannot be operated on!'), [$body])];
//                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', '当前单据已审核，不允许操作！'), [$body])];
                    }
                } else {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', 'The current document has been audited and cannot be operated on!'), [$body])];
//                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', '当前单据已审核，不允许操作！'), [$body])];
                }
            }
            //审核 反审核 删除
            if (isset($body['edit_type'])) {

                if ($body['edit_type'] == 1) {
                    if (!isset($body['pu_purchase_detail']) || count($body['pu_purchase_detail']) == 0) {
                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', 'Document details must have at least one!'), [$body])];
//                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', '单据明细必须有至少一条！'), [$body])];
                    }
                }
                //审核
                if ($body['edit_type'] == 1) {
                    if ($PuPurchase['ORDER_STATE'] == '2') {
                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', 'The current document has been audited and cannot be operated on!'), [$body])];
//                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', '当前单据已审核，不能再次审核！'), [$body])];
                    }
                    //更新审核时间、审核人
                    $user = Yii::$app->getUser();
                    $body['AUTITO_ID'] = $user && !$user->isGuest ? $user->getIdentity()->USER_INFO_ID : '1';
                    $body['AUTITO_AT'] = time();
                }
                //删除 修改删除字段
                if ($body['edit_type'] == 2) {
                    if ($PuPurchase['ORDER_STATE'] == '2') {
                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', 'The current document has been audited and cannot be operated on!'), [$body])];
//                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', '当前单据已审核，不能删除！'), [$body])];
                    }

                }
                //反审核
                if ($body['edit_type'] == 3) {
                    if (!isset($body['allow_back_review'])) {
                        //系统反审核标志
                        if ($PuPurchase['SYSTEM_GENERATION'] == '1') {
                            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', "The system automatically generated documents can not be reverse audited"), [])];
//                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', "系统自动生成的单据不能反审核"), [])];
                        }
                        if ($PuPurchase['ORDER_STATE'] == '1') {
                            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', 'This operation cannot be performed because the current document is not audited!'), [$body])];
//                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', '当前单据未审核，不能反审核！'), [$body])];
                        }
                    }
                    if ($PuPurchase['ORDER_STATE'] == '2') {
                        $Retext = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'purchase_method'], [$PuPurchase, $body]]);
                        if ($Retext !== false) {
                            return [static::ACTION_RETURN, $respone->setModel(500, 0, $Retext, [$body])];
                        }
                        //审核人清空
                        $body['AUTITO_ID'] = '';
                        //审核时间清空
                        $body['AUTITO_AT'] = '';
                    }

                }
            } else {
                //判断是否有至少一条单据明细
                if (!isset($body['pu_purchase_detail']) || count($body['pu_purchase_detail']) == 0) {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', 'Document details must have at least one!'), [$body])];
//                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', '单据明细必须有至少一条！'), [$body])];
                }
                //需求组织如有变动，删除原有明细
                $changedBody = $this->getDirtyAttributes();
                if (array_key_exists('DORGANISATION_ID', $changedBody)) {
                    $did = PuPurchaseDetail::find()->select(['PURCHASE_DETAIL_ID'])->where(['PU_PURCHASE_CD' => $body['PU_PURCHASE_CD']])->column();
                    if (count($did) > 0) {
                        PuPurchaseDetail::deleteAll(['PURCHASE_DETAIL_ID' => $did]);
                    }

                }
            }


        } else {
            //判断是否有至少一条单据明细
            if (!isset($body['pu_purchase_detail']) || count($body['pu_purchase_detail']) == 0) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', 'Document details must have at least one!'), [$body])];
//                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', '单据明细必须有至少一条！'), [$body])];
            }
        }


        return parent::before_AUpdate($body, $class); // TODO: Change the autogenerated stub
    }

    /**
     * after_ACreate
     * 新增后
     * @param $body
     * @param  $class
     * @return array
     * */
    public function after_ACreate($body, $class = null)
    {
        #待出库列表
        if (isset($body['PENDING_DELIVERY_ID'])) {
            $set = array('INTERNAL_PURCHASING_CD' => $this->PU_PURCHASE_CD);
            $where = array('PENDING_DELIVERY_ID' => $body['PENDING_DELIVERY_ID']);
            Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PenddeliveryLogic', 'updateAllPenddelivery'], [$set, $where]]);
        }

        return parent::after_ACreate($body, $class); // TODO: Change the autogenerated stub
    }

    /**
     * after_AUpdate
     * 修改后后
     * @param $body
     * @param  $class
     * @return array
     * */
    public function after_AUpdate($body, $class = null)
    {
        #发运单id存在则
        if (isset($body['edit_type'])) {
            if ($body['edit_type'] == 2) {
                //删除校验通过 - [关联数据回写]通过采购计划下推来的采购订单，如被删除，则上游单据状态从“已下推”回滚为“已审批”
                $PuPurchaseDetailDB = PuPurchaseDetail::find()->select(['PU_PLAN_ID', 'PURCHASE_DETAIL_ID'])->where(array('PU_PURCHASE_CD' => $body['PU_PURCHASE_CD']))->asArray()->all();

                if ($PuPurchaseDetailDB) {
                    $PU_PLAN_ID = [];
                    $PURCHASE_DETAIL_ID = [];
                    foreach ($PuPurchaseDetailDB as $item) {
                        $PURCHASE_DETAIL_ID[] = $item['PURCHASE_DETAIL_ID'];
                        if ($item['PU_PLAN_ID'] !== null && $item['PU_PLAN_ID']) {
                            $PU_PLAN_ID[] = $item['PU_PLAN_ID'];
                        }
                    }
                    if (count($PU_PLAN_ID) > 0) {
                        PuPlan::updateAll(array('PLAN_STATE' => 2), array('PU_PLAN_ID' => $PU_PLAN_ID));
                    }
                    //删除子表
                    PuPurchaseDetail::deleteAll(["PURCHASE_DETAIL_ID" => $PURCHASE_DETAIL_ID]);
                }
            }
        }
        return parent::after_AUpdate($body, $class); // TODO: Change the autogenerated stub
    }

}
