<?php

namespace yii\swoole\server;

use swoole_http_request;
use swoole_http_response;
use swoole_server;
use swoole_table;
use swoole_websocket_frame;
use swoole_websocket_server;
use Yii;
use yii\helpers\ArrayHelper;

/**
 * WebSocket服务器
 *
 * @package yii\swoole\server
 */
class WebsocketServer extends HttpServer
{
    private static $instance;

    protected function createServer()
    {
        $this->server = new swoole_websocket_server($this->config['host'], $this->config['port'], $this->config['type']);
    }

    function onOpen($server, $request)
    {
//        if (Yii::$app->getUser()->getIsGuest()) {
//            $server->close($request->fd);
//        } else {
        Yii::$app->cache->set('websocketheaders', $request->header, \ShmCache::NEVER_EXPIRED);
        Yii::$app->cache->set(Yii::$app->getUser()->getId(), ['fd' => $request->fd]);
//        }
    }

    public function onMessage(swoole_server $server, swoole_websocket_frame $frame)
    {
//        \Swoole\Coroutine::create(function () use ($server, $frame) {
        $result = ['status' => 503, 'code' => 0, 'message' => '传递参数有误', 'data' => []];

        $data = json_decode($frame->data, true);
        if (($cmd = ArrayHelper::getValue($data, 'cmd')) === null) {
            $server->push($frame->fd, $result);
        } else {
            //准备工作
            $this->app->getRequest()->setUrl(null);
            $app = clone $this->app;
            Yii::$app = &$app;
            $app->setRequest(clone $this->app->getRequest());
            $app->setResponse(clone $this->app->getResponse());
            $data = ArrayHelper::getValue($data, 'data', []);
            $app->getRequest()->setBodyParams($data);
            $app->getRequest()->setRawBody(json_encode($data));
            $app->getRequest()->setHeaders(Yii::$app->cache->get('websocketheaders'));
            $query = ArrayHelper::getValue($data, 'query', []);
            $app->getRequest()->setQueryParams($query);
            $app->setSession(clone $this->app->getSession());
            $app->setUser(clone $this->app->getUser());
            $app->setErrorHandler(clone $this->app->getErrorHandler());
            $app->refresh();
            try {
                $result = $app->runAction($cmd, $query);
            } catch (\Exception $e) {
                Yii::error($e->getMessage());
            } finally {
                $app->afterRun();
                // 还原环境变量
                Yii::$app = $this->app;
                unset($app);
                $server->push($frame->fd, json_encode($result));
            }
        }
//        });
    }

    public function onClose($server, $fd, $from_id)
    {
        parent::onClose($server, $fd, $from_id);
        Yii::info("client {$fd} closed\n", __METHOD__);
        Yii::getLogger()->flush();
    }


    public static function getInstance($config)
    {
        if (!self::$instance) {
            self::$instance = new WebsocketServer($config);
        }
        return self::$instance;
    }

}
