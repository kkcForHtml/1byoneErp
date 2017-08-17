<?php

namespace yii\swoole\process;

use Yii;
use yii\swoole\server\WorkTrait;

abstract class BaseProcess extends \yii\base\Component
{
    use WorkTrait;
    public $processArray = [];
    public $pidFile;
    public $pids = [];
    public $processList = [];
    public $memory = 512;
    protected $config = [];
    protected $root;
    protected $server = null;
    public $log_path = '/data/logs';

    public function startAll($workConfig)
    {
        $this->config = $workConfig;
        $this->root = $workConfig['root'];
        foreach ($this->processList as $class => $config) {
            $this->start($class, $config);
        }
    }

    abstract public function start($class, $config);

    public function savePid()
    {
        if ($this->pidFile) {
            \Swoole\Async::writeFile($this->pidFile, implode(',', $this->pids), function ($filename) {

            }, FILE_APPEND);
//            @file_put_contents($this->pidFile, implode(',', $this->pids));
        }
    }

    public function stop($pid, $status = 0)
    {
        $process = $this->processArray[$pid];
        $process->exit($status);
        unset($this->processArray[$pid]);
    }

    public function stopAll($status = 0)
    {
        foreach ($this->processArray as $pid => $process) {
            $process->exit($status);
        }
//        $pids = @file_exists($this->pidFile) ? file_get_contents($this->pidFile) : [];
        \Swoole\Async::readFile($this->pidFile, function ($filename, $content) {
            if (is_string($content)) {
                $pids = explode(',', $content);
            }
            foreach ($pids as $pid) {
                \swoole_process::kill(intval($pid));
            }
            @unlink($this->pidFile);
        });

    }

    /**
     * 判断内存使用是否超出
     * @param  int $memoryLimit
     * @return bool
     */
    public function memoryExceeded($pid, $name)
    {
        if ((memory_get_usage() / 1024 / 1024) >= $this->memory) {
//            @file_put_contents($this->log_path . '/' . $name . '.log', 'out of memory!', FILE_APPEND);
            \Swoole\Async::writeFile($this->log_path . '/' . $name . '.log', 'out of memory!', function ($filename) {

            }, FILE_APPEND);
            $this->release();
            $this->stop($process->pid);
        }
    }

    public function release()
    {
        if (!$this->server) {
            Yii::getLogger()->flush();
            Yii::getLogger()->flush(true);
            Yii::$app->clearComponents();
        }
    }

}
