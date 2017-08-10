<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/18 0013
 * Time: 17:59
 */
namespace addons\inventory\controllers;

use Yii;

class StoragedetailController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\inventory\models\SkStorageDetail';

    /**
     * @SWG\Post(path="/historystorage",
     *     tags={"purchase"},
     *     summary="历史入库单",
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
    public function actionHistorystorage()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storagedetailLogic', 'getHistoryStorage'], [$post]]);
    }
}