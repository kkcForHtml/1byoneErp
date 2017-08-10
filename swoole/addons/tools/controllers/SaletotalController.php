<?php
/**
 * User: Fable
 */
namespace addons\tools\controllers;

use Yii;
use addons\tools\modellogic\XAmaorderlogic\Model\ListInventorySupplyRequest;
use addons\tools\modellogic\XAmazoninventorylogic;

class SaletotalController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\tools\models\OboSaletotal';

    public function actionParsesaledata(){
        return Yii::$app->rpc->create('tools')->sendAndrecv([['\addons\tools\modellogic\SaletotalLogic','ParseSaleData'],[]]);
    }

}