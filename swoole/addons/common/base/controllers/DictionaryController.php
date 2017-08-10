<?php

namespace addons\common\base\controllers;

use Yii;

class DictionaryController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\common\base\models\PDictionary';
}