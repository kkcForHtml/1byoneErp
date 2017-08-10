<?php

namespace addons\users\models;

use Yii;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use yii\swoole\db\ActiveRecord;



/**
 * @SWG\Definition(
 *   definition="UAuthorisation",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="AUTHORISATION_ID", type="integer",description="权限管理表ID"),
 *           @SWG\Property(property="PERMISSION_GROUPS_ID", type="string",description="权限ID"),
 *           @SWG\Property(property="AUTHORISATION_STATE",type="integer",description="是否有权,1：设置 0未设置"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="ROLE_INFO_ID", type="integer",description="角色ID"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class UAuthorisation extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'u_authorisation';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PERMISSION_GROUPS_ID', 'AUTHORISATION_STATE', 'CREATED_AT', 'UPDATED_AT', 'ROLE_INFO_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'AUTHORISATION_ID' => Yii::t('users', '权限管理表ID'),
            'ROLE_INFO_ID' => Yii::t('users', '角色编码'),
            'PERMISSION_GROUPS_ID' => Yii::t('users', '权限ID'),
            'AUTHORISATION_STATE' => Yii::t('users', '是否有权,1：设置 0未设置'),
            'CREATED_AT' => Yii::t('users', '创建时间'),
            'UPDATED_AT' => Yii::t('users', '修改时间'),
            'ROLE_INFO_ID' => Yii::t('users', '角色ID'),
            'CUSER_ID' => Yii::t('users', '创建人ID'),
            'UUSER_ID' => Yii::t('users', '更新人ID'),
        ];
    }

    //权限
    public function getU_permission_groups()
    {
        return $this->hasOne(UPermissionGroups::className(), ['PERMISSION_GROUPS_ID' => 'PERMISSION_GROUPS_ID']);
    }

    //关联添加配置(权限)
    public $realation = ['u_permission_groups' => ['PERMISSION_GROUPS_ID' => 'PERMISSION_GROUPS_ID']];

    /** 角色授权
     * @param $post
     * @return mixed
     */
    public static function authority($post){
        $respone = new ResponeModel();
        $roleCode =  $post['ROLE_INFO_ID'];
        $info =  $post['PERMISSION_INFO'];
        //先删除，后新增
        UAuthorisation::deleteAll('ROLE_INFO_ID=:roleCode',[':roleCode'=>$roleCode]);
        foreach($info as $key=>$value) {
            $roleAuth = new UAuthorisation();
            $roleAuth->PERMISSION_GROUPS_ID = $value['PERMISSION_GROUPS_ID'];
            $roleAuth->AUTHORISATION_STATE = $value['STATE'];
            $roleAuth->ROLE_INFO_ID = $roleCode;
            $result = $roleAuth->save(false);
            if (!$result) {
                return $respone->setModel(500, 0, Yii::t('users', "License failed."), $post);
//                return $respone->setModel(500, 0, "授权失败", $post);
            }
        }
        return $respone->setModel(200, 0, Yii::t('users', "License success."), $post);
//        return $respone->setModel(200, 0, "授权成功", $post);
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
                'class'=>OperatorBehaviors::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CUSER_ID','UUSER_ID'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UUSER_ID'],
                ],
            ]
        ];
    }
}
