<?php

namespace yii\swoole\debug\filedebug;
use yii\swoole\Application;

/**
 * 覆盖原有的Config面板
 *
 * @package yii\swoole\debug\filedebug
 */
class ConfigPanel extends \yii\debug\panels\ConfigPanel
{

    /**
     * @inheritdoc
     */
    public function getPhpInfo()
    {
        if (!Application::$workerApp) {
            return parent::getPhpInfo();
        }
        // swoole跑在cli下, 此时获取得到的PHPINFO是没有混杂html的, 这里加上个pre标签使其显示正常点
        $info = parent::getPhpInfo();
        $info = "<pre>{$info}</pre>";
        return $info;
    }
}
