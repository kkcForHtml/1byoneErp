<?php
/**
 * Created by PhpStorm.
 * User: erp
 * Date: 2017/6/20
 * Time: 14:37
 */

namespace addons\amazon\modellogic;

use yii\swoole\db\Query;
use Yii;
use yii\web\ServerErrorHttpException;

class amazonorderLogic
{
    public static $modelClass = 'addons\amazon\models\CAmazonOrder';

    /**
     * 追溯销售订单列表
     * $post['sku']
     * */
    public static function amazon_order($post)
    {
        if(isset($post['sku']) && $post['sku']){
            $page = isset($post['page']) && $post['page'] >= 1 ? intval($post['page']) : 1; //默认第一页
            $limit = isset($post['limit']) && $post['limit'] >= 1 ? intval($post['limit']) : 20;    //默认每页20
            $start = isset($post['startTime']) && $post['startTime'] ? $post['startTime'] : date('Y-m-d', strtotime('-3 day'));  //起始时间，默认3天前
            $end = isset($post['endTime']) && $post['endTime'] ? $post['endTime'] :  date('Y-m-d', strtotime('-1 day'));    //截止时间，默认昨天
            $start = strtotime("$start 00:00:00");
            $end = strtotime("$end 23:59:59");
            $diff = round(abs($end - $start) / (3600 * 24));    //日期相差天数

            $where = array('and', ['=', 'PSKU_ID', $post['sku']], ['>=', 'PURCHASE_DATE', $start], ['<=', 'PURCHASE_DATE', $end]);
            $orderDB = self::getOrderDB($where, $page, $limit); //获取数据列表
            $orderList =  self::getOrderList($orderDB); //拼装数据
            $count = self::countOrder($where);  //统计
            $sum = self::sumOrder($where);  //商品数量合计
            $ave = round($sum / $diff);    //日均销量
            return ['list'=>$orderList, 'count'=>$count, 'ave'=>$ave];
        }else{
            throw new ServerErrorHttpException(Yii::t('amazon','sku不能为空！'));
        }
    }

    //拼装数据
    public static function getOrderList($orderDB){
        $order = array();
        if(count($orderDB) > 0){
            $accounts = self::getAccountList();
            $moneys = self::getMoneyList();
            $channels = self::getChannelList();
            foreach ($orderDB as $key => $value) {
                $account = array_key_exists($value['ACCOUNT_ID'],$accounts)?$accounts[$value['ACCOUNT_ID']]:null;
                if(!$account)continue;
                $order[$key]['PURCHASE_DATE'] = date('Y/m/d H:i:s', $value['PURCHASE_DATE']);   //销售日期
                $order[$key]['CHANNEL_NAME_CN'] = $account['CHANNEL_ID']&&array_key_exists($account['CHANNEL_ID'],$channels)?$channels[$account['CHANNEL_ID']]:'';   //平台名称
                $order[$key]['MONEY_NAME_CN'] = $value['CURRENCY_ID']&&array_key_exists($value['CURRENCY_ID'],$moneys)?$moneys[$value['CURRENCY_ID']]:'';   //货币名
                $order[$key]['ITEM_PRICE'] = round($value['ITEM_PRICE'], 2);  //单价
                $order[$key]['QUANTITY_SHIPPED'] = intval($value['QUANTITY_SHIPPED']);  //数量
                $order[$key]['AMOUNT'] = round($value['ITEM_PRICE'] * $value['QUANTITY_SHIPPED'], 2);  //总金额 = 单价 * 数量
            }
        }
        return array_values($order);
    }

    /**
     * 获取账号信息
     * @return mixed
     */
    public static function getAccountList(){
        $accountList = Yii::$app->rpc->create('basics')->sendAndrecv([['\addons\master\basics\modellogic\accountLogic','getAccountAll'],[['ACCOUNT_STATE'=>1]]]);
        $re = [];
        foreach($accountList as $item){
            $re[$item['ACCOUNT_ID']] = $item;
        }
        return $re;
    }

    /**
     * 获取平台信息
     * @return array
     */
    public static function getChannelList(){
        $channelList = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\basicsLogic', 'getChannelA'], ['CHANNEL_ID','CHANNEL_NAME_CN'],['CHANNEL_STATE'=>1]])->recv();
        $re = [];
        foreach($channelList as $item){
            $re[$item['CHANNEL_ID']] = $item['CHANNEL_NAME_CN'];
        }
        return $re;
    }

    /**
     * 获取币种信息
     * @return mixed
     */
    public static function getMoneyList(){
        $moneyList = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\basicsLogic', 'getmoney'], [['MONEY_ID', 'MONEY_NAME_CN']]])->recv(); //所有货币数据
        $re = [];
        foreach($moneyList as $item){
            $re[$item['MONEY_ID']] = $item['MONEY_NAME_CN'];
        }
        return $re;
    }

    //从数据库中获取列表
    public static function getOrderDB($where, $page, $limit){
        $offset = ($page - 1) * $limit; //起始点
        return (new Query())->from('c_amazon_order_detail cd')
            ->select(['cd.*', 'co.ACCOUNT_ID', 'co.PURCHASE_DATE'])
            ->leftJoin('c_amazon_order co','co.AMAZON_ORDER_ID = cd.AMAZON_ORDER_ID')
            ->where($where)
            ->offset($offset)
            ->limit($limit)
            ->distinct()
            ->all();
    }
    //统计符合条件的数据总和
    public static function countOrder($where){
        return (new Query())->from('c_amazon_order_detail cd')
            ->select(['cd.ID'])
            ->leftJoin('c_amazon_order co','co.AMAZON_ORDER_ID = cd.AMAZON_ORDER_ID')
            ->where($where)
            ->distinct()
            ->count('1');
    }
    //统计符合条件的商品数量总和
    public static function sumOrder($where){
        return (new Query())->from('c_amazon_order_detail cd')
            ->select(['QUANTITY_SHIPPED'])
            ->leftJoin('c_amazon_order co','co.AMAZON_ORDER_ID = cd.AMAZON_ORDER_ID')
            ->where($where)
            ->distinct()
            ->sum("QUANTITY_SHIPPED");
    }
}