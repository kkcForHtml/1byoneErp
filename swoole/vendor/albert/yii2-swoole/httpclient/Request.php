<?php

namespace yii\swoole\httpclient;

class Request extends \yii\httpclient\Request
{
    public $pool_size = 30;
    public $busy_size = 15;
    public $dns_timeout = 0.5;
    public $client_timeout = -1;
    public $keep_alive = true;
    public $websocket_mask = true;
}
