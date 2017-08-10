<?php
namespace addons\sales\modellogic;

/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/19 0019
 * Time: 15:47
 */
use Yii;
use yii\swoole\modellogic\BaseLogic;
use yii\swoole\helpers\ArrayHelper;
use yii\swoole\db\Query;

use addons\sales\models\CrSalesOrder;
use addons\sales\models\CrSalesOrderDetail;
use yii\swoole\rest\CreateExt;
use yii\swoole\rest\ResponeModel;
use yii\swoole\rest\UpdateExt;

class salesorderLogic extends BaseLogic
{
    public static $modelClass = 'addons\purchase\models\CrSalesOrder';

    /**
     * setSalesOrder
     * 修改采购订单明细
     * @param array $where @修改条件
     * @param array $setr @修改的值
     * @return bool
     * */
    public static function setSalesOrder($where, $setr)
    {
        return CrSalesOrder::updateAll($setr, $where);
    }

    /**
     * 物理删除销售订单 与 明细
     */
    public static function delSalesOrder($where){

       $CrSalesOrder  =  CrSalesOrder::find()->where($where)->asArray()->one();

       $crSaleDetail_ids = CrSalesOrderDetail::find()->where(array('SALES_ORDER_ID'=>$CrSalesOrder['SALES_ORDER_ID']))->select('SALES_ORDER_DETAIL_ID')->all();

       $detail_res = CrSalesOrderDetail::deleteAll(array('SALES_ORDER_DETAIL_ID'=>$crSaleDetail_ids));

       return  $detail_res;
    }


    /**
     * getSalesOrder
     * 入库单主表查询
     * @param $select array
     * @param $where array
     * @return array
     *
     */
    public static function getSalesOrder($select,$where)
    {
        if(count($select)==0){
            return CrSalesOrder::find()->where($where)->asArray()->all();
        }else{
            return CrSalesOrder::find()->select($select)->where($where)->asArray()->all();
        }
    }

    /**
     * addStorage
     * 新增销售订单
     * @param $data
     *
     * */
    public static function addSalesOrder($data)
    {

        foreach ($data as $dispatchModel) {
            $post = Yii::$app->getRequest()->getBodyParams();
            Yii::$app->getRequest()->setBodyParams($dispatchModel);
            $result = CreateExt::actionDo(new CrSalesOrder(), $dispatchModel);
            Yii::$app->getRequest()->setBodyParams($post);
            if ($result instanceof ResponeModel) {
                return $result;
            }
        }
    }

    /**
     * addStorage
     * 新增销售订单
     * @param $data
     *
     * */
    public static function addSalesOrderReturn($data)
    {
        foreach ($data as $dispatchModel) {
            $post = Yii::$app->getRequest()->getBodyParams();
            Yii::$app->getRequest()->setBodyParams($dispatchModel);
            $result = CreateExt::actionDo(new CrSalesOrder(), $dispatchModel);
            Yii::$app->getRequest()->setBodyParams($post);
        }
        return $result;
    }


    /**
     * StorageAuditing
     * 审核销售订单
     * @param $data
     * @return bool
     * */
    public static function StorageAuditing($data)
    {
        $dispatchModel = array("batchMTC" => $data);
        $post = Yii::$app->getRequest()->getBodyParams();
        Yii::$app->getRequest()->setBodyParams($dispatchModel);
        $result = UpdateExt::actionDo(new CrSalesOrder(), $dispatchModel);
        Yii::$app->getRequest()->setBodyParams($post);
        if ($result instanceof ResponeModel) {
            return $result;
        }
    }
}