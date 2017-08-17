<?php

namespace yii\swoole\tcp;

use Yii;
use yii\base\ErrorException;
use yii\base\InvalidParamException;
use yii\helpers\BaseJson;
use yii\swoole\helpers\ArrayHelper;
use yii\swoole\pack\TcpPack;

trait TcpTrait
{
    public function onReceive($serv, $fd, $from_id, $data)
    {
//        \Swoole\Coroutine::create(function () use ($serv, $fd, $from_id, $data) {
        $data = TcpPack::decode($data, 'tcp');
        $data = ArrayHelper::merge([$serv, $fd, $from_id], $data);
        $GLOBALS['call_user_func_array']([$this, 'run'], $data);

//        });
    }

    public function run($serv, $fd, $form_id, $function, $params, $IP = '127.0.0.1', $traceId = null, $fastcall = false)
    {
        if ($fastcall) {
            $serv->send($fd, TcpPack::encode(['status' => 200, 'code' => 0, 'message' => 'success', 'data' => null], 'tcp'));
        }

        if (is_string($function) && strpos($function, '\\') === false && strpos($function, '/') !== false) {
            try {
                list($query, $params) = $params;
                Yii::$app->request->setBodyParams($params);
                Yii::$app->request->setHostInfo(null);
                Yii::$app->request->setUrl($function);
                Yii::$app->request->setRawBody(json_encode($params));
                Yii::$app->request->setTraceId($traceId);
                Yii::$app->getRequest()->setQueryParams($query);
                Yii::$app->refresh();
                $result = Yii::$app->runAction($function, $query);
                if (!$fastcall) {
                    $serv->send($fd, TcpPack::encode($result, 'tcp'));
                }

                $this->setLog($result);
            } catch (\Exception $e) {
                if (!$fastcall) {
                    $serv->send($fd, TcpPack::encode($e, 'tcp'));
                }

                $this->setLog($e);
            }

        } elseif (is_array($function)) {
            try {
                $pnum = count($function);
                if ($pnum === 3) {
                    list($comp, $obj, $method) = $function;
                    if (Yii::$app->has($comp)) {
                        $obj = Yii::$app->get($comp)->$obj;
                        $result = $GLOBALS['call_user_func_array']([$obj, $method], $params);
                    } else {
                        $result = new InvalidParamException('Error send data!');
                    }
                } elseif ($pnum === 2) {
                    list($obj, $method) = $function;
                    if (Yii::$app->has($comp)) {
                        $obj = Yii::$app->get($obj);
                        $result = $GLOBALS['call_user_func_array']([$obj, $method], $params);
                    } else {
                        $result = $GLOBALS['call_user_func_array']($function, $params);
                    }
                } else {
                    $result = new InvalidParamException('Error send data!');
                }

                if (!$fastcall) {
                    $serv->send($fd, TcpPack::encode($result, 'tcp'));
                }
                $function = is_array($function) ? implode('\\', $function) : $function;
                $this->setLog($result);
            } catch (\Exception $e) {
                if (!$fastcall) {
                    $serv->send($fd, TcpPack::encode($result, 'tcp'));
                }
                $function = is_array($function) ? implode('\\', $function) : $function;
                $this->setLog($e);
            }
        }
    }

    private function setLog($result)
    {
        Yii::$app->response->content = BaseJson::encode(Yii::createObject('yii\swoole\rest\Serializer')->serialize($result));
        Yii::$app->release();
    }
}
