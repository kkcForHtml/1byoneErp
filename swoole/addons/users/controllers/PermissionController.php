<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/13 0013
 * Time: 17:59
 */
namespace addons\users\controllers;

use Yii;

class PermissionController extends \yii\swoole\rest\ActiveController
{

    public $modelClass = 'addons\users\models\URolePermission';

    /**
     * @SWG\Post(path="/checkmenuspermission",
     *     tags={"users"},
     *     summary="查询菜单权限",
     *     description="返回菜单权限信息",
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
    public function actionCheckmenuspermission(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('users')->sendAndrecv([['\addons\users\modellogic\rolePermissionLogic','checkMenusPermission'],[$post]]);
    }

    /**
     * @SWG\Post(path="/listmenuspermission",
     *     tags={"users"},
     *     summary="菜单权限管理",
     *     description="返回菜单权限管理列表",
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
    public function actionListmenuspermission(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('users')->sendAndrecv([['\addons\users\modellogic\rolePermissionLogic','listMenusPermission'],[$post]]);
    }
}