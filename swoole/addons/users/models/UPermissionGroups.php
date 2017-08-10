<?php

namespace addons\users\models;

use Yii;

/**
 * @SWG\Definition(
 *   definition="UPermissionGroups",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="PERMISSION_GROUPS_ID", type="integer",description="权限ID"),
 *           @SWG\Property(property="BUSINESS_OBJECT_ID", type="string",description="业务对象ID"),
 *           @SWG\Property(property="PERMISSIONR_REMARKS",type="string",description="权限说明"),
 *           @SWG\Property(property="INTERFACEURL",type="string",description="接口URL"),
 *           @SWG\Property(property="PERMISSION_NAME_CN",type="string",description="权限名(中文)"),
 *           @SWG\Property(property="PERMISSION_NAME_EN",type="string",description="权限名(英文)"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="CUSER_CODE", type="string",description="创建人"),
 *           @SWG\Property(property="UUSER_CODE", type="string",description="更新人"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class UPermissionGroups extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'u_permission_groups';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['INTERFACEURL'], 'string'],
            [['CREATED_AT', 'UPDATED_AT','RIGHT_STATE', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['PERMISSION_NAME_CN', 'PERMISSION_NAME_EN'], 'string', 'max' => 100],
            [['PERMISSIONR_REMARKS'], 'string', 'max' => 255],
            [['CUSER_CODE', 'UUSER_CODE'], 'string', 'max' => 30],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'PERMISSION_GROUPS_ID' => Yii::t('users', '权限ID'),
            'BUSINESS_OBJECT_ID' => Yii::t('users', '业务对象ID'),
            'PERMISSIONR_REMARKS' => Yii::t('users', '权限说明'),
            'INTERFACEURL' => Yii::t('users', '接口URL'),
            'PERMISSION_NAME_CN' => Yii::t('users', '权限名(中文)'),
            'PERMISSION_NAME_EN' => Yii::t('users', '权限名(英文)'),
            'CREATED_AT' => Yii::t('users', '创建时间'),
            'UPDATED_AT' => Yii::t('users', '修改时间'),
            'CUSER_CODE' => Yii::t('users', '创建人'),
            'UUSER_CODE' => Yii::t('users', '更新人'),
            'CUSER_ID' => Yii::t('users', '创建人ID'),
            'UUSER_ID' => Yii::t('users', '更新人ID'),
        ];
    }
}
