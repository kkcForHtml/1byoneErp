<?php

namespace yii\swoole\httpclient;

use Yii;

class Response extends \yii\httpclient\Response
{

    private $conn;

    public function getData()
    {
        $this->recv();
        return parent::getData();
    }

    public function setConn(\Swoole\Coroutine\Http\Client $conn)
    {
        $this->conn = $conn;
    }

    private function recv()
    {
        if ($this->conn->errCode === 0 && !isset($this->conn->body) && $this->conn->recv()) {
            $this->setContent($this->conn->body);
            $this->setHeaders($this->conn->headers);
            $this->setCookies($this->conn->cookies);
        }
        $this->conn->close();
    }

    public function getStatusCode()
    {
        $this->recv();
        if (isset($this->conn->statusCode)) {
            $code = $this->conn->statusCode;
        } else {
            $code = 500;
        }
        return $code;
    }

}
