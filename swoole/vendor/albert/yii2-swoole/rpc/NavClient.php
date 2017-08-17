<?php

namespace yii\swoole\rpc;

use Yii;

class NavClient extends IRpcClient
{

    private $data;

    public function recv()
    {
        list($method, $data) = $this->data;
        $data = $GLOBALS['call_user_func_array']($method, $data);
        return $data;
    }

    public function send($data, $uri = null)
    {
        $this->data = $data;
        return clone $this;
    }

}
