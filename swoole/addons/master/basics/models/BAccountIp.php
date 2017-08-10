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
 *   definition="BAccountIp",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"IP_ID"},
 *           @SWG\Property(property="IP_ID", type="int",description="TP ID"),
 *           @SWG\Property(property="ACCOUNT_ID", type="string",description="账号ID"),
 *           @SWG\Property(property="TP", type="string",description="IP"),
 *           @SWG\Property(property="TP_STATE", type="int",description="状态,1：有效 0：废弃"),
 *           @SWG\Property(property="IP_REMARKS", type="string",description="备注"),
 *           @SWG\Property(property="CREATED_AT", type="int",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT", type="int",description="更新时间"),
 *           @SWG\Property(property="CUSER_ID", type="int",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="int",description="更新人ID")
 *       )
 *   }
 * )
 */
class BAccountIp extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'b_account_ip';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ACCOUNT_ID', 'TP_STATE', 'CREATED_AT', 'UPDATED_AT', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['TP'], 'string', 'max' => 20],
            [['IP_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'IP_ID' => Yii::t('basics', 'TP ID'),
            'ACCOUNT_ID' => Yii::t('basics', '账号ID'),
            'TP' => Yii::t('basics', 'IP'),
            'TP_STATE' => Yii::t('basics', '状态,1：Y 0：N'),
            'IP_REMARKS' => Yii::t('basics', '备注'),
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
