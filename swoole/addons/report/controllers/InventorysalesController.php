<?php
namespace addons\report\controllers;
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/6/20 0020
 * Time: 11:42
 */
use \yii\swoole\rest\ActiveController;
use Yii;
class InventorysalesController extends ActiveController
{
    public $modelClass = 'addons\sales\models\Undefined';

    /**
     * @SWG\Post(path="/trackallocation",
     *     tags={"purchase"},
     *     summary="追溯发运跟踪自定义接口",
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
    public function actionTrackallocation()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('report')->sendAndrecv([['\addons\report\modellogic\trackallocationLogic', 'indexCustom'], [$post]]);
    }

    /**
     * @SWG\Post(path="/salesvolumeanalysis",
     *     tags={"purchase"},
     *     summary="库存销量分析表",
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
    public function actionSalesindex()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        $page = Yii::$app->getRequest()->get('page');
        return Yii::$app->rpc->create('report')->sendAndrecv([['\addons\report\modellogic\trackallocationLogic', 'SalesVolumeAnalysis'], [$post,$page]]);
    }
}