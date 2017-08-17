<?php

namespace yii\swoole\httpclient;

use Yii;

class Client extends \yii\httpclient\Client
{

    /**
     * @var Transport|array|string|callable HTTP message transport.
     */
    private $_transport = 'yii\swoole\httpclient\SwooleTransport';


    /**
     * Sets the HTTP message transport. It can be specified in one of the following forms:
     *
     * - an instance of `Transport`: actual transport object to be used
     * - a string: representing the class name of the object to be created
     * - a configuration array: the array must contain a `class` element which is treated as the object class,
     *   and the rest of the name-value pairs will be used to initialize the corresponding object properties
     * - a PHP callable: either an anonymous function or an array representing a class method (`[$class or $object, $method]`).
     *   The callable should return a new instance of the object being created.
     * @param Transport|array|string $transport HTTP message transport
     */
    public function setTransport($transport)
    {
        $this->_transport = $transport;
    }

    /**
     * @return Transport HTTP message transport instance.
     */
    public function getTransport()
    {
        if (!is_object($this->_transport)) {
            $this->_transport = Yii::createObject($this->_transport);
        }
        return $this->_transport;
    }

    /**
     * @return Request request instance.
     */
    public function createRequest()
    {
        $config = $this->requestConfig;
        if (!isset($config['class'])) {
            $config['class'] = Request::className();
        }
        $config['client'] = $this;
        return Yii::createObject($config);
    }

    /**
     * Creates a response instance.
     * @param string $content raw content
     * @param array $headers headers list.
     * @return Response request instance.
     */
    public function createConn(\Swoole\Coroutine\Http\Client $conn)
    {
        $config = $this->responseConfig;
        if (!isset($config['class'])) {
            $config['class'] = Response::className();
        }
        $config['client'] = $this;
        $response = Yii::createObject($config);
        $response->setConn($conn);
        return $response;
    }

}
