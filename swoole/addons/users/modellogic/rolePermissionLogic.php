<?php

/**
 * Created by PhpStorm.
 * User: AM02
 * Date: 2017/5/3
 * Time: 15:38
 */

namespace addons\users\modellogic;

use addons\users\models\URoleInfo;
use addons\users\models\URolePermission;
use Yii;
use yii\db\Query;
use yii\db\Expression;
use \yii\swoole\rest\ResponeModel;
use yii\web\ServerErrorHttpException;

class rolePermissionLogic
{
    /**查询角色权限
     * @param $post
     * @return array
     */
public static function getRolePermissionInfo($condition)
{

    $respone = new ResponeModel();
    $con = "";
    $where = "";
    $page = isset($condition["page"]) ? $condition["page"] : 1;
    $limit = isset($condition["limit"]) ? $condition["limit"] : 20;
    $index = ($page - 1) * $limit;

    if (!empty($condition['ROLE_INFO_NAME_CN'])) {
        $where = ['like', 'u.ROLE_INFO_NAME_CN', $condition['ROLE_INFO_NAME_CN']];
    } else if (!empty($condition['ROLE_INFO_ID'])) {
        $where = ['u.ROLE_INFO_ID' => $condition['ROLE_INFO_ID']];
        if(isset($condition['STATE'])){
            $andWhere = ['<>',"auth.AUTHORISATION_STATE",$condition['STATE']];
        }
    }
    if (isset($condition['BUSINESS_OBJECT_ID'])) {
        $con = ['p.BUSINESS_OBJECT_ID' => $condition['BUSINESS_OBJECT_ID']];
        $select = "p.PERMISSION_GROUPS_ID,p.BUSINESS_OBJECT_ID,p.PERMISSION_NAME_CN,p.PERMISSIONR_REMARKS,auth.AUTHORISATION_STATE AS STATE";
        //查询角色权限信息
        $rolespermissions = (new \yii\db\Query())
            ->select($select)
            ->from('u_role_info u')
            ->leftJoin('u_authorisation AS auth', 'u.ROLE_INFO_ID = auth.ROLE_INFO_ID')
            ->leftJoin('u_permission_groups AS p', 'p.PERMISSION_GROUPS_ID = auth.PERMISSION_GROUPS_ID')
            ->leftJoin('u_business_system AS s', 'p.BUSINESS_OBJECT_ID = s.BUSINESS_OBJECT_ID')
            ->where($where)
            ->andWhere($andWhere)
            ->andWhere($con)
            ->all();
        if(count($rolespermissions)==0){
            $select = "g.PERMISSION_GROUPS_ID,g.BUSINESS_OBJECT_ID,g.PERMISSION_NAME_CN,g.PERMISSIONR_REMARKS,0 AS STATE";
            $rolespermissions = (new \yii\swoole\db\Query())
                ->select(new Expression($select))
                ->from('u_permission_groups g')
                ->leftJoin('u_business_system AS s', 'g.BUSINESS_OBJECT_ID = s.BUSINESS_OBJECT_ID')
                //     ->leftJoin('u_user_organization AS uorg', 'u.USER_INFO_CODE = uorg.USER_INFO_CODE')
                //   ->leftJoin('o_organisation AS org', 'uorg.ORGANISATION_CODE = org.ORGANISATION_CODE')
                ->where(['g.BUSINESS_OBJECT_ID'=>$condition['BUSINESS_OBJECT_ID']])
                //->andWhere(['not in', ['r.PERMISSION_GROUPS_ID' => null]])
                ->distinct()
                ->all();

        }
        return $rolespermissions;
    } else {
        $con = ['NOT', ['auth.PERMISSION_GROUPS_ID' => null]];
        $select = "u.ROLE_INFO_ID,
            u.ROLE_INFO_CODE,
            u.ROLE_INFO_NAME_CN,
            s.SUBSYSTEM,
            s.FUNC_MODULE,
            s.BUSINESS_OBJECT,
            p.PERMISSION_NAME_CN,
            auth.AUTHORISATION_STATE";
        //查询超级管理员权限信息总条数
        $select2 = "u.ROLE_INFO_ID,
                u.ROLE_INFO_CODE,
                u.ROLE_INFO_NAME_CN,
                s.SUBSYSTEM,
                s.FUNC_MODULE,
                s.BUSINESS_OBJECT,
                p.PERMISSION_NAME_CN,
                1 as AUTHORISATION_STATE";
        //查询角色权限信息总条数
        $totalCount = (new \yii\db\Query())
            ->select($select)
            ->from('u_role_info u')
            ->leftJoin('u_authorisation AS auth', 'u.ROLE_INFO_ID = auth.ROLE_INFO_ID')
            ->leftJoin('u_permission_groups AS p', 'p.PERMISSION_GROUPS_ID = auth.PERMISSION_GROUPS_ID')
            ->leftJoin('u_business_system AS s', 'p.BUSINESS_OBJECT_ID = s.BUSINESS_OBJECT_ID')
            ->where($where)
            ->andWhere($con)
            ->count();
        $rolespermissions = (new \yii\db\Query())
            ->select($select)
            ->from('u_role_info u')
            ->leftJoin('u_authorisation AS auth', 'u.ROLE_INFO_ID = auth.ROLE_INFO_ID')
            ->leftJoin('u_permission_groups AS p', 'p.PERMISSION_GROUPS_ID = auth.PERMISSION_GROUPS_ID')
            ->leftJoin('u_business_system AS s', 'p.BUSINESS_OBJECT_ID = s.BUSINESS_OBJECT_ID')
            ->where($where)
            ->andWhere($con)
            ->limit($limit)
            ->offset($index)
            ->all();
        $totalCount2 = (new \yii\db\Query())
            ->select(new Expression($select2))
            ->from('u_business_system s')
            ->leftJoin('u_permission_groups AS p', 'p.BUSINESS_OBJECT_ID = s.BUSINESS_OBJECT_ID')
            ->leftJoin('u_role_info AS u', 'u.ROLE_TYPE_ID = 3')
            ->where($where)
            ->count();
        //查询超级管理员权限信息
        $adminpermissions = (new \yii\db\Query())
            ->select(new Expression($select2))
            ->from('u_business_system s')
            ->leftJoin('u_permission_groups AS p', 'p.BUSINESS_OBJECT_ID = s.BUSINESS_OBJECT_ID')
            ->leftJoin('u_role_info AS u', 'u.ROLE_TYPE_ID = 3')
            ->where($where)
            ->limit($limit)
            ->offset($index)
            ->all();
        $allRolePermissions = array_merge($rolespermissions,$adminpermissions);
        $meta = array();
        $meta["totalCount"] = $totalCount+$totalCount2;
        return $respone->setModel(200, 0, Yii::t('users', "Query was successful"), $allRolePermissions, $meta);

        /*$con = ['NOT', ['auth.PERMISSION_GROUPS_ID' => null]];
        $select = "*";
        //查询角色权限信息
        $totalCount = (new \yii\db\Query())
            ->select($select)
            ->from('u_role_info u')
            ->leftJoin('u_authorisation AS auth', 'u.ROLE_INFO_ID = auth.ROLE_INFO_ID')
            ->leftJoin('u_permission_groups AS p', 'p.PERMISSION_GROUPS_ID = auth.PERMISSION_GROUPS_ID')
            ->leftJoin('u_business_system AS s', 'p.BUSINESS_OBJECT_ID = s.BUSINESS_OBJECT_ID')
            ->where($where)
            ->andWhere($con)
            ->count();

        $rolespermissions = (new \yii\db\Query())
            ->select($select)
            ->from('u_role_info u')
            ->leftJoin('u_authorisation AS auth', 'u.ROLE_INFO_ID = auth.ROLE_INFO_ID')
            ->leftJoin('u_permission_groups AS p', 'p.PERMISSION_GROUPS_ID = auth.PERMISSION_GROUPS_ID')
            ->leftJoin('u_business_system AS s', 'p.BUSINESS_OBJECT_ID = s.BUSINESS_OBJECT_ID')
            ->where($where)
            ->andWhere($con)
            ->limit($limit)
            ->offset($index)
            ->all();

            $meta = array();
            $meta["totalCount"] =$totalCount;
            return $respone->setModel(200, 0, Yii::t('users', "Query was successful"), $rolespermissions, $meta);*/
//            return $respone->setModel(200, 0, "查询成功", $rolespermissions, $meta);
    }


}

    /**
     * 查询菜单权限
     * @param $post
     * @return $this
     * @throws ServerErrorHttpException
     */
    public static function checkMenusPermission($post)
    {
        $roleId = isset($post['ROLE_INFO_ID'])&&$post['ROLE_INFO_ID']?$post['ROLE_INFO_ID']:'';
        $roleName = isset($post['ROLE_INFO_NAME_CN'])&&$post['ROLE_INFO_NAME_CN']?$post['ROLE_INFO_NAME_CN']:'';
        if((!$roleId) && (!$roleName)){
            throw new ServerErrorHttpException(Yii::t('users', 'Parameter check failed'));
        }
        $_uRolePermission = (new Query())->from('u_role_permission p')
            ->select('i.ROLE_INFO_ID,i.ROLE_INFO_ID,i.ROLE_INFO_NAME_CN,i.ROLE_INFO_NAME_EN,p.ROLE_PERMISSION_ID,p.MENUS,p.NOTE')
            ->leftJoin('u_role_info i','p.ROLE_INFO_ID = i.ROLE_INFO_ID')
            ->where(['p.PERMISSION_STATE'=>1])
            ->andFilterWhere(['=', 'p.ROLE_INFO_ID', $roleId])
            ->andFilterWhere(['LIKE', 'i.ROLE_INFO_NAME_CN', $roleName])
            ->all();
        $response = new ResponeModel();
        if(!empty($_uRolePermission)){
            $uRolePermission = Yii::$app->rpc->create('base')->sendAndrecv([['\addons\common\base\modellogic\menusLogic','getMenus'],[$_uRolePermission]]);
            return $response->setModel(200, 0, Yii::t('users', 'Successful operation!'), $uRolePermission);
        }else{
            return $response->setModel(200, 0, Yii::t('users', 'Successful operation!'), []);
        }
    }

    /**
     * 展示菜单权限列表
     * @return $this
     * @throws ServerErrorHttpException
     */
    public static function listMenusPermission()
    {
        $roleIds = Yii::$app->session->get('roleId');
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_session'], []])->recv();
        if ($str) {
            $_menus = URolePermission::find()
                ->select('MENUS')
                ->where(['PERMISSION_STATE'=>1,'ROLE_INFO_ID'=>$roleIds])
                ->asArray()
                ->all();
            $menus = [];
            foreach($_menus as $_item){
                $item = !empty($_item['MENUS'])?explode(',',$_item['MENUS']):[];
                foreach($item as $temp){
                    if(!in_array($temp,$menus)){
                        array_push($menus,$temp);
                    }
                }
            }
            $_uRolePermission['MENUS'] = !empty($menus)?implode(',',$menus):'';
        } else {
            //管理员
            $_uRolePermission['MENUS'] = -1;
        }
        $response = new ResponeModel();
        if(!empty($_uRolePermission)){
            $uRolePermission = Yii::$app->rpc->create('base')->sendAndrecv([['\addons\common\base\modellogic\menusLogic','getParseMenus'],[$_uRolePermission]]);
            return $response->setModel(200, 0, Yii::t('users', 'Successful operation!'), $uRolePermission);
        }else{
            return $response->setModel(200, 0, Yii::t('users', 'Successful operation!'), []);
        }
    }
}