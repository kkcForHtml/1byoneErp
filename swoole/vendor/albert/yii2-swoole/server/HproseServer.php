<?php

namespace yii\swoole\server;

use Hprose\Swoole\Server;
use yii\swoole\rpc\IRpcServer;

class HproseServer implements IRpcServer {

    private static $instance;
    private $config = [];
    private $server;

    public function __construct($config) {
        $this->config = $config;
        $this->server = new Server("{$this->config['server_type']}://{$this->config['host']}:{$this->config['port']}", $this->config['server_mode']);
        $this->server->setErrorTypes(E_ALL);
        $this->server->setDebugEnabled();
        $this->createData();
        $this->server->start($this->config);
    }

    private function createData() {
        $methods = $this->config['methods'];
        foreach ($methods as $scope => $datas) {
            $this->addMethods($datas['methods'], $scope, $datas['alias'], $datas['options']);
        }
    }

    public function addAsyncMethod($method, $scope, $alias = '', array $options = array()) {
        $this->server->addAsyncMethod($method, $scope, $alias, $options);
    }

    public function addAsyncMethods(array $methods, $scope, array $aliases = array(), array $options = array()) {
        $this->server->addAsyncMethods($methods, $scope, $aliases, $options);
    }

    public function addMethod($method, $scope, $alias = '', array $options = array()) {
        $this->server->addMethod($method, $scope, $alias, $options);
    }

    public function addMethods(array $methods, $scope, array $aliases = array(), array $options = array()) {
        $this->server->addMethods($methods, $scope, $aliases, $options);
    }

    public static function getInstance($config) {
        if (!self::$instance) {
            self::$instance = new HproseServer($config);
        }
        return self::$instance;
    }

}
