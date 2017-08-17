<?php

/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace yii\swoole\rest;

use yii;
use yii\web\ServerErrorHttpException;

/**
 * DeleteAction implements the API endpoint for deleting a model.
 *
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class DeleteAction extends Action
{

    /**
     * Deletes a model.
     * @param mixed $id id of the model to be deleted.
     * @throws ServerErrorHttpException on failure.
     */
    public function run($id = null)
    {
        if ($id) {
            $model = $this->findModel($id);

            if ($this->checkAccess) {
                $GLOBALS['call_user_func']($this->checkAccess, $this->id, $model);
            }
            $body = Yii::$app->getRequest()->getBodyParams();
            if (method_exists($model, 'before_ADelete')) {
                $class = yii\swoole\helpers\ArrayHelper::remove($body, 'before');
                list($status, $model) = $model->before_ADelete($model, $class);
                if ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN) {
                    return $model;
                }
            }

            if ($model->delete() === false) {
                throw new ServerErrorHttpException('Failed to delete the object for unknown reason.');
            }

            if (method_exists($model, 'after_ADelete')) {
                $class = yii\swoole\helpers\ArrayHelper::remove($body, 'after');
                list($status, $model) = $model->after_ADelete($model, $class);
                if ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN) {
                    return $model;
                }
            }

            return $model;
        } else {
            if ($this->checkAccess) {
                $GLOBALS['call_user_func']($this->checkAccess, $this->id);
            }
            $modelClass = new $this->modelClass();
            $filter = Yii::$app->getRequest()->getBodyParams();
            $result = DeleteExt::actionDo($modelClass, $filter);
        }
        return $result;
    }

}
