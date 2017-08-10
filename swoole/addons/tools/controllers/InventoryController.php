<?php
/**
 * Created by PhpStorm.
 * User: Fable
 * Date: 2017/5/25
 * Time: 17:08
 */
namespace addons\tools\controllers;

use Yii;

use yii\console\Controller;

class InventoryController extends Controller
{
    public $modelClass = '';

    /*
     * 抓取数据
     */
    public function actionTestinven(){
        return  Yii::$app->rpc->create('tools')->sendAndrecv([['\addons\tools\modellogic\XAmazoninventorylogic','getinventory'],[array()]]);
    }

    /**
     * 解析库存数据
     */
    public function actionParsingdata(){
        return Yii::$app->rpc->create('tools')->sendAndrecv([['\addons\tools\modellogic\XAmazoninventorylogic','ParsingData'],[]]);
    }

}