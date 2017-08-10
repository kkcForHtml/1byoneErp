<?php

/**
 * Created by PhpStorm.
 * User: AM02
 * Date: 2017/5/3
 * Time: 15:38
 */

namespace addons\users\modellogic;

use addons\users\models\URoleInfo;
use addons\users\models\URoleUser;
use Yii;
use addons\users\models\UPersonalRole;
use addons\users\models\UAuthorisation;
use addons\users\modellogic\userPermissionLogic;
use addons\users\modellogic\rolePermissionLogic;
use \yii\swoole\rest\ResponeModel;

class businesLogic
{
    /**根据角色或者用户查询对应的拥有权限的子系统
     * @param $post
     * @return array
     */
public static function getBusiniesByUserOrRole($post){

    //判断传参非空
    if(!isset($post['USER_INFO_ID']) && !isset($post['ROLE_INFO_ID'] )){
        return  array();
    } else if (isset($post['USER_INFO_ID'])){
        $where=[ 'u.USER_INFO_ID'=> $post['USER_INFO_ID']];
        $tableStr = 'u_personal_role u';
        $systems = array();
        //个人权限业务子系统查询
        $systems = (new \yii\db\Query())
            ->select('s.*')
            ->from($tableStr)
            ->leftJoin('u_permission_groups AS g','u.PERMISSION_GROUPS_ID = g.PERMISSION_GROUPS_ID')
            ->leftJoin('u_business_system AS s','g.BUSINESS_OBJECT_ID = s.BUSINESS_OBJECT_ID')
            ->where($where)
            ->distinct()
            ->all();
        //查询个人权限表，获取权限id
        $permissionids = UPersonalRole::find()->select(['PERMISSION_GROUPS_ID','USER_INFO_ID'])->where(['USER_INFO_ID' => $post['USER_INFO_ID']])->asArray()->all();
        $newArry = [];
        $whereGroup = [];
        if(count($permissionids) > 0){
            foreach ($permissionids as $item) {
                array_push($newArry,$item['PERMISSION_GROUPS_ID']);
            }
        }
        $whereGroup = ['not in', 'u.PERMISSION_GROUPS_ID', $newArry];
        $roleInfo = URoleUser::find()->select(['ROLE_INFO_ID','USER_INFO_ID'])->where(['USER_INFO_ID' => $post['USER_INFO_ID']])->asArray()->all();
        $rolesystems = array();
        if(count($roleInfo) > 0){
            foreach ($roleInfo as $role) {
                if(count($newArry)>0){
                    $roleInfoSys = static::getSystems($role['ROLE_INFO_ID'],$whereGroup);
                }else{
                    $roleInfoSys = static::getSystems($role['ROLE_INFO_ID'],[]);
                }
                $rolesystems = array_merge($rolesystems, $roleInfoSys);
            }
        }
        $systems = array_merge($systems,$rolesystems);
    }else if (isset($post['ROLE_INFO_ID'])){
        $where=[ 'u.ROLE_INFO_ID'=> $post['ROLE_INFO_ID']];
        if(is_array($post['ROLE_INFO_ID'])){
            $where = ["in","u.ROLE_INFO_ID",$post['ROLE_INFO_ID']];
        }
        $tableStr = 'u_authorisation u';

        //权限子系统查询
        $systems = (new \yii\db\Query())
            ->select('s.*')
            ->from($tableStr)
            ->leftJoin('u_permission_groups AS g','u.PERMISSION_GROUPS_ID = g.PERMISSION_GROUPS_ID')
            ->leftJoin('u_business_system AS s','g.BUSINESS_OBJECT_ID = s.BUSINESS_OBJECT_ID')
            ->where($where)
            ->distinct()
            ->all();
    }
    return $systems;
}
    /**查询不在个人权限的角色权限业务系统
     * @param $post
     * @return array
     */
    public static function getSystems($roleID,$where){
        $con['u.ROLE_INFO_ID'] = $roleID;
        $roleType = URoleInfo::find()->select(['ROLE_INFO_ID','ROLE_TYPE_ID'])->where(['ROLE_INFO_ID' => $roleID])->asArray()->one();
        if($roleType['ROLE_TYPE_ID']!=3){
            $roleSystems = (new \yii\db\Query())
                ->select('s.*')
                ->from('u_authorisation u')
                ->leftJoin('u_permission_groups AS g','u.PERMISSION_GROUPS_ID = g.PERMISSION_GROUPS_ID')
                ->leftJoin('u_business_system AS s','g.BUSINESS_OBJECT_ID = s.BUSINESS_OBJECT_ID')
                ->where($where)
                ->andWhere($con)
                ->distinct()
                ->all();
        }else{
            $roleSystems = (new \yii\db\Query())
                ->select('s.*')
                ->from('u_business_system s')
                ->leftJoin('u_permission_groups AS u','u.BUSINESS_OBJECT_ID = s.BUSINESS_OBJECT_ID')
                ->distinct()
                ->all();
        }

        return $roleSystems;
    }




}