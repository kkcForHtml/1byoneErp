<?php
/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace yii\swoole\web;

use yii\helpers\Html;

class UploadedFile extends \yii\web\UploadedFile
{
    private static $_files;

    public static function getInstance($model, $attribute)
    {
        $name = Html::getInputName($model, $attribute);
        return static::getInstanceByName($name);
    }

    public static function getInstances($model, $attribute)
    {
        $name = Html::getInputName($model, $attribute);
        return static::getInstancesByName($name);
    }

    public static function getInstanceByName($name)
    {
        $files = self::loadFiles();
        return isset($files[$name]) ? new static($files[$name]) : null;
    }

    public static function getInstancesByName($name)
    {
        $files = self::loadFiles();
        if (isset($files[$name])) {
            return [new static($files[$name])];
        }
        $results = [];
        foreach ($files as $key => $file) {
            if (strpos($key, "{$name}[") === 0) {
                $results[] = new static($file);
            }
        }
        return $results;
    }

    private static function loadFiles()
    {
        if (self::$_files === null) {
            self::$_files = [];
            if (isset($_FILES) && is_array($_FILES)) {
                foreach ($_FILES as $class => $info) {
                    $key = key($info);
                    self::$_files[$class . '[' . $key . ']'] = [
                        'name' => $info[$key]['name'],
                        'tempName' => $info[$key]['tmp_name'],
                        'type' => $info[$key]['type'],
                        'size' => $info[$key]['size'],
                        'error' => $info[$key]['error'],
                    ];
                }
            }
        }
        return self::$_files;
    }
}
