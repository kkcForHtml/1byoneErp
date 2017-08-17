<?php

/*
 * This file is part of the light/yii2-swagger.
 *
 * (c) lichunqiang <light-li@hotmail.com>
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace yii\swoole\swagger;

use Yii;

class SwaggerApiLogic
{
    private static function getRoutes($scanDir, $scanOptions = [], $controller)
    {
        try {
            $json = json_decode(\Swagger\scan($scanDir, $scanOptions), true);
            if (isset($json['paths'])) {
                $del = $json['paths'];
                foreach ($controller->actions() as $id => $value) {
                    $actions[] = $id;
                }
                $class = new \ReflectionClass($controller);
                foreach ($class->getMethods() as $method) {
                    $name = $method->getName();
                    if ($method->isPublic() && !$method->isStatic() && strpos($name, 'action') === 0 && $name !== 'actions') {
                        $name = strtolower(preg_replace('/(?<![A-Z])[A-Z]/', ' \0', substr($name, 6)));
                        $id = ltrim(str_replace(' ', '-', $name), '-');
                        $actions[] = $id;
                    }
                }

                foreach ($del as $r => $i) {
                    unset($json['paths'][$r]);
                    $cur_act = str_replace('/', '', $r);
                    if (in_array($cur_act, $actions)) {
                        foreach ($i as $method => $t) {
                            $i[$method]['tags'] = [$controller->module->id];
                        }
                        $json['paths'][Yii::$app->BaseHelper->getPath($controller->module) . '/' . $controller->id . $r] = $i;
                    }
                }
                unset($actions);
            }
            unset($del);
            return $json;
        } catch (\Exception $e) {
            throw $e;
        }
    }

    private static $routeData = [];

    /**
     * Get swagger object
     *
     * @return \Swagger\Annotations\Swagger
     */
    public static function getSwagger()
    {
        if (!self::$routeData) {
            $result = [];
            self::getRouteRecrusive(Yii::$app, $result);

            foreach ($result as $id => $value) {
                foreach ($value['paths'] as $route => $method) {
                    foreach ($method as $v) {
                        self::$routeData[] = ['group' => $id, 'route' => $route, 'description' => $v['summary']];
                    }
                }
            }
        }

        return self::$routeData;
    }

    /**
     * Get route(s) recrusive
     * @param \yii\base\Module $module
     * @param array $result
     */
    private static function getRouteRecrusive($module, &$result)
    {
        foreach ($module->getModules() as $id => $child) {
            if (($child = $module->getModule($id)) !== null) {
                self::getRouteRecrusive($child, $result);
            }
        }

        $path = Yii::$app->BaseHelper->getPath($module);

        foreach ($module->controllerMap as $id => $type) {
            $controller = Yii::createObject($type, [$id, $module]);
            if ($controller) {
                $result[$module->id] = self::getRoutes([
                    Yii::getAlias('@vendor/albert/yii2-swoole/swagger/public'),
                    Yii::getAlias('@addons' . $path),
                    Yii::getAlias('@vendor/albert/yii2-swoole/swagger/defaultapi')
                ], [], $controller);
            }
        }

        $namespace = trim($module->controllerNamespace, '\\') . '\\';
        self::getControllerFiles($module, $namespace, '', $result);
    }

    /**
     * Get list controller under module
     * @param \yii\base\Module $module
     * @param string $namespace
     * @param string $prefix
     * @param mixed $result
     * @return mixed
     */
    private static function getControllerFiles($module, $namespace, $prefix, &$result = [])
    {
        $path = Yii::getAlias('@' . str_replace('\\', '/', $namespace), false);
        if (!is_dir($path)) {
            return;
        }
        foreach (scandir($path) as $file) {
            if ($file == '.' || $file == '..') {
                continue;
            }
            if (is_dir($path . '/' . $file) && preg_match('%^[a-z0-9_/]+$%i', $file . '/')) {
                self::getControllerFiles($module, $namespace . $file . '\\', $prefix . $file . '/');
            } elseif (strcmp(substr($file, -14), 'Controller.php') === 0) {
                $baseName = substr(basename($file), 0, -14);
                $name = strtolower(preg_replace('/(?<![A-Z])[A-Z]/', ' \0', $baseName));
                $id = ltrim(str_replace(' ', '-', $name), '-');
                $className = $namespace . $baseName . 'Controller';
                if (strpos($className, '-') === false && class_exists($className) && is_subclass_of($className, 'yii\base\Controller')) {
                    $controller = Yii::createObject($className, [$id, $module]);
                    if ($controller) {
                        $result[$module->id] = self::getRoutes([
                            Yii::getAlias('@vendor/albert/yii2-swoole/swagger/public'),
                            Yii::getAlias($path),
                            Yii::getAlias('@vendor/albert/yii2-swoole/swagger/defaultapi')
                        ], [], $controller);
                    }
                }
            }
        }
    }
}
