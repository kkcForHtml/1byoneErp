<?php
/**
 * Created by PhpStorm.
 * User: erp
 * Date: 2017/6/5
 * Time: 14:40
 */
namespace addons\purchase\controllers;
use Yii;
use \yii\swoole\rest\ActiveController;
class PinspectController extends ActiveController
{
    public $modelClass = 'addons\purchase\models\PuPurchase';

    /**
     * 审核
     * @return mixed
     */
    public function actionPiaudit()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\pinspectLogic', 'piAudit'], [$post]]);
    }

    /**
     * 反审核
     * @return mixed
     */
    public function actionPireaudit()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\pinspectLogic', 'piReAudit'], [$post]]);
    }

    public function actionPidel()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\pinspectLogic', 'piDel'], [$post]]);
    }

    /**
     * 导出EXL
     * @return mixed
     */
    public function actionExportpi()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\pinspectLogic', 'exportPi'], [$post]]);
    }
}