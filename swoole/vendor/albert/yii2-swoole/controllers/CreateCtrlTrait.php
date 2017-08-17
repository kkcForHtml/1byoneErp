<?php
namespace yii\swoole\controllers;

use Yii;
use yii\swoole\Application;

trait CreateCtrlTrait
{
    /**
     * @var array 保存 id => controller 的实例缓存
     */
    public static $controllerIdCache = [];

    /**
     * 保存控制器实例缓存, 减少一次创建请求的开销
     * 能提升些少性能.
     * 这里要求控制器在实现时, 业务逻辑尽量不要写在构造函数中
     *
     * @inheritdoc
     */
    public function createControllerByID($id)
    {
        if (!Application::$workerApp) {
            return parent::createControllerByID($id);
        }

        if (!isset(self::$controllerIdCache[$id])) {
            $controller = parent::createControllerByID($id);
            if (!$controller) {
                return $controller;
            }
            // 清空id和module的引用
            $controller->id = null;
            $controller->module = null;
            self::$controllerIdCache[$id] = clone $controller;
        }

        /** @var Controller $controller */
        $controller = clone self::$controllerIdCache[$id];
        $controller->id = $id;
        $controller->module = $this;
        $controller->init();
        return $controller;
    }
}