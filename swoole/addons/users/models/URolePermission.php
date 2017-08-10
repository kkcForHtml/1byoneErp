<?php

namespace addons\users\models;

use Yii;
use \yii\swoole\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
/**
 * @SWG\Definition(
 *   definition="users",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="ROLE_PERMISSION_ID", type="integer",description="菜单权限ID"),
 *           @SWG\Property(property="ROLE_INFO_ID", type="integer",description="角色ID"),
 *           @SWG\Property(property="MENUS", type="string",description="菜单ID逗号隔开"),
 *           @SWG\Property(property="PASSWORD", type="string",description="备注"),
 *           @SWG\Property(property="PERMISSION_STATE", type="integer",description="是否启用,1：Y 0：N"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class URolePermission extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'u_role_permission';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ROLE_INFO_ID', 'PERMISSION_STATE', 'CREATED_AT', 'UPDATED_AT', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['MENUS', 'NOTE'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ROLE_PERMISSION_ID' => Yii::t('users', '菜单权限ID'),
            'ROLE_INFO_ID' => Yii::t('users', '角色ID'),
            'MENUS' => Yii::t('users', '菜单ID逗号隔开'),
            'NOTE' => Yii::t('users', '备注'),
            'PERMISSION_STATE' => Yii::t('users', '是否启用,1：Y 0：N'),
            'CREATED_AT' => Yii::t('users', '创建时间'),
            'UPDATED_AT' => Yii::t('users', '修改时间'),
            'CUSER_ID' => Yii::t('users', '创建人ID'),
            'UUSER_ID' => Yii::t('users', '更新人ID'),
        ];
    }

    //创建人
    public function getU_userinfoc()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_CODE' => 'CUSER_CODE'])->alias('c');
    }

    //更新人
    public function getU_userinfou()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_CODE' => 'UUSER_CODE'])->alias('u');
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
//            [
//                'class' => OperatorBehaviors::className(),
//                'attributes' => [
//                    ActiveRecord::EVENT_BEFORE_INSERT => ['CUSER_ID', 'UUSER_ID'],
//                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UUSER_ID'],
//                ],
//            ]
        ];
    }
}
