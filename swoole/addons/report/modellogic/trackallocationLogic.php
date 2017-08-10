<?php
namespace addons\report\modellogic;

use yii\db\Expression;
use yii\swoole\db\Query;
use Yii;
use yii\web\ServerErrorHttpException;
use yii\swoole\rest\ResponeModel;
use yii\swoole\db\DBHelper;

/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/6/20 0020
 * Time: 11:54
 */
class trackallocationLogic
{

    //追溯发运跟踪自定义index()
    public static function indexCustom($post)
    {
        $result = self::concatIndexWhere($post);

        //分页
        $limit = array_key_exists('limit', $post) && $post['limit'] ? $post['limit'] : "20";
        $page = array_key_exists('page', $post) && $post['page'] ? $post['page'] : "1";
        list($total, $data) = DBHelper::SearchList($result, ['limit' => $limit], $page - 1);
        $res = new ResponeModel();
        return $res->setModel('200', 0, Yii::t('report', 'Successful operation!'), $data, ['totalCount' => $total]);
    }

    //拼接自定义index()过滤条件
    public static function concatIndexWhere($post)
    {
        //产品SKU
        $sku = array_key_exists('sku', $post) && $post['sku'] ? $post['sku'] : "";
        if ($sku == "") {
            throw new ServerErrorHttpException(Yii::t('report', "No SKU!"));
        }
        $result = self::getTrackAllocation($sku);
        //组织
        $organisation = array_key_exists('organisation', $post) && $post['organisation'] ? $post['organisation'] : "";
        if ($organisation == "") {
            throw new ServerErrorHttpException(Yii::t('report', "No organization!"));
        }
        $result = $result->andWhere(['t.ORGANISATION_ID' => $organisation]);
        //运输方式
        $transportMode = array_key_exists('transportMode', $post) && $post['transportMode'] ? $post['transportMode'] : "";
        if ($transportMode == "") {
            throw new ServerErrorHttpException(Yii::t('report', "No type of shipping!"));
        }
        $result = $result->andWhere(['t.TRANSPORT_MODE' => $transportMode]);
        //仓库类型
        $inWarehouseType = array_key_exists('inWarehouseType', $post) && $post['inWarehouseType'] ? $post['inWarehouseType'] : "";
        if ($inWarehouseType == "") {
            throw new ServerErrorHttpException(Yii::t('report', "No warehouse tpye!"));
        }
        $result = $result->andWhere(['t.IN_WAREHOUSE_TYPE' => $inWarehouseType]);

        return $result;
    }

    /**
     * getTrackAllocation
     * 追溯发运跟踪
     * @param $PSKU_ID @产品SKU
     * @throws
     * @return array
     * TRANSPORT_MODE 类型
     * NUMBERCD 空海次数/调拨发运单
     * DISPATCH_TIME 发运日期
     * EXPECTED_ARRIVED_TIME 预计到达日期
     * OUT_WAREHOUSE 发货仓库
     * IN_WAREHOUSE 目的仓库
     * IN_WAREHOUSE_TYPE 目的仓库(调入仓库)类型
     * SHIPMENT_NUMBER 实际发运数量
     * ARECIPIENT_NUM 已收货数量
     * ADJUSTMENT_NUMBER 调整数量
     * PSKU_CODE 产品SKU
     *
     * */
    public static function getTrackAllocation($PSKU_ID)
    {
        $trackingDetail = self::getTracking();
        $allocationDetail = self::getAllocation();
        //联表
        $unionAll = $trackingDetail->union($allocationDetail, true);
        return (new Query())->from(['t' => $unionAll])->andWhere(['t.PSKU_ID' => $PSKU_ID]);
    }

    /**
     * getAllocation
     * 追溯发运跟踪
     * @throws
     * @return array
     * */
    public static function getAllocation()
    {
        //调拨
        $allocationDetail = (new Query())->from('sh_allocation_detail shad')
            ->select(new Expression("sha.AORGANISATION_ID AS ORGANISATION_ID,
                6 AS TRANSPORT_MODE,
                ska.ALLOCATION_CD AS NUMBERCD,
                sha.ESTIMATE_CALLOUT_AT AS DISPATCH_TIME,
                sha.ESTIMATE_TRANSFER_AT AS EXPECTED_ARRIVED_TIME,
                sha.OUT_WAREHOUSE_ID,
                sha.IN_WAREHOUSE_ID,
                bw.WAREHOUSE_TYPE_ID AS IN_WAREHOUSE_TYPE,
                shad.SHIPMENT_NUMBER,
                shad.ARECIPIENT_NUM,
                shad.ADJUSTMENT_NUMBER,
                shad.PSKU_ID"))
            ->leftJoin('sh_allocation sha', 'sha.ALLOCATION_ID = shad.ALLOCATION_ID')
            ->leftJoin('sk_allocation_detail skad', 'skad.ALLOCATION_DETAIL_ID = shad.SALLOCATION_DETAIL_ID')
            ->leftJoin('sk_allocation ska', 'ska.ALLOCATION_ID = skad.ALLOCATION_ID')
            ->leftJoin('b_warehouse bw', 'bw.WAREHOUSE_ID = sha.IN_WAREHOUSE_ID')
            ->leftJoin('b_channel bc', 'bc.CHANNEL_ID = bw.CHANNEL_ID')
            ->where(['and', ['=', 'ska.ALLOCATION_STATE', 2], ['<>', 'skad.ALLOCATIONS_STATE', 0], ['>', '(shad.SHIPMENT_NUMBER - shad.ARECIPIENT_NUM - shad.ADJUSTMENT_NUMBER)', 0], ['=', 'bc.PLATFORM_TYPE_ID', '2']]);
        return $allocationDetail;
    }

    public static function getTracking()
    {
        //发运
        $trackingDetail = (new Query())->from('sh_tracking_detail stdl')
            ->select("sdn.ORGANISATION_ID,
                st.TRANSPORT_MODE,
                sdn.KUKAI_NUMBER AS NUMBERCD,
                st.ACTUAL_SHIPM_AT AS DISPATCH_TIME,
                st.EXPECTED_SERVICE_AT AS EXPECTED_ARRIVED_TIME,
                sdn.DELIVER_WARID AS OUT_WAREHOUSE_ID,
                sdn.WAREHOUSE_ID AS IN_WAREHOUSE_ID,
                bw.WAREHOUSE_TYPE_ID AS IN_WAREHOUSE_TYPE,
                stdl.SHIPMENT_NUMBER,
                stdl.ARECIPIENT_NUM,
                stdl.ADJUSTMENT_NUMBER,
                stdl.PSKU_ID")
            ->leftJoin('sh_tracking st', 'st.TRACKING_ID = stdl.TRACKING_ID')
            ->leftJoin('sh_dispatch_note sdn', 'sdn.DISPATCH_NOTE_ID = stdl.DISPATCH_NOTE_ID')
            ->leftJoin('b_warehouse bw', 'bw.WAREHOUSE_ID = sdn.WAREHOUSE_ID')
            ->leftJoin('b_channel bc', 'bc.CHANNEL_ID = bw.CHANNEL_ID')
            ->where(['and', ['=', 'sdn.PLAN_STATE', 2], ['>', '(sdn.ACTUAL_SHIPM_NUM - stdl.ARECIPIENT_NUM - stdl.ADJUSTMENT_NUMBER)', 0], ['=', 'bc.PLATFORM_TYPE_ID', '2']]);
        return $trackingDetail;
    }

    /**
     * SalesVolumeAnalysis
     * 库存销量分析表
     * @param $post ['organization'] @组织编码 - 需求组织(库存职能类型)
     * @param $post ['small_type'] @小分类ID
     * @param $post ['sku'] @SKU编码
     * @param $page
     * @throws
     * @return array
     * */
    public static function SalesVolumeAnalysis($post, $page)
    {
        if (isset($post['organization']) || isset($post['small_type']) || isset($post['sku'])) {

            //权限
            // $organization = Yii::$app->session->get('organization');
            $organization = [];
            $sku_list = (new Query())->from('g_product_sku');
            #1.根据检索条件 找出对应的SKU
            if (count($post['organization']) > 0) {
                $sku_list->andWhere(['ORGAN_ID_DEMAND' => $post['organization']]);
            }
            if (count($post['sku']) > 0) {
                $sku_list->andWhere(['PSKU_ID' => $post['sku']]);
            }
            if (count($post['small_type']) > 0) {
                foreach ($post['small_type'] as $i => $item) {
                    $sku_list->andWhere(new Expression("FIND_IN_SET(:{$i},PRODUCT_TYPE_PATH)", [":{$i}" => $item]));
                }
            }

            //权限
            $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
            if ($str) {
                $sku_list->andWhere(['ORGAN_ID_DEMAND' => Yii::$app->session->get('organization') ?: null]);
                $sku_list->andWhere(['PSKU_ID' => Yii::$app->session->get('product_id') ?: null]);
            }


            $limit = array_key_exists('limit', $post) && $post['limit'] ? $post['limit'] : "20";
            $page = $page ? $page : "1";
            //分页
            list($total, $data) = DBHelper::SearchList($sku_list->groupBy('PSKU_ID'), ['limit' => $limit], $page - 1);
            //拼装数据
            $datas = static::SetAnalysis($data, $organization);
            $res = new ResponeModel();
            return $res->setModel('200', 0, Yii::t('report', 'Successful operation!'), $datas, ['totalCount' => $total]);
        } else {
            throw new ServerErrorHttpException(Yii::t('report', "Parameter incomplete!"));
//            throw new ServerErrorHttpException(Yii::t('report', "参数不全!"));
        }

    }

    /**
     *
     * 库存销售分析数据结构拼装
     * SetAnalysis
     * @param $list
     * @param $organization
     * @return array
     *
     * */
    public static function SetAnalysis($list, $organization)
    {
        #2.根据SKU 查询计算栏位值
        if (count($list) > 0) {
            $str = [];
            $PSKU_ID = [];
            $ORGANIZE_CODE = [];
            foreach ($list as $item) {
                $PSKU_ID[] = $item['PSKU_ID'];
                $ORGANIZE_CODE[] = $item['ORGAN_ID_DEMAND'];
            }

            //查询需要的数据
            $lists = static::GetTrackDate($PSKU_ID, $organization);
            foreach ($list as $i => $val) {
                $str[$i] = [];
                //分类
                $type = static::GetSkuType($val['PRODUCT_TYPE_PATH'], $lists['ProductType']);
                //需求组织
                $ORGANISATION_NAME = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getorganization_list'], [$lists['organisation'], $val['ORGAN_ID_DEMAND'], 'ORGANISATION_ID', ['ORGANISATION_NAME_CN', 'ORGANISATION_ID']]]);
                //单位
                $UNIT = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getorganization_list'], [$lists['unit'], $val['UNIT_ID'], 'UNIT_ID', ['UNIT_NAME_CN', 'UNIT_SYMBOLS']]]);
                //厂家在产数量 厂家好货数量（已检） 国内仓
                $PurchaseNumber = static::GetPurchaseNum($val['PSKU_ID'], $val['ORGAN_ID_DEMAND'], $lists['Purchase']);
                // 空运在途（FBA）  海运在途（FBA） 空运在途（自营） 海运在途（自营） 当地自营仓 调拨在途（往FBA）A 调拨在途（往自营）B
                $TrackAllocationNum = static::GetTrackAllocationNum($val['PSKU_ID'], $val['ORGAN_ID_DEMAND'], $lists['ShipmentS']);
                //及时库存检索 国内仓 当地自营仓
                $INSTANT_INVENTORY_L = static::INSTANT_INVENTORY($lists['INSTANT_INVENTORY'], $val['ORGAN_ID_DEMAND'], $val['PSKU_ID']);
                //销量
                $saletotal = static::GetSaletotal($val['PSKU_ID'], $val['ORGAN_ID_DEMAND'], $lists['obo_saletotal']);
                $str[$i] = [
                    'SKU_TYPE_BIG' => $type[0],//产品大分类
                    'SKU_TYPE_SMALL' => $type[1],//产品小分类
                    'ORGANISATION_NAME' => $ORGANISATION_NAME == '' ? '' : $ORGANISATION_NAME[0],//需求组织名称
                    'ORGANISATION_ID' => $ORGANISATION_NAME == '' ? '' : $ORGANISATION_NAME[1],//需求组织编码
                    'PSKU_CODE' => $val['PSKU_CODE'],//sku编码
                    'PSKU_ID' => $val['PSKU_ID'],//skuID
                    'PSKU_NAME_CN' => $val['PSKU_NAME_CN'],//sku名称
                    'UNIT_NAME_CN' => $UNIT[0],//单位名称
                    'UNIT_SYMBOLS' => $UNIT[1],//单位符号
                    'MANUFACTOR_INPRODUCTION' => $PurchaseNumber[0] == null ? 0 : $PurchaseNumber[0],//厂家在产数量
                    'MANUFACTOR_HAVE' => $PurchaseNumber[1] == null ? 0 : $PurchaseNumber[1],//厂家好货数量（已检）
                    'DOMESTIC_WAREHOUSE' => $INSTANT_INVENTORY_L[0] == null ? 0 : $INSTANT_INVENTORY_L[0],//国内仓
                    'FBA_AIRLIFT' => $TrackAllocationNum[0] == null ? 0 : $TrackAllocationNum[0],//空运在途（FBA）
                    'FBA_SHIPPING' => $TrackAllocationNum[1] == null ? 0 : $TrackAllocationNum[1],//海运在途（FBA）
                    'PROP_AIRLIFT' => $TrackAllocationNum[2] == null ? 0 : $TrackAllocationNum[2],//空运在途（自营）
                    'PROP_SHIPPING' => $TrackAllocationNum[3] == null ? 0 : $TrackAllocationNum[3],//海运在途（自营）
                    'PROP_LOCAL' => $INSTANT_INVENTORY_L[1] == null ? 0 : $INSTANT_INVENTORY_L[1],//当地自营仓
                    'FBA_ALLOCATION' => $TrackAllocationNum[4] == null ? 0 : $TrackAllocationNum[4],//调拨在途（往FBA）
                    'PROP_ALLOCATION' => $TrackAllocationNum[5] == null ? 0 : $TrackAllocationNum[5],//调拨在途（往自营）
                    'PROP_FBA_WAREHOUSE' => static::amazon_inventory($lists['amazon_inventory'], $val['ORGAN_ID_DEMAND'], $val['PSKU_ID']),//当地FBA托管仓
                    'PLAN_NUMBER' => static::GetPlanNumber($lists['pu_plan'], $val['PSKU_ID']), // 已计划的补单数量
                    'NEXT_CYCLE' => static::GetNextCycle($lists['g_next_cycle'], $val['PSKU_ID']),//下单周期
                    'THREE_AVERAGE_SALES' => $saletotal[0] == null ? 0 : $saletotal[0],//3天平均销量
                    'SEVEN_AVERAGE_SALES' => $saletotal[1] == null ? 0 : $saletotal[1],//7天平均销量
                    'THIRTY_AVERAGE_SALES' => $saletotal[2] == null ? 0 : $saletotal[2],//30天平均销量
                    'DAY_FBA_WAREHOUSE' => $saletotal[3] == null ? 0 : $saletotal[3],//日平均销量
                ];
            }
            return $str;
        }
    }

    /**
     * GetTrackDate
     * 查询库存销量分析用到基础数据
     * @param $PSKU_ID
     * @param $organization
     * @return array
     * */
    public static function GetTrackDate($PSKU_ID, $organization)
    {
        #2.1产品分类数据集合
        $ProductTypeDB = (new Query())->from('g_product_type');
        #2.2需求组织集合-类型为库存职能且实体状态的
        $organisation_db = (new Query())->from('o_organisation_relation_middle T1')
            ->select(['T1.ORGANISATION_ID', 'T2.ORGANISATION_NAME_CN'])
            ->leftJoin('o_organisation T2', 'T2.ORGANISATION_ID = T1.ORGANISATION_ID')
            ->where(['T1.FUNCTION_ID' => 4, 'T1.ENTITY_STATE' => 1])
            ->distinct();

        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            $ProductTypeDB->andWhere(['PRODUCT_TYPE_ID' => Yii::$app->session->get('categoryd') ?: null]);
            $organisation_db->andWhere(['T1.ORGANISATION_ID' => Yii::$app->session->get('organization') ?: null]);
        }
        $ProductType = $ProductTypeDB->all();
        $organisation = $organisation_db->all();
        #2.3计量单位集合
        $unit = (new Query())->from('b_unit')->all();
        #3.3采购跟踪情况集合
        $Purchase = static::getPurchase($PSKU_ID);
        #3.4发运调拨情况集合
        $Shipment = static::getTrackAllocation($PSKU_ID);
        $ShipmentS = $Shipment->all();
        #3.5及时库存表
        $INSTANT_INVENTORY = (new Query())->from('sk_instant_inventory T1')
            ->select(['T1.*', 'T2.WAREHOUSE_TYPE_ID', 'bc.PLATFORM_TYPE_ID', 'T2.ORGANISATION_ID'])
            ->leftJoin('b_warehouse T2', 'T2.WAREHOUSE_ID = T1.WAREHOUSE_ID')
            ->leftJoin('b_channel bc', 'bc.CHANNEL_ID = T2.CHANNEL_ID')
            ->where(['T1.PSKU_ID' => $PSKU_ID])
            ->andWhere(['=', 'bc.PLATFORM_TYPE_ID', '2'])
            ->all();
        #3.6采购计划数据
        $pu_plan = (new Query())->from('pu_plan T1')
            ->select(['T1.PLAN_STATE', 'T1.PURCHASE', 'T1.PSKU_ID', 'bc.PLATFORM_TYPE_ID'])
            ->leftJoin('b_channel bc', 'bc.CHANNEL_ID = T1.CHANNEL_ID')
            ->where(['T1.PSKU_ID' => $PSKU_ID])
            ->andWhere(['=', 'bc.PLATFORM_TYPE_ID', '2'])
            ->all();
        #3.7FBA及时库数据
        $amazon_inventory = (new Query())->from('c_amazon_inventory T1')
            ->select(['T1.PSKU_ID', 'T1.ORGANISATION_ID', 'T1.IN_STOCK_SUPPLY_QUANTITY'])
            ->where(['T1.PSKU_ID' => $PSKU_ID])
            //->andWhere(['T1.ORGANISATION_ID' => $organization])
            ->all();
        #3.8下单周期
        $g_next_cycle = (new Query())->from('g_next_cycle')->where(['PSKU_ID' => $PSKU_ID])->all();
        #3.9FBA销售记录表
        $obo_saletotal = (new Query())->select(['AVG3', 'AVG7', 'AVG15', 'AVG30', 'WEIGHTAVGSALE', 'PSKU_ID', 'ORGANISATION_CODE'])->from('obo_saletotal')->where(['PSKU_ID' => $PSKU_ID])->all();
        $list = [
            'ProductType' => $ProductType,
            'organisation' => $organisation,
            'unit' => $unit,
            'Purchase' => $Purchase,
            'ShipmentS' => $ShipmentS,
            'INSTANT_INVENTORY' => $INSTANT_INVENTORY,
            'pu_plan' => $pu_plan,
            'amazon_inventory' => $amazon_inventory,
            'g_next_cycle' => $g_next_cycle,
            'obo_saletotal' => $obo_saletotal
        ];
        return $list;
    }

    /**
     * 返回分类名称
     * GetSkuType
     * @param code
     * @param list
     * @return array
     * */
    public static function GetSkuType($code, $list)
    {
        $arr = explode(",", $code);
        $test = [];
        $test[0] = '';
        $test[1] = '';
        if (count($arr) > 0) {
            foreach ($list as $item) {
                if ($arr[0] == $item['PRODUCT_TYPE_ID']) {
                    $test[0] = $item['SYSTEM_NAME_CN'];
                }
                if ($arr[1] == $item['PRODUCT_TYPE_ID']) {
                    $test[1] = $item['SYSTEM_NAME_CN'];
                }
            }
        }
        return $test;
    }

    /**
     * GetPurchaseNum
     * 采购跟踪数据统计
     * @param $PSKU_ID
     * @param $ORGANISATION_CODE
     * @param $Purchase
     * @return array
     * */
    public static function GetPurchaseNum($PSKU_ID, $ORGANISATION_CODE, $Purchase)
    {
        $test = [];
        $test[0] = 0;//厂家在产数量
        $test[1] = 0;//厂家好货数量（已检）
        if (count($Purchase) > 0) {
            foreach ($Purchase as $item) {
                if ($PSKU_ID == $item['PSKU_ID']) {
                    if ((floatval($item['PURCHASE']) - floatval($item['INSPECTION_NUMBER'])) > 0) {
                        $test[0] = $test[0] + (floatval($item['PURCHASE']) - floatval($item['INSPECTION_NUMBER']));//在产数量+(采购数量-已验数量)
                    }
                    if ((floatval($item['INSPECTION_NUMBER']) - floatval($item['RGOODS_NUMBER'])) > 0) {
                        $test[1] = $test[1] + (floatval($item['INSPECTION_NUMBER']) - floatval($item['RGOODS_NUMBER']));//厂家好货数量+(已验数量-已收货数量)
                    }

                }
            }
        }
        return $test;
    }

    /**
     *GetSaletotal
     * 查询销售量
     * @param $PSKU_ID
     * @param $ORGAN_CODE
     * @param $list
     * @return array
     * */
    public static function GetSaletotal($PSKU_ID, $ORGAN_CODE, $list)
    {
        $test = [];
        $test[0] = 0;//3天均售
        $test[1] = 0;//7天均售
        $test[2] = 0;//30天均售
        $test[3] = 0;//每天均售
        if (count($list) > 0) {
            foreach ($list as $item) {
                if ($PSKU_ID == $item['PSKU_ID']) {
                    $test[0] = $test[0] + floatval($item['AVG3']);
                    $test[1] = $test[1] + floatval($item['AVG7']);
                    $test[2] = $test[2] + floatval($item['AVG30']);
                    $test[3] = $test[3] + floatval($item['WEIGHTAVGSALE']);
                }
            }
        }
        return $test;
    }

    /**
     * GetTrackAllocationNum
     * 发运调拨数据统计
     * @param $PSKU_ID
     * @param $ORGAN_CODE
     * @param $AllocationNum
     * @return array
     * */
    public static function GetTrackAllocationNum($PSKU_ID, $ORGAN_CODE, $AllocationNum)
    {
        $test = [];
        $test[0] = 0;// 空运在途（FBA）
        $test[1] = 0;// 海运在途（FBA
        $test[2] = 0;// 空运在途（自营）
        $test[3] = 0;// 海运在途（自营）
        $test[4] = 0;//调拨在途（往FBA）A
        $test[5] = 0;//调拨在途（往自营）B
        if (count($AllocationNum) > 0) {
            foreach ($AllocationNum as $item) {
                if ($PSKU_ID == $item['PSKU_ID']) {
                    //空运在途
                    if ($item['TRANSPORT_MODE'] == '1' || $item['TRANSPORT_MODE'] == '4' || $item['TRANSPORT_MODE'] == '5') {
                        //（FBA）
                        if ($item['IN_WAREHOUSE_TYPE'] == '5') {
                            $text = (floatval($item['SHIPMENT_NUMBER']) - floatval($item['ARECIPIENT_NUM']) - floatval($item['ADJUSTMENT_NUMBER']));
                            if ($text > 0) {
                                $test[0] = $test[0] + $text;
                            }

                        }
                        //（自营）
                        if ($item['IN_WAREHOUSE_TYPE'] == '2') {
                            $text = (floatval($item['SHIPMENT_NUMBER']) - floatval($item['ARECIPIENT_NUM']) - floatval($item['ADJUSTMENT_NUMBER']));
                            if ($text > 0) {
                                $test[2] = $test[2] + $text;
                            }

                        }
                    }
                    //海运在途
                    if ($item['TRANSPORT_MODE'] == '2' || $item['TRANSPORT_MODE'] == '3') {
                        //（FBA）
                        if ($item['IN_WAREHOUSE_TYPE'] == '5') {
                            $text = (floatval($item['SHIPMENT_NUMBER']) - floatval($item['ARECIPIENT_NUM']) - floatval($item['ADJUSTMENT_NUMBER']));
                            if ($text > 0) {
                                $test[1] = $test[1] + $text;
                            }

                        }
                        //（自营）
                        if ($item['IN_WAREHOUSE_TYPE'] == '2') {
                            $text = (floatval($item['SHIPMENT_NUMBER']) - floatval($item['ARECIPIENT_NUM']) - floatval($item['ADJUSTMENT_NUMBER']));
                            if ($text > 0) {
                                $test[3] = $test[3] + $text;
                            }

                        }
                    }

                    //调拨在途
                    if ($item['TRANSPORT_MODE'] == '6') {
                        //（往FBA）A
                        if ($item['IN_WAREHOUSE_TYPE'] == '5') {
                            $text = (floatval($item['SHIPMENT_NUMBER']) - floatval($item['ARECIPIENT_NUM']) - floatval($item['ADJUSTMENT_NUMBER']));
                            if ($text > 0) {
                                $test[4] = $test[4] + $text;
                            }

                        }
                        //（往自营）B
                        if ($item['IN_WAREHOUSE_TYPE'] == '2') {
                            $text = (floatval($item['SHIPMENT_NUMBER']) - floatval($item['ARECIPIENT_NUM']) - floatval($item['ADJUSTMENT_NUMBER']));
                            if ($text > 0) {
                                $test[5] = $test[5] + $text;
                            }

                        }
                    }

                }
            }
        }
        return $test;
    }

    /**
     * INSTANT_INVENTORY
     * 查询及时库存表数据
     * @param $list
     * @param $ORGAN_CODE
     * @param $PSKU_ID
     * @return array
     * */
    public static function INSTANT_INVENTORY($list, $ORGAN_CODE, $PSKU_ID)
    {
        $test = [];
        $test[0] = 0;
        $test[1] = 0;
        if (count($list) > 0) {
            foreach ($list as $item) {
                if ($PSKU_ID == $item['PSKU_ID']) {
                    if ($item['WAREHOUSE_TYPE_ID'] == '1') {
                        $test[0] = $test[0] + floatval($item['INSTANT_NUMBER']);
                    }
                    if ($item['WAREHOUSE_TYPE_ID'] == '2') {
                        $test[1] = $test[1] + floatval($item['INSTANT_NUMBER']);
                    }
                }
            }
        }
        return $test;
    }

    /**
     * getPurchase
     * 采购订单及采购订单明细
     * @param $PSKU_ID
     * @return array
     * */
    public static function getPurchase($PSKU_ID)
    {
        $model = [
            "where" => ["or", [">", "(pu_purchase_detail.PURCHASE-pu_purchase_detail.INSPECTION_NUMBER)", "0"], [">", "(pu_purchase_detail.INSPECTION_NUMBER-pu_purchase_detail.RGOODS_NUMBER)", "0"], ["=", "b_channel.PLATFORM_TYPE_ID", "2"]],
            "andWhere" => ["pu_purchase_detail.PSKU_ID" => $PSKU_ID, 'pu_purchase.ORDER_STATE' => 2, 'pu_purchase.ORDER_TYPE' => 1],
            "joinwith" => ["purchase_partner_channel"],
            "limit" => 0
        ];
        $data = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'GetPurchaseIndex'], [$model]]);
        return $data->data;
    }

    /**
     * GetPlanNumber
     * 采购计划表 - 已计划的补单数量
     * @param $list
     * @param $PSKU_ID
     * @return string
     * */
    public static function GetPlanNumber($list, $PSKU_ID)
    {
        $test = 0;
        if (count($list) > 0) {
            foreach ($list as $item) {
                if ($PSKU_ID == $item['PSKU_ID']) {
                    if ($item['PLAN_STATE'] !== '3') {
                        $test = $test + floatval($item['PURCHASE']);
                    }
                }
            }
        }
        return $test;
    }

    /**
     * GetNextCycle
     * 下单周期
     * @param $list
     * @param $PSKU_ID
     * @return int
     * */
    public static function GetNextCycle($list, $PSKU_ID)
    {
        $test = 0;
        if (count($list) > 0) {
            foreach ($list as $item) {
                if ($PSKU_ID == $item['PSKU_ID']) {
                    $test = floatval($item['DELIVERY']) + floatval($item['STOCKING']) + floatval($item['SHELF_TIME']) + floatval($item['TRANSPORT']) + floatval($item['PLAN_TIME']);
                }
            }
        }
        return $test;
    }

    /**
     * FBA及时库存表
     * amazon_inventory
     * @param $list
     * @param $ORGAN_CODE
     * @param $PSKU_ID
     * @return int
     * */
    public static function amazon_inventory($list, $ORGAN_CODE, $PSKU_ID)
    {
        $test = 0;
        if (count($list) > 0) {
            foreach ($list as $item) {
                if ($PSKU_ID == $item['PSKU_ID']) {
                    $test = $test + floatval($item['IN_STOCK_SUPPLY_QUANTITY']);
                }
            }
        }
        return $test;
    }


}