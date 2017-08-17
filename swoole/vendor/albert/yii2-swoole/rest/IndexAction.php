<?php

/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace yii\swoole\rest;

use Yii;
use yii\data\ActiveDataProvider;

/**
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class IndexAction extends Action
{

    /**
     * @var callable a PHP callable that will be called to prepare a data provider that
     * should return a collection of the models. If not set, [[prepareDataProvider()]] will be used instead.
     * The signature of the callable should be:
     *
     * ```php
     * function ($action) {
     *     // $action is the action object currently running
     * }
     * ```
     *
     * The callable should return an instance of [[ActiveDataProvider]].
     */
    public $prepareDataProvider;

    /**
     * @return ActiveDataProvider
     */
    public function run($filter = null)
    {
        if ($this->checkAccess) {
            $GLOBALS['call_user_func']($this->checkAccess, $this->id);
        }
        $modelClass = new $this->modelClass();
        return IndexExt::actionDo($modelClass, \yii\helpers\Json::decode($filter));
    }

}
