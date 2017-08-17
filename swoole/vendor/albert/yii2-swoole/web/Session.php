<?php

namespace yii\swoole\web;

use Yii;
use yii\swoole\Application;
use yii\swoole\helpers\CoroHelper;
use yii\swoole\helpers\SerializeHelper;
use yii\web\Cookie;

/**
 * Class Session
 *
 * @property string sessionKey
 * @property swoole_http_response swooleResponse
 */
class Session extends \yii\web\Session
{
    /**
     * @var string
     */
    protected $_sessionKey = 'JSESSIONID';

    protected $_sessionName = 'PHPSESSID';

    /**
     * @return string
     */
    public function getSessionKey()
    {
        return $this->_sessionKey;
    }

    /**
     * @param string $sessionKey
     */
    public function setSessionKey($sessionKey)
    {
        $this->_sessionKey = $sessionKey;
    }

    /**
     * @return string the current session name
     */
    public function getName()
    {
        if (!Application::$workerApp) {
            return parent::getName();
        }
        return $this->_sessionName;
    }

    /**
     * It defaults to "PHPSESSID".
     */
    public function setName($value)
    {
        if (!Application::$workerApp) {
            return parent::setName();
        }
        $this->_sessionName = $value;
    }

    /**
     * @var string
     */
    protected $_id = [];

    /**
     * 从cookie中取session id
     *
     * @return string
     */
    public function getId()
    {
        if (!Application::$workerApp) {
            return parent::getId();
        }
        $id = CoroHelper::getId();
        if (isset($this->_id[$id])) {
            return $this->_id[$id];
        }
        $cookie = Yii::$app->getRequest()->getCookies()->get($this->sessionKey);
        if ($cookie) {
            return $cookie->value;
        }
        return null;
    }

    /**
     * @param string $value
     */
    public function setId($value)
    {
        if (!Application::$workerApp) {
            return parent::setId($value);
        }
        $cookie = new Cookie([
            'name' => $this->sessionKey,
            'value' => $value
        ]);
        $id = CoroHelper::getId();
        $this->_id[$id] = $value;
        Yii::$app->response->getCookies()->add($cookie);
    }

    /**
     * @var bool
     */
    protected $_isActive = [];

    /**
     * 判断当前是否使用了session
     */
    public function getIsActive()
    {
        if (!Application::$workerApp) {
            return parent::getIsActive();
        }
        $id = CoroHelper::getId();
        return isset($this->_isActive[$id]) ? $this->_isActive[$id] : false;
    }

    /**
     * @param bool $isActive
     */
    public function setIsActive($isActive)
    {
        $id = CoroHelper::getId();
        $this->_isActive[$id] = $isActive;
    }

    /**
     * 打开会话连接, 从redis中加载会话数据
     *
     * @inheritdoc
     */
    public function open()
    {
        if (!Application::$workerApp) {
            return parent::open();
        }
        if ($this->getIsActive()) {
            Yii::info('Session started', __METHOD__);
            return;
        }
        $this->setIsActive(true);
        if (!Yii::$app->getRequest()->cookies->has($this->sessionKey)) {
            $this->regenerateID();
        }
        $sid = $this->getId();
        if (!empty($sid)) {
            $id = CoroHelper::getId();
            $data = SerializeHelper::unserialize($this->readSession($sid));
            $_SESSION[$id] = is_array($data) ? $data : [];
        }
    }

    /**
     * 关闭连接时, 主动记录session到redis
     *
     * @inheritdoc
     */
    public function close()
    {
        if (!Application::$workerApp) {
            return parent::close();
        }
        $id = CoroHelper::getId();
        // 如果当前会话激活了, 则写session
        if ($this->getIsActive()) {
            // 将session数据存放到redis咯
            $sid = $this->getId();
            $this->writeSession($sid, SerializeHelper::serialize($_SESSION[$id]));
            // 清空当前会话数据
            unset($_SESSION[$id]);
        }
        $this->setIsActive(false);
        unset($this->_id[$id]);
        unset($this->_isActive[$id]);
        unset($this->_hasSessionId[$id]);
        Yii::info('Session closed', __METHOD__);
    }

    /**
     * 自定义生成会话ID
     *
     * @inheritdoc
     */
    public function regenerateID($deleteOldSession = false)
    {
        if (!Application::$workerApp) {
            return parent::regenerateID($deleteOldSession);
        }
        if ($deleteOldSession) {
            $id = $this->getId();
            $this->destroySession($id);
        }
        $id = 'S' . md5(Yii::$app->security->generateRandomString());
        $this->setId($id);
    }

    /**
     * 判断当前会话是否使用了cookie来存放标识
     * 在swoole中, 暂时只支持cookie标识, 所以只会返回true
     *
     * @inheritdoc
     */
    public function getUseCookies()
    {
        if (!Application::$workerApp) {
            return parent::getUseCookies();
        }
        return true;
    }

    public function destroy()
    {
        if (!Application::$workerApp) {
            return parent::destroy();
        }
        if ($this->getIsActive()) {
            $sessionId = $this->getId();
            $this->close();
            $this->setId($sessionId);
            $this->open();
            $this->setId($sessionId);
        }
    }

    private $_hasSessionId = [];

    public function getHasSessionId()
    {
        $id = CoroHelper::getId();
        if (!isset($this->_hasSessionId[$id])) {
            $name = $this->getName();
            $request = Yii::$app->getRequest();
            if (!empty($_COOKIE[$id][$name]) && ini_get('session.use_cookies')) {
                $this->_hasSessionId[$id] = true;
            } elseif (!ini_get('session.use_only_cookies') && ini_get('session.use_trans_sid')) {
                $this->_hasSessionId[$id] = $request->get($name) != '';
            } else {
                $this->_hasSessionId[$id] = false;
            }
        }

        return $this->_hasSessionId[$id];
    }

    public function setHasSessionId($value)
    {
        $id = CoroHelper::getId();
        $this->_hasSessionId[$id] = $value;
    }

    public function getCount()
    {
        $id = CoroHelper::getId();
        $this->open();
        return count($_SESSION[$id]);
    }

    public function get($key, $defaultValue = null)
    {
        $id = CoroHelper::getId();
        $this->open();
        return isset($_SESSION[$id][$key]) ? $_SESSION[$id][$key] : $defaultValue;
    }

    public function set($key, $value)
    {
        $id = CoroHelper::getId();
        $this->open();
        $_SESSION[$id][$key] = $value;
    }

    public function remove($key)
    {
        $id = CoroHelper::getId();
        $this->open();
        if (isset($_SESSION[$id][$key])) {
            $value = $_SESSION[$id][$key];
            unset($_SESSION[$id][$key]);

            return $value;
        } else {
            return null;
        }
    }

    public function removeAll()
    {
        $id = CoroHelper::getId();
        $this->open();
        foreach (array_keys($_SESSION[$id]) as $key) {
            unset($_SESSION[$id][$key]);
        }
    }

    public function has($key)
    {
        $id = CoroHelper::getId();
        $this->open();
        return isset($_SESSION[$id][$key]);
    }

    protected function updateFlashCounters()
    {
        $id = CoroHelper::getId();
        $counters = $this->get($this->flashParam, []);
        if (is_array($counters)) {
            foreach ($counters as $key => $count) {
                if ($count > 0) {
                    unset($counters[$key], $_SESSION[$id][$key]);
                } elseif ($count == 0) {
                    $counters[$key]++;
                }
            }
            $_SESSION[$id][$this->flashParam] = $counters;
        } else {
            // fix the unexpected problem that flashParam doesn't return an array
            unset($_SESSION[$id][$this->flashParam]);
        }
    }

    public function getFlash($key, $defaultValue = null, $delete = false)
    {
        $id = CoroHelper::getId();
        $counters = $this->get($this->flashParam, []);
        if (isset($counters[$key])) {
            $value = $this->get($key, $defaultValue);
            if ($delete) {
                $this->removeFlash($key);
            } elseif ($counters[$key] < 0) {
                // mark for deletion in the next request
                $counters[$key] = 1;
                $_SESSION[$id][$this->flashParam] = $counters;
            }

            return $value;
        } else {
            return $defaultValue;
        }
    }

    public function getAllFlashes($delete = false)
    {
        $id = CoroHelper::getId();
        $counters = $this->get($this->flashParam, []);
        $flashes = [];
        foreach (array_keys($counters) as $key) {
            if (array_key_exists($key, $_SESSION[$id])) {
                $flashes[$key] = $_SESSION[$id][$key];
                if ($delete) {
                    unset($counters[$key], $_SESSION[$id][$key]);
                } elseif ($counters[$key] < 0) {
                    // mark for deletion in the next request
                    $counters[$key] = 1;
                }
            } else {
                unset($counters[$key]);
            }
        }

        $_SESSION[$id][$this->flashParam] = $counters;

        return $flashes;
    }

    public function setFlash($key, $value = true, $removeAfterAccess = true)
    {
        $id = CoroHelper::getId();
        $counters = $this->get($this->flashParam, []);
        $counters[$key] = $removeAfterAccess ? -1 : 0;
        $_SESSION[$id][$key] = $value;
        $_SESSION[$id][$this->flashParam] = $counters;
    }

    public function addFlash($key, $value = true, $removeAfterAccess = true)
    {
        $id = CoroHelper::getId();
        $counters = $this->get($this->flashParam, []);
        $counters[$key] = $removeAfterAccess ? -1 : 0;
        $_SESSION[$id][$this->flashParam] = $counters;
        if (empty($_SESSION[$id][$key])) {
            $_SESSION[$id][$key] = [$value];
        } else {
            if (is_array($_SESSION[$id][$key])) {
                $_SESSION[$id][$key][] = $value;
            } else {
                $_SESSION[$id][$key] = [$_SESSION[$id][$key], $value];
            }
        }
    }

    public function removeFlash($key)
    {
        $id = CoroHelper::getId();
        $counters = $this->get($this->flashParam, []);
        $value = isset($_SESSION[$id][$key], $counters[$key]) ? $_SESSION[$id][$key] : null;
        unset($counters[$key], $_SESSION[$id][$key]);
        $_SESSION[$id][$this->flashParam] = $counters;

        return $value;
    }

    public function removeAllFlashes()
    {
        $id = CoroHelper::getId();
        $counters = $this->get($this->flashParam, []);
        foreach (array_keys($counters) as $key) {
            unset($_SESSION[$id][$key]);
        }
        unset($_SESSION[$id][$this->flashParam]);
    }

    public function offsetExists($offset)
    {
        $id = CoroHelper::getId();
        $this->open();

        return isset($_SESSION[$id][$offset]);
    }

    public function offsetGet($offset)
    {
        $id = CoroHelper::getId();
        $this->open();

        return isset($_SESSION[$id][$offset]) ? $_SESSION[$id][$offset] : null;
    }

    public function offsetSet($offset, $item)
    {
        $id = CoroHelper::getId();
        $this->open();
        $_SESSION[$id][$offset] = $item;
    }

    public function offsetUnset($offset)
    {
        $id = CoroHelper::getId();
        $this->open();
        unset($_SESSION[$id][$offset]);
    }
}
