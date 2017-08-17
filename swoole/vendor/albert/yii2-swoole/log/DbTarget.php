<?php
/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace yii\swoole\log;

use Yii;
use yii\base\InvalidConfigException;
use yii\db\Connection;
use yii\di\Instance;
use yii\helpers\VarDumper;
use yii\swoole\async\Task;

/**
 * DbTarget stores log messages in a database table.
 *
 * The database connection is specified by [[db]]. Database schema could be initialized by applying migration:
 *
 * ```
 * yii migrate --migrationPath=@yii/log/migrations/
 * ```
 *
 * If you don't want to use migration and need SQL instead, files for all databases are in migrations directory.
 *
 * You may change the name of the table used to store the data by setting [[logTable]].
 *
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class DbTarget extends \yii\log\DbTarget
{
    /**
     * @var Connection|array|string the DB connection object or the application component ID of the DB connection.
     * After the DbTarget object is created, if you want to change this property, you should only assign it
     * with a DB connection object.
     * Starting from version 2.0.2, this can also be a configuration array for creating the object.
     */
    public $db = 'dblog';
    /**
     * @var string name of the DB table to store cache content. Defaults to "log".
     */
    public $logTable = '{{%log}}';


    /**
     * Initializes the DbTarget component.
     * This method will initialize the [[db]] property to make sure it refers to a valid DB connection.
     * @throws InvalidConfigException if [[db]] is invalid.
     */
    public function init()
    {
        parent::init();
        $this->db = Instance::ensure($this->db, Connection::className());
    }

    public static function taskFlush($messages)
    {
        $id = Yii::$app->BaseHelper->guid();
        $tableName = Yii::$app->dblog->quoteTableName('{{%log}}');
        $sql = "INSERT INTO $tableName ([[id]],[[level]], [[category]], [[log_time]], [[prefix]], [[message]])
                VALUES ";
        $params = [];
        foreach ($messages as $index => $message) {
            list($text, $level, $category, $timestamp) = $message;
            if (!is_string($text)) {
                // exceptions may not be serializable if in the call stack somewhere is a Closure
                if ($text instanceof \Throwable || $text instanceof \Exception) {
                    $text = (string)$text;
                } else {
                    $text = VarDumper::export($text);
                }
            }
            if ($index > 0) {
                $sql .= ',';
            }
            $sql .= "(:id{$index},:level{$index}, :category{$index}, :log_time{$index}, :prefix{$index}, :message{$index})";
            $params[":id{$index}"] = $id;
            $params[":level{$index}"] = $level;
            $params[":category{$index}"] = $category;
            $params[":log_time{$index}"] = $timestamp;
            $params[":prefix{$index}"] = self::getMessage();
            $params[":message{$index}"] = $text;
        }
        Yii::$app->dblog->createCommand($sql, $params)->execute();
    }

    public static function getMessage()
    {
        if (Yii::$app === null) {
            return '';
        }

        $request = Yii::$app->getRequest();
        $ip = $request instanceof Request ? $request->getUserIP() : '-';

        /* @var $user \yii\web\User */
        $user = Yii::$app->has('user', true) ? Yii::$app->get('user') : null;
        if ($user && ($identity = $user->getIdentity(false))) {
            $userID = $identity->getId();
        } else {
            $userID = '-';
        }

        /* @var $session \yii\web\Session */
        $session = Yii::$app->has('session', true) ? Yii::$app->get('session') : null;
        $sessionID = $session && $session->getIsActive() ? $session->getId() : '-';

        return "[$ip][$userID][$sessionID]";
    }

    /**
     * Stores log messages to DB.
     */
    public function export()
    {
        Task::addTask('\yii\swoole\log\DbTarget::taskFlush', [$this->messages]);
    }
}
