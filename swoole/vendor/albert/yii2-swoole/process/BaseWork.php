<?php

namespace yii\swoole\process;

abstract class BaseWork extends \yii\base\Object
{

    public $timer;
    public $ticket = 0.5;
    public $processName;
    public $params = [];
    public $use_coro = false;
    public $retry = 3;

    abstract public function doWork();
}
