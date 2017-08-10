<?php
namespace addons\amazon\modellogic;
use yii\swoole\process\BaseWork;
class ReportParseWork extends BaseWork{

    public function doWork()
    {
        ReportParseLogic::parseReports();
    }
    
}