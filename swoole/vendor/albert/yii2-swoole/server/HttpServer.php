<?php

namespace yii\swoole\server;

use swoole_http_request;
use swoole_http_response;
use swoole_http_server;
use swoole_table;
use Yii;
use yii\swoole\helpers\ArrayHelper;
use yii\swoole\tcp\TcpTrait;
use yii\swoole\web\HttpTrait;

/**
 * HTTP服务器
 *
 * @package yii\swoole\server
 */
class HttpServer extends Server
{
    use TcpTrait;
    use HttpTrait;

    /**
     * @var string 缺省文件名
     */
    public $indexFile = 'index.php';

    /**
     * @var bool
     */
    public $debug = false;

    private static $instance;

    public function __construct($config)
    {
        $this->allConfig = $config;
    }

    public function start()
    {
        $this->config = ArrayHelper::merge(ArrayHelper::getValue($this->allConfig, 'web'), ArrayHelper::getValue($this->allConfig, 'common'));
        $this->name = $this->config['name'];
        if (isset($this->config['debug'])) {
            $this->debug = $this->config['debug'];
        }
        if (isset($this->config['pidFile'])) {
            $this->pidFile = $this->config['pidFile'];
        }
        $this->createServer();
        Yii::$app->setSwooleServer($this->server);
        $this->startServer();
    }

    protected function createServer()
    {
        $this->server = new swoole_http_server($this->config['host'], $this->config['port'], $this->config['type']);
    }

    protected function startServer()
    {

        $this->root = $this->config['root'];

        $this->server->on('start', [$this, 'onStart']);
        $this->server->on('shutdown', [$this, 'onShutdown']);

        $this->server->on('managerStart', [$this, 'onManagerStart']);

        $this->server->on('workerStart', [$this, 'onWorkerStart']);
        $this->server->on('workerStop', [$this, 'onWorkerStop']);

        $this->server->on('request', [$this, 'onRequest']);

        if (method_exists($this, 'onOpen')) {
            $this->server->on('open', [$this, 'onOpen']);
        }
        if (method_exists($this, 'onClose')) {
            $this->server->on('close', [$this, 'onClose']);
        }

        if (method_exists($this, 'onHandShake')) {
            $this->server->on('handshake', [$this, 'onHandShake']);
        }
        if (method_exists($this, 'onMessage')) {
            $this->server->on('message', [$this, 'onMessage']);
        }

        if (method_exists($this, 'onTask')) {
            $this->server->on('task', [$this, 'onTask']);
        }
        if (method_exists($this, 'onFinish')) {
            $this->server->on('finish', [$this, 'onFinish']);
        }

        $this->server->set($this->config['server']);
        $this->beforeStart();
        $this->server->start();
    }

    public function createServerTable()
    {
        //创建内存表
        $this->server->serverTable = new swoole_table(1024);
        $this->server->serverTable->column('host', swoole_table::TYPE_STRING, 16);
        $this->server->serverTable->column('appname', swoole_table::TYPE_STRING, 16);
        $this->server->serverTable->create();
    }

    public static function getInstance($config)
    {
        if (!self::$instance) {
            self::$instance = new HttpServer($config);
        }
        return self::$instance;
    }

}
