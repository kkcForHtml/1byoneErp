<?php

/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace yii\swoole\rest;

use yii;
use yii\base\Model;
use yii\db\ActiveRecord;
use yii\web\ServerErrorHttpException;

/**
 * UpdateAction implements the API endpoint for updating a model.
 *
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class UpdateAction extends Action
{

    /**
     * @var string the scenario to be assigned to the model before it is validated and updated.
     */
    public $scenario = Model::SCENARIO_DEFAULT;

    /**
     * Updates an existing model.
     * @param string $id the primary key of the model.
     * @return \yii\swoole\db\ActiveRecordInterface the model being updated
     * @throws ServerErrorHttpException if there is any error when updating the model
     */
    public function run($id = null)
    {
        if ($id) {
            /* @var $model ActiveRecord */
            $model = $this->findModel($id);

            if ($this->checkAccess) {
                $GLOBALS['call_user_func']($this->checkAccess, $this->id, $model);
            }

            $model->scenario = $this->scenario;
            $body = Yii::$app->getRequest()->getBodyParams();
            $transaction = $model->getDb()->beginTransaction();
            try {
                if (method_exists($model, 'before_AUpdate')) {
                    $class = yii\swoole\helpers\ArrayHelper::remove($body, 'before');
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
                        $class = yii\swoole\helpers\ArrayHelper::remove($body, 'after');
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
            if ($this->checkAccess) {
                $GLOBALS['call_user_func']($this->checkAccess, $this->id);
            }
            $modelClass = new $this->modelClass();
            $filter = Yii::$app->getRequest()->getBodyParams();
            return UpdateExt::actionDo($modelClass, $filter);
        }
    }

}
