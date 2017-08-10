<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/18 0013
 * Time: 17:59
 */
namespace addons\inventory\controllers;

use Yii;

class PendingdeController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\inventory\models\SkPendingDelivery';

   /*
    * 检测库存
    */
    public function actionCheckinventory(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PenddeliveryLogic','checkSkuInventory'],[$post]]);
    }

    /*
     * 确认出库
     */
    public function actionEnsurependde(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PenddeliveryLogic','ensurePendDelivery'],[$post]]);
    }

    /**
     * 取消出库
     * @return mixed
     * author Fox
     */
    public function actionCancelinventory(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PenddeliveryLogic','cancelPendDelivery'],[$post]]);
    }
}