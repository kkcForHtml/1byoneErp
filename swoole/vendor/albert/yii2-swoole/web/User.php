<?php

namespace yii\swoole\web;

use Yii;
use yii\base\InvalidValueException;
use yii\swoole\Application;
use yii\swoole\helpers\CoroHelper;
use yii\web\IdentityInterface;

class User extends \yii\web\User
{
    private $_access = [];
    private $_identity = [];

    public function getIdentity($autoRenew = true)
    {
        $id = CoroHelper::getId();
        if (!isset($this->_identity[$id]) || $this->_identity === []) {
            if ($this->enableSession && $autoRenew) {
                $this->_identity[$id] = null;
                $this->renewAuthStatus();
            } else {
                return null;
            }
        }

        return $this->_identity[$id];
    }

    public function setIdentity($identity)
    {
        $id = CoroHelper::getId();
        if ($identity instanceof IdentityInterface) {
            $this->_identity[$id] = $identity;
            $this->_access[$id] = [];
        } elseif ($identity === null) {
            $this->_identity[$id] = null;
        } else {
            throw new InvalidValueException('The identity object must implement IdentityInterface.');
        }
    }

    /**
     * @inheritdoc
     */
    protected function renewAuthStatus()
    {
        if (Application::$workerApp) {
            // swoole中不会自动触发open, 所以手动open
            Yii::$app->session->open();
        }
        parent::renewAuthStatus();
    }

    public function can($permissionName, $params = [], $allowCaching = true)
    {
        $id = CoroHelper::getId();
        if ($allowCaching && empty($params) && isset($this->_access[$id][$permissionName])) {
            return $this->_access[$id][$permissionName];
        }
        if (($accessChecker = $this->getAccessChecker()) === null) {
            return false;
        }
        $access = $accessChecker->checkAccess($this->getId(), $permissionName, $params);
        if ($allowCaching && empty($params)) {
            $this->_access[$id][$permissionName] = $access;
        }

        return $access;
    }
}
