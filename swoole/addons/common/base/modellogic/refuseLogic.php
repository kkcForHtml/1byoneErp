<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/25 0025
 * Time: 10:25
 */

namespace addons\common\base\modellogic;

use yii\swoole\db\ActiveRecord;
use yii\swoole\db\DBHelper;
use yii\swoole\db\Query;

class refuseLogic
{
    /*
     * 关帐检查
     */
    public static function refuse(ActiveRecord $model, array $config)
    {
        $num = count($config);
        switch ($num) {
            case 3:
                list($time, $code, $closeField) = $config;
                break;
            case 4:
                list($time, $code, $closeField, $addWhere) = $config;
                break;
            default:
                return false;
        }
        $result = true;
        if ($model->isNewRecord) {
            if (is_array($code)) {
                foreach ($code as $field) {
                    $codes[] = $model->{$field};
                }
            } else {
                $codes = $model->{$code};
            }
            $END_AT = null;
            if ($model->{$time}) {
                $END_AT = strtotime(date('Y-m-d', $model->{$time}));
            }
            $result = DBHelper::Search((new Query())->select(['ACCOUNTING_STATE'])->from('ac_accounting_period')->where(['DELETED_STATE' => 0])
                ->leftJoin('o_organisation', 'ac_accounting_period.ORGANISATION_ID=o_organisation.ORGANISATIONOT_ID')
                ->andWhere(['o_organisation.ORGANISATION_ID' => $codes])
                ->andWhere(['>=', 'END_AT', $END_AT])->andWhere(['<=', 'START_AT', $END_AT]), $addWhere)->scalar();
            //TODO 测试使用
            //$result = true;
            if ($result === false) {
                $model->addError('', \Yii::t('base', 'The business interval has not open.'));
            } elseif ($result == 0) {
                $model->addError('', \Yii::t('base', 'The business interval has been closed.'));
            }
        } else {
            if (!isset($model[$closeField])) {
                if ($keys = $model::primaryKey()) {
                    foreach ($keys as $key) {
                        $table[$key] = $model->{$key};
                    }
                    $result = !(bool)$model->findOne($table[$key])->{$closeField};
                }

            } else {
                $result = !(bool)$model->{$closeField};
            }

            if (!$result) {
                $model->addError('', \Yii::t('base', 'The business interval has been closed.'));
            }
        }
        return (bool)$result;
    }
}