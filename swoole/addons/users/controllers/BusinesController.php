<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/13 0013
 * Time: 17:59
 */
namespace addons\users\controllers;

use Yii;

class BusinesController extends \yii\swoole\rest\ActiveController
{

    public $modelClass = 'addons\users\models\UBusinessSystem';

    /**
     * @SWG\Post(path="/getbusiniesbyuserorrole",
     *     tags={"users"},
     *     summary="根据角色或者用户查询对应的拥有权限的子系统",
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
    public function actionGetbusiniesbyuserorrole(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('users')->sendAndrecv([['\addons\users\modellogic\businesLogic','getBusiniesByUserOrRole'],[$post]]);
    }

}