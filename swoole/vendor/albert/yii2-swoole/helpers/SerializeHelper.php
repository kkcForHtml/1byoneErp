<?php

namespace yii\swoole\helpers;

class SerializeHelper
{

    public static function serialize($data)
    {
        if (extension_loaded('swoole') && $data) {
            return \Swoole\Serialize::pack($data);
        } elseif (extension_loaded('hprose')) {
            return hprose_serialize($data);
        } else {
            return serialize($data);
        }
    }

    public static function unserialize($data)
    {
        if (extension_loaded('swoole') && $data) {
            return \Swoole\Serialize::unpack($data);
        } elseif (extension_loaded('hprose')) {
            return hprose_serialize($data);
        } else {
            return unserialize($data);
        }
    }

}
