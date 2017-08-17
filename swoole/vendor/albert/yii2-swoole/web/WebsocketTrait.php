<?php
namespace yii\swoole\web;

use Yii;

trait WebsocketTrait
{
    function onHandShake(swoole_http_request $request, swoole_http_response $response)
    {
//        \Swoole\Coroutine::create(function () use ($request, $response) {
            if (!isset($request->header['sec-websocket-key'])) {
                echo 'Bad protocol implementation: it is not RFC6455.';
                return false;
            }
            $key = $request->header['sec-websocket-key'];
            if (0 === preg_match('#^[+/0-9A-Za-z]{21}[AQgw]==$#', $key) || 16 !== strlen(base64_decode($key))) {
                echo 'Header Sec-WebSocket-Key: $key is illegal.';
                return false;
            }

            $result = !Yii::$app->getUser()->getIsGuest();
            if ($result) {
                $response->header('Upgrade', 'websocket');
                $response->header('Connection', 'Upgrade');
                $websocketStr = $request->header['sec-websocket-key'] . '258EAFA5-E914-47DA-95CA-C5AB0DC85B11';
                $SecWebSocketAccept = base64_encode(sha1($websocketStr, true));
                $response->header('Sec-WebSocket-Accept', $SecWebSocketAccept);
                $response->header('Sec-WebSocket-Version', '13');
                $response->status(406);

                Yii::$app->cache->set('websocketheaders', $request->header, \ShmCache::NEVER_EXPIRED);

                Yii::$app->cache->set(Yii::$app->getUser()->getId(), ['fd' => $request->fd]);
            }

            return $result;
//        });
    }
}
