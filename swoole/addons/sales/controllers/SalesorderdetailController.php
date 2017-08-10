<?php
/**
 * User: Fable
 */
namespace addons\sales\controllers;

use addons\sales\models\CrSalesOrderDetail;
use \yii\swoole\rest\ActiveController;
use Yii;
use yii\swoole\rest\DeleteExt;
use yii\swoole\rest\ResponeModel;
use yii\swoole\rest\UpdateExt;

class SalesorderdetailController extends ActiveController
{

    public $modelClass = 'addons\sales\models\CrSalesOrderDetail';
}