<?php
namespace addons\inventory\modellogic;
use addons\inventory\models\SkGoodsRejected;
use addons\inventory\models\SkInsiderTrading;
use addons\inventory\models\SkInstantInventory;
use addons\inventory\models\SkPendingDelivery;
use addons\inventory\models\SkStorageDetail;
use addons\master\product\models\GProductSku;
use addons\shipment\models\ShAllocation;
use addons\shipment\models\ShAllocationDetail;
use Yii;
use addons\inventory\models\SkAllocation;
use addons\inventory\models\SkAllocationDetail;
use yii\swoole\db\Query;
use yii\swoole\rest\CreateExt;
use yii\swoole\rest\ResponeModel;
use yii\swoole\rest\UpdateExt;
use yii\web\ServerErrorHttpException;
class allocationLogic
{
    /**
     * 审核/反审核操作（审核同时保存）
     * @param $post
     * @throws ServerErrorHttpException
     * @throws \Exception
     */
    public static function doAuth($post){
        if (isset($post['AUTH_CODE']) && $post['AUTH_CODE']) {
            $ids = [];
            if ($post['AUTH_CODE'] == 1) {//反审核
                foreach ($post['batchMTC'] as $_post) {
                    if (isset($_post['ALLOCATION_ID'])&&$_post['ALLOCATION_ID']) {
                        $ska = SkAllocation::find()->where(['and',['=','ALLOCATION_ID',$_post['ALLOCATION_ID']], ['=','ALLOCATION_STATE',1]])->count(0);
                        if ($ska>0) {//单据未审核
                            throw new ServerErrorHttpException(Yii::t('inventory', 'This operation cannot be performed because the current document is not audited!'));
                        } else {
                            $spd = SkPendingDelivery::find()->where(['and',['=','ALLOCATION_ID',$_post['ALLOCATION_ID']], ['<>','PLAN_STATE',0]])->count(0);
                            if ($spd > 0) {
                                throw new ServerErrorHttpException(Yii::t('inventory', 'The selected data contained the confirmation of the library documents, can not be audited!'));
                            }
                        }
                        $ids[] = $_post['ALLOCATION_ID'];
                    }else{
                        throw new ServerErrorHttpException(Yii::t('inventory', 'Parameter check failed'));
                    }
                }
                $transaction = Yii::$app->db->beginTransaction();
                try {
                    UpdateExt::actionDo(new SkAllocation(), ['batchMTC'=>$post['batchMTC']]);
                    !empty($ids)&&self::delAuthRelTable($ids);
                    $transaction->commit();
                } catch (\Exception $e) {
                    $transaction->rollBack();
                    throw $e;
                }
            }else{
                foreach ($post['batchMTC'] as $_post) {
                    if (isset($_post['ALLOCATION_ID'])&&$_post['ALLOCATION_ID']) {
                        if (!isset($_post['sk_allocation_detail']) || empty($_post['sk_allocation_detail'])) {
                            throw new ServerErrorHttpException(Yii::t('inventory', 'Document details must have at least one!'));
                        }
                        $ska = SkAllocation::find()->where(['and',['=','ALLOCATION_ID',$_post['ALLOCATION_ID']], ['=','ALLOCATION_STATE',2]])->count(0);
                        if ($ska>0) {//单据已审核
                            throw new ServerErrorHttpException(Yii::t('inventory', 'The current document has been audited and cannot be operated on!'));
                        }
                        $ids[] = $_post['ALLOCATION_ID'];
                    }else{
                        throw new ServerErrorHttpException(Yii::t('inventory', 'Parameter check failed'));
                    }
                }
                $transaction = Yii::$app->db->beginTransaction();
                try {
                    UpdateExt::actionDo(new SkAllocation(), ['batchMTC'=>$post['batchMTC']]);
                    !empty($ids)&&self::addAuthRelTable($ids);
                    $transaction->commit();
                } catch (\Exception $e) {
                    $transaction->rollBack();
                    throw $e;
                }
            }
        }
    }

    /**
     * 添加关联表数据,待出库表
     * @param     $ids
     * @return mixed
     */
    private static function addAuthRelTable($ids)
    {
        $fields = 's.ERGANISATION_ID as PRGANISATION_ID,
        sd.ALLOCATION_ID,
        sd.ALLOCATION_DETAIL_ID,
        s.ESTIMATED_AT as PLAN_AT,
        sd.ATPSKU_ID as PSKU_ID,
        sd.ATSKU_CODE as PSKU_CODE,
        sd.TDRODUCT_DE,
        sd.ALLOCATION_NUMBER as SHIPMENT_NUMBER,
        s.ETWAREHOUSE_ID,
        s.ATWAREHOUSE_ID,
        cast(0 as decimal) as PLAN_STATE,
        cast(0 as decimal) as OUTBOUND_TYPE';
        $sk = (new Query())->from('sk_allocation_detail sd')
            ->select($fields)
            ->leftJoin('sk_allocation s','sd.ALLOCATION_ID = s.ALLOCATION_ID')
            ->where(['sd.ALLOCATION_ID'=>$ids])
            ->all();
        CreateExt::actionDo(new SkPendingDelivery(), ['batchMTC'=>$sk]);
    }

    /**
     * 删除关联表数据。待出库表
     * @param $ids
     * @return int
     */
    private static function delAuthRelTable($ids)
    {
        $result = SkPendingDelivery::deleteAll(["ALLOCATION_ID" => $ids]);
        if ($result instanceof ResponeModel) {
            return $result;
        }
    }

    /**
     * 待出入库回写调拨状态接口
     * @param $allocationStatus
     * @param $allocationDetailId
     * @return int
     * @throws ServerErrorHttpException
     */
    public static function upAllocationsStatus($allocationStatus,$allocationDetailId){
        if(!is_array($allocationStatus)||!is_array($allocationDetailId)){
            throw new ServerErrorHttpException(Yii::t('inventory', 'Parameter check failed'));
        }
        if(!array_key_exists('ALLOCATIONS_STATE',$allocationStatus)||!array_key_exists('ALLOCATION_DETAIL_ID',$allocationDetailId)){
            throw new ServerErrorHttpException(Yii::t('inventory', 'Parameter check failed'));
        }
        $result = SkAllocationDetail::updateAll($allocationStatus,$allocationDetailId);
        if ($result instanceof ResponeModel) {
            return $result;
        }
    }

    /**
     * 返回当前仓库下sku的即时库存
     * @param $post
     * @return $this
     */
    public static function getInstantNumber($post){
        $response = new ResponeModel();
        $result = Yii::$app->rpc->create('inventory')->sendAndrecv([['addons\inventory\modellogic\instantInventoryLogic', 'checkInventory1'], [$post]]);
        return $response->setModel(200, 0, Yii::t('inventory', 'Successful operation!'), $result);
    }

    /**
     * 根据调出sku找调入sku
     * @param $post
     * @return $this
     * @throws ServerErrorHttpException
     */
    public static function getEtSku($post){
        $response = new ResponeModel();
        if(!is_array($post)){
            throw new ServerErrorHttpException(Yii::t('inventory', 'Parameter check failed'));
        }
        $fields = ['ARGANISATION_ID','PSKU_ID'];
        foreach($fields as $v){
            if(!array_key_exists($v,$post)){
                throw new ServerErrorHttpException(Yii::t('inventory', 'Parameter check failed'));
            }
        }
        $cSku = GProductSku::find()->select('CSKU_ID')
            ->where(['PSKU_ID'=>$post['PSKU_ID']])
            ->asArray()
            ->one();
        if(isset($cSku['CSKU_ID'])&&$cSku['CSKU_ID']){
            $_pSku = GProductSku::find()->select('PSKU_ID,PSKU_CODE')
                ->where(['ORGAN_ID_DEMAND'=>$post['ARGANISATION_ID'],'CSKU_ID'=>$cSku['CSKU_ID']])
                ->asArray()
                ->one();
            $pSku = ['PSKU_ID'=>isset($_pSku['PSKU_ID'])?$_pSku['PSKU_ID']:'','PSKU_CODE'=>isset($_pSku['PSKU_CODE'])?$_pSku['PSKU_CODE']:''];
        }else{
            $pSku = ['PSKU_ID'=>'' ,'PSKU_CODE'=>''];
        }
        return $response->setModel(200, 0, Yii::t('inventory', 'Successful operation!'), $pSku);
    }

    /**
     * 获取状态和出入库数量
     * @param $post
     * @return $this
     * @throws ServerErrorHttpException
     */
    public static function getAlStatus($post){
        if(!is_array($post)||empty($post)||!array_key_exists('ALLOCATION_DETAIL_ID',$post)){
            throw new ServerErrorHttpException(Yii::t('inventory', 'Parameter check failed'));
        }
        $sk = SkAllocationDetail::find()->select('ALLOCATION_DETAIL_ID,ALLOCATIONS_STATE')
            ->where($post)
            ->asArray()
            ->all();
        $_sh = Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\shallocationLogic','getAlStatus'],[$post]]);
        array_walk($sk,function(&$v,$k,$sh){
            if(array_key_exists($v['ALLOCATION_DETAIL_ID'],$sh)){
                $v['ACTUALATW_NUMBER'] = $sh[$v['ALLOCATION_DETAIL_ID']]['ACTUALATW_NUMBER'];
                $v['ACTUALETW_NUMBER'] = $sh[$v['ALLOCATION_DETAIL_ID']]['ACTUALETW_NUMBER'];
            }else{
                $v['ACTUALATW_NUMBER'] = 0;
                $v['ACTUALETW_NUMBER'] = 0;
            }
        },$_sh);
        $response = new ResponeModel();
        return $response->setModel(200, 0, Yii::t('inventory', 'Successful operation!'), $sk);
    }

    /**
     * 删除操作
     * @param $post
     * @return int
     * @throws ServerErrorHttpException
     */
    public static function doReqDel($post){
        if(!array_key_exists('ALLOCATION_ID',$post)){
            throw new ServerErrorHttpException(Yii::t('inventory', 'Parameter check failed'));
        }
        $result = SkAllocation::updateAll(['DELETED_STATE'=>1],$post);
        if($result instanceof ResponeModel){
            return $result;
        }
        $_result = SkAllocationDetail::deleteAll($post);
        if($_result instanceof ResponeModel){
            return $_result;
        }
    }

    /**
     * 生成退货确认/内部交易
     * @param $post
     * @return $this
     */
    public static function generateGoodsRejected($post){
        $response = new ResponeModel();
        $result = ['rejected'=>[],'trading'=>[]];
        foreach($post as $k=>$v){
            $sd = (new Query())->from('sk_storage_detail sd')
                ->select('sd.PSKU_ID,sd.PSKU_CODE,sd.PSKU_NAME_CN,sd.PU_ORDER_CD as PU_PURCHASE_CD,sd.PURCHASE_DETAIL_ID,sd.STORAGE_CD,sd.STORAGE_DETAIL_ID,sd.STORAGE_AT,sd.STORAGE_DNUMBER,sd.UNIT_PRICE as WAREHOUSING_PRICE')
                ->leftJoin('sk_storage s','sd.STORAGE_ID = s.STORAGE_ID')
                ->where(['s.ORDER_TYPE'=>2,'s.ORDER_STATE'=>2,'s.ORGANISATION_ID'=>$v['ERGANISATION_ID'],'sd.PSKU_ID'=>$v['ATPSKU_ID']])
                ->andWhere(['>', 'sd.STORAGE_DNUMBER', 0])
                ->orderBy(['sd.STORAGE_AT'=>SORT_DESC])
                ->all();
            array_walk($sd,function (&$item){
                $redStorageNum = SkStorageDetail::find()
                    ->where(['RED_STORAGE_CD'=>$item['STORAGE_CD'],'RED_STORAGE_DETAIL_ID'=>$item['STORAGE_DETAIL_ID']])
                    ->sum('STORAGE_DNUMBER');
                $item['STORAGE_DNUMBER'] += $redStorageNum;
            });
            $_rejected = [];
            $preNum = 0;
            $flag = false;
            foreach($sd as $_k=>$_v){
                if($_v['STORAGE_DNUMBER'] <= 0){
                    continue;
                }
                $_rejected[$_k] = $_v;
                $_num = $v['ALLOCATION_NUMBER'] - $preNum;//剩余调拨数量
                if($_num > $_v['STORAGE_DNUMBER']){//剩余调拨数量 > 当前入库数量
                    $_rejected[$_k]['GOREJECTED_NUMBER'] = $_v['STORAGE_DNUMBER'];//取当前入库数量
                }else{
                    $_rejected[$_k]['GOREJECTED_NUMBER'] = $_num;//取剩余调拨数量
                    $flag = true;
                }
                $preNum += $_rejected[$_k]['GOREJECTED_NUMBER'];//已调拨数量
                if($flag){
                    break;
                }
            }
            $result['rejected'][$k] = $_rejected;
            if(!$flag&&($num = $v['ALLOCATION_NUMBER'] - $preNum)){
                $result['trading'][$k] = ['PSKU_ID'=>$v['ATPSKU_ID'],'PSKU_CODE'=>$v['ATSKU_CODE'],'PSKU_NAME_CN'=>$v['TDRODUCT_DE'],'I_NUMBER'=>$num];
            }
        }
        return $response->setModel(200, 0, Yii::t('inventory', 'Successful operation!'), $result);
    }

    //确认 退货确认/内部交易
    public static function authGoodsRejected($post){
        if (isset($post['ALLOCATION_ID']) && $post['ALLOCATION_ID']) {
            $ska = SkAllocation::find()->where(['and',['=','ALLOCATION_ID',$post['ALLOCATION_ID']], ['=','ALLOCATION_STATE',2]])->count(0);
            if ($ska>0) {//单据已审核
                throw new ServerErrorHttpException(Yii::t('inventory', 'The current document has been audited and cannot be operated on!'));
            }
            $al = ['ALLOCATION_ID'=>$post['ALLOCATION_ID'],
                   'ALLOCATION_STATE'=>$post['ALLOCATION_STATE'],
                   'ATWAREHOUSE_ID'=>$post['ATWAREHOUSE_ID'],
                   'ETWAREHOUSE_ID'=>$post['ETWAREHOUSE_ID'],
                   'ALLOCATION_REMARKS'=>$post['ALLOCATION_REMARKS'],
                   'AUTITO_AT'=>$post['AUTITO_AT'],
                   'AUTITO_ID'=>$post['AUTITO_ID'],
                   'DETAIL_CODE'=>$post['DETAIL_CODE'],
                   'sk_allocation_detail'=>$post['sk_allocation_detail']
            ];
            $transaction = Yii::$app->db->beginTransaction();
            try {
                UpdateExt::actionDo(new SkAllocation(),$al);
                if(!empty($post['sk_goods_rejected'])){
                    self::addAuthRejRelTable($post,1);
                }
                if(!empty($post['sk_insider_trading'])){
                    self::addAuthRejRelTable($post,2);
                }
                $transaction->commit();
            } catch (\Exception $e) {
                $transaction->rollBack();
                throw $e;
            }
        }else {
            throw new ServerErrorHttpException(Yii::t('inventory', 'Parameter check failed'));
        }
    }

    /**
     * 添加退货确认、内部交易、待出库列表
     * @param $post
     * @param $type
     * @return mixed
     * @throws \Exception
     */
    private static function addAuthRejRelTable($post,$type){
        $postStr = $type == 1 ?'sk_goods_rejected':'sk_insider_trading';
        $numStr = $type == 1 ? 'GOREJECTED_NUMBER': 'I_NUMBER';
        $idStr = $type == 1 ? 'GOODS_REJECTED_ID': 'INSIDER_TRADING_ID';
        foreach($post[$postStr] as $v){
            $skd = SkAllocationDetail::find()->select('ALLOCATION_DETAIL_ID')
                ->where(['ALLOCATION_ID'=>$post['ALLOCATION_ID'],'ATPSKU_ID'=>$v['PSKU_ID']])
                ->asArray()
                ->one();
            if(isset($skd['ALLOCATION_DETAIL_ID'])&&$skd['ALLOCATION_DETAIL_ID']){
                $model = $type == 1 ? new SkGoodsRejected() : new SkInsiderTrading();
                $_temp = $v;
                $_temp['ALLOCATION_DETAIL_ID'] = $skd['ALLOCATION_DETAIL_ID'];
                $re = CreateExt::actionDo($model,$_temp);
                $obj = [];
                $obj['PRGANISATION_ID'] = $post['ERGANISATION_ID'];
                $obj['ALLOCATION_ID'] = $post['ALLOCATION_ID'];
                $obj['ALLOCATION_DETAIL_ID'] = $skd['ALLOCATION_DETAIL_ID'];
                $obj['PLAN_AT'] = $post['ESTIMATED_AT'];
                $obj['PSKU_ID'] = $v['PSKU_ID'];
                $obj['PSKU_CODE'] = $v['PSKU_CODE'];
                $obj['TDRODUCT_DE'] = $v['PSKU_NAME_CN'];
                $obj['SHIPMENT_NUMBER'] = $v[$numStr];
                $obj['ATWAREHOUSE_ID'] = $post['ATWAREHOUSE_ID'];
                $obj['ETWAREHOUSE_ID'] = $post['ETWAREHOUSE_ID'];
                $obj['PLAN_STATE'] = 0;
                $obj['OUTBOUND_TYPE'] = $type;
                $obj[$idStr] = $re[$idStr];
                CreateExt::actionDo(new SkPendingDelivery(),$obj);
            }
        }
    }

    /**
     * 获取调拨计划信息
     */
    public static function getAllocation($where){
        return SkAllocation::find()->joinWith(["sk_allocation_detail"])->where($where)->asArray()->one();
    }

    /**
     * updatePenddelivery
     * @param $data
     * @return array|\yii\swoole\rest\ActiveRecord
     */
    public static function updateAllocation($data)
    {
        $dispatchModel = array("batch" => $data);
        $post = Yii::$app->getRequest()->getBodyParams();
        Yii::$app->getRequest()->setBodyParams($dispatchModel);
        $result = UpdateExt::actionDo(new SkAllocation(), $dispatchModel);
        Yii::$app->getRequest()->setBodyParams($post);
        if ($result instanceof ResponeModel) {
            return $result;
        }
    }

    /**
     * 反写调拨计划明细
     */
    public static function updateAllocationDetail($data,$where){
        return SkAllocationDetail::updateAll($data,$where);
    }

    /**
     * 反写调拨跟踪明细
     */
    public static function updateShallocationDetail($data,$where){
        return ShAllocationDetail::updateAll($data,$where);
    }

    /**
     * 获取调拨跟踪明细
     */
    public static function getShAllocationDetail($where){
        return ShAllocationDetail::find()->where($where)->asArray()->one();
    }

    /*
     * 回写调拨跟踪
     */
    public static function updateShallocation($data,$where){
        return ShAllocation::updateAll($data,$where);
    }
}