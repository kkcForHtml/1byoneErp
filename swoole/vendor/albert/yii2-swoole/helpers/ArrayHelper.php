<?php

/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace yii\swoole\helpers;

/**
 * ArrayHelper provides additional array functionality that you can use in your
 * application.
 *
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class ArrayHelper extends \yii\helpers\ArrayHelper
{

    public static function getValueByList(array $array, array $keys, $default = null)
    {
//        if (extension_loaded('array_helper')) {
//            $result = \ArrayHelper::getValueByList($array, $keys, [$default]);
//        } else {
        if (!is_array($array) || !is_array($keys)) {
            return null;
        }
        $result = [];

        foreach ($keys as $index => $key) {
            if (is_array($default)) {
                $result[$key] = $default[$index];
            } else {
                $result[$key] = $default;
            }
            foreach ($array as $value) {
                if (static::keyExists($key, $value, false)) {
                    $result[$key][] = $value[$key];
                }
            }
        }

//        }
        return $result;
    }

    public static function getValueByArray(array $array, array $keys, $default = null)
    {
//        if (extension_loaded('array_helper')) {
//            $result = \ArrayHelper::getValueByArray($array, $keys, [$default]);
//        } else {
        if (!is_array($array) || !is_array($keys)) {
            return null;
        }
        $result = [];

        foreach ($keys as $index => $key) {
            if (is_array($default)) {
                $result[$key] = $default[$index];
            } else {
                $result[$key] = $default;
            }
            foreach ($array as $akey => $value) {
                if ($akey === $key) {
                    $result[$key] = $value;
                }
            }
        }

//        }
        return $result;
    }

    public static function sum(array $array, $key, $group)
    {
        if (!is_array($array) || !$key || !$group) {
            return null;
        }
        $result = [];
        foreach ($array as $index => $value) {
            if (in_array($value[$group], array_keys($result))) {
                $result[$group] += $value[$key];
            } else {
                $result[$value[$group]] = $value[$key];
            }
        }
        return $result;
    }

}
