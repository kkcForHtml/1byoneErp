<?php
/**
 * Created by PhpStorm.
 * controller: 组织分组控制器
 * Date: 2017/4/13 0013
 * Time: 17:59
 */
namespace addons\shipment\controllers;

use \yii\swoole\rest\ActiveController;
use Yii;

class AllocationController extends ActiveController
{

    public $modelClass = 'addons\shipment\models\ShAllocation';
}
