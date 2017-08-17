<?php

namespace yii\swoole\commands;

use Yii;
use yii\console\Controller;
use yii\helpers\ArrayHelper;
use yii\swoole\helpers\IniHelper;
use yii\swoole\server\HproseServer;
use yii\swoole\server\HttpServer;
use yii\swoole\server\ProcessServer;
use yii\swoole\server\QueueServer;
use yii\swoole\server\TaskServer;
use yii\swoole\server\TcpServer;
use yii\swoole\server\WebsocketServer;

class SwooleController extends Controller
{

    /**
     * Run swoole http server
     *
     * @param string $app Running app
     * @throws \yii\base\InvalidConfigException
     */
    public function actionHttp($app, $d = 0)
    {
        if (!isset($app)) {
            exit("No argv.\n");
        } else {
            switch ($app) {
                case 'start':
                    Yii::$app->params['swoole']['web']['server']['daemonize'] = $d;
                    HttpServer::getInstance(Yii::$app->params['swoole'])->start();
                    break;
                case 'stop':
                    break;
                case 'restart':
                    break;
                default:
                    exit("Not support this argv.\n");
                    break;
            }
        }
    }

    public function actionWebsocket($app, $d = 0)
    {
        if (!isset($app)) {
            exit("No argv.\n");
        } else {
            switch ($app) {
                case 'start':
                    Yii::$app->params['swoole']['web']['server']['daemonize'] = $d;
                    WebsocketServer::getInstance(Yii::$app->params['swoole'])->start();
                    break;
                case 'stop':
                    break;
                case 'restart':
                    break;
                default:
                    exit("Not support this argv.\n");
                    break;
            }
        }
    }

    public function actionTcp($app, $d = 0)
    {
        if (!isset($app)) {
            exit("No argv.\n");
        } else {
            switch ($app) {
                case 'start':
                    Yii::$app->params['swoole']['tcp']['server']['daemonize'] = $d;
                    TcpServer::getInstance(Yii::$app->params['swoole']);
                    break;
                case 'stop':
                    break;
                case 'restart':
                    break;
                default:
                    exit("Not support this argv.\n");
                    break;
            }
        }
    }

    public function actionTask($app, $d = 0)
    {
        if (!isset($app)) {
            exit("No argv.\n");
        } else {
            switch ($app) {
                case 'start':
                    Yii::$app->params['swoole']['task']['server']['daemonize'] = $d;
                    TaskServer::getInstance(Yii::$app->params['swoole']);
                    break;
                case 'stop':
                    break;
                case 'restart':
                    break;
                default:
                    exit("Not support this argv.\n");
                    break;
            }
        }
    }

    public function actionHprose($app, $d = 0)
    {
        if (!isset($app)) {
            exit("No argv.\n");
        } else {
            switch ($app) {
                case 'start':
                    Yii::$app->params['swoole']['hprose']['server']['daemonize'] = $d;
                    HproseServer::getInstance(ArrayHelper::merge(Yii::$app->params['swoole']['hprose'],Yii::$app->params['swoole']['common']));
                    break;
                case 'stop':
                    break;
                case 'restart':
                    break;
                default:
                    exit("Not support this argv.\n");
                    break;
            }
        }
    }

    public function actionQueue($app)
    {
        if (!isset($app)) {
            exit("No argv.\n");
        } else {
            switch ($app) {
                case 'start':
                    QueueServer::getInstance()->start(Yii::$app->params['swoole']);
                    break;
                case 'stop':
                    QueueServer::getInstance()->stop();
                    break;
                case 'restart':
                    break;
                default:
                    exit("Not support this argv.\n");
                    break;
            }
        }
    }

    public function actionProcess($app)
    {
        if (!isset($app)) {
            exit("No argv.\n");
        } else {
            switch ($app) {
                case 'start':
                    ProcessServer::getInstance()->start(Yii::$app->params['swoole']);
                    break;
                case 'stop':
                    ProcessServer::getInstance()->stop();
                    break;
                case 'restart':
                    break;
                default:
                    exit("Not support this argv.\n");
                    break;
            }
        }
    }

    public function actionCppool($app, $d = 0)
    {
        $usage = "Usage: swoole/cppool {start|status|stop|restart}" . PHP_EOL;
        if (!isset($app)) {
            exit($usage);
        } else {
            $config = Yii::$app->params['swoole']['cppool'];
            $pid = false;
            $exit_code_general = 1;
            $exit_code_invoke = 126;
            if ($app !== "start") {
                if (file_exists($config['pidFile']) === false) {
                    echo sprintf("The pid file %s does NOT exist, Pls. check service is running" . PHP_EOL, $config['pidFile']);
                    exit($exit_code_invoke);
                } else {
                    $pid = intval(file_get_contents($config['pidFile']));
                    if ($pid <= 0) {
                        echo "Malformed pid file" . PHP_EOL;
                        exit($exit_code_invoke);
                    }
                }
            }
            $dbs = [];
            foreach ($config['server']['db'] as $dbname => $cfg) {
                $dbs["'" . Yii::$app->$dbname->dsn . "'"] = $cfg;
            }
            unset($config['server']['db']);
            foreach ($config['server']['redis'] as $dbname => $cfg) {
                $dbs["'" . Yii::$app->$dbname->hostname . ':' . Yii::$app->$dbname->port . ':' . Yii::$app->$dbname->database . "'"] = $cfg;
            }
            unset($config['server']['redis']);
            $server = ArrayHelper::merge($config['server'], $dbs);
            $server['common']['daemonize'] = $d;
            if (IniHelper::write_ini_file($server, $config['path'], true)) {
                if (($conf_arr = parse_ini_file($config['path'], true)) === false) {
                    die("bad ini file\n");
                }
                switch ($app) {
                    case "start":
                        pool_server_create($config['path']);
                        break;
                    case "status":
                        pool_server_status($pid);
                        break;
                    case "reload":
                        pool_server_reload($pid);
                        echo "Tips: The reload can only modify 'pool_min','pool_max','recycle_num' and 'idel_time'" . PHP_EOL;
                        die;
                        break;
                    case "stop":
                        pool_server_shutdown($pid);
                        file_put_contents($config['pidFile'], "");
                        break;
                    case "restart":
                        @pool_server_shutdown($pid);
                        sleep(1);
                        pool_server_create($config['path']);
                        break;
                    default:
                        echo $usage;
                        exit($exit_code_general);
                }
            } else {
                echo 'can not write the ini file';
            }
        }
    }

}
