<?php

namespace yii\swoole\rest;

use yii;
use yii\swoole\db\DBHelper;

class IndexExt extends \yii\base\Object
{

    public static function actionDo($modelClass, $filter = null, $page = null)
    {
        if (!$filter) {
            $filter = Yii::$app->getRequest()->getBodyParams();
        }
        if ($page === null) {
            $page = (int)Yii::$app->request->get('page', 1) - 1;
        }

        if (method_exists($modelClass, 'before_AIndex')) {
            $class = yii\swoole\helpers\ArrayHelper::remove($filter, 'before');
            list($status, $filter) = $modelClass->before_AIndex($filter, $class);
            if ($status >= $modelClass::ACTION_RETURN) {
                return $filter;
            }
        }
        $res = new ResponeModel();
        if ($filter instanceof \yii\db\Query) {
            list($total, $data) = DBHelper::SearchList($filter, [], $page);
        } else {
            list($total, $data) = DBHelper::SearchList($modelClass::find(), $filter, $page);
        }
        if (method_exists($modelClass, 'after_AIndex')) {
            $class = yii\swoole\helpers\ArrayHelper::remove($filter, 'after');
            list($status, $data) = $modelClass->after_Aindex($data, $class);
            if ($status >= $modelClass::ACTION_RETURN) {
                return $data;
            }
        }
        return $res->setModel('200', 0, '操作成功!', $data, ['totalCount' => $total]);
    }

}
