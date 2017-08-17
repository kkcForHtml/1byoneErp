<?php

namespace yii\swoole\web;

use Yii;
use yii\swoole\helpers\ArrayHelper;
use yii\swoole\helpers\CoroHelper;

trait HttpTrait
{
    /**
     * 执行请求
     *
     * @param swoole_http_request $request
     * @param swoole_http_response $response
     */
    public function onRequest($request, $response)
    {
//        \Swoole\Coroutine::create(function () use ($request, $response) {
        $file = $this->root . '/' . $this->indexFile;
        $id = CoroHelper::getId();

        $_GET[$id] = isset($request->get) ? $request->get : [];
        $_POST[$id] = isset($request->post) ? $request->post : [];
        $_SERVER[$id] = array_change_key_case($request->server, CASE_UPPER);
        $_FILES[$id] = isset($request->files) ? $request->files : [];
        $_COOKIE[$id] = isset($request->cookie) ? $request->cookie : [];
        if (isset($request->header)) {
            foreach ($request->header as $key => $value) {
                $key = 'HTTP_' . strtoupper(str_replace('-', '_', $key));
                $_SERVER[$id][$key] = $value;
            }
        }

        $_SERVER[$id]['REQUEST_URI'] = $request->server['request_uri'];
        if (isset($request->server['query_string']) && $request->server['query_string']) {
            $_SERVER[$id]['REQUEST_URI'] = $_SERVER[$id]['REQUEST_URI'] . '?' . $request->server['query_string'];
        }

        $path = isset($request->header['path']) ? $request->header['path'] : Yii::$app->params['path'];
        $_SERVER[$id]['REQUEST_URI'] = $path . $_SERVER[$id]['REQUEST_URI'];

        $_SERVER[$id]['SERVER_ADDR'] = '127.0.0.1';
        $_SERVER[$id]['SERVER_NAME'] = 'localhost';
        $_SERVER[$id]['SCRIPT_FILENAME'] = $file;
        $_SERVER[$id]['DOCUMENT_ROOT'] = $this->root;
        $_SERVER[$id]['DOCUMENT_URI'] = $_SERVER[$id]['SCRIPT_NAME'] = '/' . $this->indexFile;

        $this->server->currentSwooleRequest[$id] = $request;
        $this->server->currentSwooleResponse[$id] = $response;

        Yii::$app->getUrlManager()->setBaseUrl($path);
        Yii::$app->getUrlManager()->checkRules();
        //set request
        try {
            //判断转发RPC
            $route = substr($request->server['request_uri'], 0, strrpos($request->server['request_uri'], '/'));
            if (!in_array($route, Yii::$rpcList)
                || in_array($route, ArrayHelper::getValue(Yii::$app->params, 'rpcCoR', []))
            ) {
                Yii::$app->beforeRun();
                $appResponse = Yii::$app->getResponse();
                $data = Yii::$app->rpc->send([$request->server['request_uri'], [Yii::$app->getRequest()->getQueryParams(), Yii::$app->getRequest()->getBodyParams()]])->recv();
                if ($data instanceof \Exception) {
                    Yii::$app->getErrorHandler()->handleException($data);
                } else {
                    $appResponse->data = $data;
                }
                Yii::$app->end();
            } else {
                Yii::$app->run();
            }
            //结束
            Yii::getLogger()->flush();
            Yii::getLogger()->flush(true);
        } catch (ErrorException $e) {
            if ($this->debug) {
                echo (string)$e;
                echo "\n";
                $response->end('');
            } else {
                Yii::$app->getErrorHandler()->handleException($e);
            }
        } catch (\Exception $e) {
            if ($this->debug) {
                echo (string)$e;
                echo "\n";
                $response->end('');
            } else {
                Yii::$app->getErrorHandler()->handleException($e);
            }
        } finally {
//            Yii::$app->clog->upload();
            Yii::$app->release();
        }
//        });
    }
}