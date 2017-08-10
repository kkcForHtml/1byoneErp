<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/13 0013
 * Time: 17:45
 */
namespace addons\master\basics\controllers;

use Yii;
use \yii\swoole\rest\ActiveController;

class WarehouseController extends ActiveController
{

    public $modelClass = 'addons\master\basics\models\BWarehouse';


}