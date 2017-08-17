<?php

namespace yii\swoole\rpc;

interface IRpcServer {

    public function addMethod($method, $scope, $alias = '', array $options = array());

    public function addAsyncMethod($method, $scope, $alias = '', array $options = array());

    public function addMethods(array $methods, $scope, array $aliases = array(), array $options = array());

    public function addAsyncMethods(array $methods, $scope, array $aliases = array(), array $options = array());
}
