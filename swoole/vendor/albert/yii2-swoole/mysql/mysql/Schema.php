<?php
/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace yii\swoole\mysql\mysql;

use yii\swoole\helpers\CoroHelper;

/**
 * Schema is the class for retrieving metadata from a MySQL database (version 4.1.x and 5.x).
 *
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class Schema extends \yii\db\mysql\Schema
{
    public function getLastInsertID($sequenceName = '')
    {
        $id = CoroHelper::getId();
        if ($this->db->isActive) {
            return $this->db->pdo[$id]->insert_id;
        } else {
            throw new InvalidCallException('DB Connection is not active.');
        }
    }

    public function quoteValue($str)
    {
        if (!is_string($str)) {
            return $str;
        }

        return "'" . addcslashes(str_replace("'", "''", $str), "\000\n\r\\\032") . "'";
    }

    protected function findColumns($table)
    {
        $sql = 'SHOW FULL COLUMNS FROM ' . $this->quoteTableName($table->fullName);
        try {
            $columns = $this->db->createCommand($sql)->queryAll();
        } catch (\Exception $e) {
            $previous = $e->getPrevious();
            if ($previous instanceof \PDOException && strpos($previous->getMessage(), 'SQLSTATE[42S02') !== false) {
                // table does not exist
                // https://dev.mysql.com/doc/refman/5.5/en/error-messages-server.html#error_er_bad_table_error
                return false;
            }
            throw $e;
        }
        foreach ($columns as $info) {
            $info = array_change_key_case($info, CASE_LOWER);
            $column = $this->loadColumnSchema($info);
            $table->columns[$column->name] = $column;
            if ($column->isPrimaryKey) {
                $table->primaryKey[] = $column->name;
                if ($column->autoIncrement) {
                    $table->sequenceName = '';
                }
            }
        }

        return true;
    }
}
