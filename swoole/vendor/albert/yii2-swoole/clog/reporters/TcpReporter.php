<?php

namespace yii\swoole\clog\reporters;

use Yii;
use yii\swoole\clog\BaseReporter;

class TcpReporter extends BaseReporter
{
    public $hostname = '127.0.0.1';
    public $port = '9503';
    public $client = 'tcpclient';

    public function init()
    {
        parent::init();
        if (is_string($this->client)) {
            $this->client = Yii::$app->get($this->client);
        } elseif (is_array($this->client)) {
            $this->client = Yii::$container->setSingleton('reporter', $this->client)->get('reporter');
        }
    }

    public function upload($data)
    {
        if (($result = $this->client->sendAndrecv($this->hostname, $this->port, $data)) instanceof \Exception) {
            throw $result;
        }
    }
}