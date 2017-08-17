<?php

namespace yii\swoole\validators;

use Yii;

class Validator extends \yii\validators\Validator
{
    public static function createValidator($type, $model, $attributes, $params = [])
    {
        $params['attributes'] = $attributes;

        if ($type instanceof \Closure || $model->hasMethod($type)) {
            // method-based validator
            $params['class'] = __NAMESPACE__ . '\InlineValidator';
            $params['method'] = $type;
        } else {
            if (isset(static::$builtInValidators[$type])) {
                $type = static::$builtInValidators[$type];
            }
            if (is_array($type)) {
                $params = array_merge($type, $params);
            } else {
                $params['class'] = $type;
            }
        }

        return Yii::createObject($params);
    }
}