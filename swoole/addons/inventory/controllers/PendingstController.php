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

class PendingstController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\inventory\models\SkPendingStorage';

   
    /**
     * 确认入库
     */
    public function actionConfirminventory(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PendstorageLogic','ConfirmInventory'],[$post]]);
    }

    /**
     * 取消入库
     */
    public function actionCancelinventory(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PendstorageLogic','CancelInventory'],[$post]]);
    }

    /**
     * @SWG\Post(path="/receivedifferencereport",
     *     tags={"inventory"},
     *     summary="收货差异表 初始化",
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
    public function actionReceivedifferencereport(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PendstorageLogic','indexReceiveDifferenceReport'],[$post]]);
    }

    /**
     * @SWG\Post(path="/receivedifferenceadjustment",
     *     tags={"inventory"},
     *     summary="收货差异表 差异调整按钮",
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
    public function actionReceivedifferenceadjustment(){
        $post = Yii::$app->getRequest()->getBodyParams();
        $model = new $this->modelClass;
        $transaction = $model->getDb()->beginTransaction();
        try {
            $result = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PendstorageLogic','receiveDifferenceAdjustment'],[$post]]);
            if ($result instanceof ResponeModel) {
                $transaction->rollBack();
                return $result;
            }
            if ($transaction->getIsActive()) {
                $transaction->commit();
            }
            return $result;
        } catch (\Exception $ex) {
            $transaction->rollBack();
            throw $ex;
        }
    }
}