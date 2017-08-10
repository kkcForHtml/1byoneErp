<?php
/**
 * Created by PhpStorm.
 * User: erp
 * Date: 2017/7/18
 * Time: 10:13
 */

namespace addons\inventory\controllers;

use Yii;

class StockinitialiseController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\inventory\models\SkStockInitialise';

    /**
     * 导出模板
     */
    public function actionExporttemplate(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\stockinitialiseLogic','exportTemplate'],[$post]]);
    }

    /**
     * 导入数据
     */
    public function actionImportdata(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\stockinitialiseLogic','importData'],[$post]]);
    }

}