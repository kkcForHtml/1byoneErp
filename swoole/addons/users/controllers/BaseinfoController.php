<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/13 0013
 * Time: 17:59
 */
namespace addons\users\controllers;

use Yii;

class BaseinfoController extends \yii\swoole\rest\ActiveController
{

    public $modelClass = 'addons\master\basics\models\BAccount';

}