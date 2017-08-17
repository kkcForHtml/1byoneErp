<?php

namespace yii\swoole\work;

use Yii;

class SrvHeartbeat implements \yii\swoole\work\IHeartbeat
{

    public function __construct()
    {
        $this->heartbeat();
    }

    public function heartbeat()
    {
        if (Yii::$app->mserver) {
            swoole_timer_tick(Yii::$app->params['BeatConfig']['Srvhbtick'] * 1000, function () {
                \Swoole\Coroutine::create(function () {
                    Yii::$app->mserver->dealServer();
                    Yii::$app->clearComponents();
                });
            });
        }
    }

}
