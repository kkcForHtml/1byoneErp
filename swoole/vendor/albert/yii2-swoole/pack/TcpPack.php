<?php

namespace yii\swoole\pack;

use Yii;
use yii\swoole\helpers\SerializeHelper;

class TcpPack implements IPack
{

    public static function encode($buffer, $server = null)
    {
        $buffer = SerializeHelper::serialize($buffer);
        $total_length = Yii::$app->params['swoole'][$server]['server']['package_length_type_len'] + strlen($buffer) - Yii::$app->params['swoole'][$server]['server']['package_length_offset'];
        return pack(Yii::$app->params['swoole'][$server]['server']['package_length_type'], $total_length) . $buffer;
    }

    public static function decode($buffer, $server = null)
    {
        $buffer = substr($buffer, Yii::$app->params['swoole'][$server]['server']['package_length_type_len']);
        return SerializeHelper::unserialize($buffer);
    }

}
