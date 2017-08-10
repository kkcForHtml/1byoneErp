<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/13 0013
 * Time: 17:43
 */
namespace addons\master\basics\controllers;

use addons\master\basics\modellogic\Barealogic;
use Yii;

class AreaController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\master\basics\models\BArea';
    /**
     * 校验
     */
    public   function   actionOnly(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return  Barealogic::OnlyLogic($post);
    }
}