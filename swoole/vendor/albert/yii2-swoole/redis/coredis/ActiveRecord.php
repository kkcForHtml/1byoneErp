<?php
namespace yii\swoole\redis\coredis;

use Yii;

class ActiveRecord extends \yii\swoole\redis\cpredis\ActiveRecord
{
    public static function find()
    {
        return Yii::createObject(ActiveQuery::className(), [get_called_class()]);
    }
}