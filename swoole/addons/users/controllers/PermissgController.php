<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/13 0013
 * Time: 17:59
 */
namespace addons\users\controllers;

use Yii;

class PermissgController extends \yii\swoole\rest\ActiveController
{

    public $modelClass = 'addons\users\models\UPermissionGroups';

    /**
     * @SWG\Post(path="/authority",
     *     tags={"users"},
     *     summary="用户或者角色授权",
     *     description="授权并返回授权结果",
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
    public function actionAuthority(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('users')->sendAndrecv([['\addons\users\modellogic\userPermissionLogic','authority'],[$post]]);
    }

    /**
     * @SWG\Post(path="/permissionsearch",
     *     tags={"users"},
     *     summary="根据子系统模块查询角色或者用户的权限组",
     *     description="返回查询结果",
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
    public function actionPermissionsearch(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('users')->sendAndrecv([['\addons\users\modellogic\permissionGroupLogic','permissionsearch'],[$post]]);
    }

}