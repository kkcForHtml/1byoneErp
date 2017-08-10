<?php
/**
 * Created by PhpStorm.
 * User: erp
 * Date: 2017/8/8
 * Time: 9:50
 */

namespace addons\tools\controllers;


class PlatformdataController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\tools\models\ToPlatformData';
}