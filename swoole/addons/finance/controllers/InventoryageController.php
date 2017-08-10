<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/24 0013
 * Time: 17:59
 */
namespace addons\finance\controllers;

use Yii;

class InventoryageController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\finance\models\AcInventoryAge';
}