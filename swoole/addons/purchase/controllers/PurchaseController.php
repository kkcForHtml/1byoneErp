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

class PurchaseController extends ActiveController
{

    public $modelClass = 'addons\purchase\models\PuPurchase';

    /**
     * @SWG\Post(path="/export_purchase",
     *     tags={"purchase"},
     *     summary="采购订单导出",
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
    public function actionExport_purchase()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'export_purchase'], [$post]]);
    }

    /**
     * @SWG\Post(path="/export_pdf",
     *     tags={"purchase"},
     *     summary="采购订单打印，返回PDF",
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
    public function actionExport_pdf(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'export_pdf'], [$post]]);
    }
}
