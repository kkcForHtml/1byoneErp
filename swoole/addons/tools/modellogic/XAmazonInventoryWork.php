<?php
/**
 * User: Fable
 */

namespace addons\tools\modellogic;
use yii\swoole\process\BaseWork;
class XAmazonInventoryWork extends BaseWork{

    public $accounts;

    public function doWork()
    {
        if (!$this->accounts) {
            $this->accounts = AmazonCommonLogic::getAccountList();
        }
        XAmazoninventorylogic::getinventory($this->accounts);
    }
}
