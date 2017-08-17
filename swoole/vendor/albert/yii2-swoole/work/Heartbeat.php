<?php

namespace yii\swoole\work;
use Yii;

class Heartbeat
{
    public static function Moint()
    {
        //服务监控

        $reload_process = new \swoole_process(function ($process) {
            $process->name('SWD-MOINT');
            new SrvHeartbeat();
        }, false, 2);
        Yii::$app->getSwooleServer()->addProcess($reload_process);
    }

    public static function UpSrv()
    {
        //服务上报
        $reload_process = new \swoole_process(function ($process) {
            $process->name('SWD-SRVUP');
            new SrvUpHeartbeat();
        }, false, 2);
        Yii::$app->getSwooleServer()->addProcess($reload_process);
    }

    public static function Inotity($path)
    {
        $reload_process = new \swoole_process(function ($process) use ($path) {
            $process->name('SWD-RELOAD');
            new \yii\swoole\work\InotifyProcess(Yii::$app->getSwooleServer(), $path);
        }, false, 2);
        Yii::$app->getSwooleServer()->addProcess($reload_process);
    }

}
