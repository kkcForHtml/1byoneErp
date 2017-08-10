<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/18
 * Time: 15:55
 */
namespace  addons\tools\controllers;
use yii;

/**
 * Class  产品问答
 * @package addons\tools\controllers
 */
class   ProductqaController extends \yii\swoole\rest\ActiveController{
      public $modelClass='addons\tools\models\QaProductFqa';
    /**
     *
     * @return string
     */

    /**
     * @SWG\Get(path="/Saveqa",
     *     tags={"xxxx"},
     *     summary="查询表数据",
     *     description="返回查询结果",
     *     produces={"application/json"},
     *
     *     @SWG\Response(
     *         response = 200,
     *         description = " success"
     *     )
     * )
     *
     */
    public  function actionSaveqa(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('tools')->sendAndrecv([['\addons\tools\modellogic\productqalogic','Saveqa'],[$post]]);
    }
}