<?php

namespace yii\swoole\sqlcache\components;

use Yii;
use yii\caching\Cache;
use yii\db\Connection;
use yii\helpers\ArrayHelper;

class Configs extends \yii\base\Object {

    const CACHE_TAG = 'addons.system\sqlcache';

    /**
     * @var Connection Database connection.
     */
    public $db = 'db';

    /**
     * @var Cache Cache component.
     */
    public $cache = 'cache';

    /**
     * @var integer Cache duration. Default to a hour.
     */
    public $cacheDuration = 3600;

    /**
     * @var string Menu table name.
     */
    public $menuTable = '{{%menu}}';

    /**
     * @var string Menu table name.
     */
    public $userTable = '{{%user}}';

    /**
     * @var integer Default status user signup. 10 mean active.
     */
    public $defaultUserStatus = 10;

    /**
     * @var boolean If true then AccessControl only check if route are registered.
     */
    public $onlyRegisteredRoute = false;

    /**
     * @var boolean If false then AccessControl will check without Rule.
     */
    public $strict = true;

    /**
     * @var array 
     */
    public $options;

    /**
     * @var self Instance of self
     */
    private static $_instance;
    private static $_classes = [
        'db' => 'yii\db\Connection',
        'cache' => 'yii\caching\Cache',
    ];

    /**
     * @inheritdoc
     */
    public function init() {
        foreach (self::$_classes as $key => $class) {
            try {
                $this->{$key} = empty($this->{$key}) ? null : yii::$app->{$this->{$key}}; //Instance::ensure($this->{$key}, $class);
            }
            catch (\Exception $exc) {
                $this->{$key} = null;
                Yii::error($exc->getMessage());
            }
        }
    }

    /**
     * Create instance of self
     * @return static
     */
    public static function instance() {
        if (self::$_instance === null) {
            $type = ArrayHelper::getValue(Yii::$app->params, 'addons.system.sqlcache.configs', []);
            if (is_array($type) && !isset($type['class'])) {
                $type['class'] = static::className();
            }

            return self::$_instance = Yii::createObject($type);
        }

        return self::$_instance;
    }

    public static function __callStatic($name, $arguments) {
        $instance = static::instance();
        if ($instance->hasProperty($name)) {
            return $instance->$name;
        }
        else {
            if (count($arguments)) {
                $instance->options[$name] = reset($arguments);
            }
            else {
                return array_key_exists($name, $instance->options) ? $instance->options[$name] : null;
            }
        }
    }

    /**
     * @return Connection
     */
    public static function db() {
        return static::instance()->db;
    }

    /**
     * @return Cache
     */
    public static function cache() {
        return static::instance()->cache;
    }

    /**
     * @return integer
     */
    public static function cacheDuration() {
        return static::instance()->cacheDuration;
    }

    /**
     * @return string
     */
    public static function menuTable() {
        return static::instance()->menuTable;
    }

    /**
     * @return string
     */
    public static function userTable() {
        return static::instance()->userTable;
    }

    /**
     * @return string
     */
    public static function defaultUserStatus() {
        return static::instance()->defaultUserStatus;
    }

    /**
     * @return boolean
     */
    public static function onlyRegisteredRoute() {
        return static::instance()->onlyRegisteredRoute;
    }

    /**
     * @return boolean
     */
    public static function strict() {
        return static::instance()->strict;
    }

}
