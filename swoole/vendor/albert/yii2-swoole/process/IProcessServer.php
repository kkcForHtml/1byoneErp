<?php

namespace yii\swoole\process;

interface IProcessServer
{
    public function start($config);

    public function stop();

    public static function getInstance();
}