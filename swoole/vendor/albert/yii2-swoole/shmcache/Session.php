<?php
/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace yii\swoole\shmcache;

use Yii;
use yii\base\InvalidConfigException;

class Session extends \yii\swoole\web\Session
{
    public $shmcache = 'cache';

    public $keyPrefix;

    public function init()
    {
        if (is_string($this->shmcache)) {
            $this->shmcache = Yii::$app->get($this->shmcache);
        } elseif (is_array($this->shmcache)) {
            if (!isset($this->shmcache['class'])) {
                $this->shmcache['class'] = Cache::className();
            }
            $this->shmcache = Yii::createObject($this->shmcache);
        }
        if (!$this->shmcache instanceof Cache) {
            throw new InvalidConfigException("Session::redis must be either a Redis connection instance or the application component ID of a Redis connection.");
        }
        if ($this->keyPrefix === null) {
            $this->keyPrefix = substr(md5(Yii::$app->id), 0, 5);
        }
        register_shutdown_function([$this, 'close']);
        if ($this->getIsActive()) {
            Yii::warning('Session is already started', __METHOD__);
            $this->updateFlashCounters();
        }
    }

    public function getUseCustomStorage()
    {
        return true;
    }

    public function readSession($id)
    {
        $data = $this->shmcache->get($this->calculateKey($id));

        return $data === false || $data === null ? '' : $data;
    }

    public function writeSession($id, $data)
    {
        return (bool)$this->shmcache->set($this->calculateKey($id), $data, $this->getTimeout());
    }

    public function destroySession($id)
    {
        return $this->shmcache->delete($this->calculateKey($id));
    }

    protected function calculateKey($id)
    {
        return $this->keyPrefix . md5(json_encode([__CLASS__, $id]));
    }
}
