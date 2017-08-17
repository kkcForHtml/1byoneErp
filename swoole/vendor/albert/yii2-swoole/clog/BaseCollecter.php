<?php

namespace yii\swoole\clog;

use Yii;
use yii\base\Component;
use yii\swoole\clog\model\MsgModel;

abstract class BaseCollecter extends Component
{
    protected $_logs;
    public $max_num = 50;

    public function save(MsgModel $model)
    {
        $this->_logs[] = $model->toArray();
        if (count($this->_logs) === $this->max_num) {
            $this->write($this->_logs);
            unset($this->_logs);
            $this->_logs = [];
        }
    }

    abstract function write($data);
}