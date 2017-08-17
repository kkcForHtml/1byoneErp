<?php

namespace yii\swoole;

use ReflectionClass;
use Yii;
use yii\base\Object;

/**
 * 继承原有的容器, 实现一些额外的逻辑
 *
 * @package yii\swoole
 */
class Container extends \yii\di\Container
{

    /**
     * @var array 类的别名
     */
    public static $classAlias = [
        'yii\db\ActiveRecord' => 'yii\swoole\db\ActiveRecord',
        'yii\db\Command' => 'yii\swoole\db\Command',
        'yii\db\Connection' => 'yii\swoole\db\Connection',
        'yii\log\Dispatcher' => 'yii\swoole\log\Dispatcher',
        'yii\log\FileTarget' => 'yii\swoole\log\FileTarget',
        'yii\log\DbTarget' => 'yii\swoole\log\DbTarget',
        'yii\log\Logger' => 'yii\swoole\log\Logger',
        'yii\web\Request' => 'yii\swoole\web\Request',
        'yii\web\Response' => 'yii\swoole\web\Response',
        'yii\web\Session' => 'yii\swoole\web\Session',
        'yii\web\ErrorHandler' => 'yii\swoole\web\ErrorHandler',
        'yii\web\User' => 'yii\swoole\web\User',
        'yii\web\View' => 'yii\swoole\web\View',
        'yii\web\AssetManager' => 'yii\swoole\web\AssetManager',
        'yii\web\UrlManager' => 'yii\swoole\web\UrlManager',
        'yii\console\ErrorHandler' => 'yii\swoole\console\ErrorHandler',
        'yii\db\Query' => 'yii\swoole\db\Query',
        'yii\debug\Module' => 'yii\swoole\debug\filedebug\Module',
        'yii\debug\panels\RequestPanel' => 'yii\swoole\debug\filedebug\RequestPanel',
        'yii\debug\panels\ConfigPanel' => 'yii\swoole\debug\filedebug\ConfigPanel',
        'yii\swoole\debug\Module' => 'yii\swoole\debug\filedebug\Module',
        'yii\swiftmailer\Mailer' => 'yii\swoole\mailer\SwiftMailer',
        'yii\redis\Connetcion' => 'yii\swoole\redis\Connection',
        'yii\redis\Session' => 'yii\swoole\redis\Session'
    ];

    /**
     * @var array 持久化的类实例
     */
    public static $persistInstances = [];

    /**
     * 在最终构造类时, 尝试检查类的别名
     *
     * @inheritdoc
     */
    protected function build($class, $params, $config)
    {
        // 检查类的别名
        if (isset(self::$classAlias[$class])) {
            $class = self::$classAlias[$class];
        }

        // 构造方法参数为空才走这个流程
        if ($class && array_key_exists($class, Yii::$classMap)) {
            /* @var $reflection ReflectionClass */
            list ($reflection, $dependencies) = $this->getDependencies($class);
            if (!isset(self::$persistInstances[$class])) {
                self::$persistInstances[$class] = $reflection->newInstanceWithoutConstructor();
            }
            $object = clone self::$persistInstances[$class];
            // 如果有params参数的话, 则交给构造方法去执行
            // 这里的逻辑貌似太简单了..
            if ($params) {
                $reflection->getConstructor()->invokeArgs($object, $params);
            }
            // 执行一些配置信息
            Yii::configure($object, $config);
            if ($object instanceof Object) {
                $object->init();
            }
            return $object;
        }

        return parent::build($class, $params, $config);
    }

}
