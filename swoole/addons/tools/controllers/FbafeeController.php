<?php

/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/18 0018
 * Time: 15:01
 */
namespace addons\tools\controllers;

use addons\tools\modellogic\fbafeeLogic;
use Yii;

class FbafeeController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\tools\models\ToFbaFeeRule';

    /**
     * @SWG\Post(path="/getfee",
     *     tags={"tools"},
     *     summary="计算FBAFee",
     *     description="返回json结果",
     *     produces={"application/json"},
     * @SWG\Parameter(
     *        in = "body",
     *        name = "body",
     *        description = "json字符串结构",
     *        required = true,
     *        type = "string",
     *        schema = "{}"
     *     ),
     * @SWG\Response(
     *         response = 200,
     *         description = " success"
     *     )
     * )
     *
     */
    public function actionGetfee(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('tools')->sendAndrecv([['\addons\tools\modellogic\fbafeeLogic','fbaFee'],[$post]]);
    }
}