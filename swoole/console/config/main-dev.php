<?php

$params = array_merge(
        require(__DIR__ . '/../../common/config/params-dev.php'), require(__DIR__ . '/../../common/config/params-local.php'), require(__DIR__ . '/params.php'), require(__DIR__ . '/params-local.php')
);

return [
    'id' => 'app-console',
    'basePath' => dirname(__DIR__),
    'bootstrap' => ['log'],
    'controllerNamespace' => 'console\controllers',
    'controllerMap' => [
        // 在下面指定定义command控制器
        'swoole' => yii\swoole\commands\SwooleController::className(),
        'grab'=>\addons\tools\controllers\GrabController::className(),
        'parse'=>\addons\amazon\controllers\ParseController::className(),
    ],
    'components' => [
        'log' => [
            'targets' => [
                [
                    'class' => 'yii\log\FileTarget',
                    'levels' => ['error', 'warning'],
                ],
            ],
        ]
    ],
    'params' => $params,
];
