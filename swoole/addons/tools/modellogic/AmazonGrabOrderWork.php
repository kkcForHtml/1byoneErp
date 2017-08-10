<?php
namespace addons\tools\modellogic;
use yii\swoole\process\BaseWork;
class AmazonGrabOrderWork extends BaseWork
{
    public $accounts;

    public function doWork()
    {
        if (!$this->accounts) {
            $this->accounts = AmazonCommonLogic::getAccountList();
        }
        foreach ($this->accounts as $account) {
            AmazonGrabOrderLogic::getOrders(['Account' => $account]);
        }
    }
}