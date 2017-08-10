<?php

/**
 * Created by PhpStorm.
 * User: AM02
 * Date: 2017/5/3
 * Time: 15:38
 */

namespace addons\users\modellogic;

use Yii;
use addons\users\models\UPersonalRole;
use addons\users\models\UAuthorisation;
use addons\users\modellogic\userPermissionLogic;
use addons\users\modellogic\rolePermissionLogic;
use \yii\swoole\rest\ResponeModel;

class permissionGroupLogic
{
    /**根据子系统模块查询角色或者用户的权限组
     * @param $post
     * @return array
     */
public static function permissionsearch($post){
    $permissions = array();

    //判断传参非空
    if(!isset($post['BUSINESS_OBJECT_ID']) && !isset($post['ROLE_INFO_ID']) && !isset($post['USER_INFO_ID'])){
        return  array();
    }
    else if (isset($post['USER_INFO_ID'])){

            //用户对应业务对象模块权限
            $condition['USER_INFO_ID'] = $post['USER_INFO_ID'];
            $condition['BUSINESS_OBJECT_ID'] = $post['BUSINESS_OBJECT_ID'];
            $condition['needRolePer'] = isset($post['needRolePer'])?$post['needRolePer']:"";
            if(isset($post['STATE'])){
                $condition['STATE'] = $post['STATE'];
            }
        if(isset($post['isAdmin'])){
            $condition['isAdmin'] = $post['isAdmin'];
        }

            $permissions = userPermissionLogic::getUserPermission($condition);

        } else if (isset($post['ROLE_INFO_ID'])) {

         //角色对应业务对象模块权限
        $condition['ROLE_INFO_ID'] = $post['ROLE_INFO_ID'];
        $condition['BUSINESS_OBJECT_ID'] = $post['BUSINESS_OBJECT_ID'];
        if(isset($post['STATE'])){
            $condition['STATE'] = $post['STATE'];
        }
        $permissions = rolePermissionLogic::getRolePermissionInfo($condition);
    }

    /*if(isset($post['USER_INFO_ID']) && !isset($post['needRolePer'])){
        //如果不需要查询对应角色权限
        return  $permissions;
    }*/
    $arrpid = array();
    $newgrouppermissions = array();
    if($post['isAdmin']==1){
        foreach($permissions as $per) {
            array_push($arrpid, $per['PERMISSION_GROUPS_ID']);
        }
        //查询个人角色对应的权限id
        if ($arrpid) {
            $where = ['not in', 'PERMISSION_GROUPS_ID', $arrpid];
        } else {
            $where = "";
        }
        //权限组表查询
        $grouppermissions = (new \yii\db\Query())
            ->select('g.PERMISSION_GROUPS_ID,g.BUSINESS_OBJECT_ID,g.PERMISSION_NAME_CN,g.PERMISSIONR_REMARKS')
            ->from('u_permission_groups g')
            ->where([ 'g.BUSINESS_OBJECT_ID'=> $post['BUSINESS_OBJECT_ID']])
            ->andWhere($where)
            ->distinct()
            ->all();
        foreach($grouppermissions as $pe) {

            $pe['STATE']=0;
            array_push($newgrouppermissions, $pe);
        }
    }
    //权限组信息
    $permissionresults = array_merge($permissions,$newgrouppermissions);


    return $permissionresults;
}




}