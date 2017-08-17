<?php

namespace yii\swoole\validators;

use yii\swoole\helpers\CallHelper;

class InlineValidator extends \yii\validators\InlineValidator
{
    public function validateAttribute($model, $attribute)
    {
        $method = $this->method;
        if (is_string($method)) {
            $method = [$model, $method];
        }
        $GLOBALS['call_user_func']($method, $attribute, $this->params, $this);
    }

    public function clientValidateAttribute($model, $attribute, $view)
    {
        if ($this->clientValidate !== null) {
            $method = $this->clientValidate;
            if (is_string($method)) {
                $method = [$model, $method];
            }

            return $GLOBALS['call_user_func']($method, $attribute, $this->params, $this);
        } else {
            return null;
        }
    }
}
