<?php
/**
 * User: Fable
 */
namespace addons\tools\modellogic;
use addons\amazon\models\CAmazonOrder;
use addons\amazon\models\CAmazonOrderDetail;
use yii;
use addons\inventory\models\SkAdjustment;
use addons\tools\models\OboSaletotal;
use addons\tools\models\OboWeighted;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\rest\CreateExt;
use yii\swoole\rest\DeleteExt;
use yii\swoole\rest\UpdateExt;

class SaletotalLogic{

    public static function ParseSaleData(){

        $startDate = mktime(0, 0, 0, date('m'), date('d')-2, date('Y'));
        $forStartDate = date('Y-m-d H:i:s',$startDate);
        $endDate = mktime(23, 59, 59, date('m'), date('d')-2, date('Y'));
        $forEndDate = date('Y-m-d H:i:s',$endDate);
        $condition = ['between', 'PURCHASE_DATE', $startDate, $endDate];

        $orders = CAmazonOrder::find()->where($condition)->asArray()->all();

        $orders_new = array();
        $ids = array();
        foreach($orders as $row){
            $orders_new[$row['AMAZON_ORDER_ID']] = $row;
            $ids[] = $row['AMAZON_ORDER_ID'];
        }

        $orderDetails = CAmazonOrderDetail::find()->where(array('AMAZON_ORDER_ID'=>$ids))->asArray()->all();

        $new_detail = array();
        foreach($orderDetails as $detail) {
            $ORGANISATION_CODE = $orders_new[$detail['AMAZON_ORDER_ID']]['ORGANIZE_CODE'];
            $key = $ORGANISATION_CODE.$detail['PSKU_CODE'];
            if(isset($new_detail[$key])){
                $new_detail[$key]['num'] += 1;
            }else{
                $new_detail[$key] = $detail;
                if(isset($new_detail[$key]['num']))
                     $new_detail[$key]['num'] += 1;
                else
                    $new_detail[$key]['num'] = 1;
                $new_detail[$key]['PSKU_CODE'] = $detail['PSKU_CODE'];
                $new_detail[$key]['ORGANISATION_CODE'] = $ORGANISATION_CODE;
                $new_detail[$key]['CHANNEL_CODE'] = $orders_new[$detail['AMAZON_ORDER_ID']]['CHANNEL_CODE'];
            }
        }

        $saleTotal = OboSaletotal::find()->asArray()->all();

        $new_saleTotal = array();
        foreach($saleTotal as $sale){
            $key = $sale['ORGANISATION_CODE'].$sale['PSKU_CODE'];
            $new_saleTotal[$key] = $sale;
        }

        $add_data = array();
        $update_data = array();

        foreach($new_detail as $k=>$info){

            if(isset($new_saleTotal[$k])){
                $update_data[] = self::formatUpdateSaleData($new_saleTotal[$k],$new_detail[$k]);
            }else{
                $add_data[] = self::formatAddSaleData($add_data,$new_detail[$k],$k);
            }
        }

        if($update_data){
            self::UpdateSaleTotal($update_data);
        }

        if($add_data){
            self::createSaleTotal($add_data);
        }

        $RESPONE = new ResponeModel();
        return $RESPONE->setModel(200, 0, "操作成功", []);
    }

    /**
     * 格式化添加的单条销量汇总数据
     */
    public static function formatAddSaleData(&$addSaleInfo,$new_detail,$k){

        if(isset($addSaleInfo[$k])){
            //$addSaleInfo[$k] = self::formatUpdateSaleData($addSaleInfo[$k],$new_detail);
        }else{
            $add_data = array();
            $add_data['ORGANISATION_CODE'] = $new_detail['ORGANISATION_CODE'];
            $add_data['PSKU_CODE'] = $new_detail['PSKU_CODE'];
            $add_data['CHANNEL_CODE'] = $new_detail['CHANNEL_CODE'];
            $add_data['DAY1'] = 1;
            $saleInfo[$k] = $add_data;
            return $add_data;
        }
    }

    /**
     * 格式化更新单条销量汇总数据
     */
    public static function formatUpdateSaleData($saleInfo, $new_detail){

        $cache = 0;
        $sum_3 = 0;
        $sum_7 = 0;
        $sum_15 = 0;
        $sum_30 = 0 ;
        for($i=1;$i<=30;$i++){

            $old_value =  $saleInfo['DAY'.$i];
            if($i==1){
                $saleInfo['DAY'.$i] = $new_detail['num'];
            }else{
                $saleInfo['DAY'.$i] = $cache;
            }
            $cache = $old_value;

            $sum_30 +=  $saleInfo['DAY'.$i];
            if($i==3){
                $sum_3 = $sum_30;
            }elseif($i==7){
                $sum_7 = $sum_30;
            }elseif($i ==15){
                $sum_15 = $sum_30;
            }
        }

        $saleInfo['AVG3'] = $sum_3  / 3;
        $saleInfo['AVG7'] = $sum_7 / 7;
        $saleInfo['AVG15'] = $sum_15 / 15;
        $saleInfo['AVG30'] = $sum_30 / 30;

        if($saleInfo['AVG3']>$saleInfo['AVG7'] && $saleInfo['AVG7']>$saleInfo['AVG15'] && $saleInfo['AVG15'] >$saleInfo['AVG30']){
            $saleInfo['SALESTATUS'] = 'HUP';
        }elseif($saleInfo['AVG3']<$saleInfo['AVG7'] && $saleInfo['7']<$saleInfo['AVG15'] && $saleInfo['15']<$saleInfo['AVG30']){
            $saleInfo['SALESTATUS'] = 'HD';
        }elseif(($saleInfo['AVG3']+$saleInfo['AVG7']) >= ($saleInfo['AVG15']+$saleInfo['AVG30'])){
            $saleInfo['SALESTATUS'] = 'WD';
        }elseif(($saleInfo['AVG3']+$saleInfo['AVG7']) < ($saleInfo['AVG15']+$saleInfo['AVG30'])){
            $saleInfo['SALESTATUS'] = 'WUP';
        }

        $weight_info = OboWeighted::find()->where(array('WEIGHTED_CODE'=>$saleInfo['SALESTATUS']))->asArray()->one();

        $saleInfo['THREEDAYS'] = $weight_info['WEIGHTED_DAY3'];
        $saleInfo['SEVENDAYS'] = $weight_info['WEIGHTED_DAY7'];
        $saleInfo['FIFTEENDAYS'] = $weight_info['WEIGHTED_DAY15'];
        $saleInfo['THIRTYDAYS'] = $weight_info['WEIGHTED_DAY30'];
        $saleInfo['WEIGHTAVGSALE'] = $saleInfo['AVG3'] * $weight_info['WEIGHTED_DAY3'] + $saleInfo['AVG7'] * $weight_info['WEIGHTED_DAY7'] + $saleInfo['AVG15'] * $weight_info['WEIGHTED_DAY15'] + $saleInfo['AVG30'] * $weight_info['WEIGHTED_DAY30'];

        return $saleInfo;
    }

    /**
     * addPendDelivery
     * 生出销量总表数据
     * @param $data
     */
    public static function createSaleTotal($data)
    {
        foreach ($data as $dispatchModel) {
            $post = Yii::$app->getRequest()->getBodyParams();
            Yii::$app->getRequest()->setBodyParams($dispatchModel);
            $result = CreateExt::actionDo(new OboSaletotal(), $dispatchModel);
            Yii::$app->getRequest()->setBodyParams($post);
            if ($result instanceof ResponeModel) {
                return $result;
            }
        }
    }

    /**
     * 更新销量总表数据
     */
    public static function UpdateSaleTotal($data){
        foreach ($data as $dispatchModel) {
            $post = Yii::$app->getRequest()->getBodyParams();
            Yii::$app->getRequest()->setBodyParams($dispatchModel);
            $result = UpdateExt::actionDo(new OboSaletotal(), $dispatchModel);
            Yii::$app->getRequest()->setBodyParams($post);
            if ($result instanceof ResponeModel) {
                return $result;
            }
        }
    }
}