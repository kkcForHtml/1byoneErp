<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/13 0013
 * Time: 17:44
 */
namespace addons\master\basics\controllers;

use Yii;

class ExchangerController extends \yii\swoole\rest\ActiveController
{

    public $modelClass = 'addons\master\basics\models\BExchangeRate';

    /**
     * @SWG\Post(path="/getexchangerate",
     *     tags={"basics"},
     *     summary="生成采购订单",
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
    public function actionGetexchangerate()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\baseLogic', 'getExchangeRate'], [$post]])->recv();
    }
}