<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/25 0025
 * Time: 9:54
 */
namespace addons\master\basics\modellogic;

use addons\master\basics\models\BArea;
use addons\master\basics\models\BChannel;
use addons\master\basics\models\BMoney;
use addons\master\basics\models\BAccount;
use addons\master\basics\models\BUnit;
use addons\master\basics\models\BWarehouse;
use yii\swoole\db\Query;

class basicsLogic
{

    /**
     * 查询所有平台数据
     * $item 指定字段值,逗号隔开
     * ['CHANNEL_CODE','CHANNEL_NAME_CN']
     * */
    public static function getchannel($item = [])
    {
        if(count($item)<=0){
            $item = '*';
        }
        return BChannel::find()->select($item)->asArray()->all();
    }
    /**
     * 根据平台编码查询平台数据
     * $CHANNEL_CODE 平台编码
     * */
    public static function getChannelByID($CHANNEL_ID)
    {
        return BChannel::find()->where(['=','CHANNEL_ID',$CHANNEL_ID])->asArray()->one();
    }

    public static function getChannelA($select = [], $where = [])
    {
        if(count($select)==0){
            $select = '*';
        }
        return BChannel::find()->select($select)->where($where)->asArray()->all();
    }
    /**
     * 查询所有币种数据
     * ['MONEY_CODE','MONEY_NAME_CN']
     * */
    public static function getmoney($item = [])
    {
        if(count($item)<=0){
            $item = '*';
        }
        return BMoney::find()->select($item)->asArray()->all();
    }

    /**
     * 查询所有账号数据
     * ['ACCOUNT_ID','ACCOUNT','MERCHANTID']
     * */
    public static function getaccount($item = [])
    {
        if(count($item)<=0){
            $item = '*';
        }
        return BAccount::find()->select($item)->asArray()->all();
    }

    /**
     * 查询所有单位数据
     * ['UNIT_CODE','UNIT_NAME_CN']
     * */
    public static function getunit($item = [])
    {
        if(count($item)<=0){
            $item = '*';
        }
        return BUnit::find()->select($item)->asArray()->all();
    }

    //获取仓库
    public static function getWarehouse($select = [], $where = [])
    {
        if(count($select)==0){
            $select = '*';
        }
        return BWarehouse::find()->select($select)->where($where)->asArray()->all();
    }

    /**
     * 获取地区
     * @param array $item
     * @return array|\yii\db\ActiveRecord[]
     */
    public static function getArea($item = [])
    {
        if(count($item)<=0){
            $item = '*';
        }
        return BArea::find()->select($item)->asArray()->all();
    }

    /**
     * 定时任务专用
     * @param array $item
     * @return array
     */
    public static function getAreaList($item = [])
    {
        if(count($item)<=0){
            $item = '*';
        }
        return (new Query())->from('b_area')->select($item)->all();
    }

    /**
     * 定时任务专用
     * @param array $item
     * @return array
     */
    public static function getMoneyList($item = [])
    {
        if(count($item)<=0){
            $item = '*';
        }
        return (new Query())->from('b_money')->select($item)->all();
    }
}