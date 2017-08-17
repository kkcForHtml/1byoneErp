<?php
/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace yii\swoole\db;

trait QueryTrait
{
    public $joinWith;
    public $flag;

    protected function normalizeOrderBy($columns)
    {
        if ($columns instanceof Expression)
        {
            return [$columns];
        }
        elseif (is_array($columns))
        {
            foreach ($columns as $key => $sort)
            {
                if (strtolower($sort) === 'desc')
                {
                    $columns[$key] = SORT_DESC;
                }
                elseif (strtolower($sort) === 'asc')
                {
                    $columns[$key] = SORT_ASC;
                }
            }
            return $columns;
        }
        else
        {
            $columns = preg_split('/\s*,\s*/', trim($columns), -1, PREG_SPLIT_NO_EMPTY);
            $result = [];
            foreach ($columns as $column)
            {
                if (preg_match('/^(.*?)\s+(asc|desc)$/i', $column, $matches))
                {
                    $result[$matches[1]] = strcasecmp($matches[2], 'desc') ? SORT_ASC : SORT_DESC;
                }
                else
                {
                    $result[$column] = SORT_ASC;
                }
            }
            return $result;
        }
    }

    public function populate($rows)
    {
        $rows = $this->buildWith($rows);
        if ($this->indexBy === null) {
            return $rows;
        }

        $result = [];
        foreach ($rows as $row) {
            if (is_string($this->indexBy)) {
                $key = $row[$this->indexBy];
            } else {
                $key = $GLOBALS['call_user_func']($this->indexBy, $row);
            }
            $result[$key] = $row;
        }
        return $this->buildWith($result);
    }

    public function one($db = null)
    {
        if ($this->emulateExecution) {
            return false;
        }
        $result = $this->createCommand($db)->queryOne();
        if ($result) {
            $list[] = $result;
            $result = $this->buildWith($list)[0];
        }
        return $result;
    }

    public function buildWith($result)
    {
        if (is_array($this->joinWith) && $result) {
            foreach ($this->joinWith as $key => $with) {
                $on = $with[2];
                $on = explode('=', $on);
                $lfield = explode('.', $on[0]);
                $lfield = count($lfield) == 1 ? $lfield[0] : $lfield[1];
                foreach ($result as $row) {
                    $ids[] = $row[$lfield];
                }

                foreach ($this->join as $join) {
                    if ($with == $join) {
                        $field = explode('.', $on[1]);
                        $field = count($field) == 1 ? $field[0] : $field[1];
                        if (is_string($join[1])) {
                            $tmp = (new Query())->from($join[1])->where([$field => $ids])->all();
                        } else if (is_array($join[1])) {
                            $query = $join[1][key($join[1])];
                            $tmp = $query->where([$field => $ids])->all();
                        }

                        foreach ($tmp as $t) {
                            foreach ($result as $k => $r) {
                                if ($t[$field] === $r[$lfield]) {
                                    if ($this->flag) {
                                        $result[$k][$key][] = $t;
                                    } else {
                                        $result[$k][$key] = $t;
                                    }
                                }
                            }
                        }
                        break;
                    }
                }
            }
        }
        return $result;
    }

    public function joinWithOne($list)
    {
        $this->flag = false;
        return $this->group($list);
    }

    public function joinWithOneList($tableList)
    {
        if (is_array($tableList)) {
            foreach ($tableList as $table) {
                $this->joinWithOne($table);
            }
        }
    }

    public function joinWithMany($list)
    {
        $this->flag = true;
        return $this->group($list);
    }

    public function joinWithManyList($tableList)
    {
        if (is_array($tableList)) {
            foreach ($tableList as $table) {
                $this->joinWithMany($table);
            }
        }
    }

    public function group($list)
    {
        if (is_array($list)) {
            foreach ($list as $key => $join) {
                if (is_array($join)) {
                    $type = "left join";
                    $on = '';
                    if (array_key_exists('type', $join)) {
                        $type = $join['type'];
                    }
                    if (array_key_exists('table', $join)) {
                        $table = $join['table'];
                    }
                    if (array_key_exists('on', $join)) {
                        $on = $join['on'];
                    }
                    if (array_key_exists('addOn', $join)) {
                        if (is_array($join['addOn'])) {
                            foreach ($join['addOn'] as $val) {
                                $on = [key($val), $on, $val[key($val)]];
                            }
                        }
                    }
                    $this->join($type, $table, $on);
                }
                $this->joinWith[$key] = [$type, $table, $on];
            }
        }
        return $this;
    }

    public function querySelect($columns)
    {
        if (!is_array($columns)) {
            return $this;
        }
        foreach ($columns as $key => $val) {
            $columns[$key] = DBHelper::Search(new Query(), $val);
        }
        if ($this->select === null) {
            $this->select = $columns;
        } else {
            $this->select = array_merge($this->select, $columns);
        }
        return $this;
    }

    public function addWhere($condition = [], $params = [])
    {
        if ($condition) {
            if ($this->where === null) {
                $this->where = "1=1";
            }
            foreach ($condition as $val) {
                $val = $this->joinWhere($val);
                $this->where = [key($val), $this->where, $val[key($val)]];
            }
            $this->addParams($params);
        }
        return $this;
    }

    public function addFilterWhere($condition = [], $params = [])
    {
        if ($condition) {
            if ($this->where === null) {
                $this->where = "1=1";
            }
            foreach ($condition as $val) {
                $val = $this->joinWhere($val);
                $condition = $this->filterCondition($val[key($val)]);
                if ($condition !== []) {
                    $this->where = [key($val), $this->where, $condition];
                }
            }
            $this->addParams($params);
        }
        return $this;
    }

    private function joinWhere($val)
    {
        if (is_string($val)) {
            return $val;
        }
        if (array_key_exists("query", $val[key($val)])) {
            $query = $val[key($val)]["query"];
            unset($val[key($val)]["query"]);
            $val[key($val)][] = DBHelper::Search((new Query()), $query);
        } elseif (array_key_exists("model", $val[key($val)])) {
            $modelparam = $val[key($val)]["model"];
            unset($val[key($val)]["model"]);
            $model = key($modelparam);
            $query = $modelparam[$model];
            $model = $model;
            $model = new $model();
            $val[key($val)][] = DBHelper::Search($model::find(), $query);
        }
        return $val;
    }

    public function queryWhere($condition = [], $params = [])
    {
        if ($condition) {
            if ($this->where === null) {
                $this->where = "1=1";
            }
            foreach ($condition as $val) {
                if (is_array($val)) {
                    $key = key($val);
                    $query = $val[key($val)];
                    $this->where = [$key, $this->where, array(key($query) => DBHelper::Search(new Query(), $query[key($query)]))];
                }
            }
            $this->addParams($params);
        }
        return $this;
    }

    public function joinList($list)
    {
        if (is_array($list)) {
            foreach ($list as $join) {
                if (is_array($join)) {
                    $type = "left join";
                    list($table, $on) = $this->getJoinList($join);
                    $this->join($type, $table, $on);
                }
            }
        }
        return $this;
    }


    public function innerJoinList($list)
    {
        if (is_array($list)) {
            foreach ($list as $join) {
                if (is_array($join)) {
                    list($table, $on) = $this->getJoinList($join);
                    $this->innerJoin($table, $on);
                }
            }
        }
        return $this;
    }

    public function leftJoinList($list)
    {
        if (is_array($list)) {
            foreach ($list as $join) {
                if (is_array($join)) {
                    list($table, $on) = $this->getJoinList($join);
                    $this->leftJoin($table, $on);
                }
            }
        }
        return $this;
    }

    public function rightJoinList($list)
    {
        if (is_array($list)) {
            foreach ($list as $join) {
                if (is_array($join)) {
                    list($table, $on) = $this->getJoinList($join);
                    $this->rightJoin($table, $on);
                }
            }
        }
        return $this;
    }

    private function getJoinList($join)
    {
        $on = '';
        if (array_key_exists('table', $join)) {
            $table = $join['table'];
        }
        if (array_key_exists('on', $join)) {
            $on = $join['on'];
        }
        if (array_key_exists('addOn', $join)) {
            if (is_array($join['addOn'])) {
                foreach ($join['addOn'] as $val) {
                    $on = [key($val), $on, $val[key($val)]];
                }
            }
        }
        if (array_key_exists('addOnFilter', $join)) {
            if (is_array($join['addOnFilter'])) {
                foreach ($join['addOnFilter'] as $val) {
                    $fon = [];
                    foreach ($val[key($val)] as $fkey => $fval) {
                        if ($fval) {
                            $fon[$fkey] = $fval;
                        }
                    }
                    $on = [key($val), $on, $fon];
                }
            }
        }
        return [$table, $on];
    }

    public function unionList($list)
    {
        if (is_array($list)) {
            foreach ($list as $val) {
                if (is_array($val)) {
                    $sql = DBHelper::Search(new Query(), $val);
                    $this->union($sql);
                }
            }
        }
        return $this;
    }
}
