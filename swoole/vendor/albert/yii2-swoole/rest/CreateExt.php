<?php

namespace yii\swoole\rest;

use yii;
use yii\web\ServerErrorHttpException;

class CreateExt extends \yii\base\Object
{

    public static function actionDo($model, $body, $transaction = null)
    {
        $transaction = $transaction ? $transaction : $model->getDb()->beginTransaction();
        try {
            if (isset($body["batch"])) {
                if (method_exists($model, 'bebore_BCreate')) {
                    $class = yii\swoole\helpers\ArrayHelper::remove($body, 'before');
                    list($status, $body) = $model->before_BCreate($body, $class);
                    if ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN_COMMIT) {
                        if ($transaction->getIsActive()) {
                            $transaction->commit();
                        }

                        return $body;
                    } elseif ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN) {
                        return $body;
                    }
                }
                $result = $model::getDb()->insertSeveral($model, $body['batch']);
                if (method_exists($model, 'after_ACreate')) {
                    $class = yii\swoole\helpers\ArrayHelper::remove($body, 'after');
                    list($status, $body) = $model->after_ACreate($body, $class);
                    if ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN_COMMIT) {
                        if ($transaction->getIsActive()) {
                            $transaction->commit();
                        }

                        return $body;
                    } elseif ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN) {
                        return $body;
                    }
                }
            } elseif (isset($body["batchMTC"])) {
                $result = [];
                foreach ($body["batchMTC"] as $params) {
                    $res = self::createSeveral(clone $model, $params, $transaction);
                    if ($res instanceof ResponeModel) {
                        return $res;
                    }
                    $result[] = $res;
                }
            } else {
                $result = self::createSeveral($model, $body, $transaction);
            }
            //
            if ($transaction->getIsActive()) {
                $transaction->commit();
            }
        } catch (\Exception $ex) {
            $transaction->rollBack();
            throw $ex;
        }

        return $result;
    }

    public static function createSeveral($model, $body, $transaction)
    {
        $model->load($body, '');
        if (method_exists($model, 'before_ACreate')) {
            $class = yii\swoole\helpers\ArrayHelper::remove($body, 'before');
            list($status, $body) = $model->before_ACreate($body, $class);
            if ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN_COMMIT) {
                if ($transaction->getIsActive()) {
                    $transaction->commit();
                }
                return $body;
            } elseif ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN) {
                return $body;
            }
        }
        yii::$app->BaseHelper->validate($model, $transaction);
        if ($model->save(false)) {
            if (method_exists($model, 'after_ACreate')) {
                $class = yii\swoole\helpers\ArrayHelper::remove($body, 'after');
                list($status, $body) = $model->after_ACreate($body, $class);
                if ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN_COMMIT) {
                    if ($transaction->getIsActive()) {
                        $transaction->commit();
                    }

                    return $body;
                } elseif ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN) {
                    return $body;
                }
            }
            $model = self::saveRealation($model, $body, $transaction);
            if ($model instanceof ResponeModel) {
                return $model;
            }
        } elseif (!$model->hasErrors()) {
            $transaction->rollBack();
            throw new ServerErrorHttpException('Failed to create the object for unknown reason.');
        }

        return $model;
    }

    private static function saveRealation($model, $body, $transaction)
    {
        $result = [];
        //关联模型
        if (isset($model->realation)) {
            foreach ($model->realation as $key => $val) {
                if (isset($body[$key])) {
                    $child = $model->getRelation($key)->modelClass;
                    if ($body[$key]) {
                        if ((bool)count(array_filter(array_keys($body[$key]), 'is_string'))) {
                            $body[$key] = [$body[$key]];
                        }
                        foreach ($body[$key] as $params) {
                            if ($val) {
                                foreach ($val as $c_attr => $p_attr) {
                                    $params[$c_attr] = $model->{$p_attr};
                                }
                            }
                            $child_model = new $child();
                            $res = self::createSeveral($child_model, $params, $transaction);
                            if ($res instanceof ResponeModel) {
                                return $res;
                            }
                            $result[$key][] = $res;
                        }
                    }
                }
            }
        }
        $model = $model->toArray();
        foreach ($result as $key => $val) {
            $model[$key] = $val;
        }
        return $model;
    }

}
