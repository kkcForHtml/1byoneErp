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
 *   definition="BAccountAddress",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"COMPANY_INFO_ID"},
 *           @SWG\Property(property="ADDRESS_ID", type="int",description="账号地址ID"),
 *           @SWG\Property(property="ACCOUNT_ID", type="string",description="账号ID"),
 *           @SWG\Property(property="ADDRESS", type="string",description="地址"),
 *           @SWG\Property(property="TELEPHONE", type="string",description="电话"),
 *           @SWG\Property(property="PURPOSE", type="string",description="用途"),
 *           @SWG\Property(property="ADDRESS_STATE", type="int",description="状态,1：有效 0：废弃"),
 *           @SWG\Property(property="ADDRESS_REMARKS", type="string",description="备注"),
 *           @SWG\Property(property="CREATED_AT", type="int",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT", type="int",description="更新时间"),
 *           @SWG\Property(property="CUSER_ID", type="int",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="int",description="更新人ID")
 *       )
 *   }
 * )
 */
class BAccountAddress extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'b_account_address';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ACCOUNT_ID', 'ADDRESS_STATE', 'CREATED_AT', 'UPDATED_AT', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['ADDRESS', 'ADDRESS_REMARKS'], 'string', 'max' => 255],
            [['TELEPHONE'], 'string', 'max' => 20],
            [['PURPOSE'], 'string', 'max' => 50],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ADDRESS_ID' => Yii::t('basics', '账号地址 ID'),
            'ACCOUNT_ID' => Yii::t('basics', '账号ID'),
            'ADDRESS' => Yii::t('basics', '地址'),
            'TELEPHONE' => Yii::t('basics', '电话'),
            'PURPOSE' => Yii::t('basics', '用途'),
            'ADDRESS_STATE' => Yii::t('basics', '状态,1：Y 0：N'),
            'ADDRESS_REMARKS' => Yii::t('basics', '备注'),
            'CREATED_AT' => Yii::t('basics', '创建时间'),
            'UPDATED_AT' => Yii::t('basics', '修改时间'),
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
