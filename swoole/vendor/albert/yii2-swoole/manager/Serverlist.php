<?php

namespace yii\swoole\manager;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\redis\coredis\ActiveRecord;

class Serverlist extends ActiveRecord
{

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ip', 'status', 'updated_at', 'preupdated_at', 'port'], 'integer'],
            [['rpcs'], 'string', 'max' => Yii::$app->RpcHelper->getRpcLen()],
            [['host'], 'string', 'max' => 16],
        ];
    }

    public function attributes()
    {
        return ['id', 'ip', 'port', 'rpcs', 'host', 'updated_at', 'preupdated_at', 'status'];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ip' => 'ip地址数字串',
            'port' => '端口号',
            'rpcs' => '提供的服务',
            'host' => '服务器地址',
            'updated_at' => '更新时间',
            'preupdated_at' => '上次更新时间',
            'status' => '服务器状态'
        ];
    }

    public function behaviors()
    {
        return [
            [
                'class' => TimestampBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['updated_at', 'preupdated_at'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['updated_at'],
                ],
            ],
        ];
    }

}
