<?php

namespace yii\swoole\helpers;

class CoroHelper
{
    public static function getId()
    {
        if (PHP_SAPI === 'cli' && is_callable('\Swoole\Coroutine::getuid')) {
            $id = \Swoole\Coroutine::getuid();
            return $id === -1 ? 0 : $id;
        } else {
            return 0;
        }
    }

    public static function sleep($time)
    {
        if (PHP_SAPI === 'cli' && is_callable('\Swoole\Coroutine::sleep')) {
            \Swoole\Coroutine::sleep($time / 1000);
        } else {
            sleep($time);
        }
    }

    public static function wait($time = 0.5)
    {
        if (PHP_SAPI === 'cli' && is_callable('\Swoole\Coroutine::sleep')) {
            \Swoole\Coroutine::sleep($time);
        }
    }
}