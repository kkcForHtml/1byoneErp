<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/13 0013
 * Time: 17:44
 */
namespace addons\master\basics\controllers;

use Yii;

class MoneyController extends \yii\swoole\rest\ActiveController
{

    public $modelClass = 'addons\master\basics\models\BMoney';

}