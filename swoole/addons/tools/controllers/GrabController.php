<?php
namespace addons\tools\controllers;
use addons\tools\modellogic\AmazonFinancialLogic;
use Yii;
use yii\console\Controller;
use addons\tools\modellogic\AmazonGrabOrderLogic;
use addons\tools\modellogic\AmazonGrabItemLogic;
use addons\tools\modellogic\AmazonReportLogic;
use addons\tools\modellogic\AmazonCommonLogic;
use addons\tools\modellogic\AmazonParseLogic;

class GrabController extends Controller
{
    public $modelClass = '';

    /**
     * 订单
     */
    public function actionOrder(){
        set_time_limit(0);
        ini_set('memory_limit','512M');
        $accounts = AmazonCommonLogic::getAccountList();
        foreach($accounts as $account){
            AmazonGrabOrderLogic::getOrders(['Account'=>$account]);
        }
    }

    /**
     * 明细
     */
    public function actionItems(){
        set_time_limit(0);
        ini_set('memory_limit','512M');
        $accounts = AmazonCommonLogic::getAccountList();
        foreach($accounts as $account){
            AmazonGrabItemLogic::getItems(['Account'=>$account]);
        }
    }

    /**
     * 报告请求ID
     */
    public function actionRequestreport(){
        set_time_limit(0);
        ini_set('memory_limit','512M');
        $reportTypeList = AmazonParseLogic::getReportTypeList();
        $accounts = AmazonCommonLogic::getAccountList();
        foreach($reportTypeList as $k=>$v){
            foreach($accounts as $account){
                AmazonReportLogic::getRequestReport(['Account'=>$account,'reportType'=>$k]);
            }
        }
    }

    /**
     * 报告下载ID
     */
    public function actionRequestlist(){
        set_time_limit(0);
        ini_set('memory_limit','512M');
        $accounts = AmazonCommonLogic::getAccountList();
        foreach($accounts as $account){
            AmazonReportLogic::getReportRequestList(['Account'=>$account]);
        }
    }

    /**
     * 报告下载ID
     * 》》》结算报告===
     */
    public function actionReportlist(){
        set_time_limit(0);
        ini_set('memory_limit','512M');
        $reportTypeList = AmazonParseLogic::getReportTypeList();
        $accounts = AmazonCommonLogic::getAccountList();
        foreach($reportTypeList as $k=>$v){
            if($k==2)continue;
            foreach($accounts as $account){
                AmazonReportLogic::getReportList(['Account'=>$account,'reportType'=>$k]);
            }
        }
    }

    /**
     * 下载报告
     */
    public function actionReport(){
        set_time_limit(0);
        ini_set('memory_limit','512M');
        $accounts = AmazonCommonLogic::getAccountList();
        foreach($accounts as $account){
            AmazonReportLogic::getReport(['Account'=>$account]);
        }
    }

    public function actionFinances(){
        set_time_limit(0);
        ini_set('memory_limit','512M');
        $accounts = AmazonCommonLogic::getAccountList();
        foreach($accounts as $account){
            AmazonFinancialLogic::getFinances(['Account'=>$account]);
        }
    }

}