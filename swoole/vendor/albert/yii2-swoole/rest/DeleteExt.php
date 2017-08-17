<?php

namespace yii\swoole\rest;

use yii;
use yii\swoole\db\DBHelper;
use yii\swoole\web\NoParamsException;
use yii\web\ServerErrorHttpException;

class DeleteExt extends \yii\base\Object
{

    public static function actionDo($model, $body, $transaction = null)
    {
        $transaction = $transaction ? $transaction : $model->getDb()->beginTransaction();
        if ($body) {
            if (isset($body["batch"])) {
                $result = $model::getDb()->deleteSeveral($model, $body['batch']);
                if (method_exists($model, 'after_ADelete') && $result !== false) {
                    $class = yii\swoole\helpers\ArrayHelper::remove($body, 'after');
                    list($status, $result) = $model->after_ADelete($result, $class);
                    if ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN_COMMIT) {
                        if ($transaction->getIsActive()) {
                            $transaction->commit();
                        }

                        return $body;
                    } elseif ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN) {
                        return $body;
                    }
                }
            } else {
                if (method_exists($model, 'before_ADelete')) {
                    $class = yii\swoole\helpers\ArrayHelper::remove($body, 'before');
                    list($status, $body) = $model->before_ADelete($body, $class);
                    if ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN_COMMIT) {
                        if ($transaction->getIsActive()) {
                            $transaction->commit();
                        }

                        return $body;
                    } elseif ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN) {
                        return $body;
                    }
                }
                $result = $model->deleteAll(DBHelper::Search((new \yii\swoole\db\Query()), $body)->where);
                if (method_exists($model, 'after_ADelete')) {
                    $class = yii\swoole\helpers\ArrayHelper::remove($body, 'after');
                    list($status, $body) = $model->after_ADelete($body, $class);
                    if ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN_COMMIT) {
                        if ($transaction->getIsActive()) {
                            $transaction->commit();
                        }

                        return $body;
                    } elseif ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN) {
                        return $body;
                    }
                }
            }
            if ($result === false || $result === []) {
                if ($transaction) {
                    $transaction->rollBack();
                }
                throw new ServerErrorHttpException('Failed to delete the object for unknown reason.');
            }
            if ($transaction->getIsActive()) {
                $transaction->commit();
            }
            return $result;
        } else {
            throw new NoParamsException('缺少参数!');
        }
    }

}
