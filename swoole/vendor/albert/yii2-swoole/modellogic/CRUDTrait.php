<?php
namespace yii\swoole\modellogic;

use yii;
use yii\swoole\helpers\ArrayHelper;
use yii\swoole\rest\CreateExt;
use yii\swoole\rest\DeleteExt;
use yii\swoole\rest\IndexExt;
use yii\swoole\rest\ResponeModel;
use yii\swoole\rest\UpdateExt;

trait CRUDTrait
{
    public static function findModel($id, $modelClass = null)
    {
        $keys = $modelClass::primaryKey();
        if (count($keys) > 1) {
            $values = explode(',', $id);
            if (count($keys) === count($values)) {
                $model = $modelClass::findOne(array_combine($keys, $values));
            }
        } elseif ($id !== null) {
            $model = $modelClass::findOne($id);
        }

        if (isset($model)) {
            return $model;
        } else {
            throw new NotFoundHttpException("Object not found: $id");
        }
    }

    public static function View($filter, $id, $modelClass = null)
    {
        $modelClass = ($modelClass ? $modelClass : static::$modelClass);
        $modelClass = new $modelClass();
        $keys = $modelClass::primaryKey();
        foreach ($keys as $index => $key) {
            $keys[$index] = $modelClass::tableName() . '.' . $key;
        }
        if (count($keys) > 1 && $id !== null) {
            $values = explode(',', $id);
            if (count($keys) === count($values)) {
                $model = $filter ? DBHelper::Search($modelClass::find()->where(array_combine($keys, $values)), $filter)->asArray()->one() : $modelClass::findOne(array_combine($keys, $values));
            }
        } elseif ($id !== null) {
            $model = $filter ? DBHelper::Search($modelClass::find()->where(array_combine($keys, [$id])), $filter)->asArray()->one() : $modelClass::findOne($id);
        } elseif ($filter) {
            $model = DBHelper::Search($modelClass::find(), $filter)->asArray()->one();
        }

        if (isset($model)) {
            return $model;
        } else {
            throw new NotFoundHttpException("Object not found: $id");
        }
    }

    public static function Index($filter = null, $page = 0, $modelClass = null)
    {
        $modelClass = ($modelClass ? $modelClass : static::$modelClass);
        $modelClass = new $modelClass();
        return IndexExt::actionDo($modelClass, $filter, $page);
    }

    public static function Create($body, $modelClass = null)
    {
        $modelClass = ($modelClass ? $modelClass : static::$modelClass);
        $modelClass = new $modelClass();

        return CreateExt::actionDo($modelClass, $body);
    }

    public static function Update($body, $id = null, $modelClass = null)
    {
        if ($id) {
            /* @var $model ActiveRecord */
            $model = self::findModel($id, $modelClass);

            $transaction = $model->getDb()->beginTransaction();
            try {
                if (method_exists($model, 'before_AUpdate')) {
                    $class = ArrayHelper::remove($body, 'before');
                    list($status, $body) = $model->before_AUpdate($body, $class);
                    if ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN_COMMIT) {
                        if ($transaction->getIsActive()) {
                            $transaction->commit();
                        }

                        return $body;
                    } elseif ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN) {
                        return $body;
                    }
                }
                $model->load($body, '');
                yii::$app->BaseHelper->validate($model, $transaction);
                if ($model->save(false) === false && !$model->hasErrors()) {
                    throw new ServerErrorHttpException('Failed to update the object for unknown reason.');
                } else {
                    if (method_exists($model, 'after_AUpdate')) {
                        $class = ArrayHelper::remove($body, 'after');
                        list($status, $body) = $model->after_AUpdate($body, $class);
                        if ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN_COMMIT) {
                            if ($transaction->getIsActive()) {
                                $transaction->commit();
                            }

                            return $body;
                        } elseif ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN) {
                            return $body;
                        }
                    }
                    $model = UpdateExt::saveRealation($model, $body, $transaction);
                    if ($model instanceof ResponeModel) {
                        return $model;
                    }
                }
                if ($transaction->getIsActive()) {
                    $transaction->commit();
                }
                return $model;
            } catch (\Exception $ex) {
                $transaction->rollBack();
                throw $ex;
            }
        } else {
            $modelClass = ($modelClass ? $modelClass : static::$modelClass);
            $modelClass = new $modelClass();
            return UpdateExt::actionDo($modelClass, $body);
        }
    }

    public static function delete($body = null, $id = null, $modelClass = null)
    {
        if ($id) {
            $model = self::findModel($id, $modelClass);

            if (method_exists($model, 'before_ADelete')) {
                $class = ArrayHelper::remove($body, 'before');
                list($status, $model) = $model->before_ADelete($model, $class);
                if ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN) {
                    return $model;
                }
            }

            if ($model->delete() === false) {
                throw new ServerErrorHttpException('Failed to delete the object for unknown reason.');
            }

            if (method_exists($model, 'after_ADelete')) {
                $class = ArrayHelper::remove($body, 'after');
                list($status, $model) = $model->after_ADelete($model, $class);
                if ($status == \yii\swoole\db\ActiveRecord::ACTION_RETURN) {
                    return $model;
                }
            }

            return $model;
        } else {
            $modelClass = ($modelClass ? $modelClass : static::$modelClass);
            $modelClass = new $modelClass();
            $result = DeleteExt::actionDo($modelClass, $body);
        }
        return $result;
    }
}