<?php

namespace addons\users\models;

use Yii;

/**
 * @SWG\Definition(
 *   definition="UBusinessSystem",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="BUSINESS_SYSTEM_ID", type="integer",description="业务系统ID"),
 *           @SWG\Property(property="SUBSYSTEMID", type="string",description="子系统ID"),
 *           @SWG\Property(property="FUNC_MODULE_ID", type="string",description="功能模块ID"),
 *           @SWG\Property(property="BUSINESS_OBJECT_ID",type="string",description="业务对象ID"),
 *           @SWG\Property(property="SUBSYSTEM",type="string",description="子系统名称"),
 *           @SWG\Property(property="FUNC_MODULE",type="string",description="模块功能名称"),
 *           @SWG\Property(property="BUSINESS_OBJECT",type="string",description="业务对象名称"),
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
class UBusinessSystem extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'u_business_system';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['CREATED_AT', 'UPDATED_AT', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['BUSINESS_OBJECT_ID', 'FUNC_MODULE_ID', 'SUBSYSTEMID'], 'string', 'max' => 32],
            [['BUSINESS_OBJECT', 'FUNC_MODULE','SUBSYSTEM'], 'string', 'max' => 100],
            [['UUSER_CODE', 'CUSER_CODE'], 'string', 'max' => 30],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'BUSINESS_SYSTEM_ID' => Yii::t('users', '业务系统ID'),
            'SUBSYSTEMID' => Yii::t('users', '子系统ID'),
            'FUNC_MODULE_ID' => Yii::t('users', '功能模块ID'),
            'BUSINESS_OBJECT_ID' => Yii::t('users', '业务对象ID'),
            'SUBSYSTEM' => Yii::t('users', '子系统名称'),
            'FUNC_MODULE' => Yii::t('users', '模块功能名称'),
            'BUSINESS_OBJECT' => Yii::t('users', '业务对象名称'),
            'CREATED_AT' => Yii::t('users', '创建时间'),
            'UPDATED_AT' => Yii::t('users', '修改时间'),
            'CUSER_CODE' => Yii::t('users', '创建人'),
            'UUSER_CODE' => Yii::t('users', '更新人'),
            'CUSER_ID' => Yii::t('users', '创建人ID'),
            'UUSER_ID' => Yii::t('users', '更新人ID'),
        ];
    }
}
