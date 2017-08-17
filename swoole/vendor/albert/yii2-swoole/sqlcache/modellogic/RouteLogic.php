<?php

namespace yii\swoole\sqlcache\modellogic;

use Yii;
use yii\helpers\VarDumper;

/**
 * Description of Route
 *
 * @author Misbahul D Munir <misbahuldmunir@gmail.com>
 * @since 1.0
 */
class RouteLogic
{

    const CACHE_TAG = 'addons.system.sqlcache.route';

    /**
     * Get avaliable and assigned routes
     * @return array
     */
    public static function getCache($modelClass)
    {
        $routes = self::getAppRoutes();
        $exists = [];
        $result = Yii::$app->cache->get(yii::$app->params['SqlCache']);
        if (!$result) {
            $query = $modelClass::find()->indexBy('name');
            $result = $query->asArray()->all();
            Yii::$app->cache->set(yii::$app->params['SqlCache'], $result);
        }
        foreach (array_keys($routes) as $route) {
            if (strpos($route, '*') !== false) {
                continue;
            }
            $route = substr($route, 1);
            if (array_key_exists($route, $result)) {
                $exists[] = ['name' => $route, 'value' => $result[$route]['value'], 'is_dep' => $result[$route]['is_dep']];
            } else {
                $exists[] = ['name' => $route, 'value' => 0, 'is_dep' => 0];
            }
        }
        return $exists;
    }

    /**
     * Get avaliable and assigned routes
     * @return array
     */
    public static function getRoutes()
    {
        $manager = Yii::$app->getAuthManager();
        $routes = self::getAppRoutes();
        $exists = [];
        foreach (array_keys($manager->getPermissions()) as $name) {
            if ($name[0] !== '/') {
                continue;
            }
            $exists[] = $name;
            unset($routes[$name]);
        }
        return [
            'avaliable' => array_keys($routes),
            'assigned' => $exists
        ];
    }

    /**
     * Get list of application routes
     * @return array
     */
    public static function getAppRoutes($module = null)
    {
        if ($module === null) {
            $module = Yii::$app;
        } elseif (is_string($module)) {
            $module = Yii::$app->getModule($module);
        }
        $key = [__METHOD__, $module->getUniqueId()];
        $cache = Configs::instance()->cache;
        if ($cache === null || ($result = $cache->get($key)) === false) {
            $result = [];
            self::getRouteRecrusive($module, $result);
            if ($cache !== null) {
                $cache->set($key, $result, Configs::instance()->cacheDuration, new TagDependency([
                    'tags' => self::CACHE_TAG,
                ]));
            }
        }

        return $result;
    }

    /**
     * Get route(s) recrusive
     * @param \yii\base\Module $module
     * @param array $result
     */
    protected static function getRouteRecrusive($module, &$result)
    {
        $token = "Get Route of '" . get_class($module) . "' with id '" . $module->uniqueId . "'";
        Yii::beginProfile($token, __METHOD__);
        try {
            foreach ($module->getModules() as $id => $child) {
                if (($child = $module->getModule($id)) !== null) {
                    self::getRouteRecrusive($child, $result);
                }
            }

            foreach ($module->controllerMap as $id => $type) {
                self::getControllerActions($type, $id, $module, $result);
            }

            $namespace = trim($module->controllerNamespace, '\\') . '\\';
            self::getControllerFiles($module, $namespace, '', $result);
            $all = '/' . ltrim($module->uniqueId . '/*', '/');
            $result[$all] = $all;
        } catch (\Exception $exc) {
            Yii::error($exc->getMessage(), __METHOD__);
        }
        Yii::endProfile($token, __METHOD__);
    }

    /**
     * Get list controller under module
     * @param \yii\base\Module $module
     * @param string $namespace
     * @param string $prefix
     * @param mixed $result
     * @return mixed
     */
    protected static function getControllerFiles($module, $namespace, $prefix, &$result)
    {
        $path = Yii::getAlias('@' . str_replace('\\', '/', $namespace), false);
        $token = "Get controllers from '$path'";
        Yii::beginProfile($token, __METHOD__);
        try {
            if (!is_dir($path)) {
                return;
            }
            foreach (scandir($path) as $file) {
                if ($file == '.' || $file == '..') {
                    continue;
                }
                if (is_dir($path . '/' . $file) && preg_match('%^[a-z0-9_/]+$%i', $file . '/')) {
                    self::getControllerFiles($module, $namespace . $file . '\\', $prefix . $file . '/', $result);
                } elseif (strcmp(substr($file, -14), 'Controller.php') === 0) {
                    $baseName = substr(basename($file), 0, -14);
                    $name = strtolower(preg_replace('/(?<![A-Z])[A-Z]/', ' \0', $baseName));
                    $id = ltrim(str_replace(' ', '-', $name), '-');
                    $className = $namespace . $baseName . 'Controller';
                    if (strpos($className, '-') === false && class_exists($className) && is_subclass_of($className, 'yii\base\Controller')) {
                        self::getControllerActions($className, $prefix . $id, $module, $result);
                    }
                }
            }
        } catch (\Exception $exc) {
            Yii::error($exc->getMessage(), __METHOD__);
        }
        Yii::endProfile($token, __METHOD__);
    }

    /**
     * Get list action of controller
     * @param mixed $type
     * @param string $id
     * @param \yii\base\Module $module
     * @param string $result
     */
    protected static function getControllerActions($type, $id, $module, &$result)
    {
        $token = "Create controller with cofig=" . VarDumper::dumpAsString($type) . " and id='$id'";
        Yii::beginProfile($token, __METHOD__);
        try {
            /* @var $controller \yii\base\Controller */
            $controller = Yii::createObject($type, [$id, $module]);
            self::getActionRoutes($controller, $result);
            $all = "/{$controller->uniqueId}/*";
            $result[$all] = $all;
        } catch (\Exception $exc) {
            Yii::error($exc->getMessage(), __METHOD__);
        }
        Yii::endProfile($token, __METHOD__);
    }

    /**
     * Get route of action
     * @param \yii\base\Controller $controller
     * @param array $result all controller action.
     */
    protected static function getActionRoutes($controller, &$result)
    {
        $token = "Get actions of controller '" . $controller->uniqueId . "'";
        Yii::beginProfile($token, __METHOD__);
        try {
            $prefix = '/' . $controller->uniqueId . '/';
            foreach ($controller->actions() as $id => $value) {
                $result[$prefix . $id] = $prefix . $id;
            }
            $class = new \ReflectionClass($controller);
            foreach ($class->getMethods() as $method) {
                $name = $method->getName();
                if ($method->isPublic() && !$method->isStatic() && strpos($name, 'action') === 0 && $name !== 'actions') {
                    $name = strtolower(preg_replace('/(?<![A-Z])[A-Z]/', ' \0', substr($name, 6)));
                    $id = $prefix . ltrim(str_replace(' ', '-', $name), '-');
                    $result[$id] = $id;
                }
            }
        } catch (\Exception $exc) {
            Yii::error($exc->getMessage(), __METHOD__);
        }
        Yii::endProfile($token, __METHOD__);
    }

}
