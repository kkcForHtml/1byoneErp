<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/13 0013
 * Time: 17:59
 */
namespace addons\users\controllers;

use Yii;

class RoleinfoController extends \yii\swoole\rest\ActiveController
{

    public $modelClass = 'addons\users\models\URoleInfo';

    /**
     * @SWG\Post(path="/getrolepermissioninfo",
     *     tags={"users"},
     *     summary="查询角色权限",
     *     description="返回角色权限信息",
     *       produces = {"application/json"},
     *       consumes = {"application/json"},
     *     @SWG\Parameter(
     *        in = "body",
     *        name = "body",
     *        description = "json字符串结构",
     *        required = false,
     *        type = "string",
     *        schema = "{}"
     *     ),
     *
     *     @SWG\Response(
     *         response = 200,
     *         description = "success"
     *     )
     * )
     *
     */
    public function actionGetrolepermissioninfo(){
        $post = Yii::$app->getRequest()->getBodyParams();

        //获取角色名称
        $roleName = isset($post['ROLE_INFO_NAME_CN'])?$post['ROLE_INFO_NAME_CN']:"";
        //获取角色编码
        $roleCode = isset($post['ROLE_INFO_CODE'])?$post['ROLE_INFO_CODE']:"";
        $condition['ROLE_INFO_NAME_CN'] = $roleName;
        $condition['ROLE_INFO_CODE'] = $roleCode;
        $condition["page"] = isset($post["page"]) ? $post["page"] : 1;
        $condition["limit"] = isset($post["limit"]) ? $post["limit"] : 20;

        return Yii::$app->rpc->create('users')->sendAndrecv([['\addons\users\modellogic\rolePermissionLogic','getRolePermissionInfo'],[$condition]]);
    }

}