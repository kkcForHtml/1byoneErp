<?php
namespace addons\inventory\controllers;
use addons\inventory\models\SkAllocation;
use addons\inventory\models\SkAllocationDetail;
use addons\inventory\models\SkInsiderTrading;
use addons\inventory\models\SkInstantInventory;
use addons\inventory\models\SkPendingDelivery;
use addons\shipment\models\ShAllocation;
use Yii;
use yii\swoole\rest\CreateExt;

class AllocationController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\inventory\models\SkAllocation';

    /**
     * 审核/反审核、批量反审核
     * @return mixed
     * @throws \yii\base\InvalidConfigException
     */
    public function actionAuth(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic','doAuth'],[$post]]);
    }

    /**
     * 获取即时库存
     * @return mixed
     * @throws \yii\base\InvalidConfigException
     */
    public function actionGetinsnum(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic','getInstantNumber'],[$post]]);
    }

    /**
     * 获取调入SKU
     * @return mixed
     * @throws \yii\base\InvalidConfigException
     */
    public function actionGetetsku(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic','getEtSku'],[$post]]);
    }

    /**
     * 获取调拨状态和实际出入库数量
     * @return mixed
     * @throws \yii\base\InvalidConfigException
     */
    public function actionGetalstatus()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic','getAlStatus'],[$post]]);
    }

    /**
     * 删除、批量删除
     * @return mixed
     * @throws \yii\base\InvalidConfigException
     */
    public function actionReqdel()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic','doReqDel'],[$post]]);
    }

    /**
     * 生成 退货确认/内部交易
     * @return mixed
     * @throws \yii\base\InvalidConfigException
     */
    public function actionRejected()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic','generateGoodsRejected'],[$post]]);
    }

    /**
     * 确认 退货确认/内部交易
     * @return mixed
     * @throws \yii\base\InvalidConfigException
     */
    public function actionAuthrej()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic','authGoodsRejected'],[$post]]);
    }
}