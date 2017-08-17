<?php

namespace yii\swoole\rpc;

use Yii;
use yii\base\NotSupportedException;
use yii\swoole\helpers\ArrayHelper;

class RpcClient extends IRpcClient
{

    public $config_r;
    public $config_n;

    public function send($data, $uri = null)
    {
        $cor = $this->getRpcCall($data);
        if (in_array($cor, Yii::$rpcList) && !in_array($cor, ArrayHelper::getValue(Yii::$app->params, 'rpcCoR', []))) {
            $client = Yii::createObject($this->config_n);
        } else {
            $client = Yii::createObject($this->config_r);
        }
        return $client->send($data);
    }

    public function recv()
    {
        throw new NotSupportedException(Yii::t('custom', '不支持此方法调用'));
    }
}
