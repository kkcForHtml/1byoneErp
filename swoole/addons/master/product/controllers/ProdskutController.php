<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/13 0013
 * Time: 19:08
 */
namespace addons\master\product\controllers;

use Yii;

class ProdskutController extends \yii\swoole\rest\ActiveController
{

    public $modelClass = 'addons\master\product\models\GProductType';

    /**
     * @SWG\Post(path="/product_type_all",
     *     tags={"product"},
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
    public function actionProduct_type_all()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('product')->sendAndrecv([['\addons\master\product\modellogic\productLogic', 'getallsmalltype'], [$post]]);
    }
}