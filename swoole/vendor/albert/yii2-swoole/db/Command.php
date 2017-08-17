<?php

namespace yii\swoole\db;

use Yii;
use yii\base\ErrorException;

class Command extends \yii\db\Command
{

    /**
     * @var int 重连次数
     */
    public $reconnectTimes = 3;

    /**
     * @var int 当前重连次数
     */
    public $reconnectCount = 0;

    /**
     * 检查指定的异常是否为可以重连的错误类型
     *
     * @param \Exception $exception
     * @return bool
     */
    public function isConnectionError($exception)
    {
        if ($exception instanceof \PDOException) {
            $errorInfo = $this->pdoStatement->errorInfo();
            if ($errorInfo[1] == 70100 || $errorInfo[1] == 2006) {
                return true;
            }
        } elseif ($exception instanceof ErrorException) {
            if (strpos($exception->getMessage(), 'MySQL server has gone away') !== false) {
                return true;
            }
        }
        $message = $exception->getMessage();
        if (strpos($message, 'Error while sending QUERY packet. PID=') !== false) {
            return true;
        }
        return false;
    }

    /**
     * 上一层对PDO的异常返回封装了一次
     *
     * @inheritdoc
     */
    public function execute()
    {
        try {
            $sql = $this->getSql();
            list($profile, $rawSql) = $this->logQuery(__METHOD__);

            if ($sql == '') {
                return 0;
            }

            $this->prepare(false);

            $profile and Yii::beginProfile($rawSql, __METHOD__);

            $this->pdoStatement->execute();
            $n = $this->pdoStatement->rowCount();
            $this->db->release();
            $profile and Yii::endProfile($rawSql, __METHOD__);

            $this->refreshTableSchema();

            $this->reconnectCount = 0;
            return $n;
        } catch (\Exception $e) {
            $profile and Yii::endProfile($rawSql, __METHOD__);
            if ($this->reconnectCount >= $this->reconnectTimes) {
                throw $this->db->getSchema()->convertException($e, $rawSql ?: $this->getRawSql());
            }
            $isConnectionError = $this->isConnectionError($e);
            if ($isConnectionError) {
                $this->cancel();
                $this->db->close();
                $this->db->open();
                $this->reconnectCount++;
                return $this->execute();
            }
            throw $this->db->getSchema()->convertException($e, $rawSql ?: $this->getRawSql());
        }
    }

    private function logQuery($category)
    {
        if ($this->db->enableLogging) {
            $rawSql = $this->getRawSql();
            Yii::info($rawSql, $category);
        }
        if (!$this->db->enableProfiling) {
            return [false, isset($rawSql) ? $rawSql : null];
        } else {
            return [true, isset($rawSql) ? $rawSql : $this->getRawSql()];
        }
    }

    /**
     * 上一层对PDO的异常返回封装了一次,
     *
     * @inheritdoc
     */
    public function queryInternal($method, $fetchMode = null)
    {
        list($profile, $rawSql) = $this->logQuery('yii\db\Command::query');
        try {
            if ($method !== '') {
                $info = $this->db->getQueryCacheInfo($this->queryCacheDuration, $this->queryCacheDependency);
                if (is_array($info)) {
                    /* @var $cache \yii\caching\Cache */
                    $cache = $info[0];
                    $cacheKey = [
                        __CLASS__,
                        $method,
                        $fetchMode,
                        $this->db->dsn,
                        $this->db->username,
                        $rawSql ?: $rawSql = $this->getRawSql(),
                    ];
                    $result = $cache->get($cacheKey);
                    if (is_array($result) && isset($result[0])) {
                        Yii::trace('Query result served from cache', 'yii\db\Command::query');
                        return $result[0];
                    }
                }
            }

            $this->prepare(true);

            $profile and Yii::beginProfile($rawSql, 'yii\db\Command::query');

            $this->pdoStatement->execute();

            if ($method === '') {
                $result = new DataReader($this);
            } else {
                if ($fetchMode === null) {
                    $fetchMode = $this->fetchMode;
                }
                $result = call_user_func_array([$this->pdoStatement, $method], (array)$fetchMode);
                $this->pdoStatement->closeCursor();
            }

            $profile and Yii::endProfile($rawSql, 'yii\db\Command::query');
        } catch (\Exception $e) {
            $profile and Yii::endProfile($rawSql, 'yii\db\Command::query');
            if ($this->reconnectCount >= $this->reconnectTimes) {
                throw $this->db->getSchema()->convertException($e, $rawSql ?: $this->getRawSql());
            }
            $isConnectionError = $this->isConnectionError($e);
            //var_dump($isConnectionError);
            if ($isConnectionError) {
                $this->cancel();
                $this->db->close();
                $this->db->open();
                $this->reconnectCount++;
                return $this->queryInternal($method, $fetchMode);
            }
            throw $this->db->getSchema()->convertException($e, $rawSql ?: $this->getRawSql());
        }

        if (isset($cache, $cacheKey, $info)) {
            $cache->set($cacheKey, [$result], $info[1], $info[2]);
            Yii::trace('Saved query result in cache', 'yii\db\Command::query');
        }

        $this->reconnectCount = 0;
        return $result;
    }

}
