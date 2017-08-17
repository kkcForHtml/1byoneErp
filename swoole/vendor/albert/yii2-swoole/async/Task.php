<?php

namespace yii\swoole\async;

use swoole_http_server;
use Yii;
use yii\swoole\Application;
use yii\swoole\helpers\SerializeHelper;

/**
 * 使用
 *
 * @package yii\swoole\async
 */
class Task
{
    /**
     * 增加异步执行任务
     * 每个task有大概0.2-0.5ms的开销
     *
     * @param string $function
     * @param array $params
     * @return int
     * @throws \yii\swoole\async\Exception
     */
    public static function addTask($function, $params = [])
    {
        //$data = self::packData($function, $params);
        $data = [$function, $params];

        if (Application::$workerApp) {
            /** @var Application $app */
            $app = Yii::$app;
            /** @var swoole_http_server $server */
            $server = $app->getSwooleServer();
            $taskId = $server->task(SerializeHelper::serialize($data));
            //echo "$taskId Add task: $function\n";
            return $taskId;
        }
        // 对于非swoole的环境, 暂时直接运行
        self::runTask($data, 0);
        return 0;
    }

    /**
     * 执行任务
     *
     * @param string $data
     * @param int $taskId
     */
    public static function runTask($data, $taskId)
    {
        $data = SerializeHelper::unserialize($data);
        //$data = self::unpackData($data);
        $function = array_shift($data);
        //echo "$taskId Run task: $function\n";
        $params = array_shift($data);
        $GLOBALS['call_user_func_array']($function, $params);
    }

}
