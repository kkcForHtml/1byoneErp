<?php
//是否使用php-cp连接池
defined('USE_POOL') or define('USE_POOL', false);
//定义redis客户端
defined('REDIS_POOL') or define('REDIS_POOL', 'yii\swoole\redis\coredis');
//session and cache
defined('SC_COM') or define('SC_COM', 'yii\swoole\shmcache');