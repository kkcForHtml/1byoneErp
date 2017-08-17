<?php

namespace yii\swoole\clog\model;


use yii\swoole\base\Model;

class MsgModel extends Model
{
    public $route;
    public $created_at;
    public $status;
    public $message;

    public function rules()
    {
        return [
            [['route', 'created_at', 'status', 'message'], 'required'],
            [['status', 'created_at'], 'integer']
        ];
    }
}