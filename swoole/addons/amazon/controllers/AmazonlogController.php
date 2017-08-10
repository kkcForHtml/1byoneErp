<?php
/**
 * User: Fable
 */
namespace addons\amazon\controllers;

use \yii\swoole\rest\ActiveController;
use Yii;

class AmazonlogController extends ActiveController
{
    public $modelClass = 'addons\amazon\models\CAmazonParseLogs';

    /*
     * 同步数据
     */
    public function actionSynchronous(){
        return Yii::$app->rpc->create('amazon')->sendAndrecv([['\addons\amazon\modellogic\amazoninventoryLogic', 'synchronous'], []]);
    }

    /**
     * 测试
     */
    public function actionTest(){
        return Yii::$app->rpc->create('amazon')->sendAndrecv([['\addons\amazon\modellogic\amazoninventoryLogic', 'ParsingDataAgain'], []]);
    }
}