<?php

namespace yii\swoole\clog;

use Yii;
use yii\base\Component;

abstract class BaseReporter extends Component
{
    public $client;

    abstract function upload($data);
}