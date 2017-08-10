<?php
namespace addons\amazon\controllers;
use addons\amazon\modellogic\ReportParseLogic;
use Yii;
use yii\console\Controller;
use addons\amazon\modellogic\OrderParseLogic;
class ParseController extends Controller
{

    public $modelClass = '';

    public function actionParse()
    {
        OrderParseLogic::parseOrders();
    }

    public function actionReport()
    {
        ReportParseLogic::parseReports();
    }

}