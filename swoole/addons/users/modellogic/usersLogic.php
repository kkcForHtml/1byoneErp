<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/25 0025
 * Time: 10:18
 */

namespace addons\users\modellogic;

use addons\users\models\UAuthorisation;
use addons\users\models\UPersonalRole;
use addons\users\models\URoleInfo;
use addons\users\models\URoleUser;
use addons\users\models\UUserCategory;
use addons\users\models\UUserOrganization;
use addons\users\models\UUserWarehouse;
use Yii;
use addons\users\models\UUserInfo;
use yii\db\Expression;
use yii\swoole\db\Query;
use yii\swoole\helpers\ArrayHelper;
use yii\swoole\rest\Controller;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\web\ExpiredException;
use yii\web\ForbiddenHttpException;

class usersLogic
{
    /**
     * 查询用户数据
     * $item 指定字段值,逗号隔开
     * */
    public static function getuser_info($item = [])
    {
        if (count($item) <= 0) {
            $item = '*';
        }
        return UUserInfo::find()->select($item)->asArray()->all();
    }

    /**
     * 修改用户密码
     * $post 前端提交过来的数据
     */
    public static function check_pwd($post)
    {
        $respone = new ResponeModel();

        $condition['USER_INFO_ID'] = $post['USER_INFO_ID'];
        $condition['PASSWORD'] = $post['oldPassword'];

        $userInfo = UUserInfo::find()->where($condition)->one();

        if ($userInfo) {
            return $respone->setModel(200, 0, Yii::t('users', "Successful operation!"), array());
//            return $respone->setModel(200, 0, "操作成功！", array());
        } else {
            return $respone->setModel(500, 0, Yii::t('users', "The original password is incorrect!"), array());
//            return $respone->setModel(500, 0, "原密码不正确！", array());
        }
    }

    public static function getUserCheck()
    {
        $USER_INFO_CODE = Yii::$app->getUser()->getIdentity()->USER_INFO_ID;
        if ($USER_INFO_CODE) {
            #1当前用户所属组织
            $Organization = UUserOrganization::find()->select(['ORGANISATION_ID'])->where(['USER_INFO_ID' => $USER_INFO_CODE])->column();
            $Warehouse_keeper = UUserWarehouse::find()->select(['WAREHOUSE_ID'])->where(['USER_INFO_ID' => $USER_INFO_CODE, 'USER_WAREHOUSE_STATE' => 1])->column();
            #2权限集
            $rues = ArrayHelper::merge(UPersonalRole::find()->select('PERMISSION_GROUPS_ID')->where(['USER_INFO_ID' => $USER_INFO_CODE, 'ROLE_USER_STATE' => 1])->column(),
                UAuthorisation::find()->select(['PERMISSION_GROUPS_ID'])->where(['ROLE_INFO_ID' => URoleUser::find()->select('ROLE_INFO_ID')->where(['USER_INFO_ID' => $USER_INFO_CODE]), 'AUTHORISATION_STATE' => 1])
                    ->andFilterWhere(['not in', 'PERMISSION_GROUPS_ID', UPersonalRole::find()->select('PERMISSION_GROUPS_ID')->where(['USER_INFO_ID' => $USER_INFO_CODE])])->column());
            #产品分类ID
            $Category_d = UUserCategory::find()->select(['PRODUCT_TYPE_ID'])->where(['USER_INFO_ID' => $USER_INFO_CODE])->column();
            $Category_N = (new Query())->from('g_product_type')->select(['PRODUCT_TYPE_ID'])->where(['PRODUCTOT_TYPE_ID' => $Category_d])->column();
            $Category = array_merge($Category_d, $Category_N);
            #产品ID
            $product_id = [];
            if (count($Category) > 0) {
                $product_sku = (new Query())->from('g_product_sku')->select('PSKU_ID');
                $list = ['or'];
                foreach ($Category as $i => $item) {
                    $list[] = new Expression("FIND_IN_SET(:{$i}, g_product_sku.PRODUCT_TYPE_PATH)", [":{$i}" => $item]);
                }
                $product_id = $product_sku->andWhere($list)->column();
            }
            #平台
            $channel = (new Query())->from('b_channel')->select(['CHANNEL_ID'])->where(['ORGANISATION_ID' => $Organization])->column();

            #仓库
            $warehouse = (new Query())->from('b_warehouse')->select(['WAREHOUSE_ID'])->where(['ORGANISATION_ID' => $Organization])->column();

            #国家
            $country = (new Query())->from('o_organisation')->select(['COUNTRY_ID'])->where(['ORGANISATION_ID' => $Organization])->column();
            #地区
            $area = (new Query())->from('o_organisation')->select(['AREA_ID'])->where(['ORGANISATION_ID' => $Organization])->column();
            #菜单
            #字典表-被过滤的角色ID
            $FILTER_ROLE = (new Query())->from('p_dictionary')->select(['D_HTML'])->where(['D_GROUP' => 'FILTER_ROLE', 'D_STATE' => '1'])->column();
            #字典表-被过滤的接口
            $FILTER_API = (new Query())->from('p_dictionary')->select(['D_HTML'])->where(['D_GROUP' => 'FILTER_API', 'D_STATE' => '1'])->column();
            #当前角色所属角色编码
            $URoleUser = URoleUser::find()->select('ROLE_INFO_ID')->where(['USER_INFO_ID' => $USER_INFO_CODE])->column();
            //当前角色所属角色ID
            $URoleInfoID = URoleUser::find()->select('ROLE_INFO_ID')->where(['USER_INFO_ID' => $USER_INFO_CODE])->column();
            $cache = Yii::$app->cache;
            if (!$cache->get('filterRole')) {
                $cache->set('filterRole', array_unique($FILTER_ROLE));//字典表-被过滤的角色编码
            }
            if (!$cache->get('filterApi')) {
                $cache->set('filterApi', array_unique($FILTER_API));//字典表-被过滤的角色编码
            }

            $session = Yii::$app->session;
            $session->set('organization', array_unique($Organization));//当前用户所属组织
            $session->set('role', array_unique($rues));//权限集
            $session->set('category', array_unique($Category_d));//产品分类ID 大分类ID
            $session->set('categoryd', array_unique($Category));//产品分类ID 全部分类
            $session->set('warehouse_keeper', array_unique($Warehouse_keeper));//当前用户如果是仓库员的时候所属仓库
            $session->set('roleUser', array_unique($URoleUser));//当前角色所属角色编码
            $session->set('roleId', array_unique($URoleInfoID));//当前角色所属角色ID
            $session->set('country', array_unique($country));//国家
            $session->set('area', array_unique($area));//地区
            $session->set('channel', array_unique($channel));//平台
            $session->set('warehouse', array_unique($warehouse));//仓库
            //产品SKU新增编辑，需要重置这个SKU_ID
            $session->set('product_id', array_unique($product_id));//SKU ID
        }

    }

    public static function checkLogin($event)
    {
        if ($event->action->controller instanceof Controller) {
            $user = Yii::$app->user;
            if (!$user->getIdentity() && !in_array($event->action->id, ['login', 'logout', 'signup'])) {
                $user->logout();
                throw new ExpiredException('session time out!');
            }
            #$action  #controllers  #models purchase/purchase/index
            if (!in_array($event->action->id, ['login', 'logout', 'signup'])) {
                $route = $event->action->getUniqueId();
                $id = Yii::$app->session->get('role');

                $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_session'], []])->recv();

                $db = (new Query())->from('u_permission_groups')->where(['PERMISSION_GROUPS_ID' => $id])
                    ->andWhere(new Expression("FIND_IN_SET(:category, INTERFACEURL)", [":category" => $route]))
                    ->andWhere(['or', 'GROUPS_TYPE = 2', 'GROUPS_TYPE = 3'])
                    ->exists();
                //过滤接口
                $OPER_ROLE_URL = (new Query())->from('p_dictionary')->select(['D_HTML'])->where(['D_GROUP' => 'OPER_ROLE_URL', 'D_STATE' => '1'])->column();
                $route_url = explode(',', $OPER_ROLE_URL[0]);
                if ($str) {
                    if (!$db && !in_array($route, $route_url)) {
                        throw new ForbiddenHttpException(Yii::t('yii', 'You are not allowed to perform this action.'));
                    }
                }
            }
        }
    }
}