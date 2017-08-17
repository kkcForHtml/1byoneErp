<?php

namespace yii\swoole\server;

use Yii;
use yii\swoole\Application;
use yii\swoole\Container;
use yii\swoole\helpers\ArrayHelper;
use yii\swoole\helpers\CoroHelper;

trait WorkTrait
{
    public function workerStart($server = null)
    {
        $id = CoroHelper::getId();
        // 初始化一些变量, 下面这些变量在进入真实流程时是无效的
        $_SERVER[$id]['SERVER_ADDR'] = '127.0.0.1';
        $_SERVER[$id]['SERVER_NAME'] = 'localhost';
        $_SERVER[$id]['REQUEST_URI'] = $_SERVER[$id]['SCRIPT_FILENAME'] = $_SERVER[$id]['DOCUMENT_ROOT'] = $_SERVER[$id]['DOCUMENT_URI'] = $_SERVER[$id]['SCRIPT_NAME'] = '';
        // 关闭Yii2自己实现的异常错误
        defined('YII_ENABLE_ERROR_HANDLER') || define('YII_ENABLE_ERROR_HANDLER', false);
        // 加载文件和一些初始化配置

        foreach (ArrayHelper::remove($this->config, 'bootstrapFile', []) as $file) {
            require $file;
        }

        $config = [];

        foreach ($this->config['configFile'] as $file) {
            $config = ArrayHelper::merge($config, include $file);
        }

        if (isset($this->config['bootstrapRefresh'])) {
            $config['bootstrapRefresh'] = $this->config['bootstrapRefresh'];
        }

        // 为Yii分配一个新的DI容器
        if (isset($this->config['persistClasses'])) {
            Container::$persistClasses = ArrayHelper::merge(Container::$persistClasses, $this->config['persistClasses']);
            Container::$persistClasses = array_unique(Container::$persistClasses);
        }

        Yii::$container = new Container();

        $config['aliases']['@webroot'] = $this->root;
        $config['aliases']['@web'] = '/';
        new Application($config);
        Yii::$app->language = $config['language'];
        Yii::$app::$workerApp = true;
        // init all yii components
        foreach ($config['components'] as $id => $_config) {
            Yii::$app->get($id);
        }

        Yii::$app->setRootPath($this->root);
        Yii::$app->setSwooleServer($this->server);
        Yii::$app->prepare();
    }
}