<?php

namespace yii\swoole\server;

use swoole_server;
use Yii;
use yii\swoole\async\Task;
use yii\swoole\helpers\ArrayHelper;
use yii\swoole\pack\TcpPack;

class TaskServer extends Server
{

    public static $instance;

    public function __construct($config)
    {
        $this->allConfig = $config;
        $this->config = ArrayHelper::merge(ArrayHelper::getValue($config, 'tcp'), ArrayHelper::getValue($config, 'common'));
        $server = new swoole_server($this->config['host'], $this->config['port']);
        $this->name = $this->config['name'];
        if (isset($this->config['pidFile'])) {
            $this->pidFile = $this->config['pidFile'];
        }
        $server->set($this->config['server']);

        $server->on('Receive', array($this, 'onReceive'));
        $server->on('Start', array($this, 'onStart'));
        $server->on('workerStart', array($this, 'onWorkerStart'));
        $server->on('managerStart', [$this, 'onManagerStart']);
        $server->on('Task', array($this, 'onTask'));
        $server->on('Finish', array($this, 'onFinish'));
        $this->beforeStart();
        $server->start();
    }

    public function onReceive($serv, $fd, $from_id, $data)
    {
//        \Swoole\Coroutine::create(function () use ($serv, $fd, $from_id, $data) {
            $param = array(
                'fd' => $fd,
                'data' => TcpPack::decode($data, 'task')
            );
            // start a task
            $serv->task(json_encode($param));
//        });
    }

    public function onTask($serv, $task_id, $from_id, $data)
    {
        $fd = json_decode($data, true);
        $tmp_data = $fd['data'];
        Task::runTask($tmp_data, $task_id);
        $serv->send($fd['fd'], "Data in Task {$task_id}");
        return 'ok';
    }

    public function onFinish($serv, $task_id, $data)
    {
        echo "Task {$task_id} finish\n";
        echo "Result: {$data}\n";
    }

    public static function getInstance($config)
    {
        if (!self::$instance) {
            self::$instance = new TaskServer($config);
        }
        return self::$instance;
    }

}
