<?php

namespace addons\master\basics\models;

use Yii;
use addons\users\models\UUserInfo;
use yii\behaviors\TimestampBehavior;
use yii\swoole\helpers\ArrayHelper;
use \yii\swoole\db\ActiveRecord;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\behaviors\OperatorBehaviors;


/**
 * @SWG\Definition(
 *   definition="BAccountCredit",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"CHANNEL_ID"},
 *           @SWG\Property(property="CREDIT_ID", type="int",description="信用卡ID"),
 *           @SWG\Property(property="ACCOUNT_ID", type="string",description="账号ID"),
 *           @SWG\Property(property="CREDIT_TYPE", type="string",description="卡类型ID"),
 *           @SWG\Property(property="CREDIT_NUMBER", type="string",description="卡号"),
 *           @SWG\Property(property="VALID_UNTIL", type="int",description="有效期至"),
 *           @SWG\Property(property="HOUSEHOLDER", type="string",description="户主"),
 *           @SWG\Property(property="CREDIT_STATE", type="int",description="仓库分类ID"),
 *           @SWG\Property(property="CREDIT_REMARKS", type="int",description="是否启用"),
 *           @SWG\Property(property="CREATED_AT", type="int",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT", type="int",description="更新时间"),
 *           @SWG\Property(property="CUSER_ID", type="int",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="int",description="更新人ID")
 *       )
 *   }
 * )
 */
class BAccountCredit extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'b_account_credit';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ACCOUNT_ID', 'VALID_UNTIL', 'CREDIT_STATE', 'CREATED_AT', 'UPDATED_AT', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['CREDIT_NUMBER'], 'string', 'max' => 60],
            [['HOUSEHOLDER', 'CREDIT_TYPE'], 'string', 'max' => 30],
            [['CREDIT_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'CREDIT_ID' => Yii::t('basics', '信用卡ID'),
            'ACCOUNT_ID' => Yii::t('basics', '账号ID'),
            'CREDIT_TYPE' => Yii::t('basics', '卡类型'),
            'CREDIT_NUMBER' => Yii::t('basics', '卡号'),
            'VALID_UNTIL' => Yii::t('basics', '有效期至'),
            'HOUSEHOLDER' => Yii::t('basics', '户主'),
            'CREDIT_STATE' => Yii::t('basics', '状态,1：Y 0：N'),
            'CREDIT_REMARKS' => Yii::t('basics', '备注'),
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
