<?php

namespace addons\common\base\controllers;

use Yii;

class RolemenusController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\common\base\models\PRoleMenus';

    /**
     * @SWG\Post(path="/getmenulist",
     *     tags={"users"},
     *     summary="获取菜单列表",
     *     description="返回菜单列表信息",
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
    public function actionGetmenulist(){
        return Yii::$app->rpc->create('base')->sendAndrecv([['\addons\common\base\modellogic\menusLogic','getMenuList'],[]]);
    }

    /**
     * @SWG\Post(path="/getoperation",
     *     tags={"users"},
     *     summary="可操作数据权限获取",
     *     description="返回可操作数据权限",
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
    public function actionGetoperation(){
        return Yii::$app->rpc->create('base')->sendAndrecv([['\addons\common\base\modellogic\menusLogic','getoperation'],[]]);
    }
}