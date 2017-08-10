<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/17 0017
 * Time: 9:10
 */
namespace addons\organization\modellogic;

class i18nLogic{

    public static function GetI18nText($text_CN){
        return Yii::t('organization',$text_CN);
    }
}