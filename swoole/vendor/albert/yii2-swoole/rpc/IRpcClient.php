<?php

namespace yii\swoole\rpc;

abstract class IRpcClient extends \yii\base\Component
{
    public $maxPoolSize = 10;
    public $busy_pool = 10;

    public function create($appname)
    {
        return $this;
    }

    abstract public function send($data, $uri = null);

    abstract public function recv();

    public function sendAndrecv($data)
    {
        return $this->send($data)->recv();
    }

    public function getRpcCall($data)
    {
        if (is_array($data[0])) {
            $cor = $data[0][0][0] === '\\' ? substr($data[0][0], 1) : $data[0][0];
        } else {
            $cor = array_shift($data);
            $cor = substr($cor, 0, strrpos($cor, '/'));
        }
        return $cor;
    }

}
