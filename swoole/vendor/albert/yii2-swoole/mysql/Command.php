<?php

namespace yii\swoole\mysql;

use Yii;
use yii\db\Exception;
use yii\swoole\helpers\CallHelper;

class Command extends \yii\db\Command
{
    public function bindParam($name, &$value, $dataType = null, $length = null, $driverOptions = null)
    {
        $this->prepare();

        if ($dataType === null) {
            $dataType = $this->db->getSchema()->getPdoType($value);
        }
        if ($length === null) {
            $this->pdoStatement->bindParam($name, $value, $dataType);
        } elseif ($driverOptions === null) {
            $this->pdoStatement->bindParam($name, $value, $dataType, $length);
        } else {
            $this->pdoStatement->bindParam($name, $value, $dataType, $length, $driverOptions);
        }
        $this->params[$name] =& $value;

        return $this;
    }

    public function prepare($forRead = null)
    {
        if ($this->pdoStatement) {
            $this->bindPendingParams();
            return;
        }

        $sql = $this->getRawSql();

        if ($this->db->getTransaction()) {
            // master is in a transaction. use the same connection.
            $forRead = false;
        }
        if ($forRead || $forRead === null && $this->db->getSchema()->isReadQuery($sql)) {
            $pdo = $this->db->getSlavePdo();
        } else {
            $pdo = $this->db->getMasterPdo();
        }

        try {
            $this->pdoStatement = new Statement;
            $this->pdoStatement->prepare($sql, $pdo);
            $this->bindPendingParams();
        } catch (\Exception $e) {
            $message = $e->getMessage() . "\nFailed to prepare SQL: $sql";
            $errorInfo = $e instanceof \PDOException ? $e->errorInfo : null;
            throw new Exception($message, $errorInfo, (int)$e->getCode(), $e);
        }
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
            $profile and Yii::endProfile($rawSql, __METHOD__);

            $this->refreshTableSchema();
            return $n;
        } catch (\Exception $e) {
            $profile and Yii::endProfile($rawSql, __METHOD__);
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
                $result = $GLOBALS['call_user_func_array']([$this->pdoStatement, $method], (array)$fetchMode);
            }

            $profile and Yii::endProfile($rawSql, 'yii\db\Command::query');
        } catch (\Exception $e) {
            $profile and Yii::endProfile($rawSql, 'yii\db\Command::query');
            throw $this->db->getSchema()->convertException($e, $rawSql ?: $this->getRawSql());
        }

        if (isset($cache, $cacheKey, $info)) {
            $cache->set($cacheKey, [$result], $info[1], $info[2]);
            Yii::trace('Saved query result in cache', 'yii\db\Command::query');
        }
        return $result;
    }
}
