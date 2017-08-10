<?php
/**
 * Created by PhpStorm.
 * User: erp
 * Date: 2017/5/31
 * Time: 15:37
 */
namespace addons\purchase\controllers;
use Yii;
use \yii\swoole\rest\ActiveController;
class PtrackController extends ActiveController
{

    public $modelClass = 'addons\purchase\models\PuPurchase';


    /**
     * 审核
     * @return mixed
     */
    public function actionPtaudit()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\ptrackLogic', 'ptAudit'], [$post]]);
    }

    /**
     * 反审核
     * @return mixed
     */
    public function actionPtreaudit()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\ptrackLogic', 'ptReAudit'], [$post]]);
    }

    /**
     * 创建排程
     * @return mixed
     */
    public function actionUppqc()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\ptrackLogic', 'upPuQ'], [$post]]);
    }

    /**
     * 导出EXL
     * @return mixed
     */
    public function actionExportpt()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\ptrackLogic', 'exportPt'], [$post]]);
    }

}