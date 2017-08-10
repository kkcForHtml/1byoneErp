<?php

namespace addons\master\basics\models;

use addons\users\models\UUserInfo;
use Yii;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\behaviors\OperatorBehaviors;

/**
 * @SWG\Definition(
 *   definition="BAccountCompanyInfo",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"COMPANY_INFO_ID"},
 *           @SWG\Property(property="COMPANY_INFO_ID", type="int",description="账号公司ID"),
 *           @SWG\Property(property="ACCOUNT_ID", type="string",description="账号ID"),
 *           @SWG\Property(property="COMPANY_INFO_NAME", type="string",description="公司名称"),
 *           @SWG\Property(property="COMPANY_INFO_ADDRESS", type="string",description="公司地址"),
 *           @SWG\Property(property="COMPANY_INFO_PHONE", type="string",description="电话"),
 *           @SWG\Property(property="REGIST_CERTIFICATE", type="int",description="税号"),
 *           @SWG\Property(property="COLLECTION_BANK", type="string",description="回款银行信息"),
 *           @SWG\Property(property="COMPANY_INFO_STATE", type="int",description="状态,1：有效 0：废弃"),
 *           @SWG\Property(property="COMPANY_INFO_REMARKS", type="string",description="备注"),
 *           @SWG\Property(property="CREATED_AT", type="int",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT", type="int",description="更新时间"),
 *           @SWG\Property(property="ORGANISATION_ID", type="int",description="所属组织ID"),
 *           @SWG\Property(property="CUSER_ID", type="int",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="int",description="更新人ID")
 *       )
 *   }
 * )
 */
class BAccountCompanyInfo extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'b_account_company_info';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['COMPANY_INFO_STATE', 'ACCOUNT_ID', 'CREATED_AT', 'UPDATED_AT', 'ORGANISATION_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['COMPANY_INFO_PHONE'], 'string', 'max' => 20],
            [['COMPANY_INFO_NAME'], 'string', 'max' => 100],
            [['COMPANY_INFO_ADDRESS', 'COMPANY_INFO_REMARKS'], 'string', 'max' => 255],
            [['REGIST_CERTIFICATE', 'COLLECTION_BANK'], 'string', 'max' => 50],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'COMPANY_INFO_ID' => Yii::t('basics', '账号公司ID'),
            'ACCOUNT_ID' => Yii::t('basics', '账号ID'),
            'COMPANY_INFO_NAME' => Yii::t('basics', '公司名称'),
            'COMPANY_INFO_ADDRESS' => Yii::t('basics', '公司地址'),
            'COMPANY_INFO_PHONE' => Yii::t('basics', '电话'),
            'REGIST_CERTIFICATE' => Yii::t('basics', '税号'),
            'COLLECTION_BANK' => Yii::t('basics', '回款银行信息'),
            'COMPANY_INFO_STATE' => Yii::t('basics', '状态,1：有效 0：废弃'),
            'COMPANY_INFO_REMARKS' => Yii::t('basics', '备注'),
            'CREATED_AT' => Yii::t('basics', '创建时间'),
            'UPDATED_AT' => Yii::t('basics', '修改时间'),
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
