<?php
/**
 * Created by PhpStorm.
 * controller: 亚马逊订单控制器
 * Date: 2017/6/21 0013
 * Time: 14:59
 */
namespace addons\amazon\controllers;

use \yii\swoole\rest\ActiveController;
use Yii;

class AmazonorderController extends ActiveController
{

    public $modelClass = 'addons\amazon\models\CAmazonOrder';

    /**
     * @SWG\Post(path="/amazon_order",
     *     tags={"sales"},
     *     summary="追溯销售订单",
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
    public function actionAmazon_order()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('amazon')->sendAndrecv([['\addons\amazon\modellogic\amazonorderLogic', 'amazon_order'], [$post]]);
    }

    /**
     * 自动收货，测试接口
     */
    public function actionAutoreceive()
    {
        return Yii::$app->rpc->create('amazon')->sendAndrecv([['\addons\amazon\modellogic\fbainventoryLogic', 'autoReceive'], []]);
    }
}
