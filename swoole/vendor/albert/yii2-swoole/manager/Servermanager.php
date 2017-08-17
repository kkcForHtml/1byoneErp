<?php

namespace yii\swoole\manager;

use Yii;
use yii\swoole\helpers\SerializeHelper;

class Servermanager extends \yii\base\Component implements \yii\swoole\manager\IServermanager
{

    public $appconfig;
    public $time_diff = 2;

    public function addserver($data)
    {
        $result = true;
        $ser = Serverlist::find()->where(['ip' => $data['ip']])->one();
        if (!$ser) {
            $ser = new Serverlist();
        }
        $data['rpcs'] = SerializeHelper::serialize(Yii::$rpcList);
        $ser->load($data, '');
        Yii::$app->BaseHelper->validate($ser);
        $ser->preupdated_at = $ser->updated_at;
        $result &= $ser->save();
        return $result;
    }

    public function delserver($data = null)
    {
        Serverlist::deleteAll($data);
    }

    public function getlist($data = [])
    {
        return Serverlist::find()->filterWhere($data)->asArray()->all();
    }

    public function create()
    {
        $this->addserver($this->appconfig);
    }

    public function getFromRedis($appname = null)
    {
        $ips = [];
        $srvlist = $this->getlist(['status' => 1]);
        foreach ($srvlist as $srv) {
            $rpcs = SerializeHelper::unserialize($srv['rpcs']);
            if (in_array($appname, $rpcs)) {
                $ips[] = $srv['host'];
            }
        }
        return $ips;
    }

    public function dealServer()
    {
        $srvlist = $this->getlist();
        foreach ($srvlist as $srv) {
            if ($srv['ip'] == current(swoole_get_local_ip())) {
                Yii::$app->getSwooleServer()->serverTable->del($srv['ip']);
            } elseif ($this->time_diff * 1000 < $srv['updated_at'] - $srv['preupdated_at']) {
                $srv['status'] = 2;
                $this->addserver($srv);
                Yii::$app->getSwooleServer()->serverTable->del($srv['ip']);
            } else {
                Yii::$app->getSwooleServer()->serverTable->set($srv['ip'], ['host' => $srv['host'], 'rpcs' => $srv['rpcs']]);
            }
        }
    }

    public function getTable($appname = null)
    {
        $ips = [];
        foreach (Yii::$app->getSwooleServer()->serverTable as $host => $data) {
            $rpcs = SerializeHelper::unserialize($data['rpcs']);
            if (in_array($appname, $rpcs)) {
                $ips[] = [$data['host'], $data['port']];
            }
        }
        return $ips;
    }

}
