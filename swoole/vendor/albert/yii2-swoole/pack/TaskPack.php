<?php

namespace yii\swoole\pack;

use Yii;

class TaskPack implements IPack {

    public static function decode($buffer, $server = null) {
        return json_decode($buffer);
    }

    public static function encode($buffer, $server = null) {
        return json_encode($buffer);
    }

}
