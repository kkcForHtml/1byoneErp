<?php
namespace addons\indexpage\controllers;
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/7/4 0004
 * Time: 9:45
 */
use Yii;
class IndexpageController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\indexpage\models\Undefined';

    /**
     * @SWG\Post(path="/pendingschedule",
     *     tags={"index"},
     *     summary="首页接口",
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
    public function actionPendingschedule()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('indexpage')->sendAndrecv([['\addons\indexpage\modellogic\IndexpageLogic', 'pendingSchedule'], [$post]]);
    }

}