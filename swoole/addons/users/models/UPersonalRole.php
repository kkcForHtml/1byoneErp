<?php

namespace addons\users\models;

use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use yii\swoole\db\ActiveRecord;
use \yii\swoole\rest\ResponeModel;


/**
 * @SWG\Definition(
 *   definition="UPersonalRole",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="PERSONAL_ROLE_ID", type="integer",description="个人权限表ID"),
 *           @SWG\Property(property="PERMISSION_GROUPS_ID", type="string",description="权限ID"),
 *           @SWG\Property(property="ROLE_USER_STATE", type="string",description="是否有权,1：启用 0禁用"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="USER_INFO_ID", type="integer",description="用户ID"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class UPersonalRole extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'u_personal_role';
    }


    /**个人权限表授权
     * @param $post
     */
    public static function authority($post)
    {
        $respone = new ResponeModel();
        $userCode = $post['USER_INFO_ID'];
        $info = $post['PERMISSION_INFO'];
        $roleInfo = $post['roleInfo'];
        //先删除，后新增
        UPersonalRole::deleteAll('USER_INFO_ID=:userCode', [':userCode' => $userCode]);

        foreach ($info as $key => $value) {
            $personrole = new UPersonalRole();
            $personrole->PERMISSION_GROUPS_ID = $value['PERMISSION_GROUPS_ID'];
            $personrole->ROLE_USER_STATE = $value['STATE'];
            $personrole->USER_INFO_ID = $userCode;
            $result = $personrole->save(false);
            if (!$result) {
//              return $respone->setModel(500, 0, "授权失败", $post);
                return $respone->setModel(500, 0, Yii::t('users', "License failed."), $post);
            }
        }
        foreach ($roleInfo as $key => $value) {
            $role = URoleUser::find()->where(['USER_INFO_ID'=>$userCode])->asArray()->all();
            foreach($role as $roleKey => $roleValue){
                $isExists = UAuthorisation::find()->where(['PERMISSION_GROUPS_ID'=>$value['PERMISSION_GROUPS_ID']])->andWhere(['ROLE_INFO_ID'=>$roleValue['ROLE_INFO_ID']])->exists();
                if($isExists){
                    UAuthorisation::deleteAll(['and','PERMISSION_GROUPS_ID'=>$value['PERMISSION_GROUPS_ID'],'ROLE_INFO_ID'=>$roleValue['ROLE_INFO_ID']]);
                }
                $roleAuth = new UAuthorisation();
                $roleAuth->PERMISSION_GROUPS_ID = $value['PERMISSION_GROUPS_ID'];
                $roleAuth->AUTHORISATION_STATE = $value['STATE'];
                $roleAuth->ROLE_INFO_ID = $roleValue['ROLE_INFO_ID'];
                $result = $roleAuth->save(false);
                if (!$result) {
                    return $respone->setModel(500, 0, Yii::t('users', "License failed."), $post);
//                return $respone->setModel(500, 0, "授权失败", $post);
                }
            }

        }


//      return $respone->setModel(200, 0, "授权成功", $post);
        return $respone->setModel(200, 0, Yii::t('users', "License success."), $post);
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PERMISSION_GROUPS_ID', 'ROLE_USER_STATE', 'CREATED_AT', 'UPDATED_AT', 'USER_INFO_ID', 'CUSER_ID', 'UUSER_ID'], 'integer']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'PERSONAL_ROLE_ID' => Yii::t('users', '个人权限表ID'),
            'PERMISSION_GROUPS_ID' => Yii::t('users', '权限ID'),
            'ROLE_USER_STATE' => Yii::t('users', '是否禁用,1：启用 0禁用'),
            'CREATED_AT' => Yii::t('users', '创建时间'),
            'UPDATED_AT' => Yii::t('users', '修改时间'),
            'USER_INFO_ID' => Yii::t('users', '用户ID'),
            'CUSER_ID' => Yii::t('users', '创建人ID'),
            'UUSER_ID' => Yii::t('users', '更新人ID'),
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
}
