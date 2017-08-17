<?php

namespace yii\swoole\web;

use Yii;
use yii\base\InvalidConfigException;

class AssetManager extends \yii\web\AssetManager
{
    public function init()
    {
        $this->basePath = Yii::getAlias($this->basePath);
        if (!is_dir($this->basePath)) {
            @mkdir($this->basePath);
        } elseif (!is_writable($this->basePath)) {
            throw new InvalidConfigException("The directory is not writable by the Web process: {$this->basePath}");
        } else {
            $this->basePath = realpath($this->basePath);
        }
        $this->baseUrl = rtrim(Yii::getAlias($this->baseUrl), '/');
    }
}
