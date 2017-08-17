<?php

/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace yii\swoole\rest;

use Yii;

/**
 * ViewAction implements the API endpoint for returning the detailed information about a model.
 *
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class ViewAction extends Action
{

    /**
     * Displays a model.
     * @param string $id the primary key of the model.
     * @return \yii\swoole\db\ActiveRecordInterface the model being displayed
     */
    public function run($id = null)
    {
//        if ($id)
//        {
//            $model = $this->findModel($id);
//        }
//        else
//        {
        $filter = Yii::$app->getRequest()->getBodyParams();
        $modelClass = new $this->modelClass();
        if (method_exists($modelClass, 'before_AView')) {
            $class = \yii\swoole\helpers\ArrayHelper::remove($filter, 'before');
            list($status, $filter) = $modelClass->before_AView($filter, $class);
            if ($status >= $modelClass::ACTION_RETURN) {
                return $filter;
            }
        }
        $model = $this->searchModel($filter, $id);
//        }
        if (method_exists($modelClass, 'after_AView')) {
            $class = \yii\swoole\helpers\ArrayHelper::remove($filter, 'after');
            list($status, $model) = $modelClass->after_AView($model, $class);
            if ($status >= $modelClass::ACTION_RETURN) {
                return $model;
            }
        }
        if ($this->checkAccess) {
            $GLOBALS['call_user_func']($this->checkAccess, $filter, $model);
        }
        return $model;
    }

}
