<?php
/**
 * Created by PhpStorm.
 * User: Fable
 * Date: 2017/5/31 0013
 * Time: 16:21
 */
namespace addons\inventory\controllers;

use Yii;

class AdjustmentController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\inventory\models\SkAdjustment';


    public function actionCheckadjustment(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\AdjustmentLogic','checkSkuInventory'],[$post]]);
    }

    /**
     * 删除
     */
    public function actionDeleteadj(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\AdjustmentLogic','deleteAdj'],[$post['batch']]]);
    }
}