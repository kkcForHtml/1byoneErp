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

class TrackingdetailController extends ActiveController
{

    public $modelClass = 'addons\shipment\models\ShTrackingDetail';

    /**
     * @SWG\Post(path="/exportpi",
     *     tags={"shipment"},
     *     summary="发运查询导出",
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
    public function actionExportpi()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\trackingdetailLogic', 'exportPi'], [$post]]);
    }

    /**
     * @SWG\Post(path="/indexcustom",
     *     tags={"shipment"},
     *     summary="发运查询",
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
    public function actionIndexcustom()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\trackingdetailLogic', 'indexCustom'], [$post]]);
    }
}
