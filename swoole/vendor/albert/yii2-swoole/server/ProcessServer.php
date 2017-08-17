<?php

namespace yii\swoole\server;

use Yii;
use yii\swoole\helpers\ArrayHelper;
use yii\swoole\process\IProcessServer;

class ProcessServer implements IProcessServer
{
    public static $instance;

    public function start($config)
    {
        Yii::$app->backendwork->startAll(ArrayHelper::getValue($config, 'common'));
    }

    public function stop()
    {
        Yii::$app->backendwork->stopAll();
    }

    public static function getInstance()
    {
        if (!self::$instance) {
            self::$instance = new ProcessServer();
        }
        return self::$instance;
    }

}
