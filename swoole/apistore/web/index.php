<?php
defined('YII_DEBUG') or define('YII_DEBUG', true);
defined('YII_ENV') or define('YII_ENV', 'dev');

require(__DIR__ . '/../../vendor/autoload.php');
require(__DIR__ . '/../../vendor/albert/yii2-swoole/Yii.php');
require(__DIR__ . '/../../common/config/bootstrap.php');
require(__DIR__ . '/../config/bootstrap.php');
//require(__DIR__ . '/../../common/config/defined.php');

$config = yii\helpers\ArrayHelper::merge(
    require(__DIR__ . '/../../common/config/main-dev.php'),
    require(__DIR__ . '/../../common/config/main-local.php'),
    require(__DIR__ . '/../config/main-dev.php'),
    require(__DIR__ . '/../config/main-local.php')
);

$application = new yii\swoole\Application($config);
$path = isset($_SERVER['HTTP_PATH']) ? $_SERVER['HTTP_PATH'] : Yii::$app->params['path'];
$application->getRequest()->setHostInfo($_SERVER['HTTP_HOST']);
$info = explode('?', $_SERVER['REQUEST_URI']);
$application->getRequest()->setPathInfo(array_shift($info));
$_SERVER['REQUEST_URI'] = $path . $_SERVER['REQUEST_URI'];
$application->getUrlManager()->setBaseUrl($path);

//$cache = Yii::$app->cache;
//if ($cache) {
//    Yii::$rpcList = $cache->get('rpclist');
//    if (!Yii::$rpcList) {
//        Yii::$rpcList = Yii::$app->RpcHelper->getRpcClass();
//        $cache->set('rpclist', Yii::$rpcList, 60 * 1000);
//    }
//} else {
//    Yii::$rpcList = Yii::$app->RpcHelper->getRpcClass();
//}

$application->run();
