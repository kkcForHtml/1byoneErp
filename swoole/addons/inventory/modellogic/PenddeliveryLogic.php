<?php
/**
 * User: Fable
 */
namespace addons\inventory\modellogic;

use addons\inventory\models\SkAllocation;
use addons\inventory\models\SkAllocationDetail;
use addons\inventory\models\SkPlacingDetail;
use addons\inventory\models\SkStorage;
use addons\master\partint\models\PaPartner;
use addons\master\product\models\GProductSku;
use addons\purchase\models\PuPurchaseDetail;
use addons\sales\modellogic\salesorderLogic;
use Yii;
use addons\inventory\models\SkPendingDelivery;

use \yii\swoole\rest\ResponeModel;
use addons\inventory\models\SkFiallocation;
use addons\inventory\models\SkFiallocationDetail;
use addons\master\basics\models\BWarehouse;
use addons\inventory\models\SkInsiderTrading;
use addons\inventory\models\SkGoodsRejected;
use addons\purchase\models\PuPurchase;
use addons\inventory\models\SkPlacing;
use addons\sales\models\CrSalesOrder;

use yii\swoole\rest\CreateExt;
use yii\swoole\rest\DeleteExt;
use yii\swoole\rest\UpdateExt;
use yii\web\ServerErrorHttpException;

class PenddeliveryLogic extends ResponeModel
{

    protected static $RESPONE;

    public function __construct()
    {
        self::$RESPONE = new ResponeModel();
    }

    /*
     * 检测库存是否足够
     */
    public static function checkSkuInventory($postarray)
    {
        $respone = new ResponeModel();
        $returnArray['flag'] = true;
        $returnArray['sku'] = '';

        if (isset($postarray['batchMTC'])) {

            $i = 0;

            foreach ($postarray['batchMTC'] as $obj) {
                if ($obj['PLAN_STATE'] == 1) {
                    return $respone->setModel(500, 0, $obj['ALLOCATION_ID'] . Yii::t('inventory', 'It has been shipped out of documents, not allowed to operate!'), []);
                }

                //检测库存是否足够
                $condition['s.WAREHOUSE_CODE'] = $obj['ATWAREHOUSE_CODE'];
                $condition['s.PSKU_CODE'] = $obj['PSKU_CODE'];
                $skuInventory = (new \yii\db\Query())
                    ->select('*')
                    ->from('sk_instant_inventory as s')
                    ->leftJoin("g_product_sku as g", "g.PSKU_CODE = g.PSKU_CODE")
                    ->where($condition)
                    ->one();
                //小于即时库存
                if ($obj['RECEIVE_NUMBER'] > $skuInventory['INSTANT_NUMBER']) {
                    $returnArray['flag'] = false;
                    $returnArray['type'] = 2;
                    if ($i > 0)
                        $returnArray['sku'] .= '  ,  ';
                    $returnArray['sku'] .= '  ' . $obj['PSKU_CODE'] . '  ';
//                    return $respone->setModel(200, 0, "查询成功", $returnArray);
                }
                $i++;
            }
            if ($returnArray['flag'] == false) {
                return $respone->setModel(200, 0, Yii::t('inventory', 'Query was successful!'), $returnArray);
            }
        }
        return $respone->setModel(200, 0, Yii::t('inventory', 'Query was successful!'), $returnArray);
//        return $respone->setModel(200, 0, "查询成功", $returnArray);
    }

    /**
     * 确认出库
     */
    public static function ensurePendDelivery($post)
    {
        if ($post['batchMTC']) {
            $detail = $post['detail'];
            $delivery_info = $post['batchMTC'];

            $transaction = Yii::$app->db->beginTransaction();

            foreach ($delivery_info as &$row) {
                //获取内部交易单
                $insiderTrading = SkInsiderTrading::find(array('INSIDER_TRADING_ID' => $row['INSIDER_TRADING_ID']))->asArray()->one();
                $row['insidertrad'] = $insiderTrading;

                //获取退货确认表
                $goods_rejected = SkGoodsRejected::find()->where(array('GOODS_REJECTED_ID' => $row['GOODS_REJECTED_ID']))->asArray()->one();
                if($goods_rejected){
                    $goods_rejected['sk_allocation_detail'] = SkAllocationDetail::find()->where(array('ALLOCATION_DETAIL_ID' => $goods_rejected['ALLOCATION_DETAIL_ID']))->asArray()->one();
                    $row['goods_rejected'] = $goods_rejected;

                    //获取内部采购订单
                    $purchase_info = PuPurchase::find()->where(array('PU_PURCHASE_CD' => $goods_rejected['PU_PURCHASE_CD']))->asArray()->one();

                    //获取采购明细订单
                    $purchase_detail = PuPurchaseDetail::find(array('PU_PURCHASE_CD' => $goods_rejected['PU_PURCHASE_CD'], 'PSKU_ID' => $row['PSKU_ID']))->asArray()->one();
                    $purchase_info['purchase_detail'] = $purchase_detail;
                    $row['purchase'] = $purchase_info;
                }
                  //获取内部交易明细
                $sk_insider_trading = SkInsiderTrading::find()->where(array('INSIDER_TRADING_ID' => $row['INSIDER_TRADING_ID']))->asArray()->one();
                if($sk_insider_trading){
                    $sk_insider_trading['sk_allocation_detail'] = SkAllocationDetail::find()->where(array('ALLOCATION_DETAIL_ID' => $sk_insider_trading['ALLOCATION_DETAIL_ID']))->asArray()->one();
                    $row['sk_insider_trading'] = $sk_insider_trading;
                }

                //获取调拨计划数据
                $allocation_detail = SkAllocationDetail::find()->where(array('ALLOCATION_DETAIL_ID' => $row['ALLOCATION_DETAIL_ID']))->asArray()->one();
                $allocation = SkAllocation::find()->where(array('ALLOCATION_ID' => $row['ALLOCATION_ID']))->asArray()->one();
                $allocation['allocation_detail'] = $allocation_detail;
                $row['allocation'] = $allocation;
            }

            try {
                foreach ($delivery_info as &$item) {
                    switch ($item['OUTBOUND_TYPE']) {
                        case 0 :
                            self::typeDelivery(array(0 => $item), $detail);
                            break;
                        case 1:
                            self::typeReturnDelivery(array(0 => $item), $detail);
                            break;
                        case 2:
                            self::typeTradingDelivery(array(0 => $item), $detail);
                            break;
                        default:
                            return self::$RESPONE->setModel(500, 0, Yii::t('inventory', 'Error of single type to be delivered!'), []);
//                            return self::$RESPONE->setModel(500, 0, '待出库单类型错误', []);
                            break;
                    }

                    //回写调拨跟踪明细
                    $data['Field'] = 'SHIPMENT_NUMBER';
                    $data['value'] = $item['RECEIVE_NUMBER'];
                    $where['SALLOCATION_DETAIL_ID'] = $item['ALLOCATION_DETAIL_ID'];
                    Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\shallocationLogic', 'updateNum'], [$data, $where]]);

                }

                //生成待入库订单
                $delivery_info = self::createPendingStorage($delivery_info);

                //生成调拨跟踪单据
                self::createAllocation($delivery_info, $detail);

                //修改待出库单状态
                $penddeliveryIds = array_column($delivery_info, 'PENDING_DELIVERY_ID');
                $update_data['PLAN_STATE'] = 1;
                $update_data['ACTUAL_AT'] = $detail['ALLOUT_AT'];
                $update_data['HANDLER_ID'] = Yii::$app->getUser()->getIdentity()->USER_INFO_ID;

                SkPendingDelivery::updateAll($update_data, array('PENDING_DELIVERY_ID' => $penddeliveryIds));

                //反写调拨计划明细状态
                $ALLOCATION_DETAIL_IDS = array_column($delivery_info, 'ALLOCATION_DETAIL_ID');
                Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic', 'upAllocationsStatus'], [['ALLOCATIONS_STATE' => 1], ['ALLOCATION_DETAIL_ID' => $ALLOCATION_DETAIL_IDS]]]);

                $transaction->commit();

            } catch (\Exception $e) {
                $transaction->rollBack();
                throw $e;
            }
        }
    }

    /**
     * 取消出库 反审核生成的对应单据 并物理删除
     */
    public static function cancelPendDelivery($post)
    {
        if ($post['batchMTC']) {

            $data = $post['batchMTC'];

            $ALLOCATION_IDS = array_column($data, 'ALLOCATION_ID');

            $allocation_data = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PendstorageLogic', 'GetPendingStorage'], ['', array('NOTE_ID' => $ALLOCATION_IDS, 'IMPORT_STATE' => 2)]]);

            foreach ($allocation_data as $row) {
                if ($row['PLAN_STATE'] != 0) {
                    $fiall_info = SkAllocation::findOne(array('ALLOCATION_ID' => $ALLOCATION_IDS));
                    throw  new \Exception('请先将调拨计划单:' . $fiall_info['ALLOCATION_CD'] . '对应的待入库单取消入库');
                }
            }

            $transaction = Yii::$app->db->beginTransaction();

            try {
                foreach ($data as $value) {

                    $value['allocation_detail'] = SkAllocationDetail::find()->where(array('ALLOCATION_DETAIL_ID' => $value['ALLOCATION_DETAIL_ID']))->asArray()->one();


                    if ($value['OUTBOUND_TYPE'] == 0) {
//                        //TODO 反审核调拨单
                        $fiallocation_condition = array('FIALLOCATION_CD' => $value['ALLOCATION_ONTHEWAY_CD']);
                        $fiallocation = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\fiallocationLogic', 'getFiallocation'], ['', $fiallocation_condition]]);//反审核
                        $fiallocation[0]['ALLOCATION_STATE'] = 1;
                        $fiallocation[0]['authFlag'] = 2;
                        $fiallocation[0]['DELETED_STATE'] = 1;
                        $fiallocation[0]['allow_back_review'] = 1;
                        Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\fiallocationLogic', 'Fiallocation'], [$fiallocation]]);//反审核

                        $del_fiallocation_condition = array('FIALLOCATION_ID' => $fiallocation[0]['FIALLOCATION_ID']);
                        //物理删除调拨单和调拨单明细
                        Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\fiallocationLogic', 'delFiallcationReal'], [$del_fiallocation_condition]]);
                    }
                    if ($value['OUTBOUND_TYPE'] == 1 || $value['OUTBOUND_TYPE'] == 2) {
                        if ($value['OUTBOUND_TYPE'] == 1) {

                            //调入组织的内部采购入库单
                            $storage_condition_red = array('STORAGE_CD' => $value['PURCHASING_WAREHOUSING_CD_RED']);
                            $storeage_order_red = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'getStorage'], ['', $storage_condition_red]]);                             //反审核
                            $storeage_order_red[0]['ORDER_STATE'] = 1;
                            $storeage_order_red[0]['DELETED_STATE'] = 1;
                            $storeage_order_red[0]['authFlag'] = 2;
                            $storeage_order_red[0]['allow_back_review'] = 1;
                            Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'StorageAuditing'], [$storeage_order_red]]);                             //反审核
                            Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'delStorage'], [$storage_condition_red]]);                         //物理删除采购入库单和详情

                            //中转仓的红字内部销售出库单
                            $red_salesth_condition = array('PLACING_CD' => $value['INTERNAL_SALESTH_CD_RED']);
                            $SALETH_RED = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\placingLogic', 'getSkPlacing'], ['', $red_salesth_condition]]);
                            $SALETH_RED[0]['PLAN_STATE'] = 1;
                            $SALETH_RED[0]['DELETED_STATE'] = 1;
                            $SALETH_RED[0]['authFlag'] = 2;
                            $SALETH_RED[0]['allow_back_review'] = 1;
                            Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\placingLogic', 'SetPlacing'], [$SALETH_RED]]);                                   //反审核
                            Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\placingLogic', 'delPlacing'], [$red_salesth_condition]]);                         //物理删除红字内部销售出库单和内部销售详情出库单
                        }

                        //代采组织|调入组织 的内部销售订单
                        $sales_condition = array('SALES_ORDER_CD' => $value['INTERNAL_SALES_CD']);
                        $sales_order = Yii::$app->rpc->create('sales')->sendAndrecv([['\addons\sales\modellogic\salesorderLogic', 'getSalesOrder'], [[], $sales_condition]]);            //反审核

                        $sales_order[0]['ORDER_STATE'] = 1;
                        $sales_order[0]['authFlag'] = 2;
                        $sales_order[0]['allow_back_review'] = 1;
                        Yii::$app->rpc->create('sales')->sendAndrecv([['\addons\sales\modellogic\salesorderLogic', 'StorageAuditing'], [$sales_order]]);            //反审核
                        Yii::$app->rpc->create('sales')->sendAndrecv([['\addons\sales\modellogic\salesorderLogic', 'delSalesOrder'], [$sales_condition]]);        //物理删除内部销售订单 和 订单详情

                        //代采组织|调入组织 的内部销售出库单
                        $salesth_condition = array('PLACING_CD' => $value['INTERNAL_SALESTH_CD']);
                        $placing_order = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\placingLogic', 'getSkPlacing'], ['', $salesth_condition]]);
                        $placing_order[0]['PLAN_STATE'] = 1;
                        $placing_order[0]['DELETED_STATE'] = 1;
                        $placing_order[0]['authFlag'] = 2;
                        $placing_order[0]['allow_back_review'] = 1;
                        Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\placingLogic', 'SetPlacing'], [$placing_order]]);                             //反审核
                        Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\placingLogic', 'delPlacing'], [$salesth_condition]]);                         //物理删除红字内部销售出库单和内部销售详情出库单

                        //调入组织的内部采购订单
                        $purchase_condition = array('PU_PURCHASE_CD' => $value['INTERNAL_PURCHASING_CD']);
                        $purchase_order = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getPurchase'], [$purchase_condition, [], []]]);
                        $purchase_order[0]['ORDER_STATE'] = 1;
                        $purchase_order[0]['DELETED_STATE'] = 1;
                        $purchase_order[0]['authFlag'] = 2;
                        $purchase_order[0]['allow_back_review'] = 1;
                        Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'SetPurchase'], [$purchase_order]]);                             //反审核
                        Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'delPurchase'], [$purchase_condition]]);

                        //调入组织的内部采购入库单
                        $storage_condition = array('STORAGE_CD' => $value['INTERNAL_PURCHASINGST_CD']);
                        $storeage_order = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'getStorage'], [[], $storage_condition]]);

                        $storeage_order[0]['ORDER_STATE'] = 1;
                        $storeage_order[0]['DELETED_STATE'] = 1;
                        $storeage_order[0]['authFlag'] = 2;
                        $storeage_order[0]['allow_back_review'] = 1;
                        Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'StorageAuditing'], [$storeage_order]]);                             //反审核
                        Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'delStorage'], [$storage_condition]]);                         //物理删除采购入库单和详情
                    }

                    //物理删除待入库单
                    $pend_storage_condition = array('NOTE_ID' => $value['ALLOCATION_ID'], 'IMPORT_STATE' => '2');
                    Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PendstorageLogic', 'delPendingStorageReal'], [$pend_storage_condition]]);

                    $Res = SkPendingDelivery::updateAll(array('PLAN_STATE' => 0, 'ACTUAL_AT' => '', 'RECEIVE_NUMBER' => 0), array('PENDING_DELIVERY_ID' => $value['PENDING_DELIVERY_ID']));

                    //反写调拨计划明细状态
                    Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\allocationLogic', 'upAllocationsStatus'], [['ALLOCATIONS_STATE' => 0], ['ALLOCATION_DETAIL_ID' => $value['ALLOCATION_DETAIL_ID']]]]);

                    //物理删除调拨跟踪与调拨明细
                    Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\shallocationLogic', 'delAllicationReal'], [['ALLOCATION_ID' => $value['ALLOCATION_ID_AFTER']],'PSKU_ID'=>$value['allocation_detail']['ETPSKU_ID']]]);

                    //回写调拨跟踪明细
                    $updatedata['Field'] = 'SHIPMENT_NUMBER';
                    $updatedata['value'] = (-1) * (int)$value['RECEIVE_NUMBER'];
                    $where['SALLOCATION_DETAIL_ID'] = $value['ALLOCATION_DETAIL_ID'];
                    Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\shallocationLogic', 'updateNum'], [$updatedata, $where]]);

                }

                $transaction->commit();

            } catch (\Exception $e) {
                $transaction->rollBack();
                throw $e;
            }
        }
    }

    /**
     * 类型-调拨出库
     */
    public static function typeDelivery($delivery_info, $detail)
    {

        self::createFiallocaData($delivery_info, $detail);

    }

    /**
     * 类型-退货出库
     */
    public static function typeReturnDelivery($delivery_info, $detail)
    {

        //调出仓的红字内部采购入库单
        $PURCHASING_WAREHOUSING_Red_Data = self::formatStorageData($delivery_info, 1);
        self::GenerateWarehouse($PURCHASING_WAREHOUSING_Red_Data, $delivery_info, 1);

        //生成出库中转仓的红字销售出库单
        $INTERNAL_SALESTH_Red_Data = self::formatPlacingData($delivery_info, 1);
        self::SetdeliveryStorage($INTERNAL_SALESTH_Red_Data, $delivery_info, 1);

        //代采组织内部销售订单
        $agent_SALES_ORDER = self::formatSalesOrder($delivery_info, 1);
        $delivery_info[0]['salesOrder'] = self::SetSalesOrder($agent_SALES_ORDER, $delivery_info);

        //待采组织内部销售出库单
        $agent_SALES_Placing_Order = self::formatPlacingData($delivery_info, 2);
        self::SetdeliveryStorage($agent_SALES_Placing_Order, $delivery_info, 2);

        //生成调入组织的内部采购订单
        $PURCHASING_DATA = self::formatPurchaseOrder($delivery_info, 1);
        $delivery_info[0]['purchase'] = self::SetPurchaseOrder($PURCHASING_DATA, $delivery_info);

        //生成调入组织的内部入库单
        $STORAGE_DATA = self::formatStorageData($delivery_info, 2);
        self::GenerateWarehouse($STORAGE_DATA, $delivery_info, 2);

    }

    /**
     * 类型-内部交易出库
     */
    public static function typeTradingDelivery($delivery_info)
    {
        //调出组织内部销售订单
        $ET_SALES_ORDER = self::formatSalesOrder($delivery_info, 2);
        $delivery_info[0]['salesOrder'] = self::SetSalesOrder($ET_SALES_ORDER, $delivery_info, 2);

        //调出组织内部销售出库单
        $ET_SALES_Placing_Order = self::formatPlacingData($delivery_info, 2);
        self::SetdeliveryStorage($ET_SALES_Placing_Order, $delivery_info, 2);

        //生成调入组织的内部采购订单
        $PURCHASING_DATA = self::formatPurchaseOrder($delivery_info, 2);
        $delivery_info[0]['purchase'] = self::SetPurchaseOrder($PURCHASING_DATA, $delivery_info);

        //生成调入组织的内部入库单
        $STORAGE_DATA = self::formatStorageData($delivery_info, 2);
        self::GenerateWarehouse($STORAGE_DATA, $delivery_info, 2);

    }

    /**
     * 生成已审核调拨单
     */
    public static function createFiallocaData($delivery_info, $detail)
    {
        if ($delivery_info) {
            $data = array();
            $i = 0;
            foreach ($delivery_info as $value) {
                //单据内容
                $data[0] = [];
                $data[0]['ORGANISATION_ID'] = $value['PRGANISATION_ID'];//需求组织
                $data[0]['ALLOCATION_AT'] = $detail['ALLOUT_AT'];           //实际调拨时间
                $Atwarehouse_info = self::getWarehuseInfo($value['ATWAREHOUSE_ID']);
                $data[0]['ATWAREHOUSE_ID'] = self::CallinWarehouse($Atwarehouse_info['ORGANISATION_ID'], $Atwarehouse_info['CHANNEL_ID'], $Atwarehouse_info['WAREHOUSE_ID']);
                $data[0]['ETWAREHOUSE_ID'] = $value['ETWAREHOUSE_ID'];

                if (!$data[0]['ATWAREHOUSE_ID']) {
                    throw new \Exception("数据缺失:调入仓库对应的在途仓不存在");
                }

                $data[0]['ALLOCATION_STATE'] = 1; //审核状态,1：未审核 2：已审核
                $data[0]['ALLOCATION_REMARKS'] = ''; //备注
                $data[0]['DELETED_STATE'] = 0;  //是否删除,1：删除 0：未删除
                $data[0]['SYSTEM_GENERATION'] = 1; //是否系统生成,0:否 1：是
                $data[0]['PENDING_DELIVERY_ID'] = $value['PENDING_DELIVERY_ID'];

                $data[0]['sk_fiallocation_detail'][0]['PSKU_ID'] = $value['PSKU_ID'];
                $data[0]['sk_fiallocation_detail'][0]['ATSKU_CODE'] = $value['PSKU_CODE'];//发运单.需求国SKU
                $data[0]['sk_fiallocation_detail'][0]['TDRODUCT_DE'] = $value['TDRODUCT_DE'];
                $data[0]['sk_fiallocation_detail'][0]['UNIT_ID'] = $value['allocation']['allocation_detail']['UNIT_ID'];
                $data[0]['sk_fiallocation_detail'][0]['ALLOCATION_NUMBER'] = $value['RECEIVE_NUMBER'];//实际发运数量
                $data[0]['sk_fiallocation_detail'][0]['ATWAREHOUSE_ID'] = $data[0]['ATWAREHOUSE_ID']; //调入仓库
                $data[0]['sk_fiallocation_detail'][0]['ETWAREHOUSE_ID'] = $data[0]['ETWAREHOUSE_ID']; //调出仓库
                $data[0]['sk_fiallocation_detail'][0]['ALLOCATION_REMARKS'] = '';

                $result = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\fiallocationLogic', 'addFiallocationReturn'], [$data]]);

                $Storage[0] = array();
                $Storage[0] = $result;
                $Storage[0]['ALLOCATION_STATE'] = 2;
                $Storage[0]['authFlag'] = 1;
                $Storage[0]['AUTITO_AT'] = time();

                Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\fiallocationLogic', 'Fiallocation'], [$Storage]]);
            }
        }
    }

    /**
     * 生成调拨跟踪单据
     * @param $deliveryInfo
     * @param $detail
     * @return $this|array
     * author Fox
     */
    public static function createAllocation($delivery_info, $detail)
    {

        if ($delivery_info) {
            $data = array();
            $i = 0;
            foreach ($delivery_info as $value) {
               if($i==0){
                   $Awarehousr_info = self::getWarehuseInfo($value['ATWAREHOUSE_ID']);

                   $data[0]['AORGANISATION_ID'] = $Awarehousr_info['ORGANISATION_ID']; //调入组织id
                   $data[0]['CHANNEL_ID'] = $Awarehousr_info['CHANNEL_ID'];            //平台
                   $data[0]['ACTUAL_CALLOUT_AT'] = $detail['ALLOUT_AT'];               //实际调出时间
                   $data[0]['ESTIMATE_CALLOUT_AT'] = $value['allocation']['ESTIMATED_AT'];  //预计调出时间
                   $data[0]['OUT_WAREHOUSE_ID'] = $value['ETWAREHOUSE_ID'];         //调出仓库
                   $data[0]['IN_WAREHOUSE_ID'] = $value['ATWAREHOUSE_ID'];             //调入仓库

                   $condition = $data[0];
                   $condition['DELETED_STATE'] = 0;
                   $shAllocation = Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\shallocationLogic', 'getShallocation'], [$condition]]);

                   $data[0]['ESTIMATE_TRANSFER_AT'] = $value['allocation']['ESTIMATEDA_AT'];   //预计调入日期
                   $data[0]['TRACK_NO'] = $detail['TRACK_NO'];                  //追踪号
                   $data[0]['LOAD_MONEY_ID'] = $detail['LOAD_MONEY_ID'];        //装卸费币种
                   $data[0]['LOAD_MONEY'] = $detail['LOAD_MONEY'];              //装卸费
                   $data[0]['FREIGHT_MONEY_ID'] = $detail['FREIGHT_MONEY_ID'];  //运费币种
                   $data[0]['FREIGHT_MONEY'] = $detail['FREIGHT_MONEY'];        //运费
                   $data[0]['INCIDEN_MONEY_ID'] = $detail['INCIDEN_MONEY_ID'];  //杂费币种
                   $data[0]['INCIDEN_MONEY'] = $detail['INCIDEN_MONEY'];        //杂费
                   $data[0]['PLAN_STATE'] = 2;                  //调拨状态 已送达
               }

                $data[0]['sh_allocation_detail'][$i]['PENDING_DELIVERY_ID'] = $value['PENDING_DELIVERY_ID'];
                $data[0]['sh_allocation_detail'][$i]['SALLOCATION_DETAIL_ID'] = $value['ALLOCATION_DETAIL_ID']; //调拨计划明细id
                $data[0]['sh_allocation_detail'][$i]['PSKU_ID'] = $value['allocation']['allocation_detail']['ETPSKU_ID'];    //调拨计划的调入SKU ID
                $data[0]['sh_allocation_detail'][$i]['PSKU_CODE'] = $value['allocation']['allocation_detail']['ETSKU_CODE'];   //调拨计划的调入SKU CODE
                $skuInfo = GProductSku::find()->where(array('PSKU_ID'=>$value['allocation']['allocation_detail']['ETPSKU_ID']))->asArray()->one();
                $data[0]['sh_allocation_detail'][$i]['GOODS_DESCRIBE'] = $skuInfo['PSKU_NAME_CN'];//货描
                $data[0]['sh_allocation_detail'][$i]['SHIPMENT_NUMBER'] = $value['RECEIVE_NUMBER'];  //发货数量
                $data[0]['sh_allocation_detail'][$i]['ARECIPIENT_NUM'] = 0;   //收货数量
                $data[0]['sh_allocation_detail'][$i]['DETAIL_REMARKS'] = '';
                $data[0]['sh_allocation_detail'][$i]['PENDING_STORAGE_ID'] = $value['PENDING_STORAGE_ID'];

                $i++;
            }
            Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\shallocationLogic', 'createAllocation'], [$data]]);

        }

    }


    /*
     *formatStorageData
     * 格式化入库单数据
     * @param $deliveryInfo @待出库数据
     * @param $detail @更改详情
     * @param $type @类型 1-调出仓的红字内部采购入库单  2-调入组织的内部采购入库单
     * @return string
     */
    public static function formatStorageData($deliveryInfo, $type)
    {

        $data = array();
        foreach ($deliveryInfo as $k => $value) {
            if ($type == 1) {
                $data[$k]['ORGANISATION_ID'] = $value['PRGANISATION_ID'];    //组织编码
                $data[$k]['PARTNER_ID'] = $value['purchase']['PARTNER_ID'];  //供应商编码
                $data[$k]['WAREHOUSE_ID'] = $value['ETWAREHOUSE_ID'];        //入库仓库
                $data[$k]['STORAGE_MONEY'] = ($value['insidertrad']['I_NUMBER'] * $value['insidertrad']['I_PRICE']) * -1;                                       //金额
                $data[$k]['UPDATE_TYPE'] = 1;

                $data[$k]['MONEY_ID'] = $value['purchase']['MONEY_ID'];;       //采购订单的币种
            } elseif ($type == 2) {
                $warehouseInfo = self::getWarehuseInfo($value['ATWAREHOUSE_ID']);
                $data[$k]['ORGANISATION_ID'] = $warehouseInfo['ORGANISATION_ID'];  //组织编码

                if($value['OUTBOUND_TYPE'] ==1){
                    $data[$k]['PARTNER_ID'] = $value['purchase']['PARTNER_ID'];      //内部采购订单合作伙伴
                }else{
                    $EwarehouseInfo = self::getWarehuseInfo($value['ETWAREHOUSE_ID']);
                    $data[$k]['PARTNER_ID'] = self::getPARTNER_ID($EwarehouseInfo['ORGANISATION_ID']);      //调出仓合作伙伴
                }

                $data[$k]['WAREHOUSE_ID'] = self::CallinWarehouse($warehouseInfo['ORGANISATION_ID'], $warehouseInfo['CHANNEL_ID'], $value['ATWAREHOUSE_ID']);     //调入库 在途仓
                if(!$data[$k]['WAREHOUSE_ID']){
                    throw new \Exception("数据缺失:仓库(".$warehouseInfo['WAREHOUSE_NAME_CN'].") 对应的在途仓不存在");
                }
                $data[$k]['STORAGE_MONEY'] = ($value['RECEIVE_NUMBER'] * $value['insidertrad']['I_PRICE']);     //金额
                $data[$k]['UPDATE_TYPE'] = 2;
                $data[$k]['MONEY_ID'] = $value['insidertrad']['MONEY_ID'];       //采购订单的币种
            } else {
                return self::$RESPONE->setModel(500, 0, Yii::t('inventory', 'Exception error'), []);
//                return self::$RESPONE->setModel(500, 0, '异常错误', []);
            }

            $data[$k]['PENDING_DELIVERY_ID'] = $value['PENDING_DELIVERY_ID'];
            $data[$k]['STORAGE_AT'] = $value['ACTUAL_AT'];        //入库日期
            $data[$k]['ORDER_TYPE'] = 2;       //单据类型 1.采购入库、2.内部采购入库、3.其他入库
            $data[$k]['DELETED_STATE'] = 0;
            $data[$k]['STORAGE_REMARKS'] = '';
            $data[$k]['SYSTEM_GENERATION'] = 1;
            $data[$k]['CLOSING_STATE'] = 0;     //是否关账，0：未关账 1：已关账
        }
        return $data;
    }

    /**
     * GenerateWarehouse
     * 生成采购入库单
     * @param $datas @待出库单数据
     * @param $delivery_info @待出库数据
     * @param $type @类型  1-红字  2-正常
     * @return string
     * */
    public
    static function GenerateWarehouse($datas, $delivery_info, $type)
    {
        #1.拼装数据
        $data = [];
        if (count($datas) > 0) {
            //单据
            $i = 0;
            $PENDING_DELIVERY_IDS = array();
            foreach ($datas as $is => $item) {
                $PENDING_DELIVERY_IDS[] = $delivery_info[$is]['PENDING_DELIVERY_ID'];
                //单据内容
                $data[$i] = [];
                $data[$i] = $item;
                $data[$i]['sk_storage_detail'] = [];
                $prin_num = 0;
                $data[$i]['sk_storage_detail'][0] = [];

                if ($delivery_info[$is]['OUTBOUND_TYPE'] == 2) {
                    $field = "sk_insider_trading";

                    $data[$i]['sk_storage_detail'][0]['PU_ORDER_CD'] = $delivery_info[$is]['purchase']['PU_PURCHASE_CD'];//采购订单.单号

                    $data[$i]['sk_storage_detail'][0]['PURCHASE_DETAIL_ID'] = $delivery_info[$is]['purchase']['pu_purchase_detail'][0]['PURCHASE_DETAIL_ID']; //采购明细id
                    $data[$i]['sk_storage_detail'][0]['UNIT_PRICE'] = $delivery_info[$is][$field]['I_PRICE'];           //内部交易.单价
                    $data[$i]['sk_storage_detail'][0]['NOT_TAX_UNITPRICE'] = $delivery_info[$is][$field]['I_PRICE'];           //不含税单价

                } elseif ($delivery_info[$is]['OUTBOUND_TYPE'] == 1) {
                    $field = "goods_rejected";
                    $data[$i]['sk_storage_detail'][0]['PU_ORDER_CD'] = $delivery_info[$is]['purchase']['PU_PURCHASE_CD'];                        //采购订单.单号
                    $data[$i]['sk_storage_detail'][0]['PURCHASE_DETAIL_ID'] = $delivery_info[$is]['purchase']['purchase_detail']['PURCHASE_DETAIL_ID']; //采购明细id
                    $data[$i]['sk_storage_detail'][0]['UNIT_PRICE'] = $delivery_info[$is]['purchase']['purchase_detail']['TAX_UNITPRICE'];           //采购订单.单价
                    $data[$i]['sk_storage_detail'][0]['NOT_TAX_UNITPRICE'] = $delivery_info[$is]['purchase']['purchase_detail']['NOT_TAX_AMOUNT'];           //不含税单价

                }

                //如果是红字入库单
                if($type == 1){
                    $data[$i]['sk_storage_detail'][0]['RED_STORAGE_CD'] = $delivery_info[$is]['goods_rejected']['STORAGE_CD'];
                    $data[$i]['sk_storage_detail'][0]['PU_ORDER_CD'] = $delivery_info[$is]['goods_rejected']['PU_PURCHASE_CD'];
                    $data[$i]['sk_storage_detail'][0]['PSKU_ID'] = $delivery_info[$is][$field]['sk_allocation_detail']['ATPSKU_ID'];
                    $data[$i]['sk_storage_detail'][0]['PSKU_CODE'] = $delivery_info[$is][$field]['sk_allocation_detail']['ATSKU_CODE'];           //调拨计划明细中的调出sku
                }else{
                    $data[$i]['sk_storage_detail'][0]['PSKU_ID'] = $delivery_info[$is][$field]['sk_allocation_detail']['ETPSKU_ID'];
                    $data[$i]['sk_storage_detail'][0]['PSKU_CODE'] = $delivery_info[$is][$field]['sk_allocation_detail']['ETSKU_CODE'];           //调拨计划明细中的调出sku
                }

                $skuInfo = GProductSku::find()->where(array('PSKU_ID'=>$data[$i]['sk_storage_detail'][0]['PSKU_ID']))->asArray()->one();

                $data[$i]['sk_storage_detail'][0]['PSKU_NAME_CN'] = $skuInfo['PSKU_NAME_CN'];
                $data[$i]['sk_storage_detail'][0]['UNIT_ID'] = $delivery_info[$is][$field]['sk_allocation_detail']['UNIT_ID'];            //报关单位

                $data[$i]['sk_storage_detail'][0]['STORAGE_DNUMBER'] = $type == 1 ? (-1) * $delivery_info[$is]['RECEIVE_NUMBER'] : $delivery_info[$is]['RECEIVE_NUMBER'];   //待出库.实际调拨数量

                $demoney = floatval($delivery_info[$is]['RECEIVE_NUMBER']) * floatval( $data[$i]['sk_storage_detail'][0]['UNIT_PRICE']);

                $data[$i]['sk_storage_detail'][0]['STORAGE_DMONEY'] = $type == 1 ? (-1) * $demoney : $demoney;
                $data[$i]['sk_storage_detail'][0]['NOT_TAX_AMOUNT'] = floatval($delivery_info[$is]['RECEIVE_NUMBER']) * floatval( $data[$i]['sk_storage_detail'][0]['NOT_TAX_UNITPRICE']);

                $data[$i]['sk_storage_detail'][0]['STORAGE_AT'] = $delivery_info[$is]['ACTUAL_AT'];//待出库.实际调拨日期
                $data[$i]['sk_storage_detail'][0]['SWAREHOUSE_ID'] = $item['WAREHOUSE_ID'];//
                $prin_num = $prin_num + $data[$i]['sk_storage_detail'][0]['STORAGE_DMONEY'];

                $data[$i]['STORAGE_MONEY'] = $prin_num;
                //入库单，上游单据只有采购订单
                $i++;
            }

            #2.调用入库单新增接口
            $res = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'addStorage'], [$data]]);
            #3.调用入库单编辑-审核接口
            $ShDeliveryDB = SkPendingDelivery::find()->select(['PURCHASING_WAREHOUSING_CD_RED', 'INTERNAL_PURCHASINGST_CD'])->where(array('PENDING_DELIVERY_ID' => $PENDING_DELIVERY_IDS))->asArray()->all();
            if (count($ShDeliveryDB) > 0) {
                #3-1 拼装入库单审核需要的结构
                $Storage = [];

                $mRoleUser = Yii::$app->user->getIdentity();
                $storages = array();
                foreach ($ShDeliveryDB as $a => $itm) {
                    $checkCD = $type == 1 ? $itm['PURCHASING_WAREHOUSING_CD_RED'] : $itm['INTERNAL_PURCHASINGST_CD'];
                    $storage_info = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'getStorageDelisc'], [array('STORAGE_CD' => $checkCD)]]);

                    $storage_info['ORDER_STATE'] = 2;
                    $storage_info['authFlag'] = 1;
                    $storage_info['AUTITO_ID'] = $mRoleUser->getId();      //审核人id
                    $storage_info['AUTITO_AT'] = time();
                    $storages[] = $storage_info;
                }
                $check_Arr = array('ORDER_STATE'=>2,'batchMTC'=>$storages);
                $result = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'updateCustom'], [$check_Arr]]);
                if ($result instanceof ResponeModel) {
                    throw new \Exception($result->message);
                }
            }
        }
    }

    /**
     * formatPlacingData
     * 格式化出库单数据
     * @param $deliveryInfo
     * @param $type 1-中转仓红字内部销售出库单  2-内部销售出库单
     * author Fox
     */
    public
    static function formatPlacingData($deliveryInfo, $type)
    {
        $data = array();
        foreach ($deliveryInfo as $k => $value) {
            if ($type == 1) {
                //供应商信息
                $partner_info  = Yii::$app->rpc->create('organization')->sendAndrecv([['\addons\organization\modellogic\organizLogic', 'GetORGANISATIONIEN'], [[], array('PARTNER_ID' => $value['purchase']['PARTNER_ID'])]]);
                if(!$partner_info){
                    throw new \Exception("数据缺失:采购订单(".$value['purchase']['PU_PURCHASE_CD']." 的供应商没对应组织");
                }
                //获取供应商的中转仓
                $warehouseInfo = self::findFransitWare($partner_info[0]['ORGANISATION_ID']);
                //获取调出组织
                $EwarehouseInfo = self::getWarehuseInfo($value['ETWAREHOUSE_ID']);

                $data[$k]['PPARTNER_ID'] =  static::getPARTNER_ID($EwarehouseInfo['ORGANISATION_ID']); //调出组织.合作伙伴
                $data[$k]['UPDATE_TYPE'] = 1;
                $data[$k]['PWAREHOUSE_ID'] = $warehouseInfo[0]['WAREHOUSE_ID'];
                $data[$k]['PRGANISATION_ID'] = $warehouseInfo[0]['ORGANISATION_ID'];
                $data[$k]['ORDER_TYPE'] = 2;                        //1.销售出库、2.内部销售出库、3.其他出库

            } elseif ($type == 2) {
                if($value['OUTBOUND_TYPE'] == 1){
                    //供应商信息
                    $partner_info  = Yii::$app->rpc->create('organization')->sendAndrecv([['\addons\organization\modellogic\organizLogic', 'GetORGANISATIONIEN'], [[], array('PARTNER_ID' => $value['purchase']['PARTNER_ID'])]]);
                    if(!$partner_info){
                        throw new \Exception("数据缺失:采购订单(".$value['purchase']['PU_PURCHASE_CD']." 的供应商没对应组织");
                    }
                    //获取供应商的中转仓
                    $warehouseInfo = self::findFransitWare($partner_info[0]['ORGANISATION_ID']);
                    $AwarehouseInfo = self::getWarehuseInfo($value['ATWAREHOUSE_ID']);
                    $data[$k]['PPARTNER_ID'] =  static::getPARTNER_ID($AwarehouseInfo['ORGANISATION_ID']); //调入组织.合作伙伴
                    $data[$k]['UPDATE_TYPE'] = 2;
                    $data[$k]['PWAREHOUSE_ID'] = $warehouseInfo[0]['WAREHOUSE_ID'];
                    $data[$k]['PRGANISATION_ID'] = $warehouseInfo[0]['ORGANISATION_ID'];
                }else{
                    $warehouseInfo = self::getWarehuseInfo($value['ETWAREHOUSE_ID']);
                    $AwarehouseInfo = self::getWarehuseInfo($value['ATWAREHOUSE_ID']);
                    $data[$k]['PPARTNER_ID'] = static::getPARTNER_ID($AwarehouseInfo['ORGANISATION_ID']); //调入组织.合作伙伴
                    $data[$k]['UPDATE_TYPE'] = 2;
                    $data[$k]['PWAREHOUSE_ID'] = $warehouseInfo['WAREHOUSE_ID'];
                    $data[$k]['PRGANISATION_ID'] = $warehouseInfo['ORGANISATION_ID'];
                }
                $data[$k]['ORDER_TYPE'] = 2;                        //1.销售出库、2.内部销售出库、3.其他出库
            } else {
                return self::$RESPONE->setModel(500, 0, Yii::t('inventory', 'Exception error'), []);
//                return self::setModel(500, 0, '异常错误', []);
            }

            if($value['OUTBOUND_TYPE'] == 1){
                $data[$k]['PMONEY_ID'] = $value['purchase']['MONEY_ID'];//采购订单.币种
            }elseif($value['OUTBOUND_TYPE'] == 2){
                $data[$k]['PRGANISATION_ID'] = $warehouseInfo['ORGANISATION_ID']; //组织
                $data[$k]['PMONEY_ID'] = $value['sk_insider_trading']['MONEY_ID'];  //内部交易.币种
            }

            $data[$k]['PLACING_AT'] = $value['ACTUAL_AT'];  //出库时间
            $data[$k]['PLAN_STATE'] = 1;
            $data[$k]['DELETED_STATE'] = 0;
            $data[$k]['CLOSING_STATE'] = 0;
            $data[$k]['SYSTEM_GENERATION'] = 1;
            $data[$k]['PENDING_DELIVERY_ID'] = $value['PENDING_DELIVERY_ID'];
            $data[$k]['ACTUAL_SHIPM_NUM'] = $type == 1 ? (-1) * $value['RECEIVE_NUMBER'] : $value['RECEIVE_NUMBER'];
        }

        return $data;
    }

    /**
     * SetdeliveryStorage
     * 生成内部销售出库单
     * @param $datas  组装好的出库数据
     * @param $delivery_info 待出库相关数据
     * @param $type 1-红字 2-正常
     * @return array
     * */
    public
    static function SetdeliveryStorage($datas, $delivery_info, $type)
    {
        if (count($datas) > 0) {
            #拼装数据
            $data = [];
            //内部销售订单
            $i = 0;
            $PENDING_DELIVERY_ID = array();
            foreach ($datas as $is => $item) {
                //单据内容
                $data[$i] = $item;
                $data[$i]['sk_placing_detail'] = [];
                $prin_num = 0;
                $PENDING_DELIVERY_ID[] = $delivery_info[$is]['PENDING_DELIVERY_ID'];
                $data[$i]['sk_placing_detail'][0] = [];

                if ($delivery_info[$is]['OUTBOUND_TYPE'] == 2) {
                    $field = "sk_insider_trading";

                   $data[$i]['sk_placing_detail'][0]['SALES_ORDER'] = $delivery_info[$is]['salesOrder']['SALES_ORDER_CD'];    //内部销售订单.单号
                    $data[$i]['sk_placing_detail'][0]['SALES_ORDER_DETAIL_ID'] = $delivery_info[$is]['salesOrder']['cr_sales_order_detail'][0]['SALES_ORDER_DETAIL_ID'];    //内部销售订单ID

                    $data[$i]['sk_placing_detail'][0]['UNIT_PRICE'] = $delivery_info[$is][$field]['I_PRICE'];

                    $data[$i]['sk_placing_detail'][0]['TAX_RATE'] = 0;

                } elseif ($delivery_info[$is]['OUTBOUND_TYPE'] == 1) {
                    $field = "goods_rejected";
                    if($type==1){

                        $data[$i]['sk_placing_detail'][0]['SALES_ORDER'] = $delivery_info[$is]['purchase']['purchase_detail']['PU_PURCHASE_CD'];    //内部销售订单.单号

                    }else{

                        $data[$i]['sk_placing_detail'][0]['SALES_ORDER'] = $delivery_info[$is]['salesOrder']['SALES_ORDER_CD'];    //内部销售订单.单号
                        $data[$i]['sk_placing_detail'][0]['SALES_ORDER_DETAIL_ID'] = $delivery_info[$is]['salesOrder']['cr_sales_order_detail'][0]['SALES_ORDER_DETAIL_ID'];    //内部销售订单ID

                    }
                    $data[$i]['sk_placing_detail'][0]['UNIT_PRICE'] = $delivery_info[$is]['purchase']['purchase_detail']['TAX_UNITPRICE'];      //内部销售订单.含税单价

                }

                //如果是红字出库单
                if($type == 1){
                    $dis_condition['INTERNAL_PURCHASINGST_CD'] = $delivery_info[$is]['goods_rejected']['STORAGE_CD'];
                    $dis_condition['INTERNAL_PURCHASING_CD'] = $delivery_info[$is]['goods_rejected']['PU_PURCHASE_CD'];
                    //获取发运单信息
                    $dispatch = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\shipment\modellogic\dispatchLogic', 'search_dispatch_one'], [$dis_condition]]);

                    $data[$i]['sk_placing_detail'][0]['RED_PLACING_CD'] = $dispatch['INTERNAL_SALESTH_CD'];
                    $data[$i]['sk_placing_detail'][0]['RED_PLACING_DETAIL_ID'] = $dispatch['INTERNAL_SALESTH_ID'];
                }

                $data[$i]['sk_placing_detail'][0]['PDNUMBER'] = $type == 1 ? (-1) * $delivery_info[$is]['RECEIVE_NUMBER'] : $delivery_info[$is]['RECEIVE_NUMBER'] ;    //内部销售订单.数量

                $data[$i]['sk_placing_detail'][0]['PSKU_ID'] = $delivery_info[$is][$field]['sk_allocation_detail']['ATPSKU_ID'];          //内部采购订单.SKU
                $data[$i]['sk_placing_detail'][0]['PDSKU_CODE'] = $delivery_info[$is][$field]['sk_allocation_detail']['ATSKU_CODE'];         //内部采购订单.SKU
                $data[$i]['sk_placing_detail'][0]['PRODUCT_DE'] = $delivery_info[$i][$field]['PSKU_NAME_CN'];                                //内部交易.产品名称
                $data[$i]['sk_placing_detail'][0]['UNIT_ID'] = $delivery_info[$is][$field]['sk_allocation_detail']['UNIT_ID'];

                $pdmoney = floatval($data[$i]['sk_placing_detail'][0]['UNIT_PRICE']) *  $data[$i]['sk_placing_detail'][0]['PDNUMBER']; //价税合计

                $data[$i]['sk_placing_detail'][0]['PDMONEY'] = $type == 1 ? (-1) * $pdmoney : $pdmoney;
                $data[$i]['sk_placing_detail'][0]['PDWAREHOUSE_ID'] = $data[$i]['PWAREHOUSE_ID'];

                /*
                if($type == 1){
                    $data[$i]['sk_placing_detail'][0]['PDWAREHOUSE_CODE'] = static::getContinental(1, [$delivery_info[$is]['purchase']['ORGANISATION_CODE'], $delivery_info[$is]['purchase']['CHANNEL_CODE']]); //获取大陆中转仓
                }else{
                    $data[$i]['sk_placing_detail'][0]['PDWAREHOUSE_CODE'] = $delivery_info[$is]['purchase']['PWAREHOUSE_CODE'];
                }
                */

                $prin_num = $prin_num + $data[$i]['sk_placing_detail'][0]['PDMONEY'];

                $data[$i]['PMONEY'] = $prin_num;
                $i++;
            }

            #2.调用内部销售出库新增接口
            $res = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\placingLogic', 'addPlacing'], [$data]]);

            #3.调用内部销售出库编辑-审核接口
            $ShDeliveryDB = SkPendingDelivery::find()->select(['PURCHASING_WAREHOUSING_CD_RED', 'INTERNAL_SALESTH_CD_RED', 'INTERNAL_SALESTH_CD', 'PRGANISATION_ID'])->where(array('PENDING_DELIVERY_ID' => $PENDING_DELIVERY_ID))->asArray()->all();

            if (count($ShDeliveryDB) > 0) {
                $mRoleUser = Yii::$app->user->getIdentity();
                #3-1 拼装内部销售出库审核需要的结构
                foreach ($ShDeliveryDB as $a => $itm) {
                    $checkCD = $type == 1 ? $itm['INTERNAL_SALESTH_CD_RED'] : $itm['INTERNAL_SALESTH_CD'];
                    $placing_info = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\placingLogic', 'getSkPlacing'], ['', array('PLACING_CD' => $checkCD)]]);

                    $placing_info[0]['PLAN_STATE'] = 2;
                    $placing_info[0]['authFlag'] = 1;
                    $placing_info[0]['AUTITO_ID'] = $mRoleUser->getId();      //审核人id
                    $placing_info[0]['AUTITO_AT'] = time();
                    Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\placingLogic', 'SetPlacing'], [$placing_info]]);
                }
            }
        }
    }


    /**
     * 格式化内部销售订单数据
     * @param $delivery_info 待出库相关数据
     * @param $type 1-退货出库-代采组织内部销售订单  2-内部交易出库-内部销售订单
     */
    public static function formatSalesOrder($delivery_info, $type)
    {
        $data = array();
        foreach ($delivery_info as $k => $value) {
            if ($type == 1) {
                //供应商信息
                $partner_info  = Yii::$app->rpc->create('organization')->sendAndrecv([['\addons\organization\modellogic\organizLogic', 'GetORGANISATIONIEN'], [[], array('PARTNER_ID' => $value['purchase']['PARTNER_ID'])]]);
                if(!$partner_info){
                    throw new \Exception("数据缺失:采购订单(".$value['purchase']['PU_PURCHASE_CD']." 的供应商没对应组织");
                }

                $data[$k]['CRGANISATION_ID'] = $partner_info[0]['ORGANISATION_ID'];
                $data[$k]['MONEY_ID'] = $value['purchase']['MONEY_ID'];   //币种

            } elseif ($type == 2) {
                $EwarehouseInfo = self::getWarehuseInfo($value['ETWAREHOUSE_ID']);
                $data[$k]['CRGANISATION_ID'] = $EwarehouseInfo['WAREHOUSE_ID'];
                $data[$k]['CHANNEL_ID'] = $EwarehouseInfo['CHANNEL_ID'];

                if($value['OUTBOUND_TYPE'] == 1){
                    $data[$k]['MONEY_ID'] = $value['purchase']['MONEY_ID'];
                }elseif($value['OUTBOUND_TYPE'] == 2){
                    $data[$k]['MONEY_ID'] = $value['sk_insider_trading']['MONEY_ID'];
                }
            }

            $AwarehouseInfo = self::getWarehuseInfo($value['ATWAREHOUSE_ID']);

            $data[$k]['PARTNER_ID'] = static::getPARTNER_ID($AwarehouseInfo['ORGANISATION_ID']); //客户 发运单需求组织对应绑定的业务伙伴\
            $data[$k]['ORDER_TYPE'] = 1;                        //单据类型1.内部销售订单
            $data[$k]['STORAGE_AT'] = $value['ACTUAL_AT'];      //下单时间 待出库.实际调拨时间
            $data[$k]['ORDER_STATE'] = 1;                       //审核状态,1：未审核 2：已审核
            $data[$k]['SYSTEM_GENERATION'] = 1;                 //是否系统生成,0:否 1：是
            $data[$k]['PENDING_DELIVERY_ID'] = $value['PENDING_DELIVERY_ID'];
            $data[$k]['PRE_ORDER_AT'] = time();
        }
        return $data;
    }

    /**
     * SetSalesOrder
     * 生成内部销售订单
     * @param $datas
     * @return array
     * */
    public
    static function SetSalesOrder($datas, $delivery_info)
    {
        if (count($datas) > 0) {
            #拼装数据
            $data = [];
            //内部销售订单
            $i = 0;
            $PENDING_DELIVERY_IDS = array();
            foreach ($datas as $is => $item) {
                $PENDING_DELIVERY_IDS[] = $delivery_info[$is]['PENDING_DELIVERY_ID'];
                //单据内容
                $data[$i] = $item;
                $data[$i]['cr_sales_order_detail'] = [];
                $prin_num = 0;

                $data[$i]['cr_sales_order_detail'][0] = [];

                if ($delivery_info[$is]['OUTBOUND_TYPE'] == 2) {
                    $field = "sk_insider_trading";
                    $data[$i]['cr_sales_order_detail'][0]['TAX_UNITPRICE'] = $delivery_info[$is][$field]['I_PRICE'];
                    $data[$i]['cr_sales_order_detail'][0]['PURCHASE'] = $delivery_info[$is][$field]['I_NUMBER'];        //内部交易.数量
                    $data[$i]['cr_sales_order_detail'][0]['NOT_TAX_UNITPRICE'] = $delivery_info[$is][$field]['I_PRICE'];;        //内部交易.单价
                    $data[$i]['cr_sales_order_detail'][0]['TAX_RATE'] = 0;
                    $data[$i]['cr_sales_order_detail'][0]['PSKU_NAME_CN'] = $delivery_info[$i][$field]['PSKU_NAME_CN'];     //内部交易.产品名称

                } elseif ($delivery_info[$is]['OUTBOUND_TYPE'] == 1) {
                    $field = "goods_rejected";
                    $data[$i]['cr_sales_order_detail'][0]['TAX_UNITPRICE'] = $delivery_info[$is][$field]['sk_allocation_detail']['UNIT_PRICE'];
                    $data[$i]['cr_sales_order_detail'][0]['PURCHASE'] = $delivery_info[$is]['RECEIVE_NUMBER'];//待出库.实际调拨数量
                    $data[$i]['cr_sales_order_detail'][0]['NOT_TAX_UNITPRICE'] = 0;      //采购订单不含税单价
                    $data[$i]['cr_sales_order_detail'][0]['TAX_RATE'] = 0;
                }

                $data[$i]['cr_sales_order_detail'][0]['PSKU_ID'] = $delivery_info[$is][$field]['sk_allocation_detail']['ATPSKU_ID'];
                $data[$i]['cr_sales_order_detail'][0]['UNIT_ID'] = $delivery_info[$is][$field]['sk_allocation_detail']['UNIT_ID'];
                $data[$i]['cr_sales_order_detail'][0]['TOTAL_TAX_AMOUNT'] = floatval($data[$i]['cr_sales_order_detail'][0]['TAX_UNITPRICE']) * $data[$i]['cr_sales_order_detail'][0]['PURCHASE'];//价税合计
                $data[$i]['cr_sales_order_detail'][0]['NOT_TAX_AMOUNT'] = floatval($data[$i]['cr_sales_order_detail'][0]['NOT_TAX_UNITPRICE']) * $data[$i]['cr_sales_order_detail'][0]['PURCHASE']; //不含税金额

                $prin_num = $prin_num + $data[$i]['cr_sales_order_detail'][0]['TOTAL_TAX_AMOUNT'];

                $data[$i]['TOTAL_AMOUNT'] = $prin_num;
                $data[$i]['PENDING_DELIVERY_ID'] = $delivery_info[$is]['PENDING_DELIVERY_ID'];
                $i++;
            }

            #2.调用销售订单新增接口
            $res = Yii::$app->rpc->create('sales')->sendAndrecv([['\addons\sales\modellogic\salesorderLogic', 'addSalesOrderReturn'], [$data]]);

            #3.调用销售订单编辑-审核接口
            $ShDeliveryDB = SkPendingDelivery::find()->select(['INTERNAL_SALES_CD'])->where(array('PENDING_DELIVERY_ID' => $PENDING_DELIVERY_IDS))->asArray()->all();

            $sales_order = array();
            if (count($ShDeliveryDB) > 0) {
                #3-1 拼装销售订单审核需要的结构
                $Storage = [];
                $mRoleUser = Yii::$app->user->getIdentity();
                foreach ($ShDeliveryDB as $a => $itm) {
                    $sales_order = Yii::$app->rpc->create('sales')->sendAndrecv([['\addons\sales\modellogic\salesorderLogic', 'getSalesOrder'], [[], array('SALES_ORDER_CD' => $itm['INTERNAL_SALES_CD'])]]);
                    $sales_order[0]['ORDER_STATE'] = 2;
                    $sales_order[0]['authFlag'] = 1;
                    $sales_order[0]['SYSTEM_GENERATION'] = 1;
                    $sales_order[0]['AUTITO_ID'] = $mRoleUser->getId();      //审核人id
                    $sales_order[0]['AUTITO_AT'] = time();
                    Yii::$app->rpc->create('sales')->sendAndrecv([['\addons\sales\modellogic\salesorderLogic', 'StorageAuditing'], [$sales_order]]);
                }
            }

            return $res;
        }
    }

    /**
     * formatPurchaseOrder
     * 格式化采购订单数据
     * @param $delivery_info
     * @param $type 1-退货出库--调入组织内部采购订单  2-内部交易出库--调入组织内部采购订单
     * author Fox
     */
    public
    static function formatPurchaseOrder($delivery_info, $type)
    {

        $data = array();

        foreach ($delivery_info as $k => $value) {
            if ($type == 1) {
                $data[$k]['PARTNER_ID'] = $value['purchase']['PARTNER_ID'];                //供应商编码
            } elseif ($type == 2) {
                $data[$k]['PARTNER_ID'] = self::getPARTNER_ID($value['PRGANISATION_ID']); //供应商编码
            }

            //退货确认信息
            $return_info = SkGoodsRejected::find()->where(array('GOODS_REJECTED_ID' => $value['GOODS_REJECTED_ID']))->asArray()->one();
            //退货采购订单表
            $return_purchase = PuPurchase::find()->where(array('PU_PURCHASE_CD' => $return_info['PU_PURCHASE_CD']))->asArray()->one();

            $ATwarehouseInfo = self::getWarehuseInfo($value['ATWAREHOUSE_ID']);
            $data[$k]['ORGANISATION_ID'] = $ATwarehouseInfo['ORGANISATION_ID'];        //采购组织
            $data[$k]['CHANNEL_ID'] = $ATwarehouseInfo['CHANNEL_ID'];         //平台
            $data[$k]['ORDER_TYPE'] = 2;                //订单类型 1-采购订单 2-内部采购订单
            $data[$k]['DELETED_STATE'] = 0;             //是否删除 1-删除 0-未深处
            $data[$k]['ORDER_REMARKS'] = ''; //备注
            $data[$k]['CLOSING_STATE'] = 0;             //是否关帐 0-未关帐 1-已关帐
            $data[$k]['ORDER_STATE'] = 1;              //状态 1-未审核 2-已审核
            $data[$k]['SYSTEM_GENERATION'] = 1;         //是否系统生成 0-否  1-是
            $data[$k]['PENDING_DELIVERY_ID'] = $value['PENDING_DELIVERY_ID'];
            $data[$k]['DORGANISATION_ID'] = $ATwarehouseInfo['ORGANISATION_ID'];     //需求组织
            $data[$k]['PRE_ORDER_AT'] = $value['ACTUAL_AT'];

            if ($type == 1) {
                $data[$k]['MONEY_ID'] = $return_purchase['MONEY_ID'];            //币种
                $data[$k]['SMETHOD'] = $return_purchase['SMETHOD'];                  //结算方式
            } elseif ($type == 2) {
                $data[$k]['MONEY_ID'] = $value['sk_insider_trading']['MONEY_ID'];               //币种
                //获取伙伴的结算方式
                $parner_info =  PaPartner::find()->where(array('PARTNER_ID'=> $data[$k]['PARTNER_ID']))->asArray()->one();
                    if(!isset($parner_info['SMETHOD'])){
                    throw new \Exception("数据缺失:合作伙伴缺少结算方式，请先补全数据");
                }
                $data[$k]['SMETHOD'] = $parner_info['SMETHOD'];                  //结算方式
            }
        }
        return $data;
    }

    /*
     *SetPurchaseOrder
     *生成采购订单
     * @param $datas --组合好的数据
     * @param $delivery_info  --待出库数据信息
     */
    public
    static function SetPurchaseOrder($datas, $delivery_info)
    {
        if (count($datas) > 0) {
            #拼装数据
            $data = [];
            //内部销售订单
            $i = 0;
            $PENDING_DELIVERY_IDS = array();
            foreach ($datas as $is => $item) {
                $PENDING_DELIVERY_IDS[] = $delivery_info[$is]['PENDING_DELIVERY_ID'];
                //单据内容
                $data[$i] = $item;
                $data[$i]['pu_purchase_detail'] = [];
                $prin_num = 0;
                $data[$i]['pu_purchase_detail'][0] = [];

                if ($delivery_info[$is]['OUTBOUND_TYPE'] == 2) {
                    $field = "sk_insider_trading";

                    $data[$i]['pu_purchase_detail'][0]['TAX_UNITPRICE'] = $delivery_info[$is][$field]['I_PRICE'];        //采购订单.含税单价

                    $data[$i]['pu_purchase_detail'][0]['NOT_TAX_UNITPRICE'] = $data[$i]['pu_purchase_detail'][0]['TAX_UNITPRICE'];     //采购订单不含税单价
                    $data[$i]['pu_purchase_detail'][0]['TAX_RATE'] = 0;


                } elseif ($delivery_info[$is]['OUTBOUND_TYPE'] == 1) {
                    $field = "goods_rejected";
                    $data[$i]['pu_purchase_detail'][0]['TAX_UNITPRICE'] = $delivery_info[$is]['purchase']['purchase_detail']['TAX_UNITPRICE'];        //采购订单.含税单价

                    $data[$i]['pu_purchase_detail'][0]['NOT_TAX_UNITPRICE'] = $delivery_info[$is]['purchase']['purchase_detail']['NOT_TAX_UNITPRICE'];      //采购订单不含税单价
                    $data[$i]['pu_purchase_detail'][0]['TAX_RATE'] = 0;
                }

                $data[$i]['pu_purchase_detail'][0]['PSKU_ID'] = $delivery_info[$is][$field]['sk_allocation_detail']['ETPSKU_ID'];          //内部交易.sku
                $data[$i]['pu_purchase_detail'][0]['PSKU_CODE'] = $delivery_info[$is][$field]['sk_allocation_detail']['ETSKU_CODE'];          //内部交易.sku

                $skuInfo = GProductSku::find()->where(array('PSKU_ID'=>$data[$i]['pu_purchase_detail'][0]['PSKU_ID']))->asArray()->one();

                $data[$i]['pu_purchase_detail'][0]['PSKU_NAME_CN'] = $skuInfo['PSKU_NAME_CN'];   //调入SKU.中文名字

                $data[$i]['pu_purchase_detail'][0]['PURCHASE'] = $delivery_info[$is]['RECEIVE_NUMBER'];//待出库.实际调拨数量

                $data[$i]['pu_purchase_detail'][0]['UNIT_ID'] = $delivery_info[$is][$field]['sk_allocation_detail']['UNIT_ID']; //发运单.报关单位

                $data[$i]['pu_purchase_detail'][0]['NOT_TAX_AMOUNT'] = floatval($data[$i]['pu_purchase_detail'][0]['NOT_TAX_UNITPRICE']) *  $data[$i]['pu_purchase_detail'][0]['PURCHASE']; //不含税金额

                $data[$i]['pu_purchase_detail'][0]['TOTAL_TAX_AMOUNT'] = floatval($data[$i]['pu_purchase_detail'][0]['TAX_UNITPRICE']) *  $data[$i]['pu_purchase_detail'][0]['PURCHASE'];                     //价税合计

                $prin_num = $prin_num + $data[$i]['pu_purchase_detail'][0]['TOTAL_TAX_AMOUNT'];

                $data[$i]['ORDER_AMOUNT'] = $prin_num;
                $i++;
            }

            #2.调用采购订单新增接口
            $result = Yii::$app->rpc->create('sales')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'addPurchaseReturn'], [$data]]);

            #3-1 拼装销售订单审核需要的结构
            $mRoleUser = Yii::$app->user->getIdentity();

            $result['ORDER_STATE'] = 2;
            $result['authFlag'] = 1;
            $result['AUTITO_ID'] = $mRoleUser->getId();
            $result['AUTITO_AT'] = time();

            Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'SetPurchase'], [[$result]]]);
            $detail =  $result['pu_purchase_detail'][0];
            $result['purchase_detail'] = $detail;
            return  $result;
        }
    }

    /**
     * addPendDelivery
     * 生出待出库单
     * @param $data
     */
    public static function createPendDelivery($data)
    {
        foreach ($data as $dispatchModel) {
            $post = Yii::$app->getRequest()->getBodyParams();
            Yii::$app->getRequest()->setBodyParams($dispatchModel);
            $result = CreateExt::actionDo(new SkPendingDelivery(), $dispatchModel);
            Yii::$app->getRequest()->setBodyParams($post);
            if ($result instanceof ResponeModel) {
                return $result;
            }
        }
    }

    /**
     * 生成待入库订单
     */
    public static function createPendingStorage($delivery_info)
    {

        $delivery_info_data = array();

        foreach ($delivery_info as $value) {
            $delivery_info_data[$value['ALLOCATION_ID']] = $value;
        }

        $ALLOCATION_IDS = array_column($delivery_info, 'ALLOCATION_ID');
        $ALLOCATIONS = SkAllocation::findAll(array('ALLOCATION_ID' => $ALLOCATION_IDS));
        $allocation_data = array();
        foreach ($ALLOCATIONS as $row) {
            $allocation_data[$row['ALLOCATION_ID']] = $row;
        }


        $data = array();
        foreach ($delivery_info as &$value) {
            $DETAILS = SkAllocationDetail::findOne(array('ALLOCATION_DETAIL_ID' => $value['ALLOCATION_DETAIL_ID']));

            if (!$DETAILS) {
                throw new \Exception("数据缺失:缺少对应的调拨计划明细数据");
            }

            $row = array();
            $row['PRGANISATION_ID'] = $allocation_data[$DETAILS['ALLOCATION_ID']]['ARGANISATION_ID']; //组织 调拨计划.调入组织
            $row['NOTE_ID'] = $DETAILS['ALLOCATION_ID'];
            $row['IMPORT_STATE'] = 2;           //数据来源 1-发运单 2-调拨计划单
            $row['PLAN_AT'] = $allocation_data[$DETAILS['ALLOCATION_ID']]['ESTIMATEDA_AT'];      //预计收货日期 调拨计划.预计调入时间
            $row['PSKU_ID'] = $DETAILS['ETPSKU_ID'];             //SKU ID
            $row['PSKU_CODE'] = $DETAILS['ETSKU_CODE'];             //SKU编码
            $row['TDRODUCT_DE'] = $DETAILS['TDRODUCT_DE'];           //sku产品描述
            $row['SHIPMENT_NUMBER'] = $value['RECEIVE_NUMBER'];     //发运数量 待出库.实际调拨数量

            $Atwarehouse_info = self::getWarehuseInfo($value['ATWAREHOUSE_ID']);
            $row['ATWAREHOUSE_ID'] =  $delivery_info_data[$DETAILS['ALLOCATION_ID']]['ATWAREHOUSE_ID'];      //调入仓库

            $row['ETWAREHOUSE_ID'] = self::CallinWarehouse($Atwarehouse_info['ORGANISATION_ID'], $Atwarehouse_info['CHANNEL_ID'], $Atwarehouse_info['WAREHOUSE_ID']); //调入仓库对应的在途仓

            $row['PLAN_STATE'] = 0;             //状态 0未收货，1正在收货，2,已收货
            $row['SYSTEM_GENERATION'] = 1;      //是否系统生成  0-否 1-是

            $result = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PendstorageLogic', 'addPendingStorageReturn'], [$row]]);
            $value['PENDING_STORAGE_ID'] = $result['PENDING_STORAGE_ID'];
        }
        return $delivery_info;
    }

    /**
     * 获取仓库信息
     */
    public static function getWarehuseInfo($id)
    {
        $condition['WAREHOUSE_ID'] = $id;
        return BWarehouse::find()->where($condition)->asArray()->One();
    }

    /**
     *
     * CallinWarehouse
     * 调入仓库
     * 目的仓是类型2的，找3；目的仓是类型5，找6 条件是 需求组织/平台
     * @param $wa1 @需求组织
     * @param $wa2 @平台
     * @param $wa3 @目的仓
     * @return string
     * */
    public
    static function CallinWarehouse($wa1, $wa2, $wa3)
    {
        #1查询目的仓分类
        $WAREHOUSE_TYPE = BWarehouse::findOne(array('WAREHOUSE_ID' => $wa3));
        if ($WAREHOUSE_TYPE['WAREHOUSE_TYPE_ID'] == '4' || $WAREHOUSE_TYPE['WAREHOUSE_TYPE_ID'] == '7') {
            return $wa3;
        }
        if($WAREHOUSE_TYPE['WAREHOUSE_TYPE_ID'] == 1){
            throw new \Exception("数据有误:调出仓没有中转仓");
        }
        #查询对应类型的条件的仓库编码
          if ($WAREHOUSE_TYPE['WAREHOUSE_TYPE_ID'] == '2') {
            $WAREHOUSE_ID = static::getContinental(4, [$wa1, $wa2]);
        }
        if ($WAREHOUSE_TYPE['WAREHOUSE_TYPE_ID'] == '5') {
            $WAREHOUSE_ID = static::getContinental(7, [$wa1, $wa2]);
        }
        if($WAREHOUSE_TYPE['WAREHOUSE_TYPE_ID'] == '8'){
            $WAREHOUSE_ID = static::getContinental(9, [$wa1, $wa2]);
        }
        return $WAREHOUSE_ID;
    }

    /**
     * getContinental
     * 获取大陆中转仓
     * @access public
     * @param $code @仓库类型
     * @param $item @条件1 采购组织，2 平台
     * @return string
     * */
    public static function getContinental($code, $item)
    {
        $o_client = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\warehouseLogic', 'getBWarehouse'], [array('WAREHOUSE_TYPE_ID' => $code), ['ORGANISATION_ID', 'CHANNEL_ID', 'WAREHOUSE_ID']]]);
        $warehouse = $o_client->recv(); //所有分类是大陆中转仓的仓库
        $where = [$warehouse, $item, ['ORGANISATION_ID', 'CHANNEL_ID'], 'WAREHOUSE_ID'];
        $result = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getorganization_list'], $where]);
        return $result;
    }

    /*
     * 查找组织的中转仓
     */
    public static function findFransitWare($ORGANISATION_ID){
        $o_client = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\warehouseLogic', 'getBWarehouse'], [array('WAREHOUSE_TYPE_ID' => 1,'ORGANISATION_ID'=>$ORGANISATION_ID), ['ORGANISATION_ID', 'CHANNEL_ID','WAREHOUSE_ID','WAREHOUSE_CODE']]]);
        $warehouse = $o_client->recv(); //所有分类是大陆中转仓的仓库
        return $warehouse;
    }

    /**
     * getPARTNER_ID
     * 根据组织获取伙伴编码
     * @param $ORGANISATION_ID
     * @return string
     * */
    public
    static function getPARTNER_ID($ORGANISATION_ID)
    {
        $ORGANISATIONDB = Yii::$app->rpc->create('organization')->sendAndrecv([['\addons\organization\modellogic\organizLogic', 'GetORGANISATIONIEN'], [['PARTNER_ID'], array('ORGANISATION_ID' => $ORGANISATION_ID)]]);

        if (!isset($ORGANISATIONDB[0]['PARTNER_ID'])) {
            throw new \Exception("数据有误:组织对应的合作伙伴数据缺失");
        }

        return isset($ORGANISATIONDB[0]['PARTNER_ID']) ? $ORGANISATIONDB[0]['PARTNER_ID'] : '';
    }

    /**
     * updatePenddelivery
     * 反写待出库编辑
     * @param $str array @修改值
     * @param $where array @修改条件
     * */
    public static function updatePenddelivery($data)
    {
        $dispatchModel = array("batch" => $data);
        $post = Yii::$app->getRequest()->getBodyParams();
        Yii::$app->getRequest()->setBodyParams($dispatchModel);
        $result = UpdateExt::actionDo(new SkPendingDelivery(), $dispatchModel);
        Yii::$app->getRequest()->setBodyParams($post);
        if ($result instanceof ResponeModel) {
            return $result;
        }
    }

    /**
     * 编辑待出库信息
     */
    public static function updateAllPenddelivery($set, $where)
    {
        return SkPendingDelivery::updateAll($set, $where);
    }
}