<?php
$ip = current(swoole_get_local_ip());
return [
    'vendorPath' => dirname(dirname(__DIR__)) . '/vendor',
    'modules' => require(__DIR__ . '/modules.php'),
    'components' => [
        'urlManager' => ['class' => 'yii\swoole\web\UrlManager'],
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
        'db' => [
            'class' => 'yii\swoole\db\Connection',
            'dsn' => 'mysql:host=120.77.64.56;dbname=1byone_test_new',
            'username' => 'root',
            'password' => '1byone@2017',
            'charset' => 'utf8',
            'enableSchemaCache' => true,
        ],
        'dblog' => require(__DIR__ . '/dblog.php'),
        'httpclient' => [
            'class' => 'yii\swoole\httpclient\Client',
            'requestConfig' => [
                'dns_timeout' => 0.5,
                'client_timeout' => -1,
            ],
        ],
        'redis' => [
            'class' => REDIS_POOL ? REDIS_POOL . '\Connection' : 'yii\redis\Connection',
            'hostname' => 'localhost',
            'port' => 6379,
            'database' => 0,
            'unixSocket' => '/tmp/redis.sock'
        ],
        'cache' => [
            'class' => SC_COM ? SC_COM . '\Cache' : 'yii\swoole\shmcache\Cache',
            'serializer' => ['\yii\swoole\helpers\SerializeHelper::serialize', '\yii\swoole\helpers\SerializeHelper::unserialize']
        ],
        'session' => [
            'class' => SC_COM ? SC_COM . '\Session' : 'yii\swoole\shmcache\Session',
        ],
        'log' => [
            'traceLevel' => YII_DEBUG ? 3 : 0,
            'targets' => [
                [
                    'class' => 'yii\swoole\log\FileTarget',
                    'levels' => ['error', 'warning'],
                ]
            ],
        ],
        'clog' => [
            'class' => \yii\swoole\clog\CLogger::className(),
            'reporter' => [
                'class' => \yii\swoole\clog\reporters\TcpReporter::className(),
                'hostname' => current(swoole_get_local_ip()),
                'port' => 9503,
                'client' => [
                    'class' => 'yii\swoole\tcp\TcpClient',
                    'maxPoolSize' => 100,
                    'busy_pool' => 90,
                    'timeout' => 0.5,
                    'async' => true,
                    'pack' => ['yii\swoole\pack\TcpPack', 'tcp'],
                    'on beforeSend' => function ($event) {
                        $traceId = Yii::$app->getRequest()->getTraceId();
                        $data = $event->sender->data;
                        $data[] = current(swoole_get_local_ip());
                        $data[] = $traceId;
                        $data[] = true;
                        $event->sender->data = $data;
                    }
                ]
            ],
            'collecter' => [
                'class' => \yii\swoole\clog\collecters\FileCollecter::className(),
                'max_num' => 1
            ],
        ],
        'rpc' => [
            'class' => 'yii\swoole\rpc\RpcClient',
            'config_r' => [
                'class' => 'yii\swoole\rpc\TcpClient',
//                'client_type' => 'swoole',
//                'link_type' => 'tcp',
                'maxPoolSize' => 10,
                'busy_pool' => 10,
                'timeout' => 0.5,
                'async' => true
            ],
            'config_n' => [
                'class' => 'yii\swoole\rpc\NavClient',
            ]
        ],
        'mserver' => [
            'class' => 'yii\swoole\manager\Servermanager',
            'time_diff' => 2,
            'appconfig' => ['host' => $ip, 'port' => 9503, 'ip' => ip2long($ip), 'status' => 1],
        ],
        'queue' => [
            'class' => 'yii\queue\drives\RedisQueue',
            'connector' => [
                'class' => 'yii\queue\connectors\RedisConnector',
                'parameters' => 'redis'
//                'parameters' => [
//                    'class' => 'yii\redis\Connection',
//                    'hostname' => 'localhost',
//                    'port' => 6379,
//                    'unixSocket' => '/tmp/redis.sock',
//                ]
            ]
        ],
        'queuework' => [
            'class' => 'yii\swoole\process\QueueProcess',
            'memory' => 512,
            'log_path' => '/data/logs',
            'processList' => ['inventory' => ['attempt' => 3, 'sleep' => 5, 'delay' => 0, 'worker' => 1]],
            'pidFile' => sys_get_temp_dir() . '/swoolequeue.pid',
        ],
        'backendwork' => [
            'class' => 'yii\swoole\process\BackendProcess',
            'memory' => 512,
            'pidFile' => sys_get_temp_dir() . '/swoolebackend.pid',
            'log_path' => '/data/logs',
            'processList' => [
//                'addons\tools\modellogic\AmazonGrabOrderWork' => ['processName' => 'GrabAmazonOrder', 'ticket' => 300, 'use_coro' => true],//取订单
//                'addons\tools\modellogic\AmazonGrabItemWork' => ['processName' => 'GrabAmazonItem', 'ticket' => 180, 'use_coro' => true],//取明细
//                'addons\amazon\modellogic\OrderParseWork' => ['processName' => 'OrderParse', 'ticket' => 600, 'use_coro' => true],   //解析订单
                'addons\tools\modellogic\AmazonGrabRequestWork' => ['processName' => 'GrabRequest', 'ticket' => 21600, 'use_coro' => true],//取亚马逊报告
                'addons\tools\modellogic\AmazonGrabReportWork' => ['processName' => 'GrabReport', 'ticket' => 1800, 'use_coro' => true],//下载报告文件
                'addons\amazon\modellogic\ReportParseWork' => ['processName' => 'ReportParse', 'ticket' => 14400, 'use_coro' => true],   //解析报告文件
                'addons\tools\modellogic\XAmazonInventoryWork' => ['processName' => 'Inventory', 'ticket' => 21600, 'use_coro' => true]        //拉取库存
            ]
        ],
        'export' => [
            'class' => 'yii\swoole\files\ExportFile',
            'filePath' => '@upload/print/advice/',
            'suffix' => '.xlsx'
        ],
    ],
    'language' => 'zh-CN',
    'sourceLanguage' => 'en-US',
    'runtimePath' => dirname(dirname(__DIR__)) . '/runtime',
];
