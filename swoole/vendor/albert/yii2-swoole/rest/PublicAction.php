<?php

/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace yii\swoole\rest;

use Yii;

/**
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class PublicAction extends Action
{
    public function run($filter = null)
    {
        if ($this->checkAccess) {
            $GLOBALS['call_user_func']($this->checkAccess, $this->id);
        }

        $modelClass = new $this->modelClass();
        return PublicExt::actionDo($modelClass, $filter);
    }

}
