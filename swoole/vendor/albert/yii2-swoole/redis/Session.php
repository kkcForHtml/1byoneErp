<?php

namespace yii\swoole\redis;

use Yii;

class Session extends \yii\swoole\web\Session
{
    public $redis = 'redis';

    public $keyPrefix;

    public function init()
    {
        if (is_string($this->redis)) {
            $this->redis = Yii::$app->get($this->redis);
        } elseif (is_array($this->redis)) {
            if (!isset($this->redis['class'])) {
                $this->redis['class'] = Connection::className();
            }
            $this->redis = Yii::createObject($this->redis);
        }
        if (!$this->redis instanceof Connection) {
            throw new InvalidConfigException("Session::redis must be either a Redis connection instance or the application component ID of a Redis connection.");
        }
        if ($this->keyPrefix === null) {
            $this->keyPrefix = substr(md5(Yii::$app->id), 0, 5);
        }
        register_shutdown_function([$this, 'close']);
        if ($this->getIsActive()) {
            Yii::warning("Session is already started", __METHOD__);
            $this->updateFlashCounters();
        }
    }

    public function getUseCustomStorage()
    {
        return true;
    }

    public function readSession($id)
    {
        $data = $this->redis->executeCommand('GET', [$this->calculateKey($id)]);

        return $data === false || $data === null ? '' : $data;
    }

    public function writeSession($id, $data)
    {
        return (bool) $this->redis->executeCommand('SET', [$this->calculateKey($id), $data, 'EX', $this->getTimeout()]);
    }

    public function destroySession($id)
    {
        $this->redis->executeCommand('DEL', [$this->calculateKey($id)]);
        // @see https://github.com/yiisoft/yii2-redis/issues/82
        return true;
    }

    protected function calculateKey($id)
    {
        return $this->keyPrefix . md5(json_encode([__CLASS__, $id]));
    }
}