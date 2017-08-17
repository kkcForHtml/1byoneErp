<?php

namespace yii\queue\connectors;

use yii\base\Component;

class RedisConnector extends Component implements IConnector {

    public $parameters;

    public function connect() {
        if (is_array($this->parameters)) {
            return \Yii::createObject($this->parameters);
        }
        else {
            return \Yii::$app->get($this->parameters);
        }
    }

}
