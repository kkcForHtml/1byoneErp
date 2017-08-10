<?php

namespace addons\master\basics\models;

use addons\master\product\models\GProductSkuFnsku;
use addons\organization\models\OOrganisation;
use addons\purchase\models\PuPlan;
use addons\purchase\models\PuPurchaseDetail;
use addons\users\models\UUserInfo;
use Yii;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;
use yii\swoole\db\Query;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\behaviors\OperatorBehaviors;

/**
 * @SWG\Definition(
 *   definition="BAccount",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"ACCOUNT_ID"},
 *           @SWG\Property(property="ACCOUNT_ID", type="int",description="账号ID"),
 *           @SWG\Property(property="ACCOUNT", type="string",description="账号"),
 *           @SWG\Property(property="MERCHANTID", type="string",description="MERCHANTID"),
 *           @SWG\Property(property="SALES_BRAND_TYPE", type="string",description="品牌"),
 *           @SWG\Property(property="ACCOUNT_STATE", type="int",description="账号状态"),
 *           @SWG\Property(property="ACCOUNT_REMARKS", type="string",description="备注"),
 *           @SWG\Property(property="CREATED_AT", type="int",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT", type="int",description="更新时间"),
 *           @SWG\Property(property="AREA_ID", type="int",description="地区ID"),
 *           @SWG\Property(property="COUNTRY_ID", type="int",description="国家ID"),
 *           @SWG\Property(property="ORGANISATION_ID", type="int",description="所属组织ID"),
 *           @SWG\Property(property="CHANNEL_ID", type="int",description="平台ID"),
 *           @SWG\Property(property="CUSER_ID", type="int",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="int",description="更新人ID")
 *       )
 *   }
 * )
 */
class BAccount extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'b_account';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ACCOUNT_ID'], 'safe'],
            [['ACCOUNT', 'ORGANISATION_ID', 'COUNTRY_ID', 'AREA_ID', 'CHANNEL_ID', 'MERCHANTID'], 'required'],
            [['ACCOUNT_STATE', 'CREATED_AT', 'UPDATED_AT', 'CHANNEL_ID', 'AREA_ID', 'COUNTRY_ID', 'ORGANISATION_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['ACCOUNT', 'MERCHANTID'], 'string', 'max' => 30],
            [['SALES_BRAND_TYPE'], 'string', 'max' => 20],
            [['ACCOUNT_REMARKS'], 'string', 'max' => 255],
            [['MwsMP', 'MwsAKey', 'MwsSKey', 'MURL'], 'string', 'max' => 125]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ACCOUNT_ID' => Yii::t('basics', '账号表ID'),
            'ACCOUNT' => Yii::t('basics', '账号'),
            'MERCHANTID' => Yii::t('basics', 'MerchantID'),
            'SALES_BRAND_TYPE' => Yii::t('basics', '销售品牌类型,多选逗号隔开'),
            'ACCOUNT_STATE' => Yii::t('basics', '是否启用,1：Y 0：N'),
            'ACCOUNT_REMARKS' => Yii::t('basics', '备注'),
            'MwsMP' => Yii::t('basics', 'MwsMarketPlaceld'),
            'MwsAKey' => Yii::t('basics', 'MwsAccessKey'),
            'MwsSKey' => Yii::t('basics', 'MwsSecretKey'),
            'MURL' => Yii::t('basics', 'URL'),
            'CREATED_AT' => Yii::t('basics', '创建时间'),
            'UPDATED_AT' => Yii::t('basics', '修改时间'),
            'CHANNEL_ID' => Yii::t('basics', '所属平台ID'),
            'AREA_ID' => Yii::t('basics', '地区ID'),
            'COUNTRY_ID' => Yii::t('basics', '国家ID'),
            'ORGANISATION_ID' => Yii::t('basics', '所属组织ID'),
            'CUSER_ID' => Yii::t('basics', '创建人ID'),
            'UUSER_ID' => Yii::t('basics', '更新人ID'),
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

    public $realation = ['b_account_address' => ['ACCOUNT_ID' => 'ACCOUNT_ID'],
        'b_account_company_info' => ['ACCOUNT_ID' => 'ACCOUNT_ID'],
        'b_account_credit' => ['ACCOUNT_ID' => 'ACCOUNT_ID'],
        'b_account_ip' => ['ACCOUNT_ID' => 'ACCOUNT_ID'],
        'b_sales_product_type' => ['ACCOUNT_ID' => 'ACCOUNT_ID']
    ];

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

    public function getB_account_credit()
    {
        return $this->hasMany(BAccountCredit::className(), ['ACCOUNT_ID' => 'ACCOUNT_ID']);
    }

    public function getB_account_company_info()
    {
        return $this->hasMany(BAccountCompanyInfo::className(), ['ACCOUNT_ID' => 'ACCOUNT_ID']);
    }

    public function getB_account_address()
    {
        return $this->hasMany(BAccountAddress::className(), ['ACCOUNT_ID' => 'ACCOUNT_ID']);
    }

    public function getB_account_ip()
    {
        return $this->hasMany(BAccountIp::className(), ['ACCOUNT_ID' => 'ACCOUNT_ID']);
    }

    //组织
    public function getO_organisation()
    {
        return $this->hasMany(OOrganisation::className(), ['ORGANISATION_ID' => 'ORGANISATION_ID']);
    }

    //平台
    public function getB_channel()
    {
        return $this->hasMany(BChannel::className(), ['CHANNEL_ID' => 'CHANNEL_ID']);
    }

    //销售产品中间表
    public function getB_sales_product_type()
    {
        return $this->hasMany(BSalesProductType::className(), ['ACCOUNT_ID' => 'ACCOUNT_ID']);
    }

    /**
     * 账号信息更新的操作
     * before_AUpdate 更新前
     * after_ACreate 更新后
     */
    public function before_AUpdate($body, $class = null)
    {
        $respone = new ResponeModel();

        //销售产品中间表全部删除再新增
        if (isset($body['b_sales_product_type'])) {
            BSalesProductType::deleteAll(['ACCOUNT_ID' => $body['ACCOUNT_ID']]);
        }
        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 账号管理删除的操作
     * before_ADelete 删除前
     * after_ADelete 删除后
     */
    public function before_ADelete($body, $class = null)
    {
        $respone = new ResponeModel();
        //映射表
        $exitData = (new Query())->from(GProductSkuFnsku::tableName())->where(['=', 'ACCOUNT_ID', $this->ACCOUNT_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This account has been used by other documents and cannot be deleted!"), [$body])];
        }
        //采购计划表
        $exitData = (new Query())->from(PuPlan::tableName())->where(['=', 'ACCOUNT_ID', $this->ACCOUNT_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This account has been used by other documents and cannot be deleted!"), [$body])];
        }
        //采购订单明细表
        $exitData = (new Query())->from(PuPurchaseDetail::tableName())->where(['=', 'ACCOUNT_ID', $this->ACCOUNT_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This account has been used by other documents and cannot be deleted!"), [$body])];
        }
        BAccountCredit::deleteAll(['ACCOUNT_ID' => $this->ACCOUNT_ID]);
        BAccountCompanyInfo::deleteAll(['ACCOUNT_ID' => $this->ACCOUNT_ID]);
        BAccountAddress::deleteAll(['ACCOUNT_ID' => $this->ACCOUNT_ID]);
        BAccountIp::deleteAll(['ACCOUNT_ID' => $this->ACCOUNT_ID]);
        return [$this::ACTION_NEXT, $body];
    }

}
