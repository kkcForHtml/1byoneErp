<?php

namespace addons\common\base\modellogic;

use addons\journal\models\LJournal;
use Yii;
use yii\helpers\Url;
use yii\helpers\Json;

class adminLogic
{
    public static function write($event)
    {
        // 具体要记录什么东西，自己来优化$description
        if (!empty($event->changedAttributes)) {
            $keys = [];
            foreach ($event->sender->primaryKey() as $key) {
                $keys[] = '[' . $key . '=' . $event->sender->$key . ']';
            }
            $desc = [
                'description' => Yii::$app->user->identity->USERNAME . '修改了表(' . $event->sender::tableName() . ')' .
                    '主键' . implode(',', $keys),
                'value' => []
            ];
            foreach ($event->changedAttributes as $name => $value) {
                $curValue = $event->sender->getAttribute($name);
                if ($value != $curValue) {
                    $desc['value'][$event->sender->getAttributeLabel($name)] = $value . '=>' . $curValue;
                }
            }
            $model = new LJournal();
            $model->USER_ID = Yii::$app->user->id;
            $model->VISIT_API = Url::to();
            $model->JOURNAL_TIME = time();
            $model->JOURNAL_REMARKS = Json::encode($desc);
            $model->JOURNAL_TYPE = 2;
            $model->save(false);
        }
    }
}