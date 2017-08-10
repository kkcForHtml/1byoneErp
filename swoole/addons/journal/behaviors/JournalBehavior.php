<?php

namespace addons\journal\behaviors;

use addons\journal\models\LJournal;
use Yii;
use yii\swoole\db\Query;


class JournalBehavior extends \yii\base\Behavior
{
    //接口
    public static function searchLog($event)
    {
        if ($user = Yii::$app->getUser()->getIdentity()) {
            if ($event->action->id === 'logout') {
                $userId = $user->USER_INFO_ID;
                $data = [
                    'JOURNAL_TIME' => time(),
                    'USER_ID' => $userId,
                    'JOURNAL_REMARKS' => '访问接口：[退出系统]',
                    'JOURNAL_TYPE' => 1,
                    'VISIT_API' => $event->action->getUniqueId()
                ];
            } else {
                $db = static::getApi($event);
                $route = $event->action->getUniqueId();
                $text = '';
                foreach ($db as $item) {
                    $url_array = explode(',', $item['INTERFACEURL']);
                    if ($route == $url_array[0]) {
                        $text = $item['PERMISSION_NAME_CN'];
                    }
                }

                $userId = $user->USER_INFO_ID;
                $data = [
                    'JOURNAL_TIME' => time(),
                    'USER_ID' => $userId,
                    'JOURNAL_REMARKS' => '访问接口：[' . $text . ']',
                    'JOURNAL_TYPE' => 1,
                    'VISIT_API' => $route
                ];
            }
            LJournal::getDb()->createCommand()->insert(LJournal::tableName(), $data);
        }
    }

    public static function getApi($event)
    {
        $route = $event->action->getUniqueId();
        $db = (new Query())->from('u_permission_groups')->select(['INTERFACEURL', 'PERMISSIONR_REMARKS', 'PERMISSION_NAME_CN'])->all();
        $return_str = [];
        foreach ($db as $item) {
            if ($item['INTERFACEURL'] !== null && $item['INTERFACEURL']) {
                $url_array = explode(',', $item['INTERFACEURL']);
                if (in_array($route, $url_array)) {
                    $return_str[] = $item;
                }
            }
        }
        return $return_str;
    }
}
