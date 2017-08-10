<?php

namespace addons\users\models;

use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;

/**
 * This is the model class for table "u_role_user".
 */

/**
 * @SWG\Definition(
 *   definition="URoleUser",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="ROLE_USER_ID", type="integer",description="角色用户ID"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="CUSER_ID", type="string",description="创建人"),
 *           @SWG\Property(property="UUSER_ID", type="string",description="更新人"),
 *           @SWG\Property(property="ROLE_INFO_ID", type="integer",description="角色ID"),
 *           @SWG\Property(property="USER_INFO_ID", type="integer",description="用户ID"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class URoleUser extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'u_role_user';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['CREATED_AT', 'UPDATED_AT', 'ROLE_INFO_ID', 'USER_INFO_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['UUSER_ID', 'CUSER_ID'], 'string', 'max' => 30],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ROLE_USER_ID' => Yii::t('users', '角色用户ID'),
            'CREATED_AT' => Yii::t('users', '创建时间'),
            'UPDATED_AT' => Yii::t('users', '修改时间'),
            'CUSER_ID' => Yii::t('users', '创建人'),
            'UUSER_ID' => Yii::t('users', '更新人'),
            'ROLE_INFO_ID' => Yii::t('users', '角色ID'),
            'USER_INFO_ID' => Yii::t('users', '用户ID'),
            'CUSER_ID' => Yii::t('users', '创建人ID'),
            'UUSER_ID' => Yii::t('users', '更新人ID'),
        ];
    }

    //用户
    public function getU_userInfo()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'USER_INFO_ID'])->joinWith('u_staffinfo')->alias('uu');
    }

    //角色
    public function getU_roleInfo()
    {
        return $this->hasOne(URoleInfo::className(), ['ROLE_INFO_ID' => 'ROLE_INFO_ID'])->alias('ur');
    }

    //创建人
    public function getU_userinfoc()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'CUSER_ID'])->alias('c');
    }

    //更新人
    public function getU_userinfou()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'UUSER_ID'])->alias('u');
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
}
