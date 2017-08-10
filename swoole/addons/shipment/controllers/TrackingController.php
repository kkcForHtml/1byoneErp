<?php
/**
 * Created by PhpStorm.
 * controller: 采购计划单
 * Date: 2017/4/13 0013
 * Time: 17:59
 */
namespace addons\shipment\controllers;

use \yii\swoole\rest\ActiveController;
use Yii;

class TrackingController extends ActiveController
{

    public $modelClass = 'addons\shipment\models\ShTracking';
}
