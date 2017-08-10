<?php

namespace addons\common\base\modellogic;

use Yii;
use yii\swoole\db\Query;

/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/23 0023
 * Time: 9:57
 */
class CreateNO
{
    private static function getCode($id)
    {
        return (new Query())->from('o_organisation')->select(['ORGANISATION_CODE'])->where(['ORGANISATION_ID' => $id])->scalar();
    }

    private static function getParner($id)
    {
        return (new Query())->from('pa_partner')->select('PARTNER_CODE')->where(['PARTNER_ID' => $id])->scalar();
    }

    private static function getNo($type, $p_en, $time, $extra = 1)
    {
        //获取流水
        return Yii::$app->db->createCommand('select p_sequence_nextval(:ORDERTYPE,:ORDERAREA,:ORDERDATE,:EXTRA)')
            ->bindValues([":ORDERTYPE" => $type, ":ORDERAREA" => $p_en, ':ORDERDATE' => $time, ':EXTRA' => $extra])->queryScalar();
    }

    private static function getChanel($id)
    {
        return (new Query())->select(['CHANNEL_NAME_EN'])->from(['b_channel'])->where(['CHANNEL_ID' => $id, 'CHANNEL_STATE' => 1])->scalar();
    }

    private static function getTime($time = null)
    {
        //获取时间
        return date('ym', $time ? $time : time());
    }

    /*
     * 采购订单单号
     */
    public static function createPO($o_type, $o_code, $d_code, $c_code, $p_type, $p_code, $time = null)
    {
        //获取平台简称
        $c_en = self::getChanel($c_code);
        //获取时间
        $time = static::getTime($time);
        //获取流水
        $no = static::getNo($o_type, $o_code, $time);
        //获取组织编码
        $o_code = self::getCode($o_code);
        $d_code = self::getCode($d_code);
        $p_code = self::getParner($p_code);

        return $o_code . $d_code . $c_en . $p_type . $p_code . $time . $no;
    }

    /*
     * 调拨计划单单单号
     */
    public static function createTO($o_type, $o_code, $i_code, $code, $time = null)
    {
        //获取时间
        $time = static::getTime($time);
        //获取流水
        $no = static::getNo($o_type, $o_code, $time, $i_code);
        //获取组织编码
        $o_code = self::getCode($o_code);
        $i_code = self::getCode($i_code);
        return $o_code . $i_code . $code . $time . $no;
    }

    /*
     * 其余单据单号
     */
    public static function createOrderNo($o_type, $o_code, $code, $time = null)
    {
        //获取时间
        $time = static::getTime($time);
        //获取流水
        $no = static::getNo($o_type, $o_code, $time);
        //获取组织编码
        $o_code = self::getCode($o_code);
        return $o_code . $code . $time . $no;
    }
}