<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/24 0013
 * Time: 17:59
 */
namespace addons\finance\controllers;

use Yii;

class AccountingperiodController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\finance\models\AcAccountingPeriod';

    /**
     * @SWG\Post(path="/indexcustom",
     *     tags={"purchase"},
     *     summary="库存台帐",
     *     description="返回json结果",
     *     produces={"application/json"},
     * @SWG\Parameter(
     *        in = "body",
     *        name = "body",
     *        description = "json字符串结构",
     *        required = true,
     *        type = "string",
     *        schema = "{}"
     *     ),
     * @SWG\Response(
     *         response = 200,
     *         description = " success"
     *     )
     * )
     *
     */
    public function actionIndexcustom()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('finance')->sendAndrecv([['\addons\finance\modellogic\accountingperiodLogic', 'indexCustom'], [$post]]);
    }

    /**
     * @SWG\Post(path="/exportpi",
     *     tags={"shipment"},
     *     summary="台帐查询导出",
     *     description="返回json结果",
     *     produces={"application/json"},
     *
     * @SWG\Response(
     *         response = 200,
     *         description = " success"
     *     )
     * )
     *
     */
    public function actionExportpi()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('finance')->sendAndrecv([['\addons\finance\modellogic\accountingperiodLogic', 'exportPi'], [$post]]);
    }

    /**
     * 关闭会计期间列表-查询接口
     * @return mixed
     * @throws \yii\base\InvalidConfigException
     */
    public function actionIndexclose()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('finance')->sendAndrecv([['\addons\finance\modellogic\acperiodcloseLogic', 'indexClose'], [$post]]);
    }

    /**
     * 反关账接口
     * @return mixed
     * @throws \yii\base\InvalidConfigException
     */
    public function actionRecloseac(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('finance')->sendAndrecv([['\addons\finance\modellogic\acperiodcloseLogic', 'reCloseAc'], [$post]]);
    }

    /**
     * 关账接口
     * @return mixed
     * @throws \yii\base\InvalidConfigException
     */
    public function actionCloseac()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('finance')->sendAndrecv([['\addons\finance\modellogic\acperiodcloseLogic', 'closeAc'], [$post]]);
    }

    /**
     * 获取影响关账失败的单据（未审核的单据）
     * @return mixed
     * @throws \yii\base\InvalidConfigException
     */
    public function actionGetunauditedorder()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('finance')->sendAndrecv([['\addons\finance\modellogic\acperiodcloseLogic', 'getUnauditedOrder'], [$post]]);
    }

    /**
     * 【导出】影响关账失败的单据（未审核的单据）
     * @return mixed
     * @throws \yii\base\InvalidConfigException
     */
    public function actionExcelunauditedorder()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('finance')->sendAndrecv([['\addons\finance\modellogic\acperiodcloseLogic', 'excelUnauditedOrder'], [$post]]);
    }
}