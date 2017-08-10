<?php
namespace addons\common\base\modellogic;

use Yii;
use addons\common\base\models\PRoleMenus;
use yii\swoole\db\Query;
use yii\swoole\rest\ResponeModel;

class menusLogic
{
    /**
     * 列表结构的角色菜单权限列表
     * @param $uRolePermissions
     * @return array
     */
    public static function getMenus($uRolePermissions)
    {
        $menuList = self::_getMenuList();
        $temp = [];
        foreach ($uRolePermissions as $k => $uRolePermission) {
            $temp[$k] = self::_matchMenusPermission($uRolePermission, $menuList);
        }
        $result = [];
        foreach ($temp as $_temp) {
            foreach ($_temp as $item) {
                $result[] = $item;
            }
        }
        return $result;
    }

    /**
     * 树型结构的角色菜单权限列表
     * @param $uRolePermission
     * @return $this
     */
    public static function getParseMenus($uRolePermission)
    {
        $menuList = self::_getMenuList();
        $list = self::_matchParseMenusPermission($uRolePermission['MENUS'], $menuList);
        self::_getParseMenus($uRolePermission, $list);
        return $uRolePermission;
    }

    /**
     * 树形结构的菜单列表
     * @return $this
     */
    public static function getMenuList()
    {
        $list = self::_getMenuList();
        $result = self::_parseMenuList($list);
        $response = new ResponeModel();
        return $response->setModel(200, 0, Yii::t('base', 'Successful operation!'), $result);
    }

    /**
     * 获取菜单列表
     * @return array|\yii\db\ActiveRecord[]
     */
    private static function _getMenuList()
    {
        return PRoleMenus::find()
            ->select('*')
            ->orderBy('MENUS_ID ASC')
            ->asArray()
            ->all();
    }

    /**
     * 匹配菜单列表权限
     * @param $uRolePermission
     * @param $menuList
     * @return mixed
     */
    private static function _matchMenusPermission($uRolePermission, $menuList)
    {
        array_walk($menuList, function (&$v, $k, $param) {
            $_menus = isset($param['MENUS']) && $param['MENUS'] ? explode(',', $param['MENUS']) : [];
            $v['ROLE_PERMISSION_ID'] = $param['ROLE_PERMISSION_ID'];
            $v['ROLE_INFO_ID'] = $param['ROLE_INFO_ID'];
            $v['ROLE_INFO_ID'] = $param['ROLE_INFO_ID'];
            $v['ROLE_INFO_NAME_CN'] = $param['ROLE_INFO_NAME_CN'];
            $v['ROLE_INFO_NAME_EN'] = $param['ROLE_INFO_NAME_EN'];
            $v['MENUS'] = $param['MENUS'];
            $v['NOTE'] = $param['NOTE'];
            $v['IS_PERMISSION'] = in_array($v['MENUS_ID'], $_menus) ? 1 : 0;
        }, $uRolePermission);
        return $menuList;
    }

    /**
     * 匹配树型结构菜单权限
     * @param $menus
     * @param $menuList
     * @return mixed
     */
    private static function _matchParseMenusPermission($menus, $menuList)
    {
        $_menus = !empty($menus) ? explode(',', $menus) : [];
        array_walk($menuList, function (&$v, $k, $param) {
            $v['IS_PERMISSION'] = !empty($param)&&$param[0] == -1 ? 1 : (in_array($v['MENUS_ID'], $param) ? 1 : 0);
        }, $_menus);
        return $menuList;
    }

    /**
     * 获取角色的菜单权限列表
     * @param      $uRolePermission
     * @param      $list
     */
    private static function _getParseMenus(&$uRolePermission, $list)
    {
        $uRolePermission['MENU_LIST'] = self::_parseMenuList($list);
    }

    /**
     * 解析成树型结构
     * @param $list
     * @return array
     */
    private static function _parseMenuList($list)
    {
        uasort($list, 'self::_sortMenus');
        $result = array();
        $index = array();
        foreach ($list as $item) {
            $item['SUB_MENUS'] = array();
            if ($item['MENUS_FID'] == 0) {
                $i = count($result);
                $result[$i] = $item;
                $index[$item['MENUS_ID']] =& $result[$i];
            } else {
                $i = count($index[$item['MENUS_FID']]['SUB_MENUS']);
                $index[$item['MENUS_FID']]['SUB_MENUS'][$i] = $item;
                $index[$item['MENUS_ID']] =& $index[$item['MENUS_FID']]['SUB_MENUS'][$i];
            }
        }
        return $result;
    }

    /**
     * 排序
     * @param $a
     * @param $b
     * @return int
     */
    private static function _sortMenus($a, $b)
    {
        if ($a['MENUS_FID'] == $b['MENUS_FID']) {
            return 0;
        }
        return $a['MENUS_FID'] > $b['MENUS_FID'] ? 1 : -1;
    }


    /**
     * 可操作数据权限获取
     * getoperation
     * @return array
     * */
    public static function getoperation()
    {
        $list = [];
        $id = Yii::$app->session->get('role');

        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_session'], []])->recv();

        $db = (new Query())->from('u_permission_groups')
            ->select(['BUSINESS_OBJECT_ID', 'GROUPS_TYPE', 'PERMISSION_NAME_CN', 'PERMISSIONR_REMARKS'])->groupBy(['PERMISSION_NAME_CN']);
        //排除admin 角色
        if ($str) {
            $list = $db->where(['PERMISSION_GROUPS_ID' => $id])
                ->andWhere(['or', 'GROUPS_TYPE = 1', 'GROUPS_TYPE = 3'])
                ->all();
        } else {
            $list = $db->andWhere(['or', 'GROUPS_TYPE = 1', 'GROUPS_TYPE = 3'])->all();
        }
        return $list;
    }
}