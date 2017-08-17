<?php

namespace yii\swoole\clog;

use Yii;
use yii\base\Component;
use yii\swoole\clog\model\MsgModel;
use yii\swoole\helpers\ArrayHelper;

class CLogger extends Component
{
    public $reporter;
    public $collecter;

    public function init()
    {
        parent::init();
        //上传日志组件
        if (is_array($this->reporter)) {
            $this->reporter = Yii::createObject($this->reporter);
        } elseif (is_string($this->reporter)) {
            $this->reporter = Yii::$app->get($this->reporter);
        }
        //收集日志组件
        if (is_array($this->collecter)) {
            $this->collecter = Yii::createObject($this->collecter);
        } elseif (is_string($this->reporter)) {
            $this->collecter = Yii::$app->get($this->collecter);
        }
    }

    public function upload()
    {
        $response = Yii::$app->getResponse();
        $data = $response->getData();
        $model = new MsgModel();
        $model->route = [Yii::$app->requestedAction->controller->id => Yii::$app->requestedAction->id];
        $model->created_at = time();
        $model->status = $response->getStatusCode();
        $model->message = is_array($data) ? ArrayHelper::getValue($data, 'message') : null;
        return $this->reporter->upload([['clog', 'collect'], [$model->toArray()]]);
    }

    public function collect($data)
    {
        $model = new MsgModel();
        $model->load($data, '');
        $this->collecter->save($model);
    }
}