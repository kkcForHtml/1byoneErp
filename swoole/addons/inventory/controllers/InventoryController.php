<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/18 0013
 * Time: 17:59
 */

namespace addons\inventory\controllers;

use Yii;

class InventoryController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\inventory\models\SkInstantInventory';

    public function actionCheckinventory()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\instantInventoryLogic', 'checkInventory'], [$post]]);
    }
}