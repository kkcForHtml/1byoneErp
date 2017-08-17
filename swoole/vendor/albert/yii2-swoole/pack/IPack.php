<?php

namespace yii\swoole\pack;

interface IPack {

    public static function encode($buffer, $server = null);

    public static function decode($buffer, $server = null);
}
