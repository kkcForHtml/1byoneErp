<?php
/**
 * Created by PhpStorm.
 * controller: 组织分组控制器
 * Date: 2017/4/13 0013
 * Time: 17:59
 */
namespace addons\sales\controllers;

use addons\sales\models\CrSalesOrder;
use \yii\swoole\rest\ActiveController;
use Yii;
use yii\swoole\rest\DeleteExt;
use yii\swoole\rest\ResponeModel;
use yii\swoole\rest\UpdateExt;

class SalesorderController extends ActiveController
{

    public $modelClass = 'addons\sales\models\CrSalesOrder';

    /**
     * GetSalesOrder
     * 查询销售订单表
     * @param $select
     * @param $where
     * @return array
     * */
    public static function GetSalesOrder($select = [],$where){
        if(count($select)>0){
            return CrSalesOrder::find()->select($select)->where($where)->asArray()->all();
        }else{
            return CrSalesOrder::find()->where($where)->asArray()->all();
        }
    }

    /**
     * SalesOrder
     * 审核调整单
     * @param $data
     * @return bool
     * */
    public static function SalesOrder($data)
    {
        $dispatchModel = array("batch" => $data);
        $post = Yii::$app->getRequest()->getBodyParams();
        Yii::$app->getRequest()->setBodyParams($dispatchModel);
        $result = UpdateExt::actionDo(new CrSalesOrder(), $dispatchModel);
        Yii::$app->getRequest()->setBodyParams($post);
        if ($result instanceof ResponeModel) {
            return $result;
        }
    }


    /**
     * DelSalesOrder
     * 待入库删除接口
     * @param $data
     * @return bool
     * */
    public static function DelSalesOrder($data)
    {
        $dispatchModel = array("batch" => $data);
        $post = Yii::$app->getRequest()->getBodyParams();
        Yii::$app->getRequest()->setBodyParams($dispatchModel);
        $result = DeleteExt::actionDo(new CrSalesOrder(), $dispatchModel);
        Yii::$app->getRequest()->setBodyParams($post);
        if ($result instanceof ResponeModel) {
            return $result;
        }
    }

}
