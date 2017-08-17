<?php

namespace yii\swoole\db;

use yii\base\ModelEvent;
use yii\swoole\coroutine\ICoroutine;

class Connection extends \yii\db\Connection implements ICoroutine
{
    /**
     * @var string driver name
     */
    private $_driverName;

    /**
     * @var Transaction the currently active transaction
     */
//    private $_transaction;

    /**
     * @var string
     */
    public $commandClass = 'yii\swoole\db\Command';

    // add function for pool
    public function release($conn = null)
    {
        // USE_POOL 为开关 可以定义在index.php文件中
        if (defined("USE_POOL") && USE_POOL === true) {
            $transaction = $this->getTransaction();
            if (!empty($transaction) && $transaction->getIsActive()) {//事务里面不释放连接
                return;
            }
            $this->pdo->release();
        }
    }

//    public function getTransaction()
//    {
//        return $this->_transaction && $this->_transaction->getIsActive() ? $this->_transaction : null;
//    }
//
//    public function beginTransaction($isolationLevel = null)
//    {
//        $this->open();
//
//        if (($transaction = $this->getTransaction()) === null) {
//            $transaction = $this->_transaction = new Transaction(['db' => $this]);
//        }
//        $transaction->begin($isolationLevel);
//
//        return $transaction;
//    }

    protected function createPdoInstance()
    {
        $pdoClass = $this->pdoClass;
        if ($pdoClass === null) {
            $pdoClass = 'PDO';
            if (defined("USE_POOL") && USE_POOL === true) {
                $pdoClass = 'pdoProxy';
            }
            if ($this->_driverName !== null) {
                $driver = $this->_driverName;
            } elseif (($pos = strpos($this->dsn, ':')) !== false) {
                $driver = strtolower(substr($this->dsn, 0, $pos));
            }
            if (isset($driver)) {
                if ($driver === 'mssql' || $driver === 'dblib') {
                    $pdoClass = 'yii\db\mssql\PDO';
                } elseif ($driver === 'sqlsrv') {
                    $pdoClass = 'yii\db\mssql\SqlsrvPDO';
                }
            }
        }

        $dsn = $this->dsn;
        if (strncmp('sqlite:@', $dsn, 8) === 0) {
            $dsn = 'sqlite:' . Yii::getAlias(substr($dsn, 7));
        }
        return new $pdoClass($dsn, $this->username, $this->password, $this->attributes);
    }

    /**
     * 批量插入自增主键
     * */
    public function insertSeveral($model, $array_columns, $transaction = null)
    {
        $sql = '';
        $params = array();
        $i = 0;
        if ((bool)count(array_filter(array_keys($array_columns), 'is_string'))) {
            $array_columns = [$array_columns];
        }
        $event = new ModelEvent;
        foreach ($array_columns as $item) {
            $table = clone $model;
            //关联模型
            if (isset($table->realation)) {
                foreach ($table->realation as $key => $val) {
                    if (isset($item[$key])) {
                        $child = $table->getRelation($key)->modelClass;
                        $child_model = new $child();
                        foreach ($val as $c_attr => $p_attr) {
                            foreach ($item[$key] as $index => $params) {
                                $item[$key][$index][$c_attr] = $table->{$p_attr};
                            }
                        }
                        if ($this->insertSeveral($child_model, $item[$key]) === false) {
                            return false;
                        }
                    }
                }
            }
            $names = array();
            $placeholders = array();
            $table->load($item, '');
            if (method_exists($table, 'before_ACreate')) {
                $class = \yii\swoole\helpers\ArrayHelper::remove($array_columns, 'before');
                list($status, $array_columns) = $table->before_ACreate($array_columns, $class);
                if ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN_COMMIT) {
                    if ($transaction->getIsActive()) {
                        $transaction->commit();
                    }
                    return $array_columns;
                } elseif ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN) {
                    return $array_columns;
                }
            }
            if (!$table->validate()) {
                $errors = [];
                foreach ($table->errors as $error) {
                    $errors = array_merge($errors, $error);
                }
                throw new \yii\web\ServerErrorHttpException(implode(' ', $errors));
            }
            $table->trigger($table::EVENT_BEFORE_INSERT, $event);
            if (!$event->isValid) {
                $errors = [];
                foreach ($table->errors as $error) {
                    $errors = array_merge($errors, $error);
                }
                throw new \yii\web\ServerErrorHttpException(implode(' ', $errors));
            }
            foreach ($table->toArray() as $name => $value) {
                if (!$i) {
                    $names[] = $this->quoteColumnName($name);
                }
                if ($value instanceof CDbExpression) {
                    $placeholders[] = $value->expression;
                    foreach ($value->params as $n => $v)
                        $params[$n] = $v;
                } else {
                    $placeholders[] = ':' . $name . $i;
                    $params[':' . $name . $i] = $value;
                }
            }
            if (!$i) {
                $sql = 'INSERT INTO ' . $this->quoteTableName($table::tableName())
                    . ' (' . implode(', ', $names) . ') VALUES ('
                    . implode(', ', $placeholders) . ')';
            } else {
                $sql .= ',(' . implode(', ', $placeholders) . ')';
            }
            $i++;
        }
        return $table::getDb()->createCommand($sql, $params)->execute();
    }

    /**
     * 批量更新
     * */
    public function updateSeveral($model, $array_columns, $transaction = null)
    {
        $sql = '';
        $params = array();
        $i = 0;
        if ((bool)count(array_filter(array_keys($array_columns), 'is_string'))) {
            $array_columns = [$array_columns];
        }
        $keys = $model::primaryKey();
        $event = new ModelEvent();
        foreach ($array_columns as $item) {
            $table = clone $model;
            //关联模型
            if (isset($table->realation)) {
                foreach ($table->realation as $key => $val) {
                    if (isset($item[$key])) {
                        $child = $table->getRelation($key)->modelClass;
                        $child_model = new $child();
                        if ($item[$key]) {
                            if (!isset($item[$key][0])) {
                                $item[$key] = [$item[$key]];
                            }
                            foreach ($val as $c_attr => $p_attr) {
                                foreach ($item[$key] as $index => $params) {
                                    $item[$key][$index][$c_attr] = $table->{$p_attr};
                                }
                            }
                            if ($this->updateSeveral($child_model, $item[$key]) === false) {
                                return false;
                            }
                        }
                    }
                }
            }
            $names = array();
            $placeholders = array();
            $table->load($item, '');
            $table->isNewRecord = false;
            if (method_exists($table, 'before_AUpdate')) {
                $class = \yii\swoole\helpers\ArrayHelper::remove($array_columns, 'before');
                list($status, $array_columns) = $table->before_AUpdate($array_columns, $class);
                if ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN_COMMIT) {
                    if ($transaction->getIsActive()) {
                        $transaction->commit();
                    }
                    return $array_columns;
                } elseif ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN) {
                    return $array_columns;
                }
            }
            if (!$table->validate()) {
                $errors = [];
                foreach ($table->errors as $error) {
                    $errors = array_merge($errors, $error);
                }
                throw new \yii\web\ServerErrorHttpException(implode(' ', $errors));
            }
            if ($keys) {
                foreach ($keys as $key) {
                    if (isset($item[$key])) {
                        $table[$key] = $item[$key];
                    }
                }
            }
            $table->trigger($table::EVENT_BEFORE_UPDATE, $event);
            if (!$event->isValid) {
                $errors = [];
                foreach ($table->errors as $error) {
                    $errors = array_merge($errors, $error);
                }
                throw new \yii\web\ServerErrorHttpException(implode(' ', $errors));
            }
            foreach ($table->toArray() as $name => $value) {
                $names[] = $this->quoteColumnName($name);
                if (!$i) {
                    $updates[] = $this->quoteColumnName($name) . "=values(" . $this->quoteColumnName($name) . ")";
                }
                if ($value instanceof CDbExpression) {
                    $placeholders[] = $value->expression;
                    foreach ($value->params as $n => $v)
                        $params[$n] = $v;
                } else {
                    $placeholders[] = ':' . $name . $i;
                    $params[':' . $name . $i] = $value;
                }
            }
            if (!$i) {
                $sql = 'INSERT INTO ' . $this->quoteTableName($table::tableName())
                    . ' (' . implode(', ', $names) . ') VALUES ('
                    . implode(', ', $placeholders) . ')';
            } else {
                $sql .= ',(' . implode(', ', $placeholders) . ')';
            }
            $i++;
        }
        $sql .= " on duplicate key update " . implode(', ', $updates);
        return $table::getDb()->createCommand($sql, $params)->execute();
    }

    /**
     * 批量删除
     * */
    public function deleteSeveral($table, $array_columns, $transaction = null)
    {
        $result = false;
        $keys = $table::primaryKey();
        $condition = [];
        if ((bool)count(array_filter(array_keys($array_columns), 'is_string'))) {
            $array_columns = [$array_columns];
        }
        $event = new ModelEvent();
        foreach ($array_columns as $item) {
            $table->load($item, '');
            $table->isNewRecord = false;
            if (method_exists($table, 'before_ADelete')) {
                $class = \yii\swoole\helpers\ArrayHelper::remove($array_columns, 'before');
                list($status, $array_columns) = $table->before_ADelete($array_columns, $class);
                if ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN_COMMIT) {
                    if ($transaction->getIsActive()) {
                        $transaction->commit();
                    }
                    return $array_columns;
                } elseif ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN) {
                    return $array_columns;
                }
            }
            if (isset($table->realation)) {
                foreach ($table->realation as $key => $val) {
                    if (isset($item[$key])) {
                        $child = $table->getRelation($key)->modelClass;
                        $child_model = new $child();
                        if ($item[$key]) {
                            if ($this->deleteSeveral($child_model, $item[$key]) === false) {
                                return false;
                            }
                        }
                    }
                }
            }
            if ($keys) {
                foreach ($keys as $key) {
                    if (isset($item[$key])) {
                        $condition[$key][] = $item[$key];
                    }
                }
            }
            $table->trigger($table::EVENT_BEFORE_DELETE, $event);
            if (!$event->isValid) {
                $errors = [];
                foreach ($table->errors as $error) {
                    $errors = array_merge($errors, $error);
                }
                throw new \yii\web\ServerErrorHttpException(implode(' ', $errors));
            }
        }
        if ($condition) {
            $result = $table->deleteAll($condition);
        }
        if ($result !== false) {
            return $condition;
        } else {
            return $result;
        }
    }

//    public function close()
//    {
//        parent::close();
//
//        if ($this->pdo !== null) {
//            Yii::trace('Closing DB connection: ' . $this->dsn, __METHOD__);
//            $this->pdo = null;
//            $this->_transaction = null;
//        }
//    }
//
//    public function __clone()
//    {
//        parent::__clone();
//        $this->_transaction = null;
//        if (strncmp($this->dsn, 'sqlite::memory:', 15) !== 0) {
//            // reset PDO connection, unless its sqlite in-memory, which can only have one connection
//            $this->pdo = null;
//        }
//    }

}
