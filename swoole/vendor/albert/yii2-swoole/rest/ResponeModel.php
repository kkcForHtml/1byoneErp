<?php

namespace yii\swoole\rest;

class ResponeModel extends \yii\base\Object {

    public $status;
    public $code;
    public $message;
    public $data;
    public $_meta;

    public function setModel($status, $code, $message, $data, $_meta = null) {
        $this->status = $status;
        $this->code = $code;
        $this->message = $message;
        $this->data = $data;
        $this->_meta = $_meta;
        return $this;
    }

}
