<?php
namespace addons\amazon\modellogic;
use yii\swoole\process\BaseWork;
class OrderParseWork extends BaseWork{

    public function doWork()
    {
        OrderParseLogic::parseOrders();
    }
    
}