<?php
/**
 * Created by PhpStorm.
 * controller: 采购计划单
 * Date: 2017/4/13 0013
 * Time: 17:59
 */
namespace addons\shipment\controllers;

use \yii\swoole\rest\ActiveController;
use Yii;

class DispatchnoteController extends ActiveController
{

    public $modelClass = 'addons\shipment\models\ShDispatchNote';

    /**
     * @SWG\Post(path="/make_dispatch",
     *     tags={"shipment"},
     *     summary="生成发运单",
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
    public function actionMake_dispatch()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\dispatchLogic', 'make_dispatch'], [$post]]);
    }

    /**
     * @SWG\Post(path="/dispatch_index",
     *     tags={"shipment"},
     *     summary="发运计划单列表数据",
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
    public function actionDispatch_index()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\dispatchLogic', 'DispatchIndex'], [$post]]);
    }

    /**
     * @SWG\Post(path="/dispatch_index",
     *     tags={"shipment"},
     *     summary="发运计划单列表数据",
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
    public function actionDispatch_view()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\dispatchLogic', 'DispatchView'], [$post]]);
    }

    /**
     * @SWG\Post(path="/to_examine",
     *     tags={"shipment"},
     *     summary="发运计划单列表数据",
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
    public function actionTo_examine()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\dispatchLogic', 'ToExamine'], [$post]]);
    }

    /**
     * @SWG\Post(path="/print_note",
     *     tags={"shipment"},
     *     summary="发运单通知",
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
    public function actionPrint_note()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\dispatchLogic', 'print_note'], [$post]]);
    }
}
