<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/18 0013
 * Time: 17:59
 */
namespace addons\inventory\controllers;

use Yii;

class PlacingdetailController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\inventory\models\SkPlacingDetail';

    /**
     * 红字校验库存
     */
    public function actionQueryplacingchoose(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\placingLogic','queryPlacingChoose'],[$post['search'],$post['pagesize'],$post['page'],$post['where'],$post['existsID']]]);
    }
}