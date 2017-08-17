<?php

namespace yii\swoole\pool;

use Yii;
use yii\swoole\helpers\ArrayHelper;
use yii\web\ServerErrorHttpException;

class HttpPool extends \yii\swoole\pool\IPool
{
    public function createConn(string $connName)
    {
        $config = ArrayHelper::getValueByArray($this->connsConfig[$connName], ['hostname', 'port', 'timeout', 'scheme'],
            ['localhost', 80, 0.5, 'http']);
        if (($ret = swoole_async_dns_lookup_coro($config['hostname'], $config['timeout']))) {
            $conn = new \Swoole\Coroutine\Http\Client($ret, $config['port'], $config['scheme'] === 'https' ? true : false);
            if ($conn->errCode !== 0) {
                throw new ServerErrorHttpException("Can not connect to {$connName}: " . $config['hostname'] . ':' . $config['port']);
            }
            return $conn;
        }
        throw new ServerErrorHttpException("Can not connect to {$connName}: " . $config['hostname'] . ':' . $config['port']);
    }
}
