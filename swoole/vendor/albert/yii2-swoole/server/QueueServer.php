<?php

namespace yii\swoole\server;

use Yii;
use yii\swoole\helpers\ArrayHelper;
use yii\swoole\process\IProcessServer;

class QueueServer implements IProcessServer
{

    public static $instance;

    public function start($config)
    {
        Yii::$app->queuework->startAll(ArrayHelper::getValue($config, 'common'));
    }

    public function stop()
    {
        Yii::$app->queuework->stopAll();
    }

    public static function getInstance()
    {
        if (!self::$instance) {
            self::$instance = new QueueServer();
        }
        return self::$instance;
    }

}
