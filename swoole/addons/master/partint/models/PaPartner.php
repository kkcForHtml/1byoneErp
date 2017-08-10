<?php

namespace addons\master\partint\models;

use addons\inventory\models\SkAdjustment;
use addons\inventory\models\SkPlacing;
use addons\master\product\models\GProductSkuPurchasingPrice;
use addons\master\product\models\GProductSkuSupplier;
use addons\sales\models\CrSalesOrder;
use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;
use yii\swoole\db\Query;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\helpers\ArrayHelper;

use addons\users\models\UUserInfo;
use addons\master\basics\models\BMoney;

/**
 * @SWG\Definition(
 *   definition="PaPartner",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="PARTNER_ID", type="integer",,format="int32",description="伙伴ID"),
 *           @SWG\Property(property="PARTNER_CODE", type="string",description="伙伴编码"),
 *           @SWG\Property(property="PARTNER_NAME_CN", type="string",description="伙伴名称(中文)"),
 *           @SWG\Property(property="PARTNER_NAME_EN", type="string",description="伙伴名称(英文)"),
 *           @SWG\Property(property="PARTNER_ANAME_CN", type="string",description="简称(中文)"),
 *           @SWG\Property(property="PARTNER_ANAME_EN", type="string",description="简称(英文)"),
 *           @SWG\Property(property="BELONG_TO_ID", type="integer",format="int32",description="货物所属ID"),
 *           @SWG\Property(property="PARTNER_DECLARE",type="integer",format="int32",description="USD厂家是否报关,1：Y 0：N"),
 *           @SWG\Property(property="SMETHOD", type="string",description="结算方式"),
 *           @SWG\Property(property="PARTNER_ADDRESS", type="string",description="详细地址"),
 *           @SWG\Property(property="PARTNER_LEGAL", type="string",description="法人代表"),
 *           @SWG\Property(property="BUSINESS_LICENCE", type="string",description="营业执照注册号"),
 *           @SWG\Property(property="TAXPAYER_REGIST_CERTIFICATE", type="string",description="税务登记号"),
 *           @SWG\Property(property="TAX_RATE", type="string",description="税率"),
 *           @SWG\Property(property="ACCOUNT_NAME", type="string",description="户名"),
 *           @SWG\Property(property="OPEN_ACCOUNT_BANK", type="string",description="开户行"),
 *           @SWG\Property(property="BANK_ACCOUNT", type="string",description="银行账号"),
 *           @SWG\Property(property="PARTNER_STATE", type="integer",format="int32",description="是否启用,1：Y 0：N"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *			 @SWG\Property(property="CLASSIFY_ID", type="integer",description="伙伴分类ID"),
 *           @SWG\Property(property="MONEY_ID", type="integer",description="币种ID"),
 *			 @SWG\Property(property="AREA_ID", type="integer",description="地区ID"),
 *			 @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class PaPartner extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'pa_partner';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PARTNER_CODE', 'PARTNER_NAME_CN', 'PARTNER_ANAME_CN'], 'required'],
            [['BELONG_TO_ID', 'PARTNER_DECLARE', 'PARTNER_STATE', 'CREATED_AT', 'UPDATED_AT', 'SMETHOD','CLASSIFY_ID','MONEY_ID','AREA_ID','CUSER_ID','UUSER_ID'], 'integer'],
            [['PARTNER_CODE'], 'string', 'max' => 20],
            [['PARTNER_NAME_CN', 'PARTNER_NAME_EN', 'ACCOUNT_NAME'], 'string', 'max' => 100],
            [['PARTNER_ANAME_CN', 'PARTNER_ANAME_EN'], 'string', 'max' => 50],
            [['PARTNER_LEGAL'], 'string', 'max' => 30],
            [['PARTNER_ADDRESS'], 'string', 'max' => 255],
            [['BUSINESS_LICENCE', 'TAXPAYER_REGIST_CERTIFICATE', 'OPEN_ACCOUNT_BANK'], 'string', 'max' => 128],
            [['TAX_RATE'], 'string', 'max' => 10],
            [['BANK_ACCOUNT'], 'string', 'max' => 60],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'PARTNER_ID' => Yii::t('partint', '伙伴ID'),
            'PARTNER_CODE' => Yii::t('partint', '伙伴编码'),
            'PARTNER_NAME_CN' => Yii::t('partint', '伙伴名称(中文)'),
            'PARTNER_NAME_EN' => Yii::t('partint', '伙伴名称(英文)'),
            'PARTNER_ANAME_CN' => Yii::t('partint', '简称(中文)'),
            'PARTNER_ANAME_EN' => Yii::t('partint', '简称(英文)'),
            'BELONG_TO_ID' => Yii::t('partint', '货物所属ID'),
            'PARTNER_DECLARE' => Yii::t('partint', 'USD厂家是否报关,1：Y 0：N'),
            'SMETHOD' => Yii::t('partint', '结算方式'),
            'PARTNER_STATE' => Yii::t('partint', '是否启用,1：Y 0：N'),
            'PARTNER_ADDRESS' => Yii::t('partint', '详细地址'),
            'PARTNER_LEGAL' => Yii::t('partint', '法人代表'),
            'BUSINESS_LICENCE' => Yii::t('partint', '营业执照注册号'),
            'TAXPAYER_REGIST_CERTIFICATE' => Yii::t('partint', '税务登记号'),
            'TAX_RATE' => Yii::t('partint', '税率'),
            'ACCOUNT_NAME' => Yii::t('partint', '户名'),
            'OPEN_ACCOUNT_BANK' => Yii::t('partint', '开户行'),
            'BANK_ACCOUNT' => Yii::t('partint', '银行账号'),
            'CREATED_AT' => Yii::t('partint', '创建时间'),
            'UPDATED_AT' => Yii::t('partint', '修改时间'),
			'CLASSIFY_ID' => Yii::t('partint', '伙伴分类ID'),
			'MONEY_ID' => Yii::t('partint', '币种ID'),
			'AREA_ID' => Yii::t('partint', '地区ID'),
			'CUSER_ID' => Yii::t('partint', '创建人ID'),
			'UUSER_ID' => Yii::t('partint', '更新人ID'),
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

    //币种
    public function getB_money()
    {
        return $this->hasOne(BMoney::className(), ['MONEY_ID' => 'MONEY_ID']);
    }

    //伙伴分类
    public function getPa_partner_classify()
    {
        return $this->hasOne(PaPartnerClassify::className(), ['CLASSIFY_ID' => 'CLASSIFY_ID']);
    }

    //联系人
    public function getPa_partner_contact()
    {
        return $this->hasMany(PaPartnerContact::className(), ['PARTNER_ID' => 'PARTNER_ID']);
    }

    public $realation = ['pa_partner_contact' => ['PARTNER_ID' => 'PARTNER_ID']];


    /**
     * 伙伴新增的操作
     * before_ACreate 新增前
     * after_ACreate 新增后
     */

    public function before_ACreate($body, $class = null)
    {

        $respone = new ResponeModel();
        $this->load($body, '');
        Yii::$app->BaseHelper->validate($this);
        // 查询数据库表，判断分类名称是否是唯一性
        $SKUDB = self::find()->where(['or', ['PARTNER_CODE' => $body['PARTNER_CODE']], ['PARTNER_NAME_CN' => $body['PARTNER_NAME_CN']]])->exists();
        if ($SKUDB) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('partint', "The encoding or Chinese name has been repeated. Please do not submit it again!"), [$body])];
        }
        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 伙伴修改的操作
     * before_AUpdate 修改前
     * after_AUpdate 修改后
     */
    public function before_AUpdate($body, $class = null)
    {
        $respone = new ResponeModel();

        // 判断是否是编辑操作
        if (isset($body['edit_type']) && $body['edit_type']) {
            $this->load($body, '');
            Yii::$app->BaseHelper->validate($this);
            $body = ArrayHelper::merge($this->toArray(), $body);

            // 查询数据库表，判断分类名称是否是唯一性
            $GproductType = static::find()->where(['<>', 'PARTNER_ID', $body['PARTNER_ID']])->andWhere(['or', ['PARTNER_CODE' => $body['PARTNER_CODE']], ['PARTNER_NAME_CN' => $body['PARTNER_NAME_CN']]])->exists();
            if ($GproductType) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('partint', "The encoding or Chinese name has been repeated. Please do not submit it again!"), [$body])];
            }
            $Gproduct = static::find()->where(['PARTNER_ID' => $body['PARTNER_ID']])->asArray()->one();
            if ($Gproduct['PARTNER_CODE'] !== $body['PARTNER_CODE']) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('partint', "Partner code prohibits modification!"), [$body])];
            }

        }

        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 伙伴信息删除的操作
     * before_ADelete 删除前
     * after_ADelete 删除后
     */
    public function before_ADelete($body, $class = null)
    {
        $respone = new ResponeModel();
        //产品SKU供应商表
        $exitData = (new Query())->from(GProductSkuSupplier::tableName())->where(['=', 'PARTNER_ID', $this->PARTNER_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This partner has been used by other documents and cannot be deleted!"), [$body])];
        }
        //产品SKU采购价格表
        $exitData = (new Query())->from(GProductSkuPurchasingPrice::tableName())->where(['=', 'PARTNER_ID', $this->PARTNER_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This partner has been used by other documents and cannot be deleted!"), [$body])];
        }
        //出库表
        $exitData = (new Query())->from(SkPlacing::tableName())->where(['=', 'PPARTNER_ID', $this->PARTNER_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This partner has been used by other documents and cannot be deleted!"), [$body])];
        }
        //销售订单表
        $exitData = (new Query())->from(CrSalesOrder::tableName())->where(['=', 'PARTNER_ID', $this->PARTNER_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This partner has been used by other documents and cannot be deleted!"), [$body])];
        }
        return [$this::ACTION_NEXT, $body];
    }

}
