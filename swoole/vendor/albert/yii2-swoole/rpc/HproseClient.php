<?php

namespace yii\swoole\rpc;

use Yii;
use yii\helpers\ArrayHelper;

class HproseClient extends IRpcClient {

    private $client;
    public $client_type = 'swoole';
    public $link_type = 'tcp';
    public $async;
    private $data;

    public function create($appname, $uri = null) {
        try {
            $serlist = [];
            if ($uri) {
                $serlist = [$uri];
            }
            elseif ($appname) {
                $serlist = Yii::$app->mserver->getTable($appname);
            }
            if (!$serlist && $appname) {
                $serlist = ArrayHelper::getColumn(Yii::$app->mserver->getlist(['appname' => $appname, 'status' => 1]), 'host');
            }

            $curlist = [];
            $port = Yii::$app->params['swoole']['hprose']['port'];
            foreach ($serlist as $host) {
                $curlist[] = $this->link_type . "://{$host}:{$port}";
            }
            switch ($this->client_type) {
                case 'swoole':
                    $this->client = \Hprose\Swoole\Client::create($curlist, $this->async);
                    break;
                case 'hprose':
                    $this->client = \Hprose\Client::create($curlist, false);
                    break;
                default:
                    $this->client = \Hprose\Swoole\Client::create($curlist, $this->async);
            }
            $this->client->setMaxPoolSize($this->maxPoolSize);
        }
        catch (\Exception $e) {
            print_r($e->getMessage());
        }
        finally {
            return $this;
        }
    }

    public function recv() {
        if ($this->client_type === 'swoole') {
            $data = $this->client->recv();
        }
        else {
            list($method, $data) = $this->data;
            $data = $GLOBALS['call_user_func_array']([$this->client, $method[1]], $data);
        }
        return $data;
    }

    public function send($data) {
        if ($this->client_type === 'swoole') {
            list($method, $data) = $data;
            $GLOBALS['call_user_func_array']([$this->client, $method], $data);
        }
        else {
            $this->data = $data;
        }
        return $this;
    }

}
