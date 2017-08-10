<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/18 0013
 * Time: 17:59
 */
namespace addons\inventory\controllers;

use Yii;
use yii\swoole\rest\ResponeModel;

class PlacingController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\inventory\models\SkPlacing';

    /**
     * @SWG\Post(path="/checkskuinventory",
     *     tags={"inventory"},
     *     summary="检查出库单SKU的库存",
     *     description="返回校验结果",
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
    public function actionCheckskuinventory(){
        $response = new ResponeModel();
        $post = Yii::$app->getRequest()->getBodyParams();
        $result = Yii::$app->rpc->create('inventory')->sendAndrecv([['addons\inventory\modellogic\instantInventoryLogic', 'checkInventory1'], [$post]]);
        return $response->setModel(200, 0, Yii::t('inventory', 'Successful operation!'), $result);
    }

    /**
     * @SWG\Post(path="/export",
     *     tags={"inventory"},
     *     summary="导出",
     *     description="返回导出结果",
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
    public function actionExport(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\placingLogic','export'],[$post]]);
    }

    public function actionUpdateplacing(){
        $post = Yii::$app->getRequest()->getBodyParams();
        foreach($post['sk_placing_detail'] as &$value){
            unset($value['b_unit']);
            unset($value['g_product_sku']);
        }
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\placingLogic','SetPlacing'],[[$post]]]);
    }
}