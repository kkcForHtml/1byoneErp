<?php

namespace yii\swoole\process;

use Yii;
use yii\queue\Job;
use yii\swoole\redis\coredis\Connection;

class QueueProcess extends BaseProcess
{
    public $queue = 'queue';

    public function init()
    {
        parent::init();
        $this->queue = Yii::$app->get($this->queue);
        $this->server = Yii::$app->getSwooleServer();
    }

    public function start($class, $config)
    {
        for ($i = 0; $i < $config['worker']; $i++) {
            $queue_process = new \swoole_process(function ($process) use ($class, $config, $i) {
                $this->workerStart();
                $process->name('swoole-queue-' . $class . '-' . $i);
                if ($config['sleep'] > 0) {
                    swoole_timer_tick($config['sleep'] * 1000, function () use ($process, $class, $config) {
                        $this->doWork($process, $class, $config);
                    });
                } else {
                    $this->doWork($process, $class, $config);
                }

            }, false, 2);

            if ($this->server) {
                $this->server->addProcess($queue_process);
            } else {
                $pid = $queue_process->start();
                if (!in_array($pid, $this->pids)) {
                    $this->pids[] = $pid;
                }
                if (!isset($this->processArray[$pid])) {
                    $this->processArray[$pid] = $queue_process;
                }
                $this->savePid();
            }
        }
    }

    protected function doWork($process, $class, $config)
    {
        if ($this->queue->connector instanceof Connection) {
            \Swoole\Coroutine::create(function () use ($process, $class, $config) {
                $this->startWork($process, $class, $config);
            });
        } else {
            $this->startWork($process, $class, $config);
        }
    }

    private function startWork($process, $class, $config)
    {
        try {
            $job = $this->queue->pop($class);
            if ($job instanceof Job) {
                if ($config['attempt'] > 0 && $job->getAttempts() > $config['attempt']) {
                    $job->failed();
                } else {
                    $job->execute();
                    if (!$job->isDeleted()) {
                        $job->release($config['delay']);
                    }
                }
            }

            $this->memoryExceeded($process->pid, $class);
            $this->release();
        } catch (\Exception $e) {
//            @file_put_contents($this->log_path . '/' . $class . '.log', (string)$e, FILE_APPEND);
            \Swoole\Async::writeFile($this->log_path . '/' . $class . '.log', (string)$e, function ($filename) {

            }, FILE_APPEND);
            $this->release();
            $this->stop($process->pid);
        }
    }
}
