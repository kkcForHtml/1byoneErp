<?php

namespace addons\master\partint\models;

use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;

use addons\users\models\UUserInfo;

/**
 * @SWG\Definition(
 *   definition="PaPartnerContact",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="CONTACT_ID", type="integer",,format="int32",description="伙伴联系ID"),
 *           @SWG\Property(property="CONTACT", type="string",description="联系人"),
 *           @SWG\Property(property="PHONE", type="string",description="手机号"),
 *           @SWG\Property(property="TEL", type="string",description="座机号码"),
 *           @SWG\Property(property="EMAIL", type="string",description="Email"),
 *           @SWG\Property(property="FAX", type="string",description="传真"),
 *           @SWG\Property(property="DEFAULTS", type="integer",format="int32",description="默认 1:勾选 0:未勾选"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *			 @SWG\Property(property="PARTNER_ID", type="integer",description="伙伴ID"),
 *			 @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class PaPartnerContact extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'pa_partner_contact';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['CREATED_AT', 'UPDATED_AT','DEFAULTS','PARTNER_ID','CUSER_ID','UUSER_ID'], 'integer'],
            [['PHONE'], 'string', 'max' => 20],
            [['CONTACT', 'EMAIL'], 'string', 'max' => 30],
            [['TEL', 'FAX'], 'string', 'max' => 16],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'CONTACT_ID' => Yii::t('partint', '伙伴联系ID'),
            'CONTACT' => Yii::t('partint', '联系人'),
            'PHONE' => Yii::t('partint', '手机号'),
            'TEL' => Yii::t('partint', '座机号码'),
            'EMAIL' => Yii::t('partint', 'Email'),
            'FAX' => Yii::t('partint', '传真'),
            'DEFAULTS'=> Yii::t('partint', '默认 1:勾选 0:未勾选'),
            'CREATED_AT' => Yii::t('partint', '创建时间'),
            'UPDATED_AT' => Yii::t('partint', '修改时间'),
			'PARTNER_ID' => Yii::t('partint', '伙伴ID'),
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
}
