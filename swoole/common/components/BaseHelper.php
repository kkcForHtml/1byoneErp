<?php

namespace common\components;

use Yii;
use yii\base\Application;
use yii\base\Component;
use yii\swoole\db\Query;
use yii\web\ServerErrorHttpException;

class BaseHelper extends Component
{
    /**
     * 生成guid
     * @return string
     */
    public function guid()
    {
        if (function_exists('com_create_guid')) {
            return com_create_guid();
        } else {
            //mt_srand((double)microtime()*10000);//optional for php 4.2.0 and up.
            //$data = strtoupper(md5(uniqid(rand(), true)));
            $data = uniqid("", true);
            //$data .= $_SERVER['REQUEST_TIME'];
            //$data .= $_SERVER['REMOTE_ADDR'];
            //$data .= $_SERVER['REMOTE_PORT'];
            $charid = strtoupper(hash('ripemd128', md5($data)));
            $hyphen = ''; //chr(45); // "-"
            $uuid = substr($charid, 0, 8) . $hyphen
                . substr($charid, 8, 4) . $hyphen
                . substr($charid, 12, 4) . $hyphen
                . substr($charid, 16, 4) . $hyphen
                . substr($charid, 20, 12);
            return $uuid;
        }
    }

    public function guidMysql($db)
    {
        return (new Query())->select("UUID()")->scalar($db);
    }

    public function guidMssql($db)
    {
        return (new Query())->select("NEWID()")->scalar($db);
    }

    function getDbtime($db)
    {
        if ($db) {
            $sql = 'SELECT now() dbtime';
            $dbtime = $db->createCommand($sql)->queryScalar();
            if ($dbtime) {
                return $dbtime;
            }
        }
        return date('Y-m-d H:i:s', time());
    }

    //过滤特殊字符

    function getDbtimestamp($db)
    {
        if ($db) {
            $sql = 'SELECT UNIX_TIMESTAMP() dbtime';
            $dbtime = $db->createCommand($sql)->queryScalar();
            if ($dbtime) {
                return $dbtime;
            }
        }
        return time();
    }

    function strFilter($str)
    {
        $regex = "/\/|\~|\!|\@|\"|\#|\\$|\%|\^|\&|\*|\(|\)|\_|\+|\{|\}|\:|\<|\>|\?|\[|\]|\,|\.|\/|\;|\'|\`|\-|\=|\\\|\|/";
        return preg_replace($regex, "", $str);
    }

    /*     * 获取毫秒级时间戳* */

    function getMonthDays($month = "this month", $format = "Y-m-d")
    {
        $start = strtotime("first day of $month");
        $end = strtotime("last day of $month");
        $days = array();
        for ($i = $start; $i <= $end; $i += 24 * 3600)
            $days[] = date($format, $i);
        return $days;
    }

    /*     * 对数组进行&拼接成字符串 * */

    function getMillisecond()
    {
        list($t1, $t2) = explode(' ', microtime());
        return (float)sprintf('%.0f', (floatval($t1) + floatval($t2)) * 1000);
    }

    /*
     * 验证数据
     */

    function getJoinStr($params)
    {
        $pairs = array();
        ksort($params);

        foreach ($params as $key => $val) {
            array_push($pairs, $key . '=' . urlencode($val));
        }
        return join('&', $pairs);
    }

    public function validate($model, $transaction = null)
    {
        if (!$model->validate()) {
            if ($transaction !== null) {
                $transaction->rollBack();
            }
            $errors = [];
            foreach ($model->errors as $error) {
                $errors = array_merge($errors, $error);
            }
            throw new ServerErrorHttpException(implode(PHP_EOL, $errors));
        }
    }


    /*
     * 获取模块路径
     */
    public function getPath($module, $path = '')
    {
        if ($module->module && !($module->module instanceof Application) && !($module->module instanceof \yii\swoole\Application)) {
            $path .= $this->getPath($module->module, $path);
        }
        if ($module && $module->id) {
            $path .= '/' . $module->id;
        }
        return $path;
    }

    /*
     * 获取临时目录
     */
    public function getTempDir()
    {
        if (function_exists('sys_get_temp_dir')) {
            return sys_get_temp_dir();
        } elseif (($tmp = getenv('TMP')) || ($tmp = getenv('TEMP')) || ($tmp = getenv('TMPDIR'))) {
            return realpath($tmp);
        } else {
            return '/tmp';
        }
    }
}
