<?php

namespace yii\swoole\db;

use yii\swoole\helpers\ArrayHelper;

class DBHelper
{

    public static function Search($query, array $filter = null)
    {
        if (!empty($filter)) {
            foreach ($filter as $k => $v) {
                $query->$k($v);
            }
        }
        return $query;
    }

    public static function PubSearch($query, array $filter, $handle, $db)
    {
        $query = static::Search($query, $filter);
        if (is_array($handle)) {
            $k = key($handle);
            $result = $query->$k($handle[key($handle)], $db);
        } else {
            $result = $query->$handle($db);
        }
        return $result;
    }

    public static function SearchList($query, array $filter = null, int $page = 0)
    {
        $limit = ArrayHelper::remove($filter, 'limit', 20);
        $offset = ArrayHelper::remove($filter, 'offset', $page * (int)$limit);
        $count = ArrayHelper::remove($filter, 'count', '1');

        $queryRes = $filter === [] || !$filter ? $query : static::Search($query, $filter);

        if ($query instanceof \yii\db\ActiveQuery) {
            $rows = $queryRes->limit($limit ?: null)->offset($offset)->asArray()->all();
        } else {
            $rows = $queryRes->limit($limit ?: null)->offset($offset)->all();
        }
        if ($limit) {
            $query->limit = null;
            $query->offset = null;
            $total = $queryRes->count($count);
        } else {
            $total = count($rows);
        }
        unset($query);
        unset($queryRes);
        return array($total, $rows);
    }

}
