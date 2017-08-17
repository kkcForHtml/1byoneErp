<?php
namespace yii\swoole\behaviors;

use Yii;
use yii\base\Behavior;
use yii\db\BaseActiveRecord;
use yii\web\ServerErrorHttpException;

class CustomBehaviors extends Behavior
{
    public $beforeSaveConfig = [];

    public $afterSaveConfig = [];

    public $beforeDelConfig = [];

    public $afterDelConfig = [];

    public function events()
    {

        $event[BaseActiveRecord::EVENT_BEFORE_INSERT] = 'beforeSave';
        $event[BaseActiveRecord::EVENT_BEFORE_UPDATE] = 'beforeSave';

        $event[BaseActiveRecord::EVENT_AFTER_INSERT] = 'afterSave';
        $event[BaseActiveRecord::EVENT_AFTER_UPDATE] = 'afterSave';

        $event[BaseActiveRecord::EVENT_BEFORE_DELETE] = 'beforeDelete';
        $event[BaseActiveRecord::EVENT_AFTER_DELETE] = 'afterDelete';
        return $event;
    }

    private function error()
    {
        if ($this->owner->hasErrors()) {
            $errors = [];
            foreach ($this->owner->errors as $error) {
                $errors = array_merge($errors, $error);
            }
            throw new ServerErrorHttpException(implode(PHP_EOL, $errors));
        }
    }

    /**
     * Event handler for beforeSave
     * @param \yii\base\ModelEvent $event
     */
    public function beforeSave($event)
    {
        if ($this->beforeSaveConfig && $this->doWork($this->beforeSaveConfig) === false) {
            $event->isValid = false;
            $this->error();
        }
    }

    /**
     * Event handler for afterSave
     * @param \yii\base\ModelEvent $event
     */
    public function afterSave($event)
    {
        if ($this->afterSaveConfig && $this->doWork($this->afterSaveConfig) === false) {
            $this->error();
        }
    }

    /**
     * Event handler for beforeDelete
     * @param \yii\base\ModelEvent $event
     */
    public function beforeDelete($event)
    {
        if ($this->beforeDelConfig && $this->doWork($this->beforeDelConfig) === false) {
            $event->isValid = false;
            $this->error();
        }
    }

    /**
     * Event handler for afterDelete
     * @param \yii\base\ModelEvent $event
     */
    public function afterDelete($event)
    {
        if ($this->afterDelConfig && $this->doWork($this->afterDelConfig) === false) {
            $this->error();
        }
    }

    private function checkAndWork(array $config)
    {
        list($condition, $data) = $config;
        unset($config);
        $flag = true;
        $flagRes = true;
        foreach ($condition as $value) {
            if (!(bool)count(array_filter(array_keys($value), 'is_string'))) {
                $type = array_shift($value);
                if (is_bool($type)) {
                    $flag &= (bool)$type;
                } elseif ($type instanceof \Closure) {
                    $flag &= $GLOBALS['call_user_func']($type);
                } else if ($type !== 'and' && $type !== 'or') {
                    return false;
                } else if (is_callable($type)) {
                    $flag &= $this->$type($value);
                }
            }
        }
        if ($flag) {
            foreach ($data as $module => $class) {
                if ($module instanceof \Closure) {
                    $flagRes &= $GLOBALS['call_user_func']($module);
                } else {
                    foreach ($class as $logic) {
                        list($logic, $param) = $logic;
                        $flagRes &= Yii::$app->rpc->create($module)->sendAndrecv([$logic, [$this->owner, $param]]);
                    }
                }

            }
        }
        return $flagRes;
    }

    private function doWork(array $config)
    {
        $flag = false;
        foreach ($config as $cfg) {
            $flag |= $this->checkAndWork($cfg);
        }
        return (bool)$flag;
    }

    private function and (array $value, $flag = true)
    {
        foreach ($value as $v) {
            if (count($v) === 3) {
                list($opt, $attr, $v_attr) = $v;
                switch ($opt) {
                    case '=':
                        $flag &= $this->owner->{$attr} == $v_attr;
                        break;
                    case '!=':
                    case '<>':
                        $flag &= $this->owner->{$attr} != $v_attr;
                        break;
                    case '>':
                        $flag &= $this->owner->{$attr} > $v_attr;
                        break;
                    case '<':
                        $flag &= $this->owner->{$attr} < $v_attr;
                        break;
                    case '>=':
                        $flag &= $this->owner->{$attr} >= $v_attr;
                        break;
                    case '<=':
                        $flag &= $this->owner->{$attr} <= $v_attr;
                        break;
                    case 'like':
                        $flag &= (strpos($v_attr, $this->owner->{$attr}) !== false);
                        break;
                    case 'in':
                        $flag &= (bool)in_array($this->owner->{$attr}, $v_attr);
                        break;
                    default:
                        $flag &= false;
                }
            } elseif (count($v) === 1) {
                $flag &= (bool)array_shift($v);
            }
        }
        unset($value);
        return $flag;
    }

    private function or (array $value, $flag = true)
    {
        foreach ($value as $v) {
            if (count($v) === 3) {
                $opt = array_shift($v);
                $attr = array_shift($v);
                $v_attr = array_shift($v);
                switch ($opt) {
                    case '=':
                        $flag |= $this->owner->{$attr} == $v_attr;
                        break;
                    case '!=':
                    case '<>':
                        $flag |= $this->owner->{$attr} != $v_attr;
                        break;
                    case '>':
                        $flag |= $this->owner->{$attr} > $v_attr;
                        break;
                    case '<':
                        $flag |= $this->owner->{$attr} < $v_attr;
                        break;
                    case '>=':
                        $flag |= $this->owner->{$attr} >= $v_attr;
                        break;
                    case '<=':
                        $flag |= $this->owner->{$attr} <= $v_attr;
                        break;
                    case 'like':
                        $flag |= (bool)strpos($this->owner->{$attr}, $v_attr);
                        break;
                    case 'in':
                        $flag |= (bool)in_array($this->owner->{$attr}, $v_attr);
                        break;
                    default:
                        $flag |= false;
                }
            } elseif (count($v) === 1) {
                $flag |= (bool)array_shift($v);
            }
        }
        unset($value);
        return $flag;
    }
}