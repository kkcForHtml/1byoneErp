<?php

namespace yii\swoole\pool;

use Yii;
use yii\swoole\helpers\ArrayHelper;

class TcpPool extends \yii\swoole\pool\IPool
{
    public function createConn(string $connName)
    {
        $config = ArrayHelper::getValueByArray($this->connsConfig[$connName], ['async', 'hostname', 'port', 'timeout'],
            [true, 'localhost', Yii::$app->params['swoole']['tcp']['port'], 0.5]);
        if ($config['async']) {
            $conn = new \Swoole\Coroutine\Client(SWOOLE_SOCK_TCP | SWOOLE_KEEP);
        } else {
            $conn = new \swoole_client(SWOOLE_SOCK_TCP | SWOOLE_KEEP);
        }
        $conn->connect($config['hostname'], $config['port'], $config['timeout']);
        return $conn;
    }
}
