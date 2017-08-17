<?php
namespace yii\swoole\console;

use Yii;

class Application extends \yii\console\Application
{
    /**
     * @var swoole_http_server 当前运行中的swoole实例
     */
    protected $_swooleServer;

    /**
     * @return swoole_http_server
     */
    public function getSwooleServer()
    {
        return $this->_swooleServer;
    }

    /**
     * @param swoole_http_server $swooleServer
     */
    public function setSwooleServer($swooleServer)
    {
        $this->_swooleServer = $swooleServer;
    }

    /**
     * @var array 扩展缓存
     */
    public static $defaultExtensionCache = null;

    /**
     * 获取默认的扩展
     *
     * @return array|mixed
     */
    public function getDefaultExtensions()
    {
        if (static::$defaultExtensionCache === null) {
            $file = Yii::getAlias('@vendor/yiisoft/extensions.php');
            static::$defaultExtensionCache = is_file($file) ? include($file) : [];
        }
        return static::$defaultExtensionCache;
    }

    /**
     * 初始化流程
     *
     * @throws \yii\base\InvalidConfigException
     */
    public function bootstrap()
    {
        $this->extensionBootstrap();
        $this->moduleBootstrap();
        //加入启动引导
        $mods = $this->getModules();
        $this->createModules($mods, $this);
    }

    /**
     * 自动加载扩展的初始化
     *
     * @throws \yii\base\InvalidConfigException
     */
    public function extensionBootstrap()
    {
        if (!$this->extensions) {
            $this->extensions = $this->getDefaultExtensions();
        }
        foreach ($this->extensions as $k => $extension) {
            if (!empty($extension['alias'])) {
                foreach ($extension['alias'] as $name => $path) {
                    Yii::setAlias($name, $path);
                }
            }
            if (isset($extension['bootstrap'])) {
                $this->bootstrap[] = $extension['bootstrap'];
                Yii::trace('Push extension bootstrap to module bootstrap list', __METHOD__);
            }
        }
    }

    /**
     * 自动加载模块的初始化
     *
     * @throws \yii\base\InvalidConfigException
     */
    public function moduleBootstrap()
    {
        foreach ($this->bootstrap as $k => $class) {
            $component = null;
            if (is_string($class)) {
                if ($this->has($class)) {
                    $component = $this->get($class);
                } elseif ($this->hasModule($class)) {
                    $component = $this->getModule($class);
                } elseif (strpos($class, '\\') === false) {
                    throw new InvalidConfigException("Unknown bootstrapping component ID: $class");
                }
            }
            if (!isset($component)) {
                $component = Yii::createObject($class);
            }

            if ($component instanceof BootstrapInterface) {
                Yii::trace('Bootstrap with ' . get_class($component) . '::bootstrap()', __METHOD__);
                $this->bootstrap[$k] = $component;
                $component->bootstrap($this);
                $this->bootstrap[$k] = $component;
            } else {
                Yii::trace('Bootstrap with ' . get_class($component), __METHOD__);
            }
        }
    }

    /**
     * 创建Module
     * @param type $modules
     */
    private function createModules($moduleConfig, $module)
    {
        foreach ($moduleConfig as $id => $_config) {
            if (is_array($_config)) {
                $mod = $module->getModule($id);
                if (isset($_config['modules'])) {
                    $this->createModules($_config['modules'], $mod);
                }
            }
        }
    }

    public function coreComponents()
    {
        return array_merge(parent::coreComponents(), [
            'errorHandler' => ['class' => 'yii\swoole\console\ErrorHandler'],
        ]);
    }
}