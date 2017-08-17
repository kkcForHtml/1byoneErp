<?php

namespace yii\swoole\sqlcache\controllers;

use Yii;
use yii\swoole\rest\ActiveController;
use yii\swoole\rest\ResponeModel;
use yii\swoole\sqlcache\modellogic\RouteLogic;

class InfcacheController extends ActiveController
{

    public $modelClass = 'yii\swoole\sqlcache\models\Sqlcache';

    public function actions()
    {
        $actions = [
            'update' => [
                'class' => 'yii\swoole\rest\UpdateAction',
                'modelClass' => $this->modelClass,
            ],
        ];
        return $actions;
    }

    public function actionIndex()
    {
        return RouteLogic::getCache($this->modelClass);
    }

    public function actionClear()
    {
        $result = new ResponeModel();
        yii::$app->cache->delete(yii::$app->params['SqlCache']);
        if (!yii::$app->cache->exists(yii::$app->params['SqlCache'])) {
            return true;
        } else {
            return $result->setModel(500, 0, '清理缓存失败', []);
        }
    }

}
