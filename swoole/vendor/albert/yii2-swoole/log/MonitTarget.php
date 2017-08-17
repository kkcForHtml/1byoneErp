<?php

namespace yii\swoole\log;

use Yii;
use yii\base\InlineAction;
use yii\log\Target;

class MonitTarget extends Target
{
    public $address = '127.0.0.1:55656';

    public function export()
    {
        if (Yii::$app->requestedAction) {
            if (Yii::$app->requestedAction instanceof InlineAction) {
                $action = get_class(Yii::$app->requestedAction->controller) . '::' . Yii::$app->requestedAction->actionMethod . '()';
            } else {
                $action = get_class(Yii::$app->requestedAction) . '::run()';
            }
        } else {
            $action = null;
        }
        $response = Yii::$app->getResponse();
        StatisticClient::report(
            Yii::$app->requestedAction ? Yii::$app->requestedAction->getUniqueId() : Yii::$app->requestedRoute,
            $action,
            $response->getIsOk(),
            $response->getStatusCode(),
            json_decode($response->getContent(), true)['message'],
            $this->address
        );
    }
}