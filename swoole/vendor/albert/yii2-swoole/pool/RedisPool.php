<?php

namespace yii\swoole\pool;

use Yii;
use yii\swoole\helpers\ArrayHelper;

class RedisPool extends \yii\swoole\pool\IPool
{
    public function createConn(string $connName)
    {
        $config = ArrayHelper::getValueByArray($this->connsConfig[$connName], ['hostname', 'port', 'serialize'],
            ['localhost', 6379, true]);

        $cons = ArrayHelper::getValueByArray($this->connsConfig[$connName], ['password', 'database', 'timeout'], [null, 0, 0.5]);

        $conn = new \Swoole\Coroutine\Redis($cons);
        $conn->connect($config['hostname'], $config['port'], false);
        return $conn;
    }
}
