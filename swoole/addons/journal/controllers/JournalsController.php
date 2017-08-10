<?php

namespace addons\journal\controllers;

use Yii;

class JournalsController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\journal\models\LJournal';

}