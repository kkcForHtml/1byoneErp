<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/6/22 0022
 * Time: 18:58
 */

namespace addons\finance\controllers;

use Yii;
use \yii\swoole\rest\ActiveController;

class LibraryrecordController extends ActiveController
{
    public $modelClass = 'addons\finance\models\SkLibraryRecord';

    /**
     * @SWG\Post(path="/indexcustom",
     *     tags={"finance"},
     *     summary="存货往来报告",
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
        return Yii::$app->rpc->create('finance')->sendAndrecv([['\addons\finance\modellogic\libraryrecordLogic', 'indexCustom'], [$post]]);
    }

    /**
     * @SWG\Post(path="/exportpi",
     *     tags={"finance"},
     *     summary="发运查询导出",
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
        return Yii::$app->rpc->create('finance')->sendAndrecv([['\addons\finance\modellogic\libraryrecordLogic', 'exportPi'], [$post]]);
    }

    /**
     * @SWG\Post(path="/getLibraryAge",
     *     tags={"finance"},
     *     summary="库龄报告（查询）",
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
    public function actionGetlibage(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('finance')->sendAndrecv([['\addons\finance\modellogic\libraryageLogic', 'getLibraryAge'], [$post]]);
    }

    /**
     * @SWG\Post(path="/excelLibraryAge",
     *     tags={"finance"},
     *     summary="库龄报告（导出Excel）",
     *     description="返回json结果",
     *     produces={"application/json"},
     * @SWG\Response(
     *         response = 200,
     *         description = " success"
     *     )
     * )
     *
     */
    public function actionExcellibage(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('finance')->sendAndrecv([['\addons\finance\modellogic\libraryageLogic', 'excelLibraryAge'], [$post]]);
    }
    /**
     * @SWG\Post(path="/getHistoryLibAge",
     *     tags={"finance"},
     *     summary="历史库龄（查询）",
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
    public function actionGethistorylibage(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('finance')->sendAndrecv([['\addons\finance\modellogic\libraryageLogic', 'getHistoryLibAge'], [$post]]);
    }

    /**
     * @SWG\Post(path="/excelHistoryLibAge",
     *     tags={"finance"},
     *     summary="历史库龄报告（导出Excel）",
     *     description="返回json结果",
     *     produces={"application/json"},
     * @SWG\Response(
     *         response = 200,
     *         description = " success"
     *     )
     * )
     *
     */
    public function actionExcelhistorylibage(){
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('finance')->sendAndrecv([['\addons\finance\modellogic\libraryageLogic', 'excelHistoryLibAge'], [$post]]);
    }

}