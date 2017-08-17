<?php

namespace yii\swoole\mysql;

use Yii;

class Statement
{
    private $sql;
    private $pdo;
    private $value;
    private $mode;
    private $data;

    public function setFetchMode($mode)
    {
        $this->mode = $mode;
    }

    public function prepare($sql, $pdo)
    {
        $this->sql = $sql;
        $this->pdo = $pdo;
    }

    public function bindValue($parameter, $value, $data_type = \PDO::PARAM_STR)
    {

    }

    public function execute($timeout = 10)
    {
        try {
            $this->pdo->setDefer();
            $this->data = $this->pdo->query($this->sql, $timeout);
            $this->data = $this->pdo->recv();
        } catch (\Exception $e) {
            Yii::warning($e->getMessage());
        }

//        $stmt = spl_object_hash($this->pdo);
//        $this->pdo->query("PREPARE {$stmt} FROM {$this->sql};");
//        $this->pdo->query($this->sql);
    }

    public function fetch($fetch_style = null, $cursor_orientation = \PDO::FETCH_ORI_NEXT, $cursor_offset = 0)
    {
        if (!is_array($this->data)) {
            return $this->data;
        }
        $result = [];
        switch ($fetch_style) {
            case \PDO::FETCH_ASSOC:
                $result = array_shift($this->data);
                break;
            default:
                $result = $this->data;
        }
        return $result;
    }

    public function fetchColumn($column_number = 0)
    {
        if (!is_array($this->data)) {
            return $this->data;
        }
        $val = array_shift($this->data);
        return $this->getColumn($val);
    }

    private function getColumn($data, $column_number = 0)
    {
        $i = 0;
        foreach ($data as $key => $v) {
            if ($i === $column_number) {
                return $v;
            }
            $i++;
        }
        return $v;
    }

    public function fetchObject($class_name = "stdClass", array $ctor_args = array())
    {
    }

    public function fetchAll($fetch_style = null, $fetch_argument = null, array $ctor_args = array())
    {
        if (!is_array($this->data)) {
            return $this->data;
        }
        $result = [];
        switch ($fetch_style) {
            case \PDO::FETCH_COLUMN:
                foreach ($this->data as $data) {
                    $result[] = $this->getColumn($data);
                }
                break;
            default:
                $result = $this->data;
        }
        return $result;
    }

    public function nextRowset()
    {
    }

    public function closeCursor()
    {

    }

    public function rowCount()
    {
        return $this->pdo->affected_rows;
    }

    public function columnCount()
    {
    }
}