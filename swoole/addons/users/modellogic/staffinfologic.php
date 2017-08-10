<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/25 0025
 * Time: 10:18
 */
namespace addons\users\modellogic;

use addons\users\models\UStaffInfo;
use Yii;

class staffinfologic
{
    /**
     * 查询用户数据
     * @param $select
     * @param $where
     * @return array
     * */
    public static function getStaffInfo($select, $where)
    {
        if (count($select) == 0) {
            return UStaffInfo::find()->where($where)->asArray()->all();
        } else {
            if(count($where)==0){
                return UStaffInfo::find()->select($select)->asArray()->all();
            }else{
                return UStaffInfo::find()->select($select)->where($where)->asArray()->all();
            }

        }

    }

}