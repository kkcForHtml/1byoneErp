<?php
namespace yii\swoole\db;

use Yii;

class ActiveRecord extends \yii\db\ActiveRecord
{
    /*
    * 处理标识
    */
    const ACTION_NEXT = 1;
    const ACTION_RETURN = 2;
    const ACTION_RETURN_COMMIT = 3;

    public $realation = [];

    public static function addQuery(&$query, $alias)
    {
    }

    public static function find()
    {
        return Yii::createObject(ActiveQuery::className(), [get_called_class()]);
    }

    private function doWork($body, $class)
    {
        if (is_string($class)) {
            $method = $class;
            $param = [];
            $class = get_class($this);
            $class = (str_replace('models', 'customba', $class)) . 'BA';
            return $GLOBALS['call_user_func_array']([$class, $method], [$this, $body, $param]);
        } elseif (is_array($class)) {
            foreach ($class as $module => $config) {
                if ((bool)count(array_filter(array_keys($config), 'is_string'))) {
                    foreach ($config as $method => $param) {
                        $logic = get_class($this);
                        $logic = (str_replace('models', 'customba', $logic)) . 'BA';
                        return $GLOBALS['call_user_func_array']([$logic, $method], [$this, $body, $param]);
                    }
                } else {
                    $count = count($config);
                    if ($count === 2) {
                        list($logic, $param) = $config;
                    } elseif ($count === 1) {
                        $logic = array_shift($config);
                        $param = [];
                    }
                    return Yii::$app->rpc->create($module)->sendAndrecv([$logic, [$this, $body, $param]]);
                }
            }
        }
    }

    private function baWork($body, $class = null)
    {
        if ($class) {
            return $this->doWork($body, $class);
        }
        return [$this::ACTION_NEXT, $body];
    }


    /*
     * 查询前
     */

    public function before_AIndex($body, $class = null)
    {
        return $this->baWork($body, $class);
    }

    /*
     * 查询后
     */

    public function after_AIndex($body, $class = null)
    {
        return $this->baWork($body, $class);
    }

    /*
    * 查询前
    */

    public function before_AView($body, $class = null)
    {
        return $this->baWork($body, $class);
    }

    /*
     * 查询后
     */

    public function after_AView($body, $class = null)
    {
        return $this->baWork($body, $class);
    }

    /*
     * 新建前
     */

    public function before_ACreate($body, $class = null)
    {
        return $this->baWork($body, $class);
    }

    public function before_BCreate($body, $class = null)
    {
        return $this->baWork($body, $class);
    }

    /*
     * 新建后
     */

    public function after_ACreate($body, $class = null)
    {
        return $this->baWork($body, $class);
    }

    /*
     * 更新前
     */

    public function before_AUpdate($body, $class = null)
    {
        return $this->baWork($body, $class);
    }

    public function before_BUpdate($body, $class = null)
    {
        return $this->baWork($body, $class);
    }

    /*
     * 更新后
     */

    public function after_AUpdate($body, $class = null)
    {
        return $this->baWork($body, $class);
    }

    /*
     * 删除前
     */

    public function before_ADelete($body, $class = null)
    {
        return $this->baWork($body, $class);
    }

    /*
     * 删除后
     */

    public function after_ADelete($body, $class = null)
    {
        return $this->baWork($body, $class);
    }
}