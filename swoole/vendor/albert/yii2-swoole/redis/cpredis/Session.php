<?php

namespace yii\swoole\redis\cpredis;

use Yii;
use yii\base\InvalidConfigException;

class Session extends \yii\swoole\redis\Session
{

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

    public function writeSession($id, $data)
    {
        return (bool)$this->redis->executeCommand('SET', [$this->calculateKey($id), $data, ['EX', $this->getTimeout()]]);
    }

}
