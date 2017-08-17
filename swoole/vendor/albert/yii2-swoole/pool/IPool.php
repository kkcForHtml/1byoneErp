<?php

namespace yii\swoole\pool;

use Yii;

abstract class IPool extends \yii\base\Component
{
    use PoolTrait;

    abstract public function createConn(string $connName);
}
