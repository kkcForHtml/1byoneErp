<?php
namespace addons\tools\modellogic;
use yii\swoole\process\BaseWork;
class AmazonGrabReportWork extends BaseWork
{
    public $accounts;

    public function doWork()
    {
        if (!$this->accounts) {
            $this->accounts = AmazonCommonLogic::getAccountList();
        }
        foreach($this->accounts as $account){
            AmazonReportLogic::getReport(['Account'=>$account]);
        }
    }

}