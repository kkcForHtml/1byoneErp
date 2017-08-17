<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/24 0024
 * Time: 12:58
 */

namespace yii\swoole\modellogic;

class BaseLogic
{
    use CRUDTrait;

    public static $modelClass;

    public static function checkAccess($action, $params = [])
    {

    }
}