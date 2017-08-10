<?php
namespace addons\master\basics\modellogic;
use addons\master\basics\models\BAccount;
use yii\swoole\db\Query;
class accountLogic
{
    public static $modelClass = 'addons\master\basics\models\BAccount';

    /**
     * 获取一条账号信息
     * @param $where
     * @return mixed
     */
    public static function getAccountOne($where)
    {
        return BAccount::find()->where($where)->asArray()->one();
    }

    /**
     * 获取多条账号信息
     */
    public static function getAccountAll($where=array())
    {
        return BAccount::find()->where($where)->asArray()->all();
    }

    /**
     * 定时任务专用
     * @param array $where
     * @return array
     */
    public static function getAccount($where)
    {
        return (new Query())->from('b_account')->where($where)->one();
    }

    /**
     * 定时任务专用
     * @param array $where
     * @return array
     */
    public static function getAccountList($where = array())
    {
        return (new Query())->from('b_account')->where($where)->all();
    }
}