<?php

//defined('USE_POOL') or define('USE_POOL', true);
//$ip = current(swoole_get_local_ip());
return [
    'vendorPath' => dirname(dirname(__DIR__)) . '/vendor',
    'modules' => require(__DIR__ . '/modules.php'),
    'components' => [
        'assetManager' => [
            'class' => 'yii\swoole\web\AssetManager',
            'basePath' => '@runtime/assets',
            'baseUrl' => '/swoole/runtime/assets'
        ],
        'i18n' => [
            'translations' => [
                'custom' => [
                    'class' => 'yii\i18n\PhpMessageSource',
                    'basePath' => '@common/messages',
                    'sourceLanguage' => 'zh-CN',
                ],
            ],
        ],
        'db' => require(__DIR__ . '/db.php'),
        'dblog' => require(__DIR__ . '/dblog.php'),
        'httpclient' => [
            'class' => 'yii\httpclient\Client',
//            'requestConfig' => ['timeout' => 0.5, 'busy_size' => 10, 'pool_size' => 10],
        ],
        'errorHandler' => [
            'class' => '\yii\swoole\web\ErrorHandler'
        ],

        'redis' => [
            'class' => 'yii\redis\Connection',
            'hostname' => 'localhost',
            'port' => 6379,
            'database' => 0,
//            'unixSocket' => '/tmp/redis.sock'
        ],
        'cache' => [
            'class' => 'yii\redis\Cache'
        ],
        'session' => [
            'class' => 'yii\redis\Session'
        ],
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning'],
                ],
            ],
        ],
        'rpc' => [
            'class' => 'yii\swoole\rpc\NavClient',
        ],
//        'mserver' => [
//            'class' => 'yii\swoole\manager\Servermanager',
//            'time_diff' => 2,
//            'appconfig' => ['host' => $ip, 'ip' => ip2long($ip), 'appname' => 'apistore', 'status' => 1],
//        ],
        'queue' => [
            'class' => 'yii\queue\drives\RedisQueue',
            'auto_create' => true,
            'producer' => [
                'class' => 'yii\queue\connectors\RedisConnector',
                'parameters' => 'redis'
            ],
            'consumer' => [
                'class' => 'yii\queue\connectors\RedisConnector',
                'parameters' => 'redis'
            ]
        ],
//        'queuework' => [
//            'class' => 'yii\swoole\process\QueueProcess',
//            'memory' => 512,
//            'processList' => ['default' => ['attempt' => 1000, 'sleep' => 1, 'delay' => 0, 'worker' => 4]],
//            'pidFile' => sys_get_temp_dir() . '/swoolequeue.pid',
//        ],
//        'backendwork' => [
//            'class' => 'yii\swoole\process\BackendProcess',
//            'memory' => 512,
//            'pidFile' => sys_get_temp_dir() . '/swoolebackend.pid',
//        ],
        'export' => [
            'class' => 'yii\swoole\files\ExportFile',
            'filePath' => '@upload/print/advice/',
            'suffix' => '.xlsx'
        ]
    ],
    'language' => 'zh-CN',
    'sourceLanguage' => 'en-US',
    'runtimePath' => dirname(dirname(__DIR__)) . '/runtime',
];
