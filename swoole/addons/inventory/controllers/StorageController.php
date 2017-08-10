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

class StorageController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\inventory\models\SkStorage';

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
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic','export'],[$post]]);
    }

    /**
     * 红字校验库存
     */
    public function actionCheckskuinventory(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic','checkSkuInventory'],[$post]]);
    }

    /**
     * @SWG\Post(path="/auditreaudit",
     *     tags={"inventory"},
     *     summary="审核&&反审核",
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
    public function actionAuditreaudit(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic','auditReaudit'],[$post]]);
    }

    /**
     * @SWG\Post(path="/updatecustom",
     *     tags={"inventory"},
     *     summary="自定义保存操作",
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
    public function actionUpdatecustom(){
        $post = Yii::$app->getRequest()->getBodyParams();
        $model = new $this->modelClass;
        $transaction = $model->getDb()->beginTransaction();
        try {
            $result = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic','updateCustom'],[$post]]);
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