<?php

namespace yii\swoole;

use Yii;
use yii\swoole\controllers\CreateCtrlTrait;

class Module extends \yii\base\Module
{
    use CreateCtrlTrait;

    /**
     * @var is debug this module
     */
    public $is_debug = 0;

    public $use_default_doc = true;

    public function init()
    {
        parent::init();
        $this->registerTranslations();
    }

    public function registerTranslations()
    {
        $path = Yii::$app->BaseHelper->getPath($this);
        Yii::$app->i18n->translations[$this->id] = [
            'class' => 'yii\i18n\PhpMessageSource',
            'sourceLanguage' => Yii::$app->sourceLanguage,
            'basePath' => '@addons' . $path . '/messages'
        ];
    }

}
