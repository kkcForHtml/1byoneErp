<?php
/**
 * Created by PhpStorm.
 * controller: 组织分组控制器
 * Date: 2017/4/13 0013
 * Time: 17:59
 */
namespace addons\organization\controllers;

use \yii\swoole\rest\ActiveController;
use Yii;

class GroupingController extends ActiveController
{

    public $modelClass = 'addons\organization\models\OGrouping';
}
