<?php

namespace yii\swoole\clog\collecters;


use yii\swoole\clog\BaseCollecter;

class FileCollecter extends BaseCollecter
{
    public function write($data)
    {
        print_r($data);
    }
}