<?php
namespace addons\shipment\modellogic;
use addons\shipment\models\ShAllocation;
use addons\shipment\models\ShAllocationDetail;
use addons\shipment\models\ShTrackingDetail;
use Yii;
use yii\swoole\rest\CreateExt;
use yii\swoole\rest\ResponeModel;
use yii\swoole\modellogic\BaseLogic;

class shallocationLogic extends BaseLogic
{
    public static $modelClass = 'addons\shipment\models\ShAllocation';

    /**
     * 添加调拨跟踪
     * @param     $sh
     * @return mixed
     */
    public static function addShAlFromAl($sh)
    {
        $_result = CreateExt::actionDo(new ShAllocation(), ['batchMTC'=>$sh]);
        if($_result instanceof ResponeModel){
            return $_result;
        }
    }

    /**
     * 添加调拨跟踪
     * @param     $sh
     * @return mixed
     */
    public static function addShAllDetail($sh)
    {
        $_result = CreateExt::actionDo(new ShTrackingDetail(), ['batchMTC'=>$sh]);
        if($_result instanceof ResponeModel){
            return $_result;
        }
    }

    /**
     * 获取调拨跟踪
     */
    public static function getShallocation($where,$select=array()){
        return ShAllocation::find()->where($where)->select($select)->asArray()->one();
    }

    /**
     * 删除调拨跟踪
     * @param $_sk
     * @return mixed
     */
    public static function delShAlFromAl($_sk)
    {
        $sh = ShAllocationDetail::find()
            ->distinct()
            ->select('ALLOCATION_ID')
            ->where(['SALLOCATION_DETAIL_ID'=>$_sk])
            ->asArray()
            ->all();
        $_sh = [];
        foreach($sh as $v){
            $_sh[] = $v['ALLOCATION_ID'];
        }
        $_result = $_sh&&ShAllocation::updateAll(['DELETED_STATE'=>1],['ALLOCATION_ID'=>$_sh]);
        if ($_result instanceof ResponeModel) {
            return $_result;
        }
        $__result = ShAllocationDetail::deleteAll(['ALLOCATION_ID'=>$_sh]);
        if ($__result instanceof ResponeModel) {
            return $__result;
        }
    }

    /**
     * 获取状态和出入库数量
     * @param $post
     * @return array
     */
    public static function getAlStatus($post){
        $sh = ShAllocationDetail::find()->select('SALLOCATION_DETAIL_ID as ALLOCATION_DETAIL_ID,SHIPMENT_NUMBER as ACTUALATW_NUMBER,ARECIPIENT_NUM as ACTUALETW_NUMBER')
            ->where(['SALLOCATION_DETAIL_ID'=>$post['ALLOCATION_DETAIL_ID']])
            ->asArray()
            ->all();
        $_sh = [];
        foreach($sh as $v){
            $_sh[$v['ALLOCATION_DETAIL_ID']] = ['ACTUALATW_NUMBER'=>$v['ACTUALATW_NUMBER'],'ACTUALETW_NUMBER'=>$v['ACTUALETW_NUMBER']];
        }
        return  $_sh;
    }

    /**
     * 添加调拨跟踪数据
     */
    public static function createAllocation($data){
        foreach ($data as $dispatchModel) {
            $post = Yii::$app->getRequest()->getBodyParams();
            Yii::$app->getRequest()->setBodyParams($dispatchModel);
            $result = CreateExt::actionDo(new ShAllocation(), $dispatchModel);
            Yii::$app->getRequest()->setBodyParams($post);
            if ($result instanceof ResponeModel) {
                return $result;
            }
        }
    }

    /**
     * 更新调拨跟踪明细 发货数量 / 收货数量
     * @param $paramArray
     */
    public static function updateNum($data, $where)
    {
        $si = ShAllocationDetail::find()
            ->where($where)
            ->one();

        $stringField = (string)$data['Field'];

        if ($si) {
            $si->$stringField += $data['value'];
            $si->save();
        }
    }

    /**
     * 物理删除调拨跟踪与调拨明细
     */
    public static function delAllicationReal($where,$skuid=0){
        $condition = $where;
        $condition['PSKU_ID'] = $skuid;
        $allocationDetail_ids = ShAllocationDetail::find()->where($condition)->select('ALLOCATION_DETAIL_ID')->asArray()->all();

        $detail_res = ShAllocationDetail::deleteAll(array('ALLOCATION_DETAIL_ID'=>$allocationDetail_ids));

        $allocationDetails = ShAllocationDetail::find()->where($where)->select('ALLOCATION_DETAIL_ID')->asArray()->all();
        if(!$allocationDetails){
            $res = ShAllocation::updateAll(array('DELETED_STATE'=>1),$where);
        }else{
            $res = true;
        }

        return $res && $detail_res;
    }
}