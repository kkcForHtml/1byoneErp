<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/25 0025
 * Time: 9:54
 */
namespace addons\master\partint\modellogic;

use addons\master\partint\models\PaPartner;
use addons\master\partint\models\PaPartnerContact;
use yii\swoole\helpers\ArrayHelper;

class partintLogic
{

    /**
     * 查询所有合作伙伴数据
     * $item 指定字段值,逗号隔开
     * ['PARTNER_ID','PARTNER_NAME_CN','PARTNER_ANAME_CN']
     * */
    public static function getpartner($item = [])
    {
        if (count($item)>0) {
            return PaPartner::find()->select($item)->asArray()->all();
        }else{
            return PaPartner::find()->asArray()->all();
        }

    }

    /**
     * 查询所有合作伙伴数据
     * $item 指定字段值,逗号隔开
     * @param $select
     * @param $where
     * @return array
     * */
    public static function getpartner_where($select = [],$where)
    {
        if (count($select)>0) {
            return PaPartner::find()->select($select)->where($where)->asArray()->all();
        }else{
            return PaPartner::find()->where($where)->asArray()->all();
        }

    }

    /**
     * 合作伙伴及联系人信息
     * */
    public static function getparther_contact($code)
    {
        if($code!==null && $code){
            $PaPartner = PaPartner::find()->where(array('PARTNER_ID' => $code))->asArray()->all();
            $PartnerContact = PaPartnerContact::find()->where(array('PARTNER_ID' => $code))->asArray()->all();
            $items = [];
            $items1 = [];
            if (count($PartnerContact) > 0) {
                //是否有默认，没有就取第一条
                foreach ($PartnerContact as $index => $item) {
                    if ($item['DEFAULTS'] == '1') {
                        $items = $item;
                    }
                    if ($index == 0) {
                        $items1 = $item;
                    }
                }
            }
            if (count($items) > 0) {
                $PaPartner['contact'] = $items;
            } else {
                $PaPartner['contact'] = $items1;
            }
            return $PaPartner;
        }else{
            return "";
        }

    }

}