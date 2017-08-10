<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/25 0025
 * Time: 10:25
 */

namespace addons\common\base\modellogic;

use addons\common\base\models\PDictionary;
use yii\swoole\db\Query;

class baseLogic
{
    /**
     * 查询字典表数据
     * $item 指定字段值,逗号隔开
     * ['D_NAME_CN','D_GROUP','D_VALUE']
     * ['PU_PURCHASE','PLAN_TYPE','INSPECTION_STATE']
     * */
    public static function getdictionary($item = [], $andftiem = [])
    {
        if (count($item) <= 0) {
            $item = '*';
        }
        return PDictionary::find()->select($item)->andFilterWhere(array('D_GROUP' => $andftiem))->asArray()->all();
    }

    public static function getExchangeRate(array $data)
    {
        foreach ($data as $index => $item) {
            list($from, $to, $time) = $item;
            if ($from == $to) {
                $data[$index][] = 1;
                continue;
            }
            if (!$time) {
                $time = time();
            }
            $result = (new Query())->select('EXCHANGE_RATE_ODDS')->from('b_exchange_rate')->where(['MONEY_ID' => $from, 'TARGET_MONEY_ID' => $to])
                ->andWhere(['>=', 'EFFECTIVE_END_DATE', $time])->andWhere(['<=', 'EFFECTIVE_START_DATE', $time])->scalar();
            if (!$result) {
                $result = null;
            }
            $data[$index][] = $result;
        }
        return $data;
    }
}