<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/25 0025
 * Time: 10:25
 */
namespace addons\common\base\modellogic;

use Yii;

class filterLogic
{

    /**
     * get_api
     * 判断当前角色及接口是否在过滤范围内
     * @return int
     * */
    public static function get_api()
    {
        $str = 1;
        $session = Yii::$app->session->get('roleUser');
        $cache = Yii::$app->cache->get('filterRole');
        if ($session && $cache) {
            if (count($cache) > 0 && count($session) > 0) {
                foreach ($cache as $item) {
                    if (in_array($item, $session)) {
                        $str = 0;
                        break;
                    }
                }
            }
        }


        $cacheApi = Yii::$app->cache->get('filterApi');
        if ($cacheApi) {
            if (count($cacheApi) > 0) {
                $route = Yii::$app->requestedAction ? Yii::$app->requestedAction->getUniqueId() : Yii::$app->requestedRoute;
                if ($route) {
                    if (in_array($route, $cacheApi)) {
                        $str = 0;
                    }
                }
            }
        }

        return $str;
    }

    /**
     * get_session
     * 判断当前角色是否在过滤范围内
     * @return int
     * */
    public static function get_session()
    {
        $str = 1;
        $session = Yii::$app->session->get('roleUser');
        $cache = Yii::$app->cache->get('filterRole');
        if ($session && $cache) {
            if (count($cache) > 0 && count($session) > 0) {
                foreach ($cache as $item) {
                    if (in_array($item, $session)) {
                        $str = 0;
                        break;
                    }
                }
            }
        }
        return $str;
    }
}