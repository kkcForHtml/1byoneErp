<?php

/**
 * Created by PhpStorm.
 * User: AM02
 * Date: 2017/5/3
 * Time: 15:38
 */

namespace addons\users\modellogic;

use addons\users\models\URolePermission;
use Yii;
use addons\users\models\UPersonalRole;
use addons\users\models\UAuthorisation;
use yii\db\Expression;
use \yii\swoole\rest\ResponeModel;

class userPermissionLogic
{
    /**查询用户权限
     * @param $condition
     * @return array
     */
    public static function getUserPermission($condition)
    {

        $respone = new ResponeModel();
        $page = isset($condition["page"]) ? $condition["page"] : 1;
        $limit = isset($condition["limit"]) ? $condition["limit"] : 20;
        $index = ($page - 1) * $limit;
        $con = array();
        $businessObjectId = null;
        $isAdmin = null;
        if (!empty($condition['USER_INFO_ID'])) {
            $con['u.USER_INFO_ID'] = $condition['USER_INFO_ID'];
            if (isset($condition['BUSINESS_OBJECT_ID'])) {
                $businessObjectId = $condition['BUSINESS_OBJECT_ID'];
            }

        } else if (!empty($condition['USERNAME'])) {
            $con = ['like', 'sta.STAFF_NAME_CN', $condition['USERNAME']];
            //$con = ['like', 'sta.USERNAME', $condition['STAFF_NAME_CN']];

        }
        if(isset($condition['STATE'])){
            $state = $condition['STATE'];
        }

        $personUsers = (new \yii\swoole\db\Query())
            ->select("*")
            ->from('u_user_info u')
            ->leftJoin('u_staff_info AS sta', 'u.STAFF_ID = sta.STAFF_ID')
            ->where($con)
            ->all();

        $permissiongroup = array();
        //循环获取每个用户的权限集合
        foreach ($personUsers as $user) {
            $permissions = static::getPermissons($user['USER_INFO_ID'], $businessObjectId, $state,$condition);

            $permissiongroup = array_merge($permissiongroup, $permissions);


    }

        if (isset($condition['BUSINESS_OBJECT_ID'])) {
            return $permissiongroup;
        }

        $resultArray = array();
        if (count($permissiongroup)>0) {
            foreach ($permissiongroup as $key=>$value) {
                if($key>=$index && $key < ($index + $limit)){
                    array_push($resultArray, $value);
                }

            }
        }

        $meta = array();
        $meta["totalCount"] =count($permissiongroup);
        return $respone->setModel(200, 0, Yii::t('users', "Query was successful"), $resultArray, $meta);
//        return $respone->setModel(200, 0, "查询成功", $resultArray, $meta);

    }

    /**给用户或者角色授权
     * @param $post
     * @return array
     */
    public static function authority($post)
    {
        $respone = new ResponeModel();

        /*$data=Yii::$app->getUser()->getIdentity();
        if(!$data) {
            return $respone->setModel(500, 0, "授权失败,请先登录系统", $post);
        }*/
        if (isset($post['USER_INFO_ID'])) {
            $userCode = $post['USER_INFO_ID'];
            $info = $post['PERMISSION_INFO'];
            $personalInfo =[];
            $roleInfo = [];
            foreach ($info as $key => $value) {
                $isExists = UPersonalRole::find()->where(['PERMISSION_GROUPS_ID'=>$value['PERMISSION_GROUPS_ID']])->exists();
                if(!$isExists){
                    array_push($roleInfo,$value);
                }else{
                    array_push($personalInfo,$value);
                }
            }
            $perinfo['USER_INFO_ID'] = $post['USER_INFO_ID'];
            $perinfo['PERMISSION_INFO'] = $personalInfo;
            $perinfo['roleInfo'] = $roleInfo;
            //个人授权
            return UPersonalRole::authority($perinfo);
        } else if (isset($post['ROLE_INFO_ID'])) {
            //角色授权
            return UAuthorisation::authority($post);
        }
        return $respone->setModel(500, 0, "ROLE_INFO_ID和USER_INFO_ID都为空,授权失败", $post);


    }

    /**获取用户权限
     * @param $post
     * @return array
     */
    public static function getPermissons($userID, $businessObjectId, $state,$condition)
    {
        $con['u.USER_INFO_ID'] = $userID;
        if ($businessObjectId !== null) {
            $con['g.BUSINESS_OBJECT_ID'] = $businessObjectId;
        }

        //查询字段
       // $select = "sta.STAFF_NAME_CN,u.USERNAME,u.USER_INFO_CODE,org.ORGANISATION_CODE,org.ORGANISATION_NAME_CN,g.PERMISSION_GROUPS_ID,g.PERMISSION_NAME_CN,g.PERMISSIONR_REMARKS,r.ROLE_USER_STATE as STATE,s.SUBSYSTEM,s.FUNC_MODULE,s.BUSINESS_OBJECT";
        //取消了,org.ORGANISATION_CODE,org.ORGANISATION_NAME_CN,这个两个组织名称的查询字段，因为2017年6月20日出现的数据重复BUG
        $select = "sta.STAFF_NAME_CN,u.USERNAME,u.USER_INFO_ID,g.PERMISSION_GROUPS_ID,g.PERMISSION_NAME_CN,g.PERMISSIONR_REMARKS,r.ROLE_USER_STATE as STATE,s.SUBSYSTEM,s.FUNC_MODULE,s.BUSINESS_OBJECT";
        //个人用户权限集合
        $personalPermission = (new \yii\swoole\db\Query())
            ->select($select)
            ->from('u_user_info u')
            ->leftJoin('u_staff_info AS sta', 'u.STAFF_ID = sta.STAFF_ID')
            ->leftJoin('u_personal_role AS r', 'u.USER_INFO_ID = r.USER_INFO_ID')
            ->leftJoin('u_permission_groups AS g', 'r.PERMISSION_GROUPS_ID = g.PERMISSION_GROUPS_ID')
            ->leftJoin('u_business_system AS s', 'g.BUSINESS_OBJECT_ID = s.BUSINESS_OBJECT_ID')
            ->where($con)
            ->andWhere(['<>','r.ROLE_USER_STATE',$state])
            ->andWhere(['<>', 'g.PERMISSION_GROUPS_ID' ,''])
            ->distinct()
            ->all();
        if (isset($con['g.BUSINESS_OBJECT_ID'])) {
            $select = "g.PERMISSION_GROUPS_ID,g.BUSINESS_OBJECT_ID,g.PERMISSION_NAME_CN,g.PERMISSIONR_REMARKS,r.ROLE_USER_STATE AS STATE";
                $personalPermission = (new \yii\swoole\db\Query())
                    ->select($select)
                    ->from('u_personal_role r')
                    ->leftJoin('u_user_info u','u.USER_INFO_ID = r.USER_INFO_ID')
                    ->leftJoin('u_permission_groups AS g', 'r.PERMISSION_GROUPS_ID = g.PERMISSION_GROUPS_ID')
                    ->leftJoin('u_business_system AS s', 'g.BUSINESS_OBJECT_ID = s.BUSINESS_OBJECT_ID')
                    ->where($con)
                    ->andWhere(['<>','r.ROLE_USER_STATE',$state])
                    ->andWhere(['<>', 'g.PERMISSION_GROUPS_ID' ,""])
                    ->distinct()
                    ->all();
        }

        //查询个人权限表，获取权限id
        $permissionids = (new \yii\swoole\db\Query())
            ->select('r.PERMISSION_GROUPS_ID')
            ->from('u_user_info u')
            ->leftJoin('u_personal_role AS r', 'u.USER_INFO_ID = r.USER_INFO_ID')
            ->where(['u.USER_INFO_ID'=>$userID])
            ->andWhere(['NOT', ['r.PERMISSION_GROUPS_ID' => null]])
            ->column();

        //查询个人角色对应的权限id
        if ($permissionids && count($permissionids)>0) {
            $where = ['not in', 'r.PERMISSION_GROUPS_ID', $permissionids];
        } else {
            $where = "";
        }
        $rolespermissions = array();

            //个人角色权限集合
            //查询字段
            $select = "sta.STAFF_NAME_CN,u.USERNAME,u.USER_INFO_ID,g.PERMISSION_GROUPS_ID,g.PERMISSION_NAME_CN,g.PERMISSIONR_REMARKS,r.AUTHORISATION_STATE as STATE,s.SUBSYSTEM,s.FUNC_MODULE,s.BUSINESS_OBJECT";
            if (isset($con['g.BUSINESS_OBJECT_ID'])) {
                $select = "g.PERMISSION_GROUPS_ID,g.BUSINESS_OBJECT_ID,g.PERMISSION_NAME_CN,g.PERMISSIONR_REMARKS,r.AUTHORISATION_STATE AS STATE";
            }
            $rolespermissions = (new \yii\swoole\db\Query())
                ->select($select)
                ->from('u_user_info u')
                ->leftJoin('u_staff_info AS sta', 'u.STAFF_ID = sta.STAFF_ID')
                ->leftJoin('u_role_user AS ru', 'u.USER_INFO_ID = ru.USER_INFO_ID')
                ->leftJoin('u_role_info AS ri', 'ru.ROLE_INFO_ID = ri.ROLE_INFO_ID')
                ->leftJoin('u_authorisation AS r', 'ru.ROLE_INFO_ID = r.ROLE_INFO_ID')
                ->leftJoin('u_permission_groups AS g', 'r.PERMISSION_GROUPS_ID = g.PERMISSION_GROUPS_ID')
                ->leftJoin('u_business_system AS s', 'g.BUSINESS_OBJECT_ID = s.BUSINESS_OBJECT_ID')
                ->where($con)
                ->andWhere($where)
                ->andWhere(['<>','r.AUTHORISATION_STATE',$state])
                ->andWhere(['NOT', ['r.PERMISSION_GROUPS_ID' => null]])
                ->distinct()
                ->all();


        // admin权限
        $selectAdmin = 'sta.STAFF_NAME_CN,ri.ROLE_INFO_ID,ri.ROLE_INFO_CODE,ri.ROLE_INFO_NAME_CN,s.SUBSYSTEM,s.FUNC_MODULE,s.BUSINESS_OBJECT,g.PERMISSIONR_REMARKS,g.PERMISSION_NAME_CN,1 as STATE';
        $adminpermissions =  (new \yii\swoole\db\Query())
            ->select(new Expression($selectAdmin))
            ->from('u_business_system s')
            ->leftJoin('u_permission_groups AS g', 'g.BUSINESS_OBJECT_ID = s.BUSINESS_OBJECT_ID')
            ->leftJoin('u_role_info AS ri', 'ri.ROLE_TYPE_ID = 3')
            ->leftJoin('u_role_user AS ru', 'ru.role_info_id = ri.role_info_id')
            ->leftJoin('u_user_info AS u', 'u.user_info_id = ru.user_info_id')
            ->leftJoin('u_staff_info AS sta', 'u.STAFF_ID = sta.STAFF_ID')
            ->where($con)
            ->distinct()
            ->all();


        //权限信息
        $rolespermissions = array_merge($rolespermissions,$adminpermissions);
        $permissions = array_merge($personalPermission, $rolespermissions);

        if($condition['isAdmin']==6&& count($permissions)==0 && empty($condition['USERNAME'])){
            if (isset($con['g.BUSINESS_OBJECT_ID'])) {
                $where = ["in",'g.BUSINESS_OBJECT_ID',$con['g.BUSINESS_OBJECT_ID']];
            }
                $select = "g.PERMISSION_GROUPS_ID,g.BUSINESS_OBJECT_ID,g.PERMISSION_NAME_CN,g.PERMISSIONR_REMARKS,0 AS STATE";
                $permissions = (new \yii\swoole\db\Query())
                    ->select(new Expression($select))
                    ->from('u_permission_groups g')
                    ->leftJoin('u_business_system AS s', 'g.BUSINESS_OBJECT_ID = s.BUSINESS_OBJECT_ID')
                    ->where($where)
                    ->distinct()
                    ->all();

        }
        return $permissions;
}
}