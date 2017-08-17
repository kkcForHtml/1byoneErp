<?php
namespace yii\swoole\rest;

use Yii;
use yii\swoole\db\DBHelper;
use yii\swoole\helpers\ArrayHelper;
use yii\swoole\web\NoParamsException;

class PublicExt
{
    public function actionDo($modelClass, $filter)
    {
        if (!$filter)
            $filter = Yii::$app->getRequest()->getBodyParams();
        if (!$filter) {
            return $modelClass::find()->count();
        } else {
            if (array_key_exists("handle", $filter)) {
                $handle = $filter["handle"];
                unset($filter["handle"]);
            } else {
                throw new NoParamsException('缺少参数!');
            }
            $alias = ArrayHelper::remove($filter, 'alias', '');
            $key = key($handle);
            if ($handle[$key]) {
                return DBHelper::Search($modelClass::find()->from($modelClass::tableName() . " {$alias}"), $filter)->asArray()->$key($handle[$key]);
            } else {
                return DBHelper::Search($modelClass::find()->from($modelClass::tableName() . " {$alias}"), $filter)->asArray()->$key();
            }
        }
    }
}