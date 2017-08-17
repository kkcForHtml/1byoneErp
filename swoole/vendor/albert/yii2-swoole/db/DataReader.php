<?php

namespace yii\swoole\db;

class DataReader extends \yii\db\DataReader {

    public function read() {
        $data = $this->_statement->fetch();
        $this->db->release();
        return $data;
    }

    public function readColumn($columnIndex) {
        $data = $this->_statement->fetchColumn($columnIndex);
        $this->db->release();
        return $data;
    }

    public function readObject($className, $fields) {
        $data = $this->_statement->fetchObject($className, $fields);
        $this->db->release();
        return $data;
    }

    public function readAll() {
        $data = $this->_statement->fetchAll();
        $this->db->release();
        return $data;
    }

    public function nextResult() {
        if (defined("USE_POOL") && USE_POOL === true) {
            throw new Exception("cp not support foreach stmt");
        }
        if (($result = $this->_statement->nextRowset()) !== false) {
            $this->_index = -1;
        }

        return $result;
    }

    public function close() {
        $this->_statement->closeCursor();
        $this->_closed = true;
        $this->db->release();
    }

    public function getRowCount() {
        $data = $this->_statement->rowCount();
        $this->db->release();
        return $data;
    }

    public function getColumnCount() {
        $data = $this->_statement->columnCount();
        $this->db->release();
        return $data;
    }

    public function current() {
        if (defined("USE_POOL") && USE_POOL === true) {
            throw new Exception("cp not support foreach stmt");
        }
        return $this->_row;
    }

    public function next() {
        if (defined("USE_POOL") && USE_POOL === true) {
            throw new Exception("cp not support foreach stmt");
        }
        $this->_row = $this->_statement->fetch();
        $this->_index++;
    }

}
