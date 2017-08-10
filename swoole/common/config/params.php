<?php

return [
    'adminEmail' => 'admin@example.com',
    'supportEmail' => 'support@example.com',
    'user.passwordResetTokenExpire' => 3600,
    'php_path' => "/usr/local/php/bin/php", //php的绝对路径,
    'conf_path' => Yii::getAlias('@common') . '/config/libshmcache.conf', //共享内存配置
    'swoole' => require(__DIR__ . '/swoole.php'),
    'BeatConfig' => ['Srvhbtick' => 2, 'DBhbtick' => 30],
    'Hearbeat' => ['class' => '\yii\swoole\work\Heartbeat', 'func' => ['DbBeat' => false, 'Moint' => true, 'UpSrv' => true, 'Inotity' => false]],
    'auto_clear_cache' => true,
    'gziplevel' => 3,
    'rpcCoR' => [],
    'extRpc' => [],
    'path' => '/swoole'
];
