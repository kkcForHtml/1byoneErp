<?php

namespace yii\swoole\rpc;

use Yii;
use yii\helpers\ArrayHelper;
use yii\swoole\pack\TcpPack;
use yii\web\NotFoundHttpException;

class TcpClient extends IRpcClient
{

    public $client;
    public $timeout = 0.5;
    public $async = true;

    public function recv()
    {
        $result = TcpPack::decode($this->client->recv(), 'tcp');
        Yii::$container->get('tcpclient')->recycle($this->client);
        return $result;
    }

    public function send($data, $uri = null)
    {
        $cor = $this->getRpcCall($data);
        //从连接池中获取连接
        $serlist = null;
        if ($uri) {
            $serlist = [$uri];
        } elseif ($cor) {
            $serlist = Yii::$app->mserver->getTable($cor);
        }
        if (!$serlist && $cor) {
            $serlist = ArrayHelper::getColumn(Yii::$app->mserver->getFromRedis($cor), 'host', false);
        }
        if (!$serlist) {
            throw new NotFoundHttpException(Yii::t('yii', 'Page not found.'));
        }
        $server = array_shift($serlist);
        list($server, $port) = $server;
        $serverIp = ip2long($server);
        $key = 'corotcp:' . $serverIp;
        if (!Yii::$container->hasSingleton('tcpclient')) {
            Yii::$container->setSingleton('tcpclient', [
                'class' => 'yii\swoole\pool\TcpPool'
            ]);
        }
        $this->client = Yii::$container->get('tcpclient')->create($key,
            [
                'hostname' => $server,
                'port' => $port,
                'timeout' => $this->timeout,
                'async' => $this->async,
                'pool_size' => $this->maxPoolSize,
                'busy_size' => $this->busy_pool
            ])
            ->fetch($key);
        //

        $odata = [current(swoole_get_local_ip()), Yii::$app->request->getTraceId()];
        $this->client->send(TcpPack::encode(ArrayHelper::merge($data, $odata), 'tcp'));
        return $this;
    }

}
