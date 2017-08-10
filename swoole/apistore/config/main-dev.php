<?php

$params = array_merge(
    require(__DIR__ . '/../../common/config/params-dev.php'), require(__DIR__ . '/../../common/config/params-local.php'), require(__DIR__ . '/params.php'), require(__DIR__ . '/params-local.php')
);

return [
    'id' => 'apistore',
    'basePath' => dirname(__DIR__),
    'vendorPath' => dirname(dirname(__DIR__)) . '/vendor',
    'bootstrap' => ['log'],
    'controllerNamespace' => 'apistore\controllers',
    'components' => [
        'user' => [
            'identityClass' => 'addons\users\models\UUserInfo',
            'enableAutoLogin' => false,
        ],
        'request' => [
            'parsers' => [
                'application/json' => 'yii\web\JsonParser',
                'text/json' => 'yii\web\JsonParser',
            ],
        ],
        'urlManager' => require(__DIR__ . '/urlManager.php')
    ],
    'on beforeAction' => function ($event) {
        \addons\users\modellogic\usersLogic::checkLogin($event);
        \addons\journal\behaviors\JournalBehavior::searchLog($event);
        return true;
    },
    'on afterAction' => function ($event) {
        \addons\journal\behaviors\JournalBehavior::searchLog($event);
        return true;
    },
    'on beforeRequest' => function ($event) {
        \yii\base\Event::on(\yii\db\BaseActiveRecord::className(), \yii\db\BaseActiveRecord::EVENT_AFTER_UPDATE, ['addons\common\base\modellogic\adminLogic', 'write']);
    },
    'params' => $params
];
