<?php
namespace addons\tools\modellogic;
use yii\swoole\process\BaseWork;
class AmazonGrabRequestWork extends BaseWork
{
    public $accounts;

    public function doWork()
    {
        $reportTypeList = AmazonParseLogic::getReportTypeList();
        if (!$this->accounts) {
            $this->accounts = AmazonCommonLogic::getAccountList();
        }
        foreach($reportTypeList as $k=>$v){
            foreach($this->accounts as $account){
                AmazonReportLogic::getRequestReport(['Account'=>$account,'reportType'=>$k]);
            }
        }
        sleep(120);
        foreach($this->accounts as $account){
            AmazonReportLogic::getReportRequestList(['Account'=>$account]);
        }
    }

}