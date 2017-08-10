<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/6/7 0007
 * Time: 19:05
 */

namespace addons\master\basics\modellogic;

use addons\master\basics\models\BWarehouse;
class warehouseLogic
{
    /**
     * getBWarehouse
     * 根据条件查询平台
     * @access public
     * @param $where
     * @param $select
     * @return array
     * */
    public static function getBWarehouse($where,$select = []){
        if(count($select)==0){
            $select['*'];
        }
        return BWarehouse::find()->select($select)->where($where)->asArray()->all();
    }
}