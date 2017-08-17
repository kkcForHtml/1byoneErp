<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/21 0021
 * Time: 10:30
 */
namespace yii\swoole\behaviors;

use Yii;
use yii\behaviors\BlameableBehavior;

class OperatorBehaviors extends BlameableBehavior
{
    public $getAttribute = 'USER_INFO_ID';


    /**
     * @inheritdoc
     *
     * In case, when the [[value]] is `null`, the result of the PHP function [time()](http://php.net/manual/en/function.time.php)
     * will be used as value.
     */
    protected function getValue($event)
    {
        if ($this->value === null) {
            $user = Yii::$app->getUser();
            return $user && !$user->isGuest ? $user->getIdentity()->{$this->getAttribute} : '0';
        }
        return parent::getValue($event);
    }
}