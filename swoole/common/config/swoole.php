<?php

return [
    'common' => [
        // bootstrap文件, 只会引入一次
        'bootstrapFile' => [
            __DIR__ . '/../../common/config/bootstrap.php',
        ],
        // Yii的配置文件, 只会引入一次
        'configFile' => [
            __DIR__ . '/../../common/config/main.php',
            __DIR__ . '/../../common/config/main-local.php',
            __DIR__ . '/../../apistore/config/main.php',
            __DIR__ . '/../../apistore/config/main-local.php'
        ],
        // 有一些模块比较特殊, 无法实现Refreshable接口, 此时唯有在这里指定他的类名
        'bootstrapRefresh' => [],
        'root' => realpath(__DIR__ . '/../../apistore/web'),
        'reload_path' => Yii::getAlias('@addons'),
    ],
    'web' => [
        'host' => '0.0.0.0',
        'port' => '9501',
        'name' => 'swoole-webServer',
        'use_taskserver' => false,
        'type' => SWOOLE_BASE,
        // 配置参考 https://www.kancloud.cn/admins/swoole/201155
        'pidFile' => sys_get_temp_dir() . '/swooleweb.pid',
        //addlisten
        'addlisten' => [
            'tcp' => [SWOOLE_SOCK_TCP, ['receive' => 'onReceive'],
                [
                    function ($server) {
                        if (Yii::$app->params['Hearbeat']['func']['UpSrv']) {
                            $GLOBALS['call_user_func_array'](Yii::$app->params['Hearbeat']['class'] . '::UpSrv', []);
                        }
                    }
                ]
            ]
        ],
        'beforeStart' => [
            function ($server) {
                \yii\swoole\server\ProcessServer::getInstance()->start(Yii::$app->params['swoole']);
                \yii\swoole\server\QueueServer::getInstance()->start(Yii::$app->params['swoole']);
                //reload监控进程
                if (Yii::$app->params['Hearbeat']['func']['Inotity']) {//代表启动单独进程进行reload管理
                    $GLOBALS['call_user_func_array'](Yii::$app->params['Hearbeat']['class'] . '::Inotity', [$server->config['reload_path']]);
                }
                //服务监控
                if (Yii::$app->params['Hearbeat']['func']['Moint']) {
                    $GLOBALS['call_user_func_array'](Yii::$app->params['Hearbeat']['class'] . '::Moint', []);
                }

                //创建服务注册内存表
                $server->server->serverTable = new swoole_table(1024);
                $server->server->serverTable->column('host', swoole_table::TYPE_STRING, 16);
                $server->server->serverTable->column('rpcs', swoole_table::TYPE_STRING, Yii::$app->RpcHelper->getRpcLen());
                $server->server->serverTable->create();

                //创建websocket连接内存表
                $server->server->clientTable = new swoole_table(1024);
                $server->server->clientTable->column('fd', swoole_table::TYPE_INT, 8);
                $server->server->clientTable->create();
            }
        ],
        'server' => [
            'upload_tmp_dir' => '/data/uploadfiles',
            'worker_num' => swoole_cpu_num(), //worker process num
            'backlog' => 1280, //listen backlog
            'dispatch_mode' => 2,
            'task_worker_num' => swoole_cpu_num(),
            'log_file' => '/data/logs/swoole_web.log',
            'log_level' => 0,
            'daemonize' => 0,
            'open_cpu_affinity' => true,
            'open_tcp_nodelay' => true,
            'buffer_output_size' => 32 * 1024 * 1024,
            'pid_file' => sys_get_temp_dir() . '/swooleweb.pid',
            'heartbeat_check_interval' => 5,
            'heartbeat_idle_time' => 60,
            'tcp_defer_accept' => 5,
            'enable_reuse_port' => true,
            'enable_unsafe_event' => false
        ],
    ],
    'tcp' => [
        'host' => current(swoole_get_local_ip()),
        'port' => '9503',
        'name' => 'swoole-tcpServer',
        'pidFile' => sys_get_temp_dir() . '/swooletcp.pid',
        'server' => [
            'worker_num' => swoole_cpu_num(), //worker process num
            'backlog' => 1280, //listen backlog
            'task_worker_num' => swoole_cpu_num(),
            'daemonize' => 0,
            'open_length_check' => 0,
            'package_length_type' => 'N',
            'package_length_offset' => 0,
            'package_length_type_len' => 4,
            'package_body_offset' => 4,
            'package_max_length' => 2097152, // 1024 * 1024 * 2,
            'buffer_output_size' => 3145728, //1024 * 1024 * 3,
            'pipe_buffer_size' => 33554432, // 1024 * 1024 * 32,
            'open_tcp_nodelay' => 1,
            'log_file' => '/data/logs/swoole_tcp.log',
            'heartbeat_check_interval' => 5,
            'heartbeat_idle_time' => 60,
            'tcp_defer_accept' => 5,
            'enable_reuse_port' => true,
            'pid_file' => sys_get_temp_dir() . '/swooletcp.pid',
            'enable_unsafe_event' => false,
            'open_cpu_affinity' => 1
        ]
    ],
    'task' => [
        'host' => '0.0.0.0',
        'port' => '9505',
        'name' => 'swoole-taskServer',
        'pidFile' => sys_get_temp_dir() . '/swooletask.pid',
        'server' => [
            'daemonize' => 0,
            'task_worker_num' => swoole_cpu_num() * 2,
            'open_length_check' => 0,
            'package_length_type' => 'N',
            'package_length_offset' => 0,
            'package_length_type_len' => 4,
            'package_body_offset' => 4,
            'package_max_length' => 2097152, // 1024 * 1024 * 2,
            'buffer_output_size' => 3145728, //1024 * 1024 * 3,
            'pipe_buffer_size' => 33554432, // 1024 * 1024 * 32,
            'open_tcp_nodelay' => 1,
            'backlog' => 128,
            'log_file' => '/data/logs/swoole_task.log',
        ]
    ],
    'hprose' => [
        'host' => current(swoole_get_local_ip()),
        'port' => '9504',
        'server_type' => 'tcp',
        'name' => 'swoole-hproseServer',
        'server_mode' => SWOOLE_BASE,
        'pidFile' => sys_get_temp_dir() . '/swoolehprose.pid',
        'server' => [
            'worker_num' => swoole_cpu_num(), //worker process num
            'backlog' => 128, //listen backlog
            'max_request' => 10000,
//                'max_conn' => 10000,
            'dispatch_mode' => 3,
            'log_file' => '/data/logs/swoole_hprose.log',
            'log_level' => 0,
            'daemonize' => 0,
        ],
        'methods' => [
            '\\apistore\\modellogic\\ExcelLogic' => ['methods' => ['test'], 'alias' => [], 'options' => []]
        ]
    ],
    'cppool' => [
        'pidFile' => '/var/run/php_connection_pool.pid', //不能修改
        'path' => '/tmp/pool.ini',
        'server' => [
            'common' => [
                'log_file' => '/data/logs/cppoolServer.log', //log文件,
                'recycle_num' => 2, //连接空闲后的回收力度，值越大回收的越快，但是会造成更多的消耗,
                'idel_time' => 2, //空闲连接回收的发呆时间 单位秒
                'ping_time' => 30, //进程ping数据库的间隔时间s
                'max_read_len' => 1048576, //最大转发的数据包 字节,超过抛异常
                'daemonize' => 0, //是否开启守护进程化
                'use_wait_queue' => 1, //连接都被占用后,再获取连接是否使用队列缓冲,设置为0直接抛异常
                'max_fail_num' => 1, //get_disable_list函数最多返回多少个失效结点,防止网络抖动踢掉所有的机器
                'port' => 6253, //端口
                //'max_hold_time_to_log' => 1000, //持有一个连接超过这么长时间写log日志 单位毫秒 默认为0为不开启log
                //'max_data_size_to_log' => 1024, //单次查询超过这么大字节写log日志 单位字节 默认为0为不开启log
            ],
            'db' => [
                'db' => ['pool_min' => 4, 'pool_max' => 30],
                'dblog' => ['pool_min' => 4, 'pool_max' => 30]
            ],
            'redis' => [
                'redis' => ['pool_min' => 4, 'pool_max' => 30]
            ]
        ]
    ]
];
