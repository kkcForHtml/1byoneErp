<?php
/**
 * Created by PhpStorm.
 * controller: 采购计划单
 * Date: 2017/4/13 0013
 * Time: 17:59
 */
namespace addons\purchase\controllers;

use \yii\swoole\rest\ActiveController;
use Yii;

class PlanController extends ActiveController
{

    public $modelClass = 'addons\purchase\models\PuPlan';

    /**
     * @SWG\Post(path="/generatepurchase",
     *     tags={"purchase"},
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
    public function actionGeneratepurchase()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\planLogic', 'generatePurchase'], [$post]]);
    }

    /**
     * @SWG\Post(path="/importplan",
     *     tags={"purchase"},
     *     summary="导入采购计划",
     *     description="返回json结果",
     *     produces={"application/json"},
     *
     * @SWG\Response(
     *         response = 200,
     *         description = " success"
     *     )
     * )
     *
     */
    public function actionImportplan()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\planLogic', 'importPlan'], [$post]]);
    }

    /**
     * @SWG\Post(path="/reaudit",
     *     tags={"purchase"},
     *     summary="反审核",
     *     description="返回json结果",
     *     produces={"application/json"},
     *
     * @SWG\Response(
     *         response = 200,
     *         description = " success"
     *     )
     * )
     *
     */
    public function actionReaudit()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\planLogic', 'reAudit'], [$post]]);
    }
}
