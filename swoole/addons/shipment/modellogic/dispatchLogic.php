<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/6/5 0005
 * Time: 16:26
 */
namespace addons\shipment\modellogic;

use addons\shipment\models\ShTracking;
use addons\shipment\models\ShTrackingDetail;
use Yii;
use yii\helpers\ArrayHelper;
use yii\swoole\rest\CreateExt;
use yii\swoole\rest\ResponeModel;
use yii\swoole\db\DBHelper;
use yii\swoole\db\Query;
use yii\swoole\modellogic\BaseLogic;

use addons\shipment\models\ShDispatchNote;
use yii\swoole\rest\UpdateExt;
use yii\web\ServerErrorHttpException;

class dispatchLogic extends BaseLogic
{
    public static $modelClass = 'addons\shipment\models\PuDispatchNote';


    /**
     * addDispatchNote
     * 发运单反写编辑
     * @param $str array @修改值
     * @param $where array @修改条件
     * */
    public static function addDispatchNote($str, $where)
    {
        ShDispatchNote::updateAll($str, $where);
    }


    /**
     * search_dispatch
     * 查询发运单
     * @access public
     * @param $where @查询条件
     * @return array
     * */
    public static function search_dispatch($where)
    {
        return ShDispatchNote::find()->where($where)->asArray()->all();
    }


    /**
     * search_dispatch_one
     * 查询发运单
     * @access public
     * @param $where @查询条件
     * @return array
     * */
    public static function search_dispatch_one($where)
    {
        return ShDispatchNote::find()->where($where)->asArray()->one();
    }

    /**
     * DispatchIndex
     * 发运单计划列表数据
     *
     * @access public
     * @param $post
     * @return array
     **/
    public static function DispatchIndex($post)
    {
        /**
         * 检索条件
         *
         * @param $post ['ORGANISATION_ID'] 需求组织-固定查询
         * @param $post ['search'] 采购订单号-模糊查询
         * @param $post ['search'] 供应商-模糊查询
         * @param $post ['search'] 原采购订单SKU-模糊查询
         * @param $post ['INSPECTION_STATE'] 质检状态-固定查询
         * @param $post ['search_time_start'] 交货日期reg-固定查询
         * @param $post ['search_time_end'] 交货日期end-固定查询
         * @param $post ['offset'] 页数
         * @param $post ['limit'] 每页显示条数
         * */

        $ORGANISATION_ID = ArrayHelper::getValue($post, 'ORGANISATION_ID');
        $search = ArrayHelper::getValue($post, 'search');
        $INSPECTION_STATE = ArrayHelper::getValue($post, 'INSPECTION_STATE');
        $search_time_start = ArrayHelper::getValue($post, 'search_time_start');
        $search_time_end = ArrayHelper::getValue($post, 'search_time_end');
//        $offset = ArrayHelper::getValue($post, 'offset');
//        if ($offset == null) $offset = 1;
//        $limit = ArrayHelper::getValue($post, 'limit');
//        if ($limit == null) $limit = 20;
        /**
         * 查询 采购订单明细，采购订单主表，合作伙伴表，品鉴信息表，产品SKU,资料SKU
         *
         * @param DELIVERY_AT @交货日期
         * @param INSPECTION_STATE @质检状态
         * @param DORGANISATION_ID @需求组织
         * @param CHANNEL_ID @平台
         * @param PURCHASE_CD @采购订单单号
         * @param PSKU_ID @采购订单SKU
         * @param PSKU_ID @采购订单SKU
         * @param PARTNER_NAME_CN @供应商名称
         * @param PARTNER_ANAME_CN @供应商简称
         * @param PARTNER_ID @供应商编码
         * @param PRE_ORDER_AT @下单日期
         * @param PURCHASE @翻单数量 采购数量
         * @param SHIPPED_QUANTITY @已发运数量
         * @param QUANTITY_RECEIVED @已收货数量
         * @param TRANSPORT @运输方式
         * @param FCL_LONG @整箱-长
         * @param FCL_WIDE @整箱-宽
         * @param FCL_HIGH @整箱-高
         * @param GROSS_WEIGHT @整箱-毛重
         * @param FCL_NET_WEIGHT @整箱-净重
         * @param PACKING_NUMBER @装箱数量(台/每箱)
         * @param TAILBOX_LONG @尾箱-长
         * @param TAILBOX_WIDE @尾箱-宽
         * @param TAILBOX_HIGH @尾箱-高
         * @param TAILBOX_NETWEIGHT @尾箱-毛重
         * @param TAILBOX_WEIGHT @尾箱-净重
         * @param PU_ORDER_ID @关联来源ID:采购订单明细，库存调整单明细
         * @param IMPORT_STATE @数据来源:1.采购订单明细,2.库存调整单明细 99.导入
         * @param PLA_QUANTITY @计划中的数量
         * @param ITSWHSEPLA_QUANTITY @自营仓计划中数量
         * @param SUWHSEPLA_QUANTITY @供应商仓计划中数量
         * @param ALREADY_GGOODS_NUM @已好货数量
         * @param CGORGANISATION_ID @采购组织
         * @param TAILBOX_BNUMBER @尾箱每箱数量
         * */


        $PLA_QUANTITY = (new Query())->select(['SUM(T11.ITSWHSEPLA_QUANTITY + T11.SUWHSEPLA_QUANTITY)'])->from('pu_purchase_detail T11')->where('T11.PURCHASE_DETAIL_ID = T1.PURCHASE_DETAIL_ID');
        $purchase = (new Query())->from('pu_purchase_detail T1')
            ->select(['T1.PU_PURCHASE_CD AS ORDER_CD', '(\'\') DELIVERY_AT', 'T1.INSPECTION_STATE', 'T2.DORGANISATION_ID as ORGANISATION_ID',
                'T1.TAILBOX_LONG', 'T1.TAILBOX_WIDE', 'T1.TAILBOX_HIGH', 'T1.TAILBOX_BNUMBER'
                , 'T1.TAILBOX_NETWEIGHT', 'T1.TAILBOX_WEIGHT', 'T1.PSKU_CODE', 'T2.PARTNER_ID', 'T3.PARTNER_NAME_CN', 'T3.PARTNER_ANAME_CN',
                'T2.PRE_ORDER_AT', 'T1.PURCHASE', 'T1.SHIPPED_QUANTITY', 'T1.RGOODS_NUMBER as QUANTITY_RECEIVED', 'T4.TRANSPORT', 'T5.PACKING_LONG as FCL_LONG',
                'T5.PACKING_WIDE as FCL_WIDE', 'T5.PACKING_HIGH as FCL_HIGH', 'T1.PURCHASE_DETAIL_ID as PU_ORDER_ID', '(\'1\') IMPORT_STATE',
                'T5.GROSS_WEIGHT', 'T5.NET_WEIGHT as FCL_NET_WEIGHT', 'T5.PACKING_NUMBER', 'T2.CHANNEL_ID', 'PLA_QUANTITY' => $PLA_QUANTITY,
                'T1.ITSWHSEPLA_QUANTITY', 'T1.SUWHSEPLA_QUANTITY', 'T1.INSPECTION_NUMBER as ALREADY_GGOODS_NUM', 'T2.ORGANISATION_ID as CGORGANISATION_ID', 'T1.PSKU_ID', 'T4.CSKU_ID'
            ])
            ->leftjoin('pu_purchase T2', 'T2.PU_PURCHASE_CD = T1.PU_PURCHASE_CD')
            ->leftjoin('pa_partner T3', 'T3.PARTNER_ID = T2.PARTNER_ID')
            ->leftjoin('g_product_sku T4', 'T4.PSKU_ID = T1.PSKU_ID')
            ->leftjoin('g_product_sku_packing T5', 'T5.PSKU_ID = T4.PSKU_ID')
            ->where(['and', 'T2.ORDER_TYPE <> 2', 'T2.ORDER_STATE = 2', 'T1.SHIPPED_QUANTITY < T1.PURCHASE']);

        /**
         * 查询 库存调整单明细
         *
         * @param PRGANISATION_ID @需求组织
         * @param CHANNEL_ID @仓库所属平台AWAREHOUSE_ID
         * @param ADJUSTMENT_CD @库存调整单单单号
         * @param TDSKU_ID @库存调整单明细SKU
         * @param ADJUSTMENT_AT @调整日期/下单日期
         * @param PURCHASE @调整数量/翻单数量
         * @param SHIPPED_QUANTITY @已发运数量
         * @param TDNUMBER @调整数量/已收货数量QUANTITY_RECEIVED
         * @param FCL_LONG @整箱-长
         * @param FCL_WIDE @整箱-宽
         * @param FCL_HIGH @整箱-高
         * @param GROSS_WEIGHT @整箱-毛重
         * @param FCL_NET_WEIGHT @整箱-净重
         * @param PACKING_NUMBER @装箱数量(台/每箱)
         * @param PU_ORDER_ID @关联来源ID:采购订单明细，库存调整单明细
         * @param IMPORT_STATE @数据来源:1.采购订单明细,2.库存调整单明细 99.导入
         * @param PLA_QUANTITY @计划中的数量
         * @param ITSWHSEPLA_QUANTITY @自营仓计划中数量
         * @param SUWHSEPLA_QUANTITY @供应商仓计划中数量
         * @param ALREADY_GGOODS_NUM @调整数量/已好货数量
         * @param TAILBOX_BNUMBER @尾箱每箱数量
         * */

        $dispatch_note = (new Query())->from('sk_adjustment_detail T1')
            ->select(['T2.ADJUSTMENT_CD AS ORDER_CD', '(\'\') DELIVERY_AT', '(\'\') INSPECTION_STATE', 'T2.PRGANISATION_ID as ORGANISATION_ID',
                '(\'\') TAILBOX_LONG', '(\'\') TAILBOX_WIDE', '(\'\') TAILBOX_HIGH', '(\'\') TAILBOX_BNUMBER'
                , '(\'\') TAILBOX_NETWEIGHT', '(\'\') TAILBOX_WEIGHT', 'T1.TDSKU_CODE as PSKU_CODE', '(\'\') PARTNER_ID', '(\'\') PARTNER_NAME_CN', '(\'\') PARTNER_ANAME_CN',
                'T2.ADJUSTMENT_AT as PRE_ORDER_AT', 'T1.TDNUMBER as PURCHASE', 'T1.SHIPPED_QUANTITY', 'T1.TDNUMBER as QUANTITY_RECEIVED', '(\'\') TRANSPORT', 'T4.PACKING_LONG as FCL_LONG',
                'T4.PACKING_WIDE as FCL_WIDE', 'T4.PACKING_HIGH as FCL_HIGH', 'T1.ADJUSTMENT_DETAIL_ID as PU_ORDER_ID', '(\'2\') IMPORT_STATE',
                'T4.GROSS_WEIGHT', 'T4.NET_WEIGHT as FCL_NET_WEIGHT', 'T4.PACKING_NUMBER', 'T5.CHANNEL_ID', 'T1.PLA_QUANTITY',
                '(\'\') ITSWHSEPLA_QUANTITY', '(\'\') SUWHSEPLA_QUANTITY', 'T1.TDNUMBER as ALREADY_GGOODS_NUM', 'T2.PRGANISATION_ID as CGORGANISATION_ID', 'T1.PSKU_ID', 'T3.CSKU_ID'
            ])
            ->leftjoin('sk_adjustment T2', 'T2.ADJUSTMENT_ID = T1.ADJUSTMENT_ID')
            ->leftjoin('g_product_sku T3', 'T3.PSKU_ID = T1.PSKU_ID')
            ->leftjoin('g_product_sku_packing T4', 'T4.PSKU_ID = T3.PSKU_ID')
            ->leftjoin('b_warehouse T5', 'T5.WAREHOUSE_ID = T1.TDAREHOUSE_ID')
            ->where(['and', 'T5.WAREHOUSE_TYPE_ID = 1', 'T2.PLAN_STATE = 2', 'T1.SHIPPED_QUANTITY < T1.TDNUMBER', 'LOCATE(\'-\', T1.TDNUMBER) = 0']);

        /** 返回字段结构 **/
        $select = ['ORDER_CD', 'DELIVERY_AT', 'INSPECTION_STATE', 'ORGANISATION_ID',
            'TAILBOX_LONG', 'TAILBOX_WIDE', 'TAILBOX_HIGH', 'TAILBOX_BNUMBER',
            'TAILBOX_NETWEIGHT', 'TAILBOX_WEIGHT', 'PSKU_CODE', 'PARTNER_ID', 'PARTNER_NAME_CN', 'PARTNER_ANAME_CN',
            'PRE_ORDER_AT', 'PURCHASE', 'SHIPPED_QUANTITY', 'QUANTITY_RECEIVED', 'TRANSPORT', 'FCL_LONG',
            'FCL_WIDE', 'FCL_HIGH', 'PU_ORDER_ID', 'IMPORT_STATE',
            'GROSS_WEIGHT', 'FCL_NET_WEIGHT', 'PACKING_NUMBER', 'CHANNEL_ID', 'PLA_QUANTITY',
            'ITSWHSEPLA_QUANTITY', 'SUWHSEPLA_QUANTITY', 'ALREADY_GGOODS_NUM', 'CGORGANISATION_ID', 'PSKU_ID', 'CSKU_ID', 'CSKU_ID'
        ];

        /** 查询条件 **/
        $wheres = ['and', ['=', 'T10.ORGANISATION_ID', $ORGANISATION_ID], ['=', 'T10.INSPECTION_STATE', $INSPECTION_STATE]];
        $andwhere = ['or', ['like', 'T10.ORDER_CD', $search], ['like', 'T10.PARTNER_NAME_CN', $search], ['like', 'T10.PARTNER_ANAME_CN', $search], ['like', 'T10.PSKU_CODE', $search]];

        /** 查询数据 **/
        $res = new ResponeModel();
        $query_db = (new Query())->from(['T10' => $purchase->union($dispatch_note)])
            ->select($select)
            ->andFilterWhere($wheres)
            ->andFilterWhere($andwhere);
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            $query_db->andWhere(['T10.ORGANISATION_ID' => Yii::$app->session->get('organization') ?: null])
                ->andWhere(['T10.PSKU_ID' => Yii::$app->session->get('product_id') ?: null]);
        }
        $query = $query_db->all();
        $str = [];
        if ($search_time_start && $search_time_start !== null) {
            $search_time_start = strtotime($search_time_start);
        }
        if ($search_time_end && $search_time_start !== null) {
            $search_time_end = strtotime($search_time_end);
        }


        foreach ($query as $item) {
            if ($item['ORDER_CD'] !== null) {
                $DELIVERY = (new Query())->select(['INSPECTION_AT'])
                    ->from('pu_qctables')
                    ->where(['and', ['=', 'PSKU_ID', $item['PSKU_ID']], ['=', 'PU_ORDER_CD', $item['ORDER_CD']], 'INSPECTION_AT <= unix_timestamp(now())'])
                    ->orderBy('INSPECTION_AT desc')
                    ->one();
                //, ['between', 'FROM_UNIXTIME(T10.DELIVERY_AT, \'%Y-%m-%d\')', $search_time_start, $search_time_end]
                $item['DELIVERY_AT'] = $DELIVERY ? $DELIVERY['INSPECTION_AT'] : '';
                if ($search_time_start && $search_time_end) {
                    if (floatval($item['DELIVERY_AT']) >= $search_time_start && floatval($item['DELIVERY_AT']) <= $search_time_end) {
                        $str[] = $item;
                    }
                } else {
                    if ($search_time_start) {
                        if (floatval($item['DELIVERY_AT']) >= $search_time_start) {
                            $str[] = $item;
                        }
                    } else if ($search_time_end) {
                        if (floatval($item['DELIVERY_AT']) <= $search_time_end && $item['DELIVERY_AT'] != '') {
                            $str[] = $item;
                        }
                    } else {
                        $str[] = $item;
                    }

                }
            }
        }
        return $res->setModel('200', 0, Yii::t('shipment', 'Successful operation!'), $str);
//        return $res->setModel('200', 0, '操作成功!', $str);
    }


    /**
     * make_dispatch
     * 生成发运单
     * @access public
     * @param $post
     * @return array
     * */
    public static function make_dispatch($post)
    {
        $respone = new ResponeModel();
        /** 1.基础校验 **/
        $data = ArrayHelper::getValue($post, 'batchMTC');
        if ($data == null || count($data) == 0) {
            return $respone->setModel(500, 0, Yii::t('shipment', "Incomplete structure, unable to generate documents!"), $post);
//            return $respone->setModel(500, 0, Yii::t('shipment', "结构不完整，无法生成单据!"), $post);
        }


        $dispatch = [];
        /** 2.循环数据 **/
        foreach ($data as $i => $item) {
            /** 1-1.基础校验 **/
            if ($item['ITSWHSEPLA_NUM'] == '0' && $item['SUWHSEPLA_NUM'] == '0') {
                return $respone->setModel(500, 0, Yii::t('shipment', "The quantity of shipment in transit warehouse and the quantity of supplier can not be 0 at the same time!"), $post);
//                return $respone->setModel(500, 0, Yii::t('shipment', "中转仓出货数量和供应商出货数量不能同时为0!"), $post);
            }

            /** 4.拼装发运单对应字段数据 **/
            $dispatch[$i] = [];
            $dispatch[$i] = [
                'PU_ORDER_ID' => $item['PU_ORDER_ID'],// 关联来源ID:采购订单明细，库存调整单明细
                'PSKU_ID' => $item['PSKU_ID'],// SKUID
                'PSKU_CODE' => $item['PSKU_CODE'],// SKU编码
                'DEMANDSKU_ID' => $item['DEMANDSKU_ID'],// 实际发运SKUID
                'DEMANDSKU_CODE' => $item['DEMANDSKU_CODE'],// 实际发运SKU编码
                'CHANNEL_ID' => $item['CHANNEL_ID'], // 平台编码
                'TRANSPORT_MODE' => $item['TRANSPORT'],// 运输方式:1:空运  2:海运  3:龙舟海运，4:快递,5:陆运
                'URGENT_ORDER' => $item['URGENT_ORDER'],// 紧急单据:1:是 2:否
                'ORGANISATION_ID' => $item['ORGANISATION_ID'],// 需求组织
                'IMPORT_STATE' => $item['IMPORT_STATE'], // 数据来源:1.采购订单明细,2.库存调整单明细
                'PlAN_SHIPMENT_AT' => $item['DELIVERY_AT_PLAN'],// 计划发运日期
                'ACTUAL_SHIPM_AT' => $item['DELIVERY_AT_PLAN'],// 实际发运日期
                'DISPATCH_REMARKS' => $item['DISPATCH_REMARKS'],// 备注
                'PARTNER_ID' => $item['PARTNER_ID'],// 供应商编码
                'DELIVER_WARID' => '', //出、发货仓库:null表示供应商仓
                'WAREHOUSE_ID' => $item['WAREHOUSE_ID'], // 目的仓
                'SUPPLIER_SHIPMENTS' => $item['SUWHSEPLA_NUM'],//出货数量,供应商出货数SUWHSEPLA_NUM
                'LAST_NUM' => isset($item['LAST_NUM']) ? $item['LAST_NUM'] : 0,//尾箱数
                'TAILBOX_LONG' => $item['TAILBOX_LONG'],//尾箱长
                'TAILBOX_WIDE' => $item['TAILBOX_WIDE'],//尾箱宽
                'TAILBOX_HIGH' => $item['TAILBOX_HIGH'],//尾箱高
                'TAILBOX_NETWEIGHT' => $item['TAILBOX_NETWEIGHT'],//尾箱毛重
                'TAILBOX_WEIGHT' => $item['TAILBOX_WEIGHT'],//尾箱净重
                'FCL_LONG' => $item['FCL_LONG'],//整箱长
                'FCL_WIDE' => $item['FCL_WIDE'],//整箱宽
                'FCL_HIGH' => $item['FCL_HIGH'],//整箱高
                'GROSS_WEIGHT' => $item['GROSS_WEIGHT'],//整箱毛重
                'FCL_NET_WEIGHT' => $item['FCL_NET_WEIGHT'],//整箱净重
                'PACKING_NUMBER' => $item['PACKING_NUMBER'],//装箱数量(台/每箱)
                'TAILBOX_BNUMBER' => $item['TAILBOX_BNUMBER'],//尾箱每箱数量
                'FCL_NUM' => isset($item['FCL_NUM']) ? $item['FCL_NUM'] : 0,//整箱数

            ];


            $ITSWHSEPLA_NUM = floatval($item['ITSWHSEPLA_NUM']);
            if ($ITSWHSEPLA_NUM > 0) {
                /** 5.发运计划下推发运单时，发货仓库的获取为:如果选择从中转仓出货，则发货仓库为采购组织的大陆中转仓的仓库 **/
                $_WARCODE = static::getContinentalTwo(1, $item['CGORGANISATION_ID']);
                $dispatch[$i]['DELIVER_WARID'] = $_WARCODE !== null ? $_WARCODE : "";
                $dispatch[$i]['TRANSITW_SHIPMENTS'] = $item['ITSWHSEPLA_NUM'];//出货数量,中转仓出货数ITSWHSEPLA_NUM
                $dispatch[$i]['SUPPLIER_SHIPMENTS'] = 0;//出货数量,供应商出货数SUWHSEPLA_NUM
                $dispatch[$i]['PLA_QUANTITY'] = $ITSWHSEPLA_NUM;//计划发运数量
                $dispatch[$i]['ACTUAL_SHIPM_NUM'] = $ITSWHSEPLA_NUM;//计划发运数量
                /** 3.判断供应商出货数和中转仓出货数是否有值，都有则生成两条 **/
                $SUWHSEPLA_NUM = floatval($item['SUWHSEPLA_NUM']);
                if ($SUWHSEPLA_NUM > 0) {
                    $dispatch[$i + 100] = [];
                    $dispatch[$i + 100] = [
                        'PU_ORDER_ID' => $item['PU_ORDER_ID'],// 关联来源ID:采购订单明细，库存调整单明细
                        'PSKU_ID' => $item['PSKU_ID'],// PSKU_ID
                        'PSKU_CODE' => $item['PSKU_CODE'],// SKU编码
                        'DEMANDSKU_ID' => $item['DEMANDSKU_ID'],// 实际发运SKUID
                        'DEMANDSKU_CODE' => $item['DEMANDSKU_CODE'],// 实际发运SKU编码
                        'CHANNEL_ID' => $item['CHANNEL_ID'], // 平台编码
                        'TRANSPORT_MODE' => $item['TRANSPORT'],// 运输方式:1:空运  2:海运  3:龙舟海运，4:快递,5:陆运
                        'URGENT_ORDER' => $item['URGENT_ORDER'],// 紧急单据:1:是 2:否
                        'ORGANISATION_ID' => $item['ORGANISATION_ID'],// 需求组织
                        'IMPORT_STATE' => $item['IMPORT_STATE'], // 数据来源:1.采购订单明细,2.库存调整单明细
                        'PlAN_SHIPMENT_AT' => $item['DELIVERY_AT_PLAN'],// 计划发运日期
                        'ACTUAL_SHIPM_AT' => $item['DELIVERY_AT_PLAN'],// 实际发运日期
                        'DISPATCH_REMARKS' => $item['DISPATCH_REMARKS'],// 备注
                        'PARTNER_ID' => $item['PARTNER_ID'],// 供应商编码
                        'DELIVER_WARID' => '', //出、发货仓库:null表示供应商仓
                        'WAREHOUSE_ID' => $item['WAREHOUSE_ID'], // 目的仓
                        'TRANSITW_SHIPMENTS' => 0,//出货数量,中转仓出货数ITSWHSEPLA_NUM
                        'SUPPLIER_SHIPMENTS' => $item['SUWHSEPLA_NUM'],//出货数量,供应商出货数SUWHSEPLA_NUM
                        'LAST_NUM' => $item['LAST_NUM'],//尾箱数
                        'TAILBOX_LONG' => $item['TAILBOX_LONG'],//尾箱长
                        'TAILBOX_WIDE' => $item['TAILBOX_WIDE'],//尾箱宽
                        'TAILBOX_HIGH' => $item['TAILBOX_HIGH'],//尾箱高
                        'TAILBOX_NETWEIGHT' => $item['TAILBOX_NETWEIGHT'],//尾箱毛重
                        'TAILBOX_WEIGHT' => $item['TAILBOX_WEIGHT'],//尾箱净重
                        'FCL_LONG' => $item['FCL_LONG'],//整箱长
                        'FCL_WIDE' => $item['FCL_WIDE'],//整箱宽
                        'FCL_HIGH' => $item['FCL_HIGH'],//整箱高
                        'GROSS_WEIGHT' => $item['GROSS_WEIGHT'],//整箱毛重
                        'FCL_NET_WEIGHT' => $item['FCL_NET_WEIGHT'],//整箱净重
                        'PACKING_NUMBER' => $item['PACKING_NUMBER'],//装箱数量(台/每箱)
                        'TAILBOX_BNUMBER' => $item['TAILBOX_BNUMBER'],//尾箱每箱数量
                        'FCL_NUM' => isset($item['FCL_NUM']) ? $item['FCL_NUM'] : 0,//整箱数
                    ];
                    $dispatch[$i + 100]['PLA_QUANTITY'] = $SUWHSEPLA_NUM;//计划发运数量
                    $dispatch[$i + 100]['ACTUAL_SHIPM_NUM'] = $SUWHSEPLA_NUM;//计划发运数量
                }
            } else {
                $dispatch[$i]['DELIVER_WARID'] = ''; //出、发货仓库:null表示供应商仓
                $dispatch[$i]['TRANSITW_SHIPMENTS'] = 0;//出货数量,中转仓出货数ITSWHSEPLA_NUM
                $dispatch[$i]['SUPPLIER_SHIPMENTS'] = $item['SUWHSEPLA_NUM'];//出货数量,供应商出货数SUWHSEPLA_NUM
                $dispatch[$i]['PLA_QUANTITY'] = $item['SUWHSEPLA_NUM'];//计划发运数量
                $dispatch[$i]['ACTUAL_SHIPM_NUM'] = $item['SUWHSEPLA_NUM'];//计划发运数量
            }

        }
        //重置数组下标
        $dispatchModel = array("batchMTC" => array_values($dispatch));
        $result = CreateExt::actionDo(new ShDispatchNote(), $dispatchModel);
        if ($result instanceof ResponeModel) {
            return $result;
        }

        /** 返回提示 **/
        return $respone->setModel(200, 0, Yii::t('shipment', '总生成 {item} 张单据', ['item' => count(array_values($dispatch))]), $post);
//        return $respone->setModel(200, 0, Yii::t('shipment', "总生成") . " " . count(array_values($dispatch)) . " " . Yii::t('shipment', "张单据"), $post);
    }

    /**
     * getContinental
     * 获取仓库
     * @access public
     * @param $code @仓库类型
     * @param $item @条件1 组织，2 平台
     * @return string
     * */
    public static function getContinental($code, $item)
    {
        $o_client = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\warehouseLogic', 'getBWarehouse'], [array('WAREHOUSE_TYPE_ID' => $code), ['ORGANISATION_ID', 'CHANNEL_ID', 'WAREHOUSE_ID']]]);
        $warehouse = $o_client->recv(); //所有分类是大陆中转仓的仓库
        $where = [$warehouse, $item, ['ORGANISATION_ID', 'CHANNEL_ID'], 'WAREHOUSE_ID'];
        return Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getorganization_list'], $where]);

    }

    /**
     * getContinentalTwo
     * 获取仓库-大陆中转仓
     * @access public
     * @param $code @仓库类型
     * @param $item @条件1 采购组织
     * @return string
     * */
    public static function getContinentalTwo($code, $item)
    {
        $o_client = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\warehouseLogic', 'getBWarehouse'], [array('WAREHOUSE_TYPE_ID' => $code), ['ORGANISATION_ID', 'CHANNEL_ID', 'WAREHOUSE_ID']]]);
        $warehouse = $o_client->recv(); //所有分类是大陆中转仓的仓库
        $where = [$warehouse, $item, 'ORGANISATION_ID', 'WAREHOUSE_ID'];
        return Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getorganization_list'], $where]);

    }

    /**
     * getContinentalThere
     * 获取仓库-大陆中转仓
     * @access public
     * @param $code @仓库类型
     * @param $warehouseCode @平台
     * @param $ORGANIZE_CODE @组织
     * @return string
     * @return string
     * */
    public static function getContinentalThere($code, $warehouseCode, $ORGANIZE_CODE)
    {
        #根据平台编码找到分类ID
        $CHANNEL_CODE = (new Query())
            ->from('b_channel')
            ->select(['CHANNEL_ID'])
            ->where([
                'PLATFORM_TYPE_ID' => (new Query())->from('b_channel T1')->select(['T1.PLATFORM_TYPE_ID'])->where(['T1.CHANNEL_ID' => $warehouseCode])->column(),
                'ORGANISATION_ID' => $ORGANIZE_CODE
            ])->column();

        $o_client = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\warehouseLogic', 'getBWarehouse'], [['WAREHOUSE_TYPE_ID' => $code, 'ORGANISATION_ID' => $ORGANIZE_CODE, 'CHANNEL_ID' => $CHANNEL_CODE], ['ORGANISATION_ID', 'CHANNEL_ID', 'WAREHOUSE_ID']]]);
        $warehouse = $o_client->recv(); //所有分类是大陆中转仓的仓库

        return count($warehouse) > 0 ? $warehouse[0]['WAREHOUSE_ID'] : 0;

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
        $WAREHOUSE_TYPE = Yii::$app->rpc->create('basics')->sendAndrecv([['\addons\master\basics\modellogic\warehouseLogic', 'getBWarehouse'], [array('WAREHOUSE_ID' => $wa3), ['WAREHOUSE_TYPE_ID']]]);
        #查询对应类型的条件的仓库编码
        $WAREHOUSE_CODE = '';
        if ($WAREHOUSE_TYPE[0]['WAREHOUSE_TYPE_ID'] == '2') {
            $WAREHOUSE_CODE = static::getContinental(3, [$wa1, $wa2]);
        }
        if ($WAREHOUSE_TYPE[0]['WAREHOUSE_TYPE_ID'] == '5') {
            $WAREHOUSE_CODE = static::getContinental(6, [$wa1, $wa2]);
        }
        return $WAREHOUSE_CODE;
    }

    /**
     * DispatchView
     * 发运单列表
     * @access public
     * @param $post
     * @return array
     * */
    public static function DispatchView($post)
    {
        /**
         * 检索条件
         *
         * @param $post ['search'] @采购订单号-模糊查询
         * @param $post ['search'] @供应商-模糊查询
         * @param $post ['search'] @需求国SKU-模糊查询
         * @param $post ['search'] @PO号-模糊查询
         * @param $post ['search'] @产品条码-模糊查询
         * @param $post ['search'] @空海次数-模糊查询
         * @param $post ['search'] @目的仓-模糊查询
         * @param $post ['TRANSPORT_MODE'] @运输方式-固定查询
         * @param $post ['PLAN_STATE'] @单据状态-固定查询
         * @param $post ['ORGANISATION_CODE'] @需求组织-固定查询
         * @param $post ['p_shipm_time_start'] @计划发运日期reg-固定查询
         * @param $post ['p_shipm_time_end'] @计划发运日期end-固定查询
         * @param $post ['a_shipm_time_start'] @实际发运日期reg-固定查询
         * @param $post ['a_shipm_time_end'] @实际发运日期end-固定查询
         * @param $post ['offset'] @页数
         * @param $post ['limit'] @每页显示条数
         * */


        $search = ArrayHelper::getValue($post, 'search');
        $PLAN_STATE = ArrayHelper::getValue($post, 'PLAN_STATE');
        $ORGANISATION_CODE = ArrayHelper::getValue($post, 'ORGANISATION_ID');
        $TRANSPORT_MODE = ArrayHelper::getValue($post, 'TRANSPORT_MODE');
        $p_shipm_time_start = ArrayHelper::getValue($post, 'p_shipm_time_start');
        $p_shipm_time_end = ArrayHelper::getValue($post, 'p_shipm_time_end');
        $a_shipm_time_start = ArrayHelper::getValue($post, 'a_shipm_time_start');
        $a_shipm_time_end = ArrayHelper::getValue($post, 'a_shipm_time_end');
        $DISPATCH_NOTE_ID = ArrayHelper::getValue($post, 'DISPATCH_NOTE_ID');

        $offset = ArrayHelper::getValue($post, 'offset');
        if ($offset == null) $offset = 1;
        $limit = ArrayHelper::getValue($post, 'limit');
        if ($limit == null) $limit = 20;
        /** 过滤目的仓，拿到匹配到的目的仓编码 **/
        $WAREHOUSE_CODES = '';
        if ($search !== null && $search) {
            $warehouse = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\master\basics\modellogic\warehouseLogic', 'getBWarehouse'], [['or', ['like', 'WAREHOUSE_NAME_CN', $search]], ['WAREHOUSE_ID']]]);
            if (count($warehouse) > 0) {
                $WAREHOUSE_CODES = [];
                foreach ($warehouse as $i => $item) {
                    $WAREHOUSE_CODES[$i] = $item['WAREHOUSE_ID'];
                }
            }
        }
        /**
         * 查询发运单，关联采购订单明细，库存调整单明细，拼装数据返回
         * @param $ORDER_CD @单号
         * @param $PRICE @单价
         * @param $SO_MONEY_ID @币种
         * @param $AMOUNT @总金额
         * @param $PACKING_NUMBER @每箱数量
         * @param $L_LONG @长(CM)
         * @param $L_WIDE @宽(CM)
         * @param $L_HIGH @(CM)
         * @param $L_WEIGHT @毛重(KG)
         * @param $NET_WEIGHT @净重(KG)
         * @param $INSPECTION_STATE @最新验货状态
         * @param $DELIVERY_AT @好货日期
         * @param $SO_FNSKU @原采购产品条码
         * @param $PARTNER_NAME_CN @供应商名称
         * @param $PARTNER_ANAME_CN @供应商简称
         * @param $PLA_QUANTITY @计划发运数量
         * @param * 发运单表所有字段
         * */
        $res = new ResponeModel();
        $ORDER_CD = 'CASE WHEN T1.IMPORT_STATE = 1 THEN
	(SELECT T3.PU_PURCHASE_CD from pu_purchase_detail T3 WHERE T3.PURCHASE_DETAIL_ID = T1.PU_ORDER_ID)
 WHEN T1.IMPORT_STATE =2 THEN
(SELECT T21.ADJUSTMENT_CD from sk_adjustment_detail T2 LEFT JOIN sk_adjustment T21 ON T21.ADJUSTMENT_ID = T2.ADJUSTMENT_ID WHERE T2.ADJUSTMENT_DETAIL_ID = T1.PU_ORDER_ID)
  END ORDER_CD';
        $ORDER_CD_where = 'CASE WHEN T1.IMPORT_STATE = 1 THEN
	(SELECT T3.PU_PURCHASE_CD from pu_purchase_detail T3 WHERE T3.PURCHASE_DETAIL_ID = T1.PU_ORDER_ID)
 WHEN T1.IMPORT_STATE =2 THEN
(SELECT T21.ADJUSTMENT_CD from sk_adjustment_detail T2 LEFT JOIN sk_adjustment T21 ON T21.ADJUSTMENT_ID = T2.ADJUSTMENT_ID WHERE T2.ADJUSTMENT_ID = T1.PU_ORDER_ID)
  END';
        $PRICE = 'CASE WHEN T1.IMPORT_STATE = 1 THEN
	(SELECT T3.TAX_UNITPRICE from pu_purchase_detail T3 WHERE T3.PURCHASE_DETAIL_ID = T1.PU_ORDER_ID)
 WHEN T1.IMPORT_STATE =2 THEN
	(SELECT T2.UNIT_PRICE from sk_adjustment_detail T2 WHERE T2.ADJUSTMENT_DETAIL_ID = T1.PU_ORDER_ID)
  END PRICE';
        $SO_MONEY_CODE = 'CASE WHEN T1.IMPORT_STATE = 1 THEN
	(SELECT T33.MONEY_ID as SO_MONEY_ID from pu_purchase_detail T3 LEFT JOIN pu_purchase T33 ON T33.PU_PURCHASE_CD = T3.PU_PURCHASE_CD WHERE T3.PURCHASE_DETAIL_ID = T1.PU_ORDER_ID)
 WHEN T1.IMPORT_STATE =2 THEN
	(SELECT T2.MONEY_ID as SO_MONEY_ID from sk_adjustment_detail T2 WHERE T2.ADJUSTMENT_DETAIL_ID = T1.PU_ORDER_ID)
  END SO_MONEY_ID';
        $AMOUNT = 'CASE WHEN T1.IMPORT_STATE = 1 THEN
	(SELECT T3.TAX_AMOUNT from pu_purchase_detail T3 WHERE T3.PURCHASE_DETAIL_ID = T1.PU_ORDER_ID)
 WHEN T1.IMPORT_STATE =2 THEN
	(SELECT T2.TDMONEY from sk_adjustment_detail T2 WHERE T2.ADJUSTMENT_DETAIL_ID = T1.PU_ORDER_ID)
  END AMOUNT';
//        $PACKING_NUMBER = 'CASE WHEN T1.IMPORT_STATE = 1 THEN
//	(SELECT T3.EACH_NUMBER from pu_purchase_detail T3 WHERE T3.PURCHASE_DETAIL_ID = T1.PU_ORDER_ID)
// WHEN T1.IMPORT_STATE =2 THEN
//	(SELECT T22.PACKING_NUMBER from g_product_sku_packing T22 where T22.PSKU_ID = T1.PSKU_ID)
//  END PACKING_NUMBER';
//        $L_LONG = 'CASE WHEN T1.IMPORT_STATE = 1 THEN
//	(SELECT T3.FCL_LONG from pu_purchase_detail T3 WHERE T3.PURCHASE_DETAIL_ID = T1.PU_ORDER_ID)
// WHEN T1.IMPORT_STATE =2 THEN
//	(SELECT T22.PACKING_LONG from g_product_sku_packing T22 where T22.PSKU_ID = T1.PSKU_ID)
//  END L_LONG';
//        $L_WIDE = 'CASE WHEN T1.IMPORT_STATE = 1 THEN
//	(SELECT T3.FCL_WIDE from pu_purchase_detail T3 WHERE T3.PURCHASE_DETAIL_ID = T1.PU_ORDER_ID)
// WHEN T1.IMPORT_STATE =2 THEN
//	(SELECT T22.PACKING_WIDE from g_product_sku_packing T22 where T22.PSKU_ID = T1.PSKU_ID)
//  END L_WIDE';
//        $L_HIGH = 'CASE WHEN T1.IMPORT_STATE = 1 THEN
//	(SELECT T3.FCL_HIGH from pu_purchase_detail T3 WHERE T3.PURCHASE_DETAIL_ID = T1.PU_ORDER_ID)
// WHEN T1.IMPORT_STATE =2 THEN
//	(SELECT T22.PACKING_HIGH from g_product_sku_packing T22 where T22.PSKU_ID = T1.PSKU_ID)
//  END L_HIGH';
//        $L_WEIGHT = 'CASE WHEN T1.IMPORT_STATE = 1 THEN
//	(SELECT T3.GROSS_WEIGHT from pu_purchase_detail T3 WHERE T3.PURCHASE_DETAIL_ID = T1.PU_ORDER_ID)
// WHEN T1.IMPORT_STATE =2 THEN
//	(SELECT T22.GROSS_WEIGHT from g_product_sku_packing T22 where T22.PSKU_ID = T1.PSKU_ID)
//  END L_WEIGHT';
//        $NET_WEIGHT = 'CASE WHEN T1.IMPORT_STATE = 1 THEN
//	(SELECT T3.FCL_NET_WEIGHT from pu_purchase_detail T3 WHERE T3.PURCHASE_DETAIL_ID = T1.PU_ORDER_ID)
// WHEN T1.IMPORT_STATE =2 THEN
//	(SELECT T22.NET_WEIGHT from g_product_sku_packing T22 where T22.PSKU_ID = T1.PSKU_ID)
//  END NET_WEIGHT';
        $INSPECTION_STATE = 'CASE WHEN T1.IMPORT_STATE = 1 THEN
	(SELECT T3.INSPECTION_STATE from pu_purchase_detail T3 WHERE T3.PURCHASE_DETAIL_ID = T1.PU_ORDER_ID)
 WHEN T1.IMPORT_STATE =2 THEN
	\'\'
  END INSPECTION_STATE';
        $DELIVERY_AT = 'CASE WHEN T1.IMPORT_STATE = 1 THEN
	(SELECT (SELECT DELIVERY_AT from pu_qctables WHERE PSKU_ID = T3.PSKU_ID and PU_ORDER_CD = T3.PU_PURCHASE_CD and INSPECTION_AT <= unix_timestamp(now()) ORDER BY INSPECTION_AT desc LIMIT 0,1)DELIVERY_AT from pu_purchase_detail T3 WHERE T3.PURCHASE_DETAIL_ID = T1.PU_ORDER_ID)
 WHEN T1.IMPORT_STATE =2 THEN
	\'\'
  END DELIVERY_AT';
        $SO_FNSKU = 'CASE WHEN T1.IMPORT_STATE = 1 THEN
	(SELECT T3.FNSKU as SO_FNSKU from pu_purchase_detail T3 WHERE T3.PURCHASE_DETAIL_ID = T1.PU_ORDER_ID)
 WHEN T1.IMPORT_STATE =2 THEN
	\'\'
  END SO_FNSKU';
//        $PLA_QUANTITY = 'CASE WHEN T1.IMPORT_STATE = 1 THEN
//	(SELECT (T3.ITSWHSEPLA_QUANTITY+T3.SUWHSEPLA_QUANTITY) as PLA_QUANTITY from pu_purchase_detail T3 WHERE T3.PURCHASE_DETAIL_ID = T1.PU_ORDER_ID)
// WHEN T1.IMPORT_STATE =2 THEN
//	(SELECT T2.PLA_QUANTITY from sk_adjustment_detail T2 WHERE T2.ADJUSTMENT_ID = T1.PU_ORDER_ID)
//  END PLA_QUANTITY';
        $organization = Yii::$app->session->get('organization') ?: null;
        $product_id = Yii::$app->session->get('product_id') ?: null;
        $WAREHOUSE_NAME = 'CASE WHEN T1.DELIVER_WARID IS NOT NULL THEN
	(SELECT TT.WAREHOUSE_NAME_CN as WAREHOUSE_NAME from b_warehouse TT WHERE TT.WAREHOUSE_ID = T1.DELIVER_WARID)
	 END DELIVER_WAREHOUSE_NAME';
        $query = (new Query())->from('sh_dispatch_note T1')
            ->select(['T1.*', 'TP.PARTNER_NAME_CN', 'TP.PARTNER_ANAME_CN', $ORDER_CD, $PRICE, $SO_MONEY_CODE, $AMOUNT,
                $INSPECTION_STATE, $DELIVERY_AT, $SO_FNSKU, $WAREHOUSE_NAME,
                'bc.CHANNEL_NAME_CN', 'gp.AMAZON_SIZE_ID', 'gp.PSKU_NAME_CN', 'gp.PSKU_NAME_EN',
                'gps.CUSTOMS_CODE', 'bu.UNIT_NAME_CN as UNIT_NAME', 'gps.CUSTOMS_NAME', 'gps.REPORTING_ELEMENTS', 'bw.WAREHOUSE_NAME_CN'])
            ->leftJoin('pa_partner TP', 'TP.PARTNER_ID = T1.PARTNER_ID')//供应商
            ->leftJoin('b_channel bc', 'bc.CHANNEL_ID = T1.CHANNEL_ID')//平台
            ->leftJoin('g_product_sku gp', 'gp.PSKU_ID = T1.PSKU_ID')//产品sku
            ->leftJoin('g_product_sku_declare gps', 'gps.PSKU_ID = T1.PSKU_ID')//产品sku 海关
            ->leftJoin('b_unit bu', 'bu.UNIT_ID = gps.UNIT_ID')//单位
            ->leftJoin('b_warehouse bw', 'bw.WAREHOUSE_ID = T1.WAREHOUSE_ID')//目的仓
            ->where(['T1.DELETED_STATE' => '0'])
            ->orderBy(['T1.URGENT_ORDER' => SORT_ASC, 'T1.PlAN_SHIPMENT_AT' => SORT_DESC])
            ->andFilterWhere(['and',
                ['=', 'T1.TRANSPORT_MODE', $TRANSPORT_MODE],
                ['=', 'T1.ORGANISATION_ID', $ORGANISATION_CODE],
                ['=', 'PLAN_STATE', $PLAN_STATE], ['=', 'DISPATCH_NOTE_ID', $DISPATCH_NOTE_ID],
                ['between', 'FROM_UNIXTIME(T1.PlAN_SHIPMENT_AT, \'%Y-%m-%d\')', $p_shipm_time_start, $p_shipm_time_end], ['between', 'FROM_UNIXTIME(T1.ACTUAL_SHIPM_AT, \'%Y-%m-%d\')', $a_shipm_time_start, $a_shipm_time_end]
            ])
            ->andFilterWhere(['or',
                ['like', $ORDER_CD_where, $search],
                ['like', 'TP.PARTNER_CODE', $search],
                ['like', 'T1.DEMANDSKU_CODE', $search],
                ['like', 'bc.CHANNEL_NAME_CN', $search],
                ['like', 'T1.PSKU_CODE', $search],
                ['like', 'T1.WAREHOUSE_CODE', $WAREHOUSE_CODES],
                ['like', 'T1.PO_NUMBER', $search],
                ['like', 'T1.FNSKU', $search],
                ['like', 'T1.KUKAI_NUMBER', $search],
                ['like', 'T1.TRANSPORT_MODE', $search],
                ['like', 'TP.PARTNER_NAME_CN', $search],
                ['like', 'TP.PARTNER_ANAME_CN', $search],
            ])
            ->orderBy('T1.URGENT_ORDER ASC,T1.PlAN_SHIPMENT_AT ASC')
            ->groupBy('T1.DISPATCH_NOTE_ID');

        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            $query->andWhere(['T1.ORGANISATION_ID' => $organization])
                ->andWhere(['T1.PSKU_ID' => $product_id])
                ->andWhere(['or', ['T1.DEMANDSKU_ID' => $product_id], ['T1.DEMANDSKU_ID' => null], ['T1.DEMANDSKU_ID' => '']]);
        }
        $data['data'] = $query;
        list($total, $data) = DBHelper::SearchList($query, ['limit' => $limit], $offset - 1);

        return $res->setModel('200', 0, Yii::t('shipment', 'Successful operation!'), $data, ['totalCount' => $total]);
//        return $res->setModel('200', 0, '操作成功!', $data, ['totalCount' => $total]);
    }

    /**
     * Calculation 审核
     * 采购订单明细中、库存调整单明细中的计划中的数量 增加/减少
     * @param $value ['IMPORT_STATE'] @来源单据类型1采购单2库存调整单
     * @param $value ['PU_ORDER_ID'] @来源单据ID
     * @param $value ['TRANSITW_SHIPMENTS'] @中转仓出货数
     * @param $value ['SUPPLIER_SHIPMENTS'] @供应商出货数
     * @param $value ['increase_decrease'] @增加减少区分 1增加 0减少
     * */
    public static function Calculation($value)
    {
        /** 采购订单明细 **/
        if ($value['IMPORT_STATE'] == '1') {
            $where = array('PURCHASE_DETAIL_ID' => $value['PU_ORDER_ID']);
            $setr1 = ['ITSWHSEPLA_QUANTITY', 'SUWHSEPLA_QUANTITY'];
            $PurchaseDetailDB = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getPurchaseDetail'], [$where, $setr1]]);
            if (count($PurchaseDetailDB) > 0) {
                if ($value['increase_decrease'] == '1') {
                    $setr = array(
                        'ITSWHSEPLA_QUANTITY' => (floatval($PurchaseDetailDB[0]['ITSWHSEPLA_QUANTITY']) + floatval($value['TRANSITW_SHIPMENTS'])),
                        'SUWHSEPLA_QUANTITY' => (floatval($PurchaseDetailDB[0]['SUWHSEPLA_QUANTITY']) + floatval($value['SUPPLIER_SHIPMENTS'])),
                    );
                } else {
                    $setr = array(
                        'ITSWHSEPLA_QUANTITY' => (floatval($PurchaseDetailDB[0]['ITSWHSEPLA_QUANTITY']) - floatval($value['TRANSITW_SHIPMENTS'])),
                        'SUWHSEPLA_QUANTITY' => (floatval($PurchaseDetailDB[0]['SUWHSEPLA_QUANTITY']) - floatval($value['SUPPLIER_SHIPMENTS'])),
                    );
                }
                Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'setPurchaseDetail'], [$setr, $where]]);
            }
        } else {
            /** 库存调整单明细 **/
            $where = array('ADJUSTMENT_DETAIL_ID' => $value['PU_ORDER_ID']);
            $setr2 = ['PLA_QUANTITY'];
            $AdjustmentDetailDB = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\AdjustmentLogic', 'getSkAdjustmentDetail'], [$where, $setr2]]);
            if (count($AdjustmentDetailDB) > 0) {
                if ($value['increase_decrease'] == '1') {
                    $setr = array('PLA_QUANTITY' => floatval($AdjustmentDetailDB[0]['PLA_QUANTITY']) + (floatval($value['TRANSITW_SHIPMENTS']) + floatval($value['SUPPLIER_SHIPMENTS'])));
                } else {
                    $setr = array('PLA_QUANTITY' => floatval($AdjustmentDetailDB[0]['PLA_QUANTITY']) - (floatval($value['TRANSITW_SHIPMENTS']) - floatval($value['SUPPLIER_SHIPMENTS'])));
                }

                Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\AdjustmentLogic', 'setAdjustmentDetail'], [$where, $setr]]);
            }

        }

    }


    /**
     * ToExamine
     * 发运单审核
     * @param $data @发运单数据结构
     * @return array
     * @throws
     * */
    public static function ToExamine($data)
    {
        $respone = new ResponeModel();
        // 校验 1
        if (isset($data['batchMTC']) && count($data['batchMTC']) > 0) {

            // 校验 2
            $batch = [];
            foreach ($data['batchMTC'] as $i => $item) {
                $batch[$i] = [];
                $items = static::search_dispatch_one(['DISPATCH_NOTE_ID' => $item['DISPATCH_NOTE_ID']]);
                if ($items['PLAN_STATE'] == '2') {
                    return $respone->setModel(500, 0, Yii::t('shipment', "The current document has been audited and cannot be operated on!"), $data);
//                    return $respone->setModel(500, 0, Yii::t('shipment', "已审核单据无法再次审核!"), $data);
                }
                if ($items['DELETED_STATE'] == '1') {
                    return $respone->setModel(500, 0, Yii::t('shipment', "The document is in the deleted state and cannot be audited!"), $data);
//                    return $respone->setModel(500, 0, Yii::t('shipment', "单据已是被删除状态，无法审核单据!"), $data);
                }

                $CUSTOMS_PRICE = floatval($items['CUSTOMS_PRICE']);
                if ($CUSTOMS_PRICE <= 0) {
                    return $respone->setModel(500, 0, Yii::t('shipment', "Customs declaration unit price must be greater than 0!"), $data);
//                    return $respone->setModel(500, 0, Yii::t('shipment', "报关单价必须大于0！"), $data);
                }
                $batch[$i] = $items;
            }
            //3返回直采或者代采数据
            $identical_data = static::getdirect($batch);

            foreach ($identical_data['all_data'] as $is) {
                $return_test = static::newrefuse($is);
                if (!$return_test) {
                    return $respone->setModel(500, 0, Yii::t('shipment', "The document is in the period of close account and cannot be audited!"), $data);
                }
            }
            $transaction = Yii::$app->db->beginTransaction();
            try {
                $test = null;
                //4直采操作
                $test = static::manipulation($identical_data['identical']);
                if ($test !== null) {
                    $transaction->rollBack();
                    return $test;
                }
                //5代采操作
                $test = static::substitution($identical_data['not_identical']);
                if ($test !== null) {
                    $transaction->rollBack();
                    return $test;
                }
                //6生成发运跟踪
                $test = static::SetTRACKING($identical_data['all_data']);
                if ($test !== null) {
                    $transaction->rollBack();
                    return $test;
                }
                #7-往上级单据反写修改计划中数量及已发货数量
                $str = static::CalculatedQuantity($identical_data['all_data']);

                //修改发运单审核状态
                $tests = static::setDisNot($str);
                if ($tests && $tests->status == '500') {
                    $test = $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failure:") . $tests->message), $data);
//                    return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "审核失败:") . $test->message), $data);
                }
                if ($test !== null) {
                    $transaction->rollBack();
                    return $test;
                } else {
                    $transaction->commit();
                    //返回提示
                    return $respone->setModel(200, 0, Yii::t('shipment', "Successful operation!"), $data);
//                return $respone->setModel(200, 0, Yii::t('shipment', "审核成功"), $data);
                }


            } catch (\Exception $e) {
                $transaction->rollBack();
                throw $e;
            }


        } else {
            return $respone->setModel(500, 0, Yii::t('shipment', "The structure is incomplete and cannot be audited!"), $data);
//            return $respone->setModel(500, 0, Yii::t('shipment', "结构不完整，无法审核单据!"), $data);
        }
    }

    /**
     * 单据生成后修改发运单审核字段
     * setDisNot
     * @param $data
     * @return array
     *
     **/
    public static function setDisNot($data)
    {
        $dispatchModel = array("batchMTC" => $data);
        $post = Yii::$app->getRequest()->getBodyParams();
        Yii::$app->getRequest()->setBodyParams($dispatchModel);
        $result = UpdateExt::actionDo(new ShDispatchNote(), $dispatchModel);
        Yii::$app->getRequest()->setBodyParams($post);
        if ($result instanceof ResponeModel) {
            return $result;
        }
    }

    /**
     *
     * 审核方法2 - 直采操作
     * manipulation
     * @param $data
     * @return array
     * */
    public static function manipulation($data)
    {
        if (count($data) > 0) {
            $purchase = [];
            $FIALLOCATION = [];
            $PENDING_STORAGE = [];
            foreach ($data as $i => $item) {
                #1如果发货仓库是供应商仓
                if ($item['DELIVER_WARID'] == null || !$item['DELIVER_WARID']) {
                    #根据采购订单分组-采购入库单
                    if ($item['IMPORT_STATE'] == '1') {
                        $purchase[] = $item;
                    }
                    if ($item['IMPORT_STATE'] == '2') {
                        $purchase[] = $item;
                    }
                }
                #根据组织平台实际发运日期分组 - 调拨单
                $FIALLOCATION[] = $item;
                #待入库数据 拼装
                $PENDING_STORAGE[$i] = static::AssembleWa($item, 1);

            }
            #1 生成入库单
            $test = static::GenerateWarehouse($purchase);
            if ($test) {
                return $test;
            }
            #2 生成调拨单
            $test = static::AppropriationNote($FIALLOCATION);
            if ($test) {
                return $test;
            }
            #3 生成待入库数据
            $test = static::AddPendingStorage($PENDING_STORAGE);
            if ($test) {
                return $test;
            }
        }
    }


    /**
     *
     * 审核方法1 - 拼装直采或者代采数据
     * getdirect
     * @param $data
     * @return array
     * */
    public static function getdirect($data)
    {
        $identical_data = [];
        $not_identical_data = [];
        $all_data = [];
        foreach ($data as $i => $item) {
            if ($item['IMPORT_STATE'] == '1') {
                #2-1.采购订单-采购组织
                $PurchaseDetail = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getPurchaseDetail'], [array('PURCHASE_DETAIL_ID' => $item['PU_ORDER_ID'])]]);
                $Purchase = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getPurchase'], [array('PU_PURCHASE_CD' => $PurchaseDetail[0]['PU_PURCHASE_CD'])]]);
                if ($item['ORGANISATION_ID'] == $Purchase[0]['ORGANISATION_ID']) {
                    $identical_data[$i] = [];
                    $identical_data[$i] = $item;
                    $identical_data[$i]['Purchase'] = $Purchase[0];
                    $identical_data[$i]['Purchase']['PurchaseDetail'] = $PurchaseDetail;
                } else {
                    $not_identical_data[$i] = [];
                    $not_identical_data[$i] = $item;
                    $not_identical_data[$i]['Purchase'] = $Purchase[0];
                    $not_identical_data[$i]['Purchase']['PurchaseDetail'] = $PurchaseDetail;
                }
                $all_data[$i] = [];
                $all_data[$i] = $item;
                $all_data[$i]['Purchase'] = $Purchase[0];
                $all_data[$i]['Purchase']['PurchaseDetail'] = $PurchaseDetail;

            }

            if ($item['IMPORT_STATE'] == '2') {
                #2-2.库存调整单 - 采购组织
                $AdjustmentDetail = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\AdjustmentLogic', 'getSkAdjustmentDetail'], [array('ADJUSTMENT_DETAIL_ID' => $item['PU_ORDER_ID'])]]);
                $Adjustment = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\AdjustmentLogic', 'getSkAdjustment'], [array('ADJUSTMENT_ID' => $AdjustmentDetail[0]['ADJUSTMENT_ID'])]]);
                #3.判断采购组织和需求组织是否一样
                if ($item['ORGANISATION_ID'] == $Adjustment[0]['PRGANISATION_ID']) {
                    $identical_data[$i] = [];
                    $identical_data[$i] = $item;
                    $identical_data[$i]['Adjustment'] = $Adjustment[0];
                    $identical_data[$i]['Adjustment']['AdjustmentDetail'] = $AdjustmentDetail;
                } else {
                    $not_identical_data[$i] = [];
                    $not_identical_data[$i] = $item;
                    $not_identical_data[$i]['Adjustment'] = $Adjustment[0];
                    $not_identical_data[$i]['Adjustment']['AdjustmentDetail'] = $AdjustmentDetail;
                }
                $all_data[$i] = [];
                $all_data[$i] = $item;
                $all_data[$i]['Adjustment'] = $Adjustment[0];
                $all_data[$i]['Adjustment']['AdjustmentDetail'] = $AdjustmentDetail;

            }
        }
        // 直采
        $str['identical'] = array_values($identical_data);
        // 代采
        $str['not_identical'] = array_values($not_identical_data);
        // 全部数据
        $str['all_data'] = array_values($all_data);

        return $str;
    }


    /**
     * CalculatedQuantity
     * 计算数量，修改采购订单或者库存调整单中的计划中数量及已发运数量
     * @param $dates
     * @return array
     **/
    public static function CalculatedQuantity($dates)
    {
        //7-1发运单审核或者从删除，需要将计划发运数量根据仓库从采购订单或者库存调整单的中转仓计划数量或者供应商计划数量栏位减去.
        //7-2当发运单审核的时候，需将实际发运数量加到采购订单或者库存调整单的已发运数量.
        if (count($dates) > 0) {
            $return_str = [];
            $user = Yii::$app->getUser();
            foreach ($dates as $i => $item) {

                $return_str[$i]['DISPATCH_NOTE_ID'] = $item['DISPATCH_NOTE_ID'];
                $return_str[$i]['PLAN_STATE'] = 2;
                $return_str[$i]['AUTITO_ID'] = $user && !$user->isGuest ? $user->getIdentity()->USER_INFO_ID : '1';//审核人
                $return_str[$i]['AUTITO_AT'] = time();//审核时间
                $return_str[$i]['ORGANISATION_ID'] = $item['ORGANISATION_ID'];
                #采购
                if ($item['IMPORT_STATE'] == '1') {
                    $Purchase_db = (new Query())->from('pu_purchase_detail')->select(['SHIPPED_QUANTITY', 'ITSWHSEPLA_QUANTITY', 'SUWHSEPLA_QUANTITY'])->where(['PURCHASE_DETAIL_ID' => $item['PU_ORDER_ID']])->one();
                    $LOG_SHIPPED_QUANTITY = $Purchase_db['SHIPPED_QUANTITY'];
                    $SHIPPED_QUANTITY = floatval($item['ACTUAL_SHIPM_NUM']) + floatval($LOG_SHIPPED_QUANTITY);//已发运数量
                    $ITSWHSEPLA_QUANTITY = $Purchase_db['ITSWHSEPLA_QUANTITY'];
                    $SUWHSEPLA_QUANTITY = $Purchase_db['SUWHSEPLA_QUANTITY'];
                    //采购订单
                    if ($item['DELIVER_WARID'] != null || $item['DELIVER_WARID']) {
                        //中转仓-计划中数量
                        $ITSWHSEPLA_QUANTITY = floatval($ITSWHSEPLA_QUANTITY) - floatval($item['TRANSITW_SHIPMENTS']);
                    } else {
                        //供应商仓 - 计划中数量
                        $SUWHSEPLA_QUANTITY = floatval($SUWHSEPLA_QUANTITY) - floatval($item['SUPPLIER_SHIPMENTS']);
                    }
                    $data = [
                        'SHIPPED_QUANTITY' => $SHIPPED_QUANTITY,
                        'ITSWHSEPLA_QUANTITY' => $ITSWHSEPLA_QUANTITY,
                        'SUWHSEPLA_QUANTITY' => $SUWHSEPLA_QUANTITY
                    ];

                    Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'setPurchaseDetail'], [$data, ['PURCHASE_DETAIL_ID' => $item['PU_ORDER_ID']]]]);

                }
                #库存调整
                if ($item['IMPORT_STATE'] == '2') {
                    $Adjustment_db = (new Query())->from('sk_adjustment_detail')->select(['SHIPPED_QUANTITY', 'PLA_QUANTITY'])->where(['ADJUSTMENT_DETAIL_ID' => $item['PU_ORDER_ID']])->one();

                    $SHIPPED_QUANTITY = floatval($item['ACTUAL_SHIPM_NUM']) + floatval($Adjustment_db['SHIPPED_QUANTITY']);//已发运数量
                    $ITSWHSEPLA_QUANTITY = floatval($Adjustment_db['PLA_QUANTITY']) - floatval($item['TRANSITW_SHIPMENTS']) - floatval($item['SUPPLIER_SHIPMENTS']);
                    $data1 = [
                        'PLA_QUANTITY' => $ITSWHSEPLA_QUANTITY,
                        'SHIPPED_QUANTITY' => $SHIPPED_QUANTITY
                    ];
                    Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\AdjustmentLogic', 'setAdjustmentDetail'], [['ADJUSTMENT_DETAIL_ID' => $item['PU_ORDER_ID']], $data1]]);

                }
            }
            return $return_str;
        }
    }

    /**
     * 生成发运跟踪
     * SetTRACKING
     * @param $datas
     * @return array
     * */
    public static function SetTRACKING($datas)
    {
        #1拼装数据
        #主表计划日期/国家/运输方式/次数 不可编辑
        #子表 SKU/货描/发运数量/已收货数量/实际送达时间/采购币种/采购单价/清关币种/清关单价/件数/净重/毛重/体积

        if (count($datas) > 0) {
            $purchase = [];
            $SKU_CODE = [];
            $ORGANISATION_CODE = [];
            #2分组
            foreach ($datas as $item) {
                //按照 计划日期/国家/运输方式/次数 分组
                $purchase[$item['PlAN_SHIPMENT_AT'] . $item['ORGANISATION_ID'] . $item['TRANSPORT_MODE'] . $item['KUKAI_NUMBER']][] = $item;
                #抽取来源单据是库存调整单的数据
                if ($item['IMPORT_STATE'] == '2') {
                    $SKU_CODE[] = $item['PSKU_ID'];
                    $ORGANISATION_CODE[] = $item['ORGANISATION_ID'];
                }

            }
            #3拼装数据
            $data = [];
            $i = 0;
            foreach ($purchase as $is => $item) {
                //单据内容
                $data[$i] = [];
                $data[$i] = [
                    'PLAN_AT' => $item[0]['PlAN_SHIPMENT_AT'],//计划日期
                    'ORGANISATION_ID' => $item[0]['ORGANISATION_ID'],//国家/组织
                    'TRANSPORT_MODE' => $item[0]['TRANSPORT_MODE'],//运输方式
                    'CHANNEL_ID' => $item[0]['CHANNEL_ID'],//平台
                    'CNUMBER' => $item[0]['KUKAI_NUMBER'],//次数
                    'WAREHOUSE_ID' => $item[0]['WAREHOUSE_ID'],//目的仓
                    'ACTUAL_SHIPM_AT' => $item[0]['ACTUAL_SHIPM_AT'],//实际发运日期
                    'EXPECTED_SERVICE_AT' => $item[0]['EXPECTED_SERVICE_AT'],//预计送达日期
                ];

                $data[$i]['sh_tracking_detail'] = [];
                foreach ($item as $ii => $items) {
                    $data[$i]['sh_tracking_detail'][$ii] = [];
                    $data[$i]['sh_tracking_detail'][$ii] = [
                        'PSKU_ID' => $items['DEMANDSKU_ID'],//SKU ID
                        'PSKU_CODE' => $items['DEMANDSKU_CODE'],//SKU
                        'GOODS_DESCRIBE' => isset($items['Purchase']) ? $items['Purchase']['PurchaseDetail'][0]['PSKU_NAME_CN'] : $items['Adjustment']['AdjustmentDetail'][0]['TDRODUCT_DE'],//货描
                        'SHIPMENT_NUMBER' => $items['ACTUAL_SHIPM_NUM'],//发运数量
//                        'ARECIPIENT_NUM' => 0,//已收货数量
//                        'ACTUALS_ERVICE_AT' => null,//实际送达时间
                        'PU_MONEY_ID' => isset($items['Purchase']) ? $items['Purchase']['MONEY_ID'] : '',//采购币种
                        'PU_MONEY' => isset($items['Purchase']) ? $items['Purchase']['PurchaseDetail'][0]['TAX_UNITPRICE'] : $items['Adjustment']['AdjustmentDetail'][0]['UNIT_PRICE'],//采购单价
                        'CLEARANCE_MONEY_ID' => $items['MONEY_ID'],//清关币种
                        'CLEARANCE_MONEY' => $items['CUSTOMS_PRICE'],//清关单价
                    ];

                    #查询SKU数据 - 体积
                    $FCL_LONG = $items['FCL_LONG'];//长
                    $FCL_WIDE = $items['FCL_WIDE'];//宽
                    $FCL_HIGH = $items['FCL_HIGH'];//高
                    $FCL_NET_WEIGHT = $items['FCL_NET_WEIGHT'];//净重
                    $GROSS_WEIGHT = $items['GROSS_WEIGHT'];//毛重

                    $data[$i]['sh_tracking_detail'][$ii]['GNUMBER'] = floatval($items['FCL_NUM']) + floatval($items['LAST_NUM']);//件数= 尾箱数+整箱数
                    $data[$i]['sh_tracking_detail'][$ii]['NET_WEIGHT'] = floatval($FCL_NET_WEIGHT);//净重
                    $data[$i]['sh_tracking_detail'][$ii]['GROSS_WEIGHT'] = floatval($GROSS_WEIGHT);//毛重
                    $data[$i]['sh_tracking_detail'][$ii]['VOLUME'] = (floatval($FCL_LONG) * floatval($FCL_WIDE) * floatval($FCL_HIGH)) % 1000000;//体积
                    $data[$i]['sh_tracking_detail'][$ii]['DISPATCH_NOTE_ID'] = $items['DISPATCH_NOTE_ID'];//发运单ID
                    $data[$i]['sh_tracking_detail'][$ii]['PU_ORDER_CD'] = isset($items['Purchase']) ? $items['Purchase']['PU_PURCHASE_CD'] : $items['Adjustment']['ADJUSTMENT_CD'];//采购单号
                }
                $i++;
            }

            #4调用发运跟踪新增接口
            $respone = new ResponeModel();
            try {
                $test = Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\trackingdetailLogic', 'addTracking'], [$data]]);
                if ($test && $test->status == '500') {
                    return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failed: shipment tracking generation error occurred. Error prompt:") . $test->message), $data);
                }
            } catch (ServerErrorHttpException $msg) {
                return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failed: shipment tracking generation error occurred. Error prompt:") . $msg->getMessage()), $data);
            }

        }
    }

    /**
     * AssembleWa
     * 待入库数据拼装
     * @param $item @结构
     * @param $num 1直采 2代采
     * @return array
     * */
    public
    static function AssembleWa($item, $num)
    {
        $data = [
            'PRGANISATION_ID' => $item['ORGANISATION_ID'],//发运单.需求组织
            'NOTE_ID' => $item['DISPATCH_NOTE_ID'],//发运单/调拨单
            'IMPORT_STATE' => 1,//1:发运单，2调拨单
            'TDRODUCT_DE' => isset($item['Purchase']) ? $item['Purchase']['PurchaseDetail'][0]['PSKU_NAME_CN'] : $item['Adjustment']['AdjustmentDetail'][0]['TDRODUCT_DE'],//产品描述
            'PLAN_AT' => $item['EXPECTED_SERVICE_AT'],//发运单.预计送达日期
            'ACTUAL_AT' => $item['EXPECTED_SERVICE_AT'],//发运单.预计送达日期
            'PSKU_ID' => $item['DEMANDSKU_ID'],//发运单.需求国SKU ID
            'PSKU_CODE' => $item['DEMANDSKU_CODE'],//发运单.需求国SKU
            'SHIPMENT_NUMBER' => $item['ACTUAL_SHIPM_NUM'],//发运单.实际发运数量
            'RECEIVE_NUMBER' => 0,
            'ATWAREHOUSE_ID' => $item['WAREHOUSE_ID'],//发运单.目的仓
            'ETWAREHOUSE_ID' => static::CallinWarehouse($item['ORGANISATION_ID'], $item['CHANNEL_ID'], $item['WAREHOUSE_ID']),//内部采购订单.采购组织/平台的，在途仓（目的仓是2的，找3；目的仓是5，找6）
            'PLAN_STATE' => 0,//状态:0未收货，1正在收货，2,已收货
            'CLOSING_STATE' => 0,//是否关账，0:未关账 1:已关账
        ];
        return $data;
    }

    /**
     *
     * 审核方法2-1 - 代采操作
     * substitution
     * @param $data
     * @return array
     * */
    public
    static function substitution($data)
    {
        if (count($data) > 0) {
            $purchase = [];//采购入库
            $SALES_ORDER = [];//销售订单,内部销售出库,内部采购订单，内部采购入库单
            $PENDING_STORAGE = [];//待入库
            foreach ($data as $i => $item) {
                #1如果发货仓库是供应商仓
                if ($item['DELIVER_WARID'] == null || !$item['DELIVER_WARID']) {
                    #根据采购订单分组-采购入库单
                    if ($item['IMPORT_STATE'] == '1') {
                        $purchase[] = $item;
                        $SALES_ORDER[] = $item;

                    }
                    if ($item['IMPORT_STATE'] == '2') {
                        $purchase[] = $item;
                        $SALES_ORDER[] = $item;
                    }
                } else {
                    #根据采购订单分组-采购入库单
                    if ($item['IMPORT_STATE'] == '1') {
                        $SALES_ORDER[] = $item;

                    }
                    if ($item['IMPORT_STATE'] == '2') {
                        $SALES_ORDER[] = $item;
                    }
                }
                #待入库数据 拼装
                $PENDING_STORAGE[$i] = static::AssembleWa($item, 2);

            }
            #1 生成入库单
            $test = static::GenerateWarehouse($purchase);
            if ($test) {
                return $test;
            }
            #2 生成内部销售订单
            $test = static::SetSalesOrder($SALES_ORDER);
            if ($test) {
                return $test;
            }
            #2-1 根据内部销售订单 生成内部销售出库
            $test = static::SetdeliveryStorage($SALES_ORDER);
            if ($test) {
                return $test;
            }
            #3 生成内部采购订单
            $test = static::SET_PURCHASE($SALES_ORDER);
            if ($test) {
                return $test;
            }
            #3-1 根据内部采购订单 生成内部采购入库单
            $test = static::SetGgodownEntry($SALES_ORDER);
            if ($test) {
                return $test;
            }
            #4 生成待入库数据
            $test = static::AddPendingStorage($PENDING_STORAGE);
            if ($test) {
                return $test;
            }
        }
    }

    /**
     * 内部采购入库单生成
     * SetGgodownEntry
     * @param $datas
     * @return array
     * */
    public
    static function SetGgodownEntry($datas)
    {
        if (count($datas) > 0) {
            #拼装数据
            $data = [];
            $DISPATCH_NOTE_ID = [];
            foreach ($datas as $is => $item) {
                $DISPATCH_NOTE_ID[] = $item['DISPATCH_NOTE_ID'];
                $ShDispatchNote = ShDispatchNote::find()->select(['INTERNAL_PURCHASING_CD', 'INTERNAL_PURCHASING_ID'])->where(array('DISPATCH_NOTE_ID' => $item['DISPATCH_NOTE_ID']))->asArray()->one();
                $purchaseDB = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getPurchase'], [array('PU_PURCHASE_CD' => $ShDispatchNote['INTERNAL_PURCHASING_CD'])]]);
                $data[$is] = [
                    'ORGANISATION_ID' => $item['ORGANISATION_ID'],//内部采购订单.采购组织
                    'STORAGE_AT' => $item['ACTUAL_SHIPM_AT'],//内部采购订单.制单日期
                    'ORDER_TYPE' => 2,//1.采购入库、2.内部采购入库、3.其他入库
                    'DELETED_STATE' => 0,
                    'PARTNER_ID' => static::getPARTNER_CODE(isset($item['Purchase']) ? $item['Purchase']['ORGANISATION_ID'] : $item['Adjustment']['PRGANISATION_ID']),//内部采购订单的供应商编码
                    'WAREHOUSE_ID' => static::CallinWarehouse($item['ORGANISATION_ID'], $item['CHANNEL_ID'], $item['WAREHOUSE_ID']),//内部采购订单.采购组织/平台的，在途仓（目的仓是2的，找3；目的仓是5，找6）
                    'ORDER_STATE' => 1,
                    'MONEY_ID' => $item['MONEY_ID'],//内部采购订单.币种
                    'CREATED_AT' => $purchaseDB[0]['CREATED_AT'] !== null ? $purchaseDB[0]['CREATED_AT'] : '',//内部采购订单.制单日期
                    'SYSTEM_GENERATION' => 1,
                    'CLOSING_STATE' => 0,
                    'DISPATCH_NOTE_ID' => $item['DISPATCH_NOTE_ID'],
                    'STORAGE_MONEY' => floatval($item['CUSTOMS_PRICE']) * floatval($item['ACTUAL_SHIPM_NUM']),
                ];
                $data[$is]['sk_storage_detail'][0] = [
                    'DISPATCH_NOTE_ID' => $item['DISPATCH_NOTE_ID'],
                    'ORDER_TYPE' => 2,//1.采购入库、2.内部采购入库、3.其他入库
                    'PU_ORDER_CD' => $ShDispatchNote['INTERNAL_PURCHASING_CD'],//内部采购订单.单号
                    'PURCHASE_DETAIL_ID' => $ShDispatchNote['INTERNAL_PURCHASING_ID'],//内部采购订单.单号
                    'PSKU_ID' => $item['DEMANDSKU_ID'],//内部采购订单.SKU ID
                    'PSKU_CODE' => $item['DEMANDSKU_CODE'],//内部采购订单.SKU
                    'PSKU_NAME_CN' => isset($item['Purchase']) ? $item['Purchase']['PurchaseDetail'][0]['PSKU_NAME_CN'] : $item['Adjustment']['AdjustmentDetail'][0]['TDRODUCT_DE'],
                    'UNIT_ID' => isset($item['Purchase']) ? $item['Purchase']['PurchaseDetail'][0]['UNIT_ID'] : $item['Adjustment']['AdjustmentDetail'][0]['UNIT_ID'],//内部采购订单.单位
                    'STORAGE_DNUMBER' => $item['ACTUAL_SHIPM_NUM'],//内部采购订单.数量
                    'UNIT_PRICE' => $item['CUSTOMS_PRICE'],//内部采购订单.含税单价
                    'STORAGE_DMONEY' => floatval($item['CUSTOMS_PRICE']) * floatval($item['ACTUAL_SHIPM_NUM']),
                    'STORAGE_AT' => $item['ACTUAL_SHIPM_AT'],//内部采购订单.下单日期
                    'SWAREHOUSE_ID' => static::CallinWarehouse($item['ORGANISATION_ID'], $item['CHANNEL_ID'], $item['WAREHOUSE_ID']),//内部采购订单.采购组织/平台的，在途仓（目的仓是2的，找3；目的仓是5，找6）
                    'TAX_RATE' => 0,//税率
                    'NOT_TAX_UNITPRICE' => $item['CUSTOMS_PRICE'],//不含税单价
                    'NOT_TAX_AMOUNT' => floatval($item['CUSTOMS_PRICE']) * floatval($item['ACTUAL_SHIPM_NUM']),//不含税金额
                ];
            }

            #2. 内部采购入库单生成新增接口
            $respone = new ResponeModel();
            try {
                $test = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'addStorage'], [$data]]);
                if ($test && $test->status == '500') {
                    return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failure: internal purchase order form error. Error prompt:") . $test->message), $data);
                }
                #3. 内部采购入库单生成-审核接口
                $ShDispatchNoteDB = ShDispatchNote::find()->select(['INTERNAL_PURCHASINGST_CD'])->where(array('DISPATCH_NOTE_ID' => $DISPATCH_NOTE_ID))->asArray()->all();
                if (count($ShDispatchNoteDB) > 0) {
                    #3-1 拼装入库单审核需要的结构
                    $Storage = [];
                    foreach ($ShDispatchNoteDB as $a => $itm) {
                        $StorageL = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'getStorageDelisc'], [['STORAGE_CD' => $itm['INTERNAL_PURCHASINGST_CD']]]]);
                        $Storage[$a] = [];
                        $Storage[$a] = $StorageL;
                        $Storage[$a]['ORDER_STATE'] = 2;
                        $Storage[$a]['authFlag'] = 1;
                        $Storage[$a]['ORDER_TYPE'] = 2;
                    }
                    $models = [
                        'ORDER_STATE' => 2,
                        'batchMTC' => $Storage
                    ];

                    $test1 = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'updateCustom'], [$models]]);
                    if ($test1 instanceof ResponeModel) {
                        return $test1;
                    }

                }
            } catch (ServerErrorHttpException $msg) {
                return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failure: internal purchase order form error. Error prompt:") . $msg->getMessage()), $data);
            }

            #通过采购订单单号 查询出入库表

        }
    }


    /**
     * 生成内部采购订单
     * SET_PURCHASE
     * @param $datas
     * @return array
     * */
    public
    static function SET_PURCHASE($datas)
    {
        if (count($datas) > 0) {
            #拼装数据
            $data = [];
            $DISPATCH_NOTE_ID = [];
            foreach ($datas as $ii => $items) {
                $DISPATCH_NOTE_ID[] = $items['DISPATCH_NOTE_ID'];
                $data[$ii] = [
                    'ORGANISATION_ID' => $items['ORGANISATION_ID'],//发运单.需求组织
                    'PARTNER_ID' => static::getPARTNER_CODE(isset($items['Purchase']) ? $items['Purchase']['ORGANISATION_ID'] : $items['Adjustment']['PRGANISATION_ID']),//发运单采购组织对应的业务伙伴;
                    'MONEY_ID' => $items['MONEY_ID'],//发运单.报关币种
                    'CHANNEL_ID' => $items['CHANNEL_ID'],//发运单.平台
                    'DORGANISATION_ID' => $items['ORGANISATION_ID'],//发运单.需求组织
                    'SMETHOD' => 3,//月结固定
                    'ORDER_TYPE' => 2,//1采购订单 2内部采购订单
                    'ORDER_STATE' => 1,//1.未审核、2.已审核
                    'DELETED_STATE' => 0,//是否删除,1:删除 0:未删除
                    'PLAN_TYPE' => 1,//1.翻单、2.首单、3.备品
                    'PRE_ORDER_AT' => $items['ACTUAL_SHIPM_AT'],//发运单.实际发运日期
                    'ORDER_AMOUNT' => floatval($items['ACTUAL_SHIPM_NUM']) * floatval($items['CUSTOMS_PRICE']),//金额
                ];
                $data[$ii]['pu_purchase_detail'][0] = [
                    'DISPATCH_NOTE_ID' => $items['DISPATCH_NOTE_ID'],
                    'PSKU_ID' => $items['DEMANDSKU_ID'],//发运单.实际SKU ID
                    'PSKU_CODE' => $items['DEMANDSKU_CODE'],//发运单.实际SKU
                    'PSKU_NAME_CN' => isset($items['Purchase']) ? $items['Purchase']['PurchaseDetail'][0]['PSKU_NAME_CN'] : $items['Adjustment']['AdjustmentDetail'][0]['TDRODUCT_DE'],
                    'UNIT_ID' => isset($items['Purchase']) ? $items['Purchase']['PurchaseDetail'][0]['UNIT_ID'] : $items['Adjustment']['AdjustmentDetail'][0]['UNIT_ID'],//发运单.报关单位
                    'PURCHASE' => $items['ACTUAL_SHIPM_NUM'],//发运单.实际发运数量
                    'TAX_UNITPRICE' => $items['CUSTOMS_PRICE'],//发运单.报关单价
                    'TAX_AMOUNT' => floatval($items['ACTUAL_SHIPM_NUM']) * floatval($items['CUSTOMS_PRICE']),//金额
                    'COMMI_PERIOD' => $items['ACTUAL_SHIPM_AT'],//发运单.实际发运日期
                    'DEMAND_AT' => $items['ACTUAL_SHIPM_AT'],//发运单.实际发运日期
                    'FNSKU' => $items['FNSKU'],//发运单.新产品条码
                    'RGOODS_NUMBER' => 0,
                    'RGOODS_AMOUNT' => 0,
                    'THIS_APPLY_AMOUNT' => 0,
                    'INSPECTION_STATE' => 1,
                    'INSPECTION_NUMBER' => $items['ACTUAL_SHIPM_NUM'],//发运单.实际发运数量
                    'SCHEDULING_NUMBER' => 0,
                    'EACH_NUMBER' => $items['PACKING_NUMBER'],
                    'FCL_NUMBER' => $items['FCL_NUM'],
                    'FCL_LONG' => $items['FCL_LONG'],
                    'FCL_WIDE' => $items['FCL_WIDE'],
                    'FCL_HIGH' => $items['FCL_HIGH'],
                    'GROSS_WEIGHT' => $items['GROSS_WEIGHT'],
                    'FCL_NET_WEIGHT' => $items['FCL_NET_WEIGHT'],

                    'TAILBOX_BNUMBER' => $items['TAILBOX_BNUMBER'],//'尾箱每箱数量
                    'TAILBOX_NUMBER' => $items['LAST_NUM'],//尾箱数
                    'TAILBOX_LONG' => $items['TAILBOX_LONG'],
                    'TAILBOX_WIDE' => $items['TAILBOX_WIDE'],
                    'TAILBOX_HIGH' => $items['TAILBOX_HIGH'],
                    'TAILBOX_WEIGHT' => $items['TAILBOX_NETWEIGHT'],//尾箱-毛重
                    'TAILBOX_NETWEIGHT' => $items['TAILBOX_WEIGHT'],//尾箱-净重

                    'NOT_TAX_UNITPRICE' => $items['CUSTOMS_PRICE'],//发运单.报关单价
                    'NOT_TAX_AMOUNT' => floatval($items['ACTUAL_SHIPM_NUM']) * floatval($items['CUSTOMS_PRICE']),//金额
                    'TAX_RATE' => 0,
                    'CHANNEL_ID' => $items['CHANNEL_ID'],//发运单.平台
                ];
            }
            $respone = new ResponeModel();
            #2.调用内内部采购订单新增接口
            try {

                $test = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'addPurchase'], [$data]]);
                if ($test && $test->status == '500') {
                    return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failed: internal purchase order generation error. Error prompt:") . $test->message), $data);
                }
                #3.调用内部采购订单编辑-审核接口
                $ShDispatchNoteDB = ShDispatchNote::find()->select(['INTERNAL_PURCHASING_CD'])->where(array('DISPATCH_NOTE_ID' => $DISPATCH_NOTE_ID))->asArray()->all();

                if (count($ShDispatchNoteDB) > 0) {
                    #3-1 拼装内部采购订单审核需要的结构
                    $Storage = [];
                    foreach ($ShDispatchNoteDB as $a => $itm) {
                        $id = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getPurchase'], [array('PU_PURCHASE_CD' => $itm['INTERNAL_PURCHASING_CD']), [], []]]);
                        $idDetail = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getPurchaseDetail'], [array('PU_PURCHASE_CD' => $itm['INTERNAL_PURCHASING_CD']), []]]);
                        $Storage[$a] = $id[0];
                        $Storage[$a]['ORDER_STATE'] = 2;
                        $Storage[$a]['edit_type'] = 1;
                        $Storage[$a]['pu_purchase_detail'] = $idDetail;
                    }
                    $test1 = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'SetPurchase'], [$Storage]]);
                    if ($test1 && $test1->status == '500') {
                        return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failed: internal purchase order generation error. Error prompt:") . $test1->message), $data);
                    }
                }
            } catch (ServerErrorHttpException $msg) {

                return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failed: internal purchase order generation error. Error prompt:") . $msg->getMessage()), $data);
            }


        }
    }

    /**
     * SetdeliveryStorage
     * 生成内部销售出库单
     * @param $datas
     * @return array
     * */
    public
    static function SetdeliveryStorage($datas)
    {
        if (count($datas) > 0) {
            $respone = new ResponeModel();
            $DISPATCH_NOTE_ID = [];
            $data = [];
            #拼装数据
            foreach ($datas as $i => $item) {
                $DISPATCH_NOTE_ID[] = $item['DISPATCH_NOTE_ID'];
                $data[$i]['PRGANISATION_ID'] = isset($item['Purchase']) ? $item['Purchase']['ORGANISATION_ID'] : $item['Adjustment']['PRGANISATION_ID'];//内部销售订单.组织
                $data[$i]['PLACING_AT'] = $item['ACTUAL_SHIPM_AT'];//内部销售订单.下单时间
                $data[$i]['ORDER_TYPE'] = 2;//1.销售出库、2.内部销售出库、3.其他出库
                $data[$i]['PPARTNER_ID'] = static::getPARTNER_CODE($item['ORGANISATION_ID']);//内部销售订单.客户
                if ($data[$i]['PPARTNER_ID'] == '' || $data[$i]['PPARTNER_ID'] == null) {
                    return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failure: internal sales out of order generated error. Error warning: the shipment request organization does not bind the business partner.")), $data);
                }
                $data[$i]['PWAREHOUSE_ID'] = static::getContinentalThere(1, $item['CHANNEL_ID'], [isset($item['Purchase']) ? $item['Purchase']['ORGANISATION_ID'] : $item['Adjustment']['PRGANISATION_ID']]);//发运单的组织/平台的类型是1的仓库
                $data[$i]['PMONEY_ID'] = $item['MONEY_ID'];//内部销售订单.币种
                $data[$i]['PLAN_STATE'] = 1;
                $data[$i]['DELETED_STATE'] = 0;
                $data[$i]['CLOSING_STATE'] = 0;
                $data[$i]['SYSTEM_GENERATION'] = 1;
                $data[$i]['PMONEY'] = floatval($item['CUSTOMS_PRICE']) * $item['ACTUAL_SHIPM_NUM'];//价税合计
                $ShDispatchNote = ShDispatchNote::find()->select(['INTERNAL_SALES_CD', 'INTERNAL_SALES_ID'])->where(array('DISPATCH_NOTE_ID' => $item['DISPATCH_NOTE_ID']))->asArray()->one();
                $INTERNAL_SALES_CD[] = $ShDispatchNote['INTERNAL_SALES_CD'];
                $data[$i]['sk_placing_detail'][0] = [
                    'DISPATCH_NOTE_ID' => $item['DISPATCH_NOTE_ID'],
                    'SALES_ORDER' => $ShDispatchNote['INTERNAL_SALES_CD'],//内部销售订单.单号
                    'SALES_ORDER_DETAIL_ID' => $ShDispatchNote['INTERNAL_SALES_ID'],//内部销售订单明细ID
                    'PSKU_ID' => $item['PSKU_ID'],//内部销售订单.SKU ID
                    'PDSKU_CODE' => $item['PSKU_CODE'],//内部销售订单.SKU
                    'PRODUCT_DE' => isset($item['Purchase']) ? $item['Purchase']['PurchaseDetail'][0]['PSKU_NAME_CN'] : $item['Adjustment']['AdjustmentDetail'][0]['TDRODUCT_DE'],
                    'UNIT_ID' => isset($item['Purchase']) ? $item['Purchase']['PurchaseDetail'][0]['UNIT_ID'] : $item['Adjustment']['AdjustmentDetail'][0]['UNIT_ID'],//发运单.报关单位;//内部销售订单.单位
                    'PDNUMBER' => $item['ACTUAL_SHIPM_NUM'],//内部销售订单.数量
                    'UNIT_PRICE' => $item['CUSTOMS_PRICE'],//内部销售订单.含税单价
                    'TAX_RATE' => 0,//内部销售订单.税率
                    'NOT_TAX_UNITPRICE' => $item['CUSTOMS_PRICE'],//内部销售订单.不含税单价
                    'NOT_TAX_AMOUNT' => floatval($item['CUSTOMS_PRICE']) * $item['ACTUAL_SHIPM_NUM'],//内部销售订单.不含税金额
                    'PDMONEY' => floatval($item['CUSTOMS_PRICE']) * $item['ACTUAL_SHIPM_NUM'],//价税合计
                    'PDWAREHOUSE_ID' => $data[$i]['PWAREHOUSE_ID'],//发运单的组织/平台的类型是1的仓库
                ];
            }
            #2.调用内部销售出库新增接口

            try {
                $test = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\placingLogic', 'addPlacing'], [$data]]);
                if ($test && $test->status == '500') {
                    return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failure: internal sales out of order generated error. Error prompt:") . $test->message), $data);
                }
                #3.调用内部销售出库编辑-审核接口

                $ShDispatchNoteDB = ShDispatchNote::find()->select(['INTERNAL_SALESTH_CD'])->where(array('DISPATCH_NOTE_ID' => $DISPATCH_NOTE_ID))->asArray()->all();
                if (count($ShDispatchNoteDB) > 0) {
                    #3-1 拼装内部销售出库审核需要的结构
                    foreach ($ShDispatchNoteDB as $a => $itm) {
                        $placing_infos = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\placingLogic', 'getSkPlacing'], [[], array('PLACING_CD' => $itm['INTERNAL_SALESTH_CD'])]]);
                        $query_l = (new Query())->from('sk_placing_detail')->where(array('PLACING_ID' => $placing_infos[0]['PLACING_ID']))->all();
                        $placing_infos[0]['sk_placing_detail'] = $query_l;
                        $placing_infos[0]['PLAN_STATE'] = 2;
                        $placing_infos[0]['authFlag'] = 1;
                        $test1 = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\placingLogic', 'SetPlacing'], [$placing_infos]]);
                        if ($test1 && $test1->status == '500') {
                            return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failure: internal sales out of order generated error. Error prompt:") . $test1->message), $data);
                        }
                    }

                }
            } catch (ServerErrorHttpException $msg) {
                return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failure: internal sales out of order generated error. Error prompt:") . $msg->getMessage()), $data);
            }

        }
    }


    /**
     * SetSalesOrder
     * 生成内部销售订单
     * @param $datas
     * @return array
     * */
    public
    static function SetSalesOrder($datas)
    {
        if (count($datas) > 0) {
            $respone = new ResponeModel();
            #拼装数据
            $data = [];
            $DISPATCH_NOTE_ID = [];
            foreach ($datas as $is => $item) {
                $DISPATCH_NOTE_ID[] = $item['DISPATCH_NOTE_ID'];
                $data[$is]['CRGANISATION_ID'] = isset($item['Purchase']) ? $item['Purchase']['ORGANISATION_ID'] : $item['Adjustment']['PRGANISATION_ID'];//采购订单.采购组织;
                $data[$is]['ORDER_TYPE'] = 1;//单据类型1.内部销售订单
                $data[$is]['PRE_ORDER_AT'] = $item['ACTUAL_SHIPM_AT'];//下单时间 发运单.实际发运时间
                $data[$is]['PARTNER_ID'] = static::getPARTNER_CODE($item['ORGANISATION_ID']);//客户 发运单需求组织对应绑定的业务伙伴
                if ($data[$is]['PARTNER_ID'] == '' || $data[$is]['PARTNER_ID'] == null) {
                    return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failed: internal sales order generation error. Error warning: the shipment request organization does not bind the business partner.")), $data);
                }
                $data[$is]['MONEY_ID'] = $item['MONEY_ID'];//发运单.报关币种
                $data[$is]['ORDER_STATE'] = 1;//审核状态,1:未审核 2:已审核
                $data[$is]['SYSTEM_GENERATION'] = 1;//是否系统生成,0:否 1:是
                $data[$is]['TOTAL_AMOUNT'] = floatval($item['CUSTOMS_PRICE']) * $item['ACTUAL_SHIPM_NUM'];//价税合计
                $data[$is]['cr_sales_order_detail'][0] = [
                    'DISPATCH_NOTE_ID' => $item['DISPATCH_NOTE_ID'],
                    'PSKU_ID' => $item['PSKU_ID'],//发运单里的采购单SKU ID
                    'PSKU_CODE' => $item['PSKU_CODE'],//发运单里的采购单SKU
                    'UNIT_ID' => isset($item['Purchase']) ? $item['Purchase']['PurchaseDetail'][0]['UNIT_ID'] : $item['Adjustment']['AdjustmentDetail'][0]['UNIT_ID'],//发运单.报关单位
                    'PURCHASE' => $item['ACTUAL_SHIPM_NUM'],//发运单.实际发运数量
                    'TAX_RATE' => 0,
                    'TAX_UNITPRICE' => $item['CUSTOMS_PRICE'],//发运单.报关单价
                    'TOTAL_TAX_AMOUNT' => floatval($item['CUSTOMS_PRICE']) * $item['ACTUAL_SHIPM_NUM'],//价税合计
                    'NOT_TAX_UNITPRICE' => $item['CUSTOMS_PRICE'],//不含税单价
                    'NOT_TAX_AMOUNT' => floatval($item['CUSTOMS_PRICE']) * $item['ACTUAL_SHIPM_NUM'],//不含税金额
                ];
            }

            #2.调用销售订单新增接口

            try {
                $test = Yii::$app->rpc->create('sales')->sendAndrecv([['\addons\sales\modellogic\salesorderLogic', 'addSalesOrder'], [$data]]);
                if ($test && $test->status == '500') {
                    return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failed: internal sales order generation error. Error prompt:") . $test->message), $data);
                }
                #3.调用销售订单编辑-审核接口
                $ShDispatchNoteDB = ShDispatchNote::find()->select(['INTERNAL_SALES_CD'])->where(array('DISPATCH_NOTE_ID' => $DISPATCH_NOTE_ID))->asArray()->all();
                if (count($ShDispatchNoteDB) > 0) {
                    #3-1 拼装销售订单审核需要的结构
                    $Storage = [];
                    foreach ($ShDispatchNoteDB as $a => $itm) {
                        $id = Yii::$app->rpc->create('sales')->sendAndrecv([['\addons\sales\modellogic\salesorderLogic', 'getSalesOrder'], [[], array('SALES_ORDER_CD' => $itm['INTERNAL_SALES_CD'])]]);
                        $Storage[$a] = [];
                        $Storage[$a]['SALES_ORDER_ID'] = $id[0]['SALES_ORDER_ID'];
                        $Storage[$a]['ORDER_STATE'] = 2;
                        $Storage[$a]['authFlag'] = 1;
                        $Storage[$a]['CRGANISATION_ID'] = $id[0]['CRGANISATION_ID'];
                        $Storage[$a]['PRE_ORDER_AT'] = $id[0]['PRE_ORDER_AT'];
                    }

                    $test1 = Yii::$app->rpc->create('sales')->sendAndrecv([['\addons\sales\modellogic\salesorderLogic', 'StorageAuditing'], [$Storage]]);
                    if ($test1 && $test1->status == '500') {
                        return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failed: internal sales order generation error. Error prompt:") . $test1->message), $data);
                    }

                }
            } catch (ServerErrorHttpException $msg) {
                return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failed: internal sales order generation error. Error prompt:") . $msg->getMessage()), $data);
            }
        }
    }

    /**
     * getPARTNER_ID
     * 根据组织获取伙伴编码
     * @param $ORGANISATION_ID
     * @return string
     * */
    public
    static function getPARTNER_CODE($ORGANISATION_ID)
    {
        $ORGANISATIONDB = Yii::$app->rpc->create('organization')->sendAndrecv([['\addons\organization\modellogic\organizLogic', 'GetORGANISATIONIEN'], [['PARTNER_ID'], array('ORGANISATION_ID' => $ORGANISATION_ID)]]);
        return $ORGANISATIONDB[0]['PARTNER_ID'];
    }

    /**
     * AddPendingStorage
     * 待入库数据生成
     * @param $datas
     * @return array
     * */
    public
    static function AddPendingStorage($datas)
    {
        if (count($datas) > 0) {
            $respone = new ResponeModel();
            #2.调用待入库新增接口
            try {
                $test = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PendstorageLogic', 'addPendingStorage'], [$datas]]);
                if ($test && $test->status == '500') {
                    return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failed: the storage list generated error. Error prompt:") . $test->message), $datas);
                }
            } catch (ServerErrorHttpException $msg) {

                return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failed: the storage list generated error. Error prompt:") . $msg->getMessage()), $datas);
            }

        }
    }

    /**
     * GenerateWarehouse
     * 生成采购入库单
     * @param $datas @发运单数据
     * @return array
     * */
    public
    static function GenerateWarehouse($datas)
    {
        #1.拼装数据
        $data = [];
        if (count($datas) > 0) {
            $DISPATCH_NOTE_ID = [];
            foreach ($datas as $i => $item) {
                if ($item['IMPORT_STATE'] == '1') {
                    $DISPATCH_NOTE_ID[] = $item['DISPATCH_NOTE_ID'];
                    $data[$i] = [
                        'ORGANISATION_ID' => $item['Purchase']['ORGANISATION_ID'],//采购订单.采购组织
                        'STORAGE_AT' => $item['ACTUAL_SHIPM_AT'],//发运单.实际发运日期
                        'ORDER_TYPE' => 1,//单据类型1.采购入库、2.内部采购入库、3.其他入库
                        'DELETED_STATE' => 0,//删除状态,1:删除 0:未删除
                        'PARTNER_ID' => $item['Purchase']['PARTNER_ID'],//采购订单.供应商编码
                        'WAREHOUSE_ID' => $item['DELIVER_WARID'] !== null && $item['DELIVER_WARID'] ? $item['DELIVER_WARID'] : static::getContinentalThere(1, $item['CHANNEL_ID'], [$item['Purchase']['ORGANISATION_ID']]),  //采购组织/平台的类型是1的仓库
                        'ORDER_STATE' => 1,//审核状态,1:未审核 2:已审核
                        'MONEY_ID' => $item['Purchase']['MONEY_ID'],//采购订单的币种
                        'CLOSING_STATE' => 0,//是否关账，0:未关账 1:已关账
                        'SYSTEM_GENERATION' => 1,//是否系统生成,0:否 1:是
                        'STORAGE_MONEY' => floatval($item['ACTUAL_SHIPM_NUM']) * floatval($item['Purchase']['PurchaseDetail'][0]['TAX_UNITPRICE']),
                        'DISPATCH_NOTE_ID' => $item['DISPATCH_NOTE_ID']
                    ];
                    $data[$i]['sk_storage_detail'][0] = [
                        'DISPATCH_NOTE_ID' => $item['DISPATCH_NOTE_ID'],
                        'ORDER_TYPE' => 1,//单据类型1.采购入库、2.内部采购入库、3.其他入库
                        'PU_ORDER_CD' => $item['Purchase']['PU_PURCHASE_CD'],//采购订单.单号
                        'PURCHASE_DETAIL_ID' => $item['Purchase']['PurchaseDetail'][0]['PURCHASE_DETAIL_ID'],//采购订单明细ID
                        'PSKU_ID' => $item['PSKU_ID'],//发运单勾选明细的采购订单的SKU的ID
                        'PSKU_CODE' => $item['PSKU_CODE'],//发运单勾选明细的采购订单的SKU
                        'PSKU_NAME_CN' => $item['Purchase']['PurchaseDetail'][0]['PSKU_NAME_CN'],
                        'UNIT_ID' => $item['Purchase']['PurchaseDetail'][0]['UNIT_ID'],//发运单.报关单位
                        'STORAGE_DNUMBER' => $item['ACTUAL_SHIPM_NUM'],//发运单.实际发运数量
                        'UNIT_PRICE' => $item['Purchase']['PurchaseDetail'][0]['TAX_UNITPRICE'],//采购订单.单价
                        'STORAGE_DMONEY' => floatval($item['ACTUAL_SHIPM_NUM']) * floatval($item['Purchase']['PurchaseDetail'][0]['TAX_UNITPRICE']),
                        'STORAGE_AT' => $item['ACTUAL_SHIPM_AT'],//发运单.实际发运日期
                        'SWAREHOUSE_ID' => $data[$i]['WAREHOUSE_ID'],//采购组织的，采购订单平台的类型1的仓库
                        'TAX_RATE' => $item['Purchase']['PurchaseDetail'][0]['TAX_RATE'],//采购订单.税率
                        'NOT_TAX_UNITPRICE' => $item['Purchase']['PurchaseDetail'][0]['NOT_TAX_UNITPRICE'],//内部销售订单.不含税单价
                        'NOT_TAX_AMOUNT' => floatval($item['Purchase']['PurchaseDetail'][0]['NOT_TAX_AMOUNT']),//内部销售订单.不含税金额
                    ];
                }

            }
            if (count($data) > 0) {
                #2.调用入库单新增接口
                $respone = new ResponeModel();
                try {
                    $test = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'addStorage'], [$data]]);
                    if ($test && $test->status == '500') {
                        return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failure: purchase warehouse receipt error occurred. Error prompt:") . $test->message), $data);
                    }
                    #3.调用入库单编辑-审核接口
                    $ShDispatchNoteDB = ShDispatchNote::find()->select(['PURCHASING_WAREHOUSING_CD'])->where(array('DISPATCH_NOTE_ID' => $DISPATCH_NOTE_ID))->asArray()->all();
                    if (count($ShDispatchNoteDB) > 0) {
                        #3-1 拼装入库单审核需要的结构
                        $Storage = [];
                        foreach ($ShDispatchNoteDB as $a => $itm) {
                            $StorageL = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'getStorageDelisc'], [['STORAGE_CD' => $itm['PURCHASING_WAREHOUSING_CD']]]]);
                            $Storage[$a] = [];
                            $Storage[$a] = $StorageL;
                            $Storage[$a]['ORDER_STATE'] = 2;
                            $Storage[$a]['authFlag'] = 1;
                            $Storage[$a]['ORDER_TYPE'] = 1;
                        }
                        $models = [
                            'ORDER_STATE' => 2,
                            'batchMTC' => $Storage
                        ];

                        $test1 = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'updateCustom'], [$models]]);
                        if ($test1 instanceof ResponeModel) {
                            return $test1;
                        }
                    }
                } catch (ServerErrorHttpException $msg) {
                    return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failure: purchase warehouse receipt error occurred. Error prompt:") . $msg->getMessage()), $data);
                }
            }
        }

    }


    /**
     * 生成调拨单
     * AppropriationNote
     * @param $datas
     * @return array
     * */
    public static function AppropriationNote($datas)
    {
        #1.拼装数据
        $data = [];
        if (count($datas) > 0) {
            $respone = new ResponeModel();
            $DISPATCH_NOTE_ID = [];
            foreach ($datas as $is => $item) {
                $DISPATCH_NOTE_ID[] = $item['DISPATCH_NOTE_ID'];//发运单ID 区分新增方式
                $data[$is] = [
                    'DISPATCH_NOTE_ID' => $item['DISPATCH_NOTE_ID'],
                    'ORGANISATION_ID' => $item['ORGANISATION_ID'],//发运单.需求组织
                    'ALLOCATION_AT' => $item['ACTUAL_SHIPM_AT'],//发运单.实际发运日期
                    'ATWAREHOUSE_ID' => static::CallinWarehouse($item['ORGANISATION_ID'], $item['CHANNEL_ID'], $item['WAREHOUSE_ID']),//发运单.需求组织/平台的，在途仓（目的仓是2的，找3；目的仓是5，找6）
                    'ETWAREHOUSE_ID' => static::getContinentalThere(1, $item['CHANNEL_ID'], [isset($item['Purchase']) ? $item['Purchase']['ORGANISATION_ID'] : $item['Adjustment']['PRGANISATION_ID']]),//发运单.需求组织/平台的，类型是1的仓库
                    'ALLOCATION_STATE' => 1,//审核状态,1:未审核 2:已审核
                    'DELETED_STATE' => 0,//是否删除,1:删除 0:未删除
                    'SYSTEM_GENERATION' => 1,//是否系统生成,0:否 1:是

                ];
                if (!$data[$is]['ATWAREHOUSE_ID']) {
                    return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failed: the allocation form was generated error. Error: transfer to warehouse cannot be empty")), $data);
                }
                if (!$data[$is]['ETWAREHOUSE_ID']) {
                    return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failed: the allocation form was generated error. Error: transfer to warehouse cannot be empty")), $data);
                }
                if (!$data[$is]['ORGANISATION_ID']) {
                    return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failed: the allocation form was generated error. Error: transfer to warehouse cannot be empty")), $data);
                }
                $data[$is]['sk_fiallocation_detail'][0] = [
                    'DISPATCH_NOTE_ID' => $item['DISPATCH_NOTE_ID'],
                    'PSKU_ID' => $item['DEMANDSKU_ID'],//发运单.需求国SKU ID
                    'ATSKU_CODE' => $item['DEMANDSKU_CODE'],//发运单.需求国SKU
                    'TDRODUCT_DE' => isset($item['Purchase']) ? $item['Purchase']['PurchaseDetail'][0]['PSKU_NAME_CN'] : $item['Adjustment']['AdjustmentDetail'][0]['TDRODUCT_DE'],//产品说明
                    'UNIT_ID' => isset($item['Purchase']) ? $item['Purchase']['PurchaseDetail'][0]['UNIT_ID'] : $item['Adjustment']['AdjustmentDetail'][0]['UNIT_ID'],//发运单.报关单位
                    'ALLOCATION_NUMBER' => $item['ACTUAL_SHIPM_NUM'],//发运单.实际发运数量
                    'ATWAREHOUSE_ID' => $data[$is]['ATWAREHOUSE_ID'],//发运单.需求组织/平台的，在途仓（目的仓是2的，找3；目的仓是5，找6）
                    'ETWAREHOUSE_ID' => $data[$is]['ETWAREHOUSE_ID'],//发运单.需求组织/平台的，类型是1的仓库
                ];
            }
            #2.调用调拨单新增接口

            try {
                $test = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\fiallocationLogic', 'addFiallocation'], [$data]]);
                if ($test && $test->status == '500') {
                    return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failed: the allocation form was generated error. Error prompt:") . $test->message), $data);
                }
                #3.调用调拨单编辑-审核接口

                $ShDispatchNoteDB = ShDispatchNote::find()->select(['ALLOCATION_ONTHEWAY_CD', 'ALLOCATION_ONTHEWAY_ID'])->where(array('DISPATCH_NOTE_ID' => $DISPATCH_NOTE_ID))->asArray()->all();
                if (count($ShDispatchNoteDB) > 0) {
                    #3-1 拼装入库单审核需要的结构
                    $Storage = [];
                    foreach ($ShDispatchNoteDB as $a => $itm) {
                        $id = (new Query())->from('sk_fiallocation')->where(['FIALLOCATION_CD' => $itm['ALLOCATION_ONTHEWAY_CD']])->one();
                        // $id = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\fiallocationLogic', 'getFiallocation'], [['FIALLOCATION_ID', 'ORGANISATION_ID', 'ATWAREHOUSE_ID', 'ETWAREHOUSE_ID', 'ALLOCATION_AT'], array('FIALLOCATION_CD' => $itm['ALLOCATION_ONTHEWAY_CD'])]]);
                        $did = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\fiallocationLogic', 'getFiallocationDetail'], [['CREATED_AT'], array('FIALLOCATION_DETAIL_ID' => $itm['ALLOCATION_ONTHEWAY_ID'])]]);

                        $Storage[0] = [];
                        $Storage[0]['FIALLOCATION_CD'] = $itm['ALLOCATION_ONTHEWAY_CD'];
                        $Storage[0]['ALLOCATION_STATE'] = 2;
                        $Storage[0]['authFlag'] = 1;
                        $Storage[0]['CREATED_AT'] = $did[0]['CREATED_AT'];
                        $Storage[0]['ALLOCATION_AT'] = $id['ALLOCATION_AT'];
                        $Storage[0]['FIALLOCATION_ID'] = $id['FIALLOCATION_ID'];
                        $Storage[0]['ORGANISATION_ID'] = $id['ORGANISATION_ID'];
                        $Storage[0]['ATWAREHOUSE_ID'] = $id['ATWAREHOUSE_ID'];
                        $Storage[0]['ETWAREHOUSE_ID'] = $id['ETWAREHOUSE_ID'];
                        $Storage[0]['AUTITO_AT'] = time();
                        $Storage[0]['ORDER_AT'] = $id['ALLOCATION_AT'];
                        $user = Yii::$app->getUser();
                        $Storage[0]['AUTITO_ID'] = $user && !$user->isGuest ? $user->getIdentity()->USER_INFO_ID : '1';
                        $test1 = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\fiallocationLogic', 'Fiallocation'], [$Storage]]);
                        if ($test1 && $test1->status == '500') {
                            return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failed: the allocation form was generated error. Error prompt:") . $test1->message), $data);
                        }
                    }
                }
            } catch (ServerErrorHttpException $msg) {
                return $respone->setModel(500, 0, Yii::t('shipment', Yii::t('shipment', "Audit failed: the allocation form was generated error. Error prompt:") . $msg->getMessage()), $data);
            }


        }

    }


    /**
     * ReverseAudit
     * 发运单反审核
     * @param $data @发运单数据结构
     * @return string
     * */
    public
    static function ReverseAudit($data)
    {
        $PendingStorage = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PendstorageLogic', 'GetPendingStorage'], ['', ['NOTE_ID' => $data['DISPATCH_NOTE_ID'], 'IMPORT_STATE' => 1]]]);
        if ($PendingStorage && count($PendingStorage) > 0) {
            if ($PendingStorage[0]['PLAN_STATE'] !== '0') {
//                $echo_one_1 = Yii::t('shipment', '已经生成的待入库单据不是未收货状态,反审核失败!');
                return Yii::t('shipment', 'The generated pending documents are not in the state of receipt, and the audit failed!');
            }
        }
        $PurchaseDetail = [];
        $AdjustmentDetail = [];
        #1直采代采操作
        if ($data['IMPORT_STATE'] == '1') {
            //查询获取采购订单的采购组织
            $PurchaseDetail = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getPurchaseDetail'], [array('PURCHASE_DETAIL_ID' => $data['PU_ORDER_ID'])]]);
            if (count($PurchaseDetail) > 0) {
                $Purchase = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getPurchase'], [array('PU_PURCHASE_CD' => $PurchaseDetail[0]['PU_PURCHASE_CD'])]]);
                $Purchase = $Purchase[0];
                $data['Purchase'] = $Purchase;
                $return_test = static::newrefuse($data);
                if (!$return_test) {
                    return Yii::t('shipment', "The document is in the period of close account and cannot be audited!");
                }
                //区分直采 代采
                if ($Purchase['ORGANISATION_ID'] == $data['ORGANISATION_ID']) {
                    $test = static::ReverseAuditDirect($data);
                    if ($test) {
                        return $test;
                    }
                } else {
                    $test = static::ReverseAuditMining($data);
                    if ($test) {
                        return $test;
                    }
                }
            }
        }
        if ($data['IMPORT_STATE'] == '2') {
            $AdjustmentDetail = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\AdjustmentLogic', 'getSkAdjustmentDetail'], [array('ADJUSTMENT_DETAIL_ID' => $data['PU_ORDER_ID'])]]);
            if (count($AdjustmentDetail) > 0) {
                $Adjustment = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\AdjustmentLogic', 'getSkAdjustment'], [array('ADJUSTMENT_ID' => $AdjustmentDetail[0]['ADJUSTMENT_ID'])]]);
                $Adjustment = $Adjustment[0];
                $data['Adjustment'] = $Adjustment;
                $return_test = static::newrefuse($data);
                if (!$return_test) {
                    return Yii::t('shipment', "The document is in the period of close account and cannot be audited!");
                }
                if ($Adjustment['PRGANISATION_ID'] == $data['ORGANISATION_ID']) {
                    $test = static::ReverseAuditDirect($data);
                    if ($test) {
                        return $test;
                    }
                } else {
                    $test = static::ReverseAuditMining($data);
                    if ($test) {
                        return $test;
                    }
                }
            }

        }
        #2.采购入库单
        if ($data['PURCHASING_WAREHOUSING_CD'] && $data['PURCHASING_WAREHOUSING_CD'] !== null) {
            $test = static::NotStorage($data);
            if ($test) {
                return $test;
            }
        }
        #3.待收货记录
        #3-1 查询待入库列表
        $test = static::NotPendingStorage($PendingStorage);
        if ($test) {
            return $test;
        }
        #4将实际发运数量从采购订单或者调整单的已发运数量中减去，
        #4-2将计划发运数量根据仓库加到采购订单或者库存调整单的中转仓已计划数量或者供应商已计划数量.
        $test = static::NotAdjustmenPurchase($data, $PurchaseDetail, $AdjustmentDetail);
        if ($test) {
            return $test;
        }
        #发运跟踪删除
        static::Deltracking($data);

        return 1;
    }

    /**
     * Deltracking
     * 发运跟踪删除操作
     * @param $data
     * */
    public static function Deltracking($data)
    {
        $ShTrackingDetail = ShTrackingDetail::find()->select(['TRACKING_DETAIL_ID', 'TRACKING_ID'])->where(['DISPATCH_NOTE_ID' => $data['DISPATCH_NOTE_ID']])->asArray()->one();
        ShTrackingDetail::deleteAll(['TRACKING_DETAIL_ID' => $ShTrackingDetail['TRACKING_DETAIL_ID']]);
        $ShTrackingDB = ShTrackingDetail::find()->select(['TRACKING_DETAIL_ID'])->where(['TRACKING_ID' => $ShTrackingDetail['TRACKING_ID']])->asArray()->all();
        if (count($ShTrackingDB) == 0) {
            ShTracking::updateAll(['DELETED_STATE' => 1], ['TRACKING_ID' => $ShTrackingDetail['TRACKING_ID']]);
        }
    }

    /**
     * NotAdjustmenPurchase
     * 反审核 修改采购订单或者库存调整的数量
     * @param $data
     * @param $PurchaseDetail
     * @param $AdjustmentDetail
     * @return string
     * */
    public static function NotAdjustmenPurchase($data, $PurchaseDetail, $AdjustmentDetail)
    {
        try {
            if (count($PurchaseDetail) > 0) {
                $SHIPPED_QUANTITY = floatval($PurchaseDetail[0]['SHIPPED_QUANTITY']) - floatval($data['ACTUAL_SHIPM_NUM']);
                $ITSWHSEPLA_QUANTITY = floatval($PurchaseDetail[0]['ITSWHSEPLA_QUANTITY']) + floatval($data['TRANSITW_SHIPMENTS']);
                $SUWHSEPLA_QUANTITY = floatval($PurchaseDetail[0]['SUWHSEPLA_QUANTITY']) + floatval($data['SUPPLIER_SHIPMENTS']);
                $PurchaseDetailStr = [
                    'SHIPPED_QUANTITY' => $SHIPPED_QUANTITY,
                    'ITSWHSEPLA_QUANTITY' => $ITSWHSEPLA_QUANTITY,
                    'SUWHSEPLA_QUANTITY' => $SUWHSEPLA_QUANTITY
                ];
                $test = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'setPurchaseDetail'], [$PurchaseDetailStr, ['PURCHASE_DETAIL_ID' => $PurchaseDetail[0]['PURCHASE_DETAIL_ID']]]]);
                if (is_object($test) && $test->status == '500') {
                    return Yii::t('shipment', "Purchase order quantity modification error:") . $test->message;
                }
            }
            if (count($AdjustmentDetail) > 0) {
                $SHIPPED_QUANTITY = floatval($AdjustmentDetail[0]['SHIPPED_QUANTITY']) - floatval($data['ACTUAL_SHIPM_NUM']);
                $PLA_QUANTITY = floatval($AdjustmentDetail[0]['PLA_QUANTITY']) + floatval($data['TRANSITW_SHIPMENTS']) + floatval($data['SUPPLIER_SHIPMENTS']);
                $AdjustmentLogicStr = [
                    'SHIPPED_QUANTITY' => $SHIPPED_QUANTITY,
                    'PLA_QUANTITY' => $PLA_QUANTITY
                ];
                $test = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\AdjustmentLogic', 'setAdjustmentDetail'], [['ADJUSTMENT_DETAIL_ID' => $AdjustmentDetail[0]['ADJUSTMENT_DETAIL_ID']], $AdjustmentLogicStr]]);
                if (is_object($test) && $test->status == '500') {
                    return Yii::t('shipment', "There is an error in the quantity adjustment of the stock adjustment list:") . $test->message;
                }
            }

        } catch (ServerErrorHttpException $msg) {
            return Yii::t('shipment', "Audit error pending warehousing:") . $msg->getMessage;
        }

    }

    /**
     * 反审核 待入库列表
     * NotPendingStorage
     * @param $PendingStorage
     * @return string
     * */
    public static function NotPendingStorage($PendingStorage)
    {
        if ($PendingStorage && count($PendingStorage) > 0) {

            $del = [];
            $del[0]['PENDING_STORAGE_ID'] = $PendingStorage[0]['PENDING_STORAGE_ID'];
            try {
                $test = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PendstorageLogic', 'DelPendingStorage'], [$del]]);
                if (is_object($test) && $test->status == '500') {
                    return Yii::t('shipment', "Audit error pending warehousing:") . $test->message;
                }
            } catch (ServerErrorHttpException $msg) {
                return Yii::t('shipment', "Audit error pending warehousing:") . $msg->getMessage;
            }


        }
    }

    /**
     * NotStorage
     * 反审核 采购入库单删除
     * @param $data
     * @return string
     * */
    public static function NotStorage($data)
    {
        #2-1 获取采购入库单ID
        $Storage = [];
        $Storage = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'getStorageDelisc'], [['STORAGE_CD' => $data['PURCHASING_WAREHOUSING_CD']]]]);
        $storage_detail_list = [];
        $storage_detail_list_d = [];
        if ($Storage) {
            $storage_detail_list[0] = $Storage;
            $storage_detail_list[0]['ORDER_STATE'] = 1;
            $storage_detail_list[0]['authFlag'] = 0;

            $storage_detail_list_d[0]['STORAGE_ID'] = $Storage['STORAGE_ID'];
            $storage_detail_list_d[0]['DELETED_STATE'] = 1;
            $Storage_data = [
                'ORDER_STATE' => 1,
                'batchMTC' => $storage_detail_list
            ];
            try {
                $test = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'updateCustom'], [$Storage_data]]);
                if ($test instanceof ResponeModel) {
                    return $test;
                }
                $test = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'StorageAuditing'], [$storage_detail_list_d]]);
                if (is_object($test) && $test->status == '500') {
                    return Yii::t('shipment', "Errors in purchasing, warehousing, SLR audit:") . $test->message;
                }
            } catch (ServerErrorHttpException $msg) {
                return Yii::t('shipment', "Errors in purchasing, warehousing, SLR audit:") . $msg->getMessage;
            }
        }

    }

    /**
     *
     * 反审核 直采
     * ReverseAuditDirect
     * @param $data
     * @return string
     * */
    public static function ReverseAuditDirect($data)
    {
        #1.在途仓的调拨单
        if ($data['ALLOCATION_ONTHEWAY_CD'] && $data['ALLOCATION_ONTHEWAY_CD'] !== null) {
            $Fiallocation = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\fiallocationLogic', 'getFiallocation'], [[], ['FIALLOCATION_CD' => $data['ALLOCATION_ONTHEWAY_CD']]]]);
            $did = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\fiallocationLogic', 'getFiallocationDetail'], [['CREATED_AT'], array('FIALLOCATION_DETAIL_ID' => $data['ALLOCATION_ONTHEWAY_ID'])]]);

            if (count($Fiallocation) > 0) {
                $Storage_data = [];//反审核用参数
                $Storage_data_del = [];//删除用参数
                $Storage_data[0] = [
                    'FIALLOCATION_ID' => $Fiallocation[0]['FIALLOCATION_ID'],
                    'ALLOCATION_STATE' => 1,
                    'authFlag' => 2,
                    'allow_back_review' => 1,
                    'FIALLOCATION_CD' => $data['ALLOCATION_ONTHEWAY_CD'],
                    'CREATED_AT' => $did[0]['CREATED_AT'],
                    'AUTITO_AT' => '',
                    'AUTITO_ID' => '',
                    'ORGANISATION_ID' => $Fiallocation[0]['ORGANISATION_ID'],
                    'ATWAREHOUSE_ID' => $Fiallocation[0]['ATWAREHOUSE_ID'],
                    'ETWAREHOUSE_ID' => $Fiallocation[0]['ETWAREHOUSE_ID']
                ];
                $Storage_data_del[0] = [
                    'FIALLOCATION_ID' => $Fiallocation[0]['FIALLOCATION_ID'],
                    'DELETED_STATE' => 1,
                    'ORGANISATION_ID' => $Fiallocation[0]['ORGANISATION_ID'],
                    'ATWAREHOUSE_ID' => $Fiallocation[0]['ATWAREHOUSE_ID'],
                    'ETWAREHOUSE_ID' => $Fiallocation[0]['ETWAREHOUSE_ID']
                ];
                try {
                    $test = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\fiallocationLogic', 'Fiallocation'], [$Storage_data]]);
                    if (is_object($test) && $test->status == '500') {
                        return Yii::t('shipment', "In transit warehouse allocation, SLR audit error:") . $test->message;
                    }
                    $test = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\fiallocationLogic', 'DelFiallocation'], [$Storage_data_del]]);
                    if (is_object($test) && $test->status == '500') {
                        return Yii::t('shipment', "In transit warehouse allocation, SLR audit error:") . $test->message;
                    }
                } catch (ServerErrorHttpException $msg) {
                    return Yii::t('shipment', "In transit warehouse allocation, SLR audit error:") . $msg->getMessage;
                }

            }

        }

    }

    /**
     *
     * 反审核 代采
     * ReverseAuditMining
     * @param $data
     * @return string
     * */
    public static function ReverseAuditMining($data)
    {
        #4.内部采购入库单
        if ($data['INTERNAL_PURCHASINGST_CD'] && $data['INTERNAL_PURCHASINGST_CD'] !== null) {
            $Storage = [];
            $Storage = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'getStorageDelisc'], [['STORAGE_CD' => $data['INTERNAL_PURCHASINGST_CD']]]]);
            $storage_detail_list = [];
            $storage_detail_list_d = [];
            if ($Storage) {
                $storage_detail_list[0] = $Storage;
                $storage_detail_list[0]['ORDER_STATE'] = 1;
                $storage_detail_list[0]['authFlag'] = 0;

                $storage_detail_list_d[0]['STORAGE_ID'] = $Storage['STORAGE_ID'];
                $storage_detail_list_d[0]['DELETED_STATE'] = 1;
                $Storage_data = [
                    'ORDER_STATE' => 1,
                    'batchMTC' => $storage_detail_list
                ];
                try {
                    $test = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'updateCustom'], [$Storage_data]]);
                    if ($test instanceof ResponeModel) {
                        return $test;
                    }

                    $test = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'StorageAuditing'], [$storage_detail_list_d]]);
                    if (is_object($test) && $test->status == '500') {
                        return Yii::t('shipment', "Errors in purchasing, warehousing, SLR audit:") . $test->message;
                    }
                } catch (ServerErrorHttpException $msg) {
                    return Yii::t('shipment', "Errors in purchasing, warehousing, SLR audit:") . $msg->getMessage;
                }
            }
        }

        #3.内部采购订单
        if ($data['INTERNAL_PURCHASING_CD'] && $data['INTERNAL_PURCHASING_CD'] !== null) {
            $Fiallocation = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getPurchase'], [['PU_PURCHASE_CD' => $data['INTERNAL_PURCHASING_CD']], [], []]]);
            if (count($Fiallocation) > 0) {
                $Storage_data = [];//反审核用参数
                $Storage_data_del = [];//删除用参数authFlag =1
                $Storage_data[0] = [
                    'PU_PURCHASE_ID' => $Fiallocation[0]['PU_PURCHASE_ID'],
                    'PU_PURCHASE_CD' => $Fiallocation[0]['PU_PURCHASE_CD'],
                    'ORGANISATION_ID' => $Fiallocation[0]['ORGANISATION_ID'],
                    'PRE_ORDER_AT' => $Fiallocation[0]['PRE_ORDER_AT'],
                    'ORDER_STATE' => 1,
                    'edit_type' => 3,
                    'allow_back_review' => 1
                ];
                $Storage_data_del[0] = [
                    'PU_PURCHASE_ID' => $Fiallocation[0]['PU_PURCHASE_ID'],
                    'PU_PURCHASE_CD' => $Fiallocation[0]['PU_PURCHASE_CD'],
                    'ORGANISATION_ID' => $Fiallocation[0]['ORGANISATION_ID'],
                    'PRE_ORDER_AT' => $Fiallocation[0]['PRE_ORDER_AT'],
                    'DELETED_STATE' => 1,
                    'edit_type' => 2
                ];
                try {
                    $test = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'SetPurchase'], [$Storage_data]]);
                    if (is_object($test) && $test->status == '500') {
                        return Yii::t('shipment', "Internal purchase order reverse audit error:") . $test->message;
                    }
                    $test = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'SetPurchase'], [$Storage_data_del]]);
                    if (is_object($test) && $test->status == '500') {
                        return Yii::t('shipment', "Internal purchase order reverse audit error:") . $test->message;
                    }
                } catch (ServerErrorHttpException $msg) {
                    return Yii::t('shipment', "Internal purchase order reverse audit error:") . $msg->getMessage;
                }


            }

        }

        #2.内部销售出库
        if ($data['INTERNAL_SALESTH_CD'] && $data['INTERNAL_SALESTH_CD'] !== null) {
            $Fiallocation = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\placingLogic', 'getPlacingSALES_CD'], [['PLACING_CD' => $data['INTERNAL_SALESTH_CD']]]]);
            unset($Fiallocation[0]['sk_placing_detail']);
            if (count($Fiallocation)) {
                $Storage_data = $Fiallocation;//反审核用参数
                $Storage_data_del = $Fiallocation;//删除用参数authFlag =1
                $Storage_data[0]['PLAN_STATE'] = 1;
                $Storage_data[0]['authFlag'] = 2;
                $Storage_data[0]['allow_back_review'] = 1;

                $Storage_data_del[0]['PLAN_STATE'] = 1;
                $Storage_data_del[0]['authFlag'] = 0;
                $Storage_data_del[0]['DELETED_STATE'] = 1;
                try {
                    $test = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\placingLogic', 'SetPlacing'], [$Storage_data]]);
                    if (is_object($test) && $test->status == '500') {
                        //return Yii::t('shipment', "内部销售出库反审核出错：" . $test->message);
                        return Yii::t('shipment', "Internal sales out of audit errors:") . $test->message;
                    }
                    $test = Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\placingLogic', 'SetPlacing'], [$Storage_data_del]]);
                    if (is_object($test) && $test->status == '500') {
                        return Yii::t('shipment', "Internal sales out of audit errors:") . $test->message;
                    }
                } catch (ServerErrorHttpException $msg) {
                    return Yii::t('shipment', "Internal sales out of audit errors:：") . $msg->getMessage;
                }


            }

        }

        #1.内部销售订单
        if ($data['INTERNAL_SALES_CD'] && $data['INTERNAL_SALES_CD'] !== null) {
            $Fiallocation = Yii::$app->rpc->create('sales')->sendAndrecv([['\addons\sales\modellogic\salesorderLogic', 'GetSalesOrder'], [[], ['SALES_ORDER_CD' => $data['INTERNAL_SALES_CD']]]]);
            if (count($Fiallocation) > 0) {
                $Storage_data = [];//反审核用参数
                $Storage_data_del = [];//删除用参数authFlag =1
                $Storage_data[0] = [
                    'SALES_ORDER_ID' => $Fiallocation[0]['SALES_ORDER_ID'],
                    'ORDER_STATE' => 1,
                    'CRGANISATION_ID' => $Fiallocation[0]['CRGANISATION_ID'],
                    'PRE_ORDER_AT' => $Fiallocation[0]['PRE_ORDER_AT'],
                    'authFlag' => 2,
                    'allow_back_review' => 1
                ];
                $Storage_data_del[0] = [
                    'SALES_ORDER_ID' => $Fiallocation[0]['SALES_ORDER_ID']
                ];
                try {
                    $test = Yii::$app->rpc->create('sales')->sendAndrecv([['\addons\sales\modellogic\salesorderLogic', 'StorageAuditing'], [$Storage_data]]);
                    if (is_object($test) && $test->status == '500') {
                        return Yii::t('shipment', "Internal sales order audit error:") . $test->message;
                    }
                    $test = Yii::$app->rpc->create('sales')->sendAndrecv([['\addons\sales\modellogic\salesorderLogic', 'StorageAuditing'], [$Storage_data_del]]);
                    if (is_object($test) && $test->status == '500') {
                        return Yii::t('shipment', "Internal sales order audit error:") . $test->message;
                    }
                } catch (ServerErrorHttpException $msg) {
                    return Yii::t('shipment', "Internal sales order audit error:") . $msg->getMessage;
                }


            }

        }
    }

    /**
     * print_note
     * 发运通知
     * 需求国家 + 空海次数 + 目的仓 + 运输方式分组
     * @param $post
     * @return array
     * */
    public static function print_note($post)
    {
        $respone = new ResponeModel();
        #1 校验数据完整性
        if (isset($post['batchMTC'])) {
            #2 拼装打印需要的数据格式
            $print_text = static::print_note_PinZ($post);
            if (count($print_text) > 0) {
                #3 调用打印配置方法
                #3.1模板路径
                $filePath = Yii::getAlias('@upload/print/dispatch_advice.xlsx');
                #3.2临时文件夹名字
                $timeFile = static::getMicrotime(microtime(true));
                #3.3生成临时excel
                $filelist = [];
                if (count($print_text) == 1) {
                    $timeFile = $print_text[0]['other']['title'];//文件名
                    Yii::$app->export->exportExcel($print_text[0]['main'], $print_text[0]['other']['title'], 3, 1, $filePath, $timeFile, $print_text[0]['other']['total'], 4);
                } else {
                    foreach ($print_text as $i => $item) {
                        $filelist[$i][] = $item['other']['title'];
                        $filelist[$i][] = $i;
                        Yii::$app->export->saveExcel($item['main'], $item['other']['title'], 3, 1, $filePath, $timeFile, $i, $print_text[$i]['other']['total'], 4);
                    }
                    #3.4压缩成ZIP导出
                    Yii::$app->export->exportExcelZip($timeFile, $filelist, '发运通知' . date("Y-m-j"));
                }

            } else {
                return $respone->setModel(500, 0, Yii::t('shipment', "No data can be generated for notification!"), $post);
//                return $respone->setModel(500, 0, Yii::t('shipment', "没有数据，无法生成通知!"), $post);
            }

        } else {
            return $respone->setModel(500, 0, Yii::t('shipment', "The structure is incomplete and cannot generate notifications!"), $post);
//            return $respone->setModel(500, 0, Yii::t('shipment', "结构不完整，无法生成通知!"), $post);
        }

    }

    /**
     * getMicrotime
     * 获取毫秒拼接成字符串
     * @param $time
     * @return string
     * */
    public static function getMicrotime($time)
    {
        $str = explode(".", $time);
        return $str[0] . $str[1];
    }

    /**
     * print_note_PinZ
     * 拼装打印需要的数据
     * @param $post
     * @return array
     *
     * */
    public static function print_note_PinZ($post)
    {
        #1 查询需要的基础数据.
        //币种
        $money_list = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\basicsLogic', 'getmoney'], [['MONEY_ID', 'MONEY_NAME_CN']]])->recv();
        //验货状态 INSPECTION_STATE 运输方式 TRANSPORTS
        $dictionary_list = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\baseLogic', 'getdictionary'], [['D_NAME_CN', 'D_GROUP', 'D_VALUE'], ['INSPECTION_STATE', 'TRANSPORTS']]])->recv();

        #2 根据条件查询发运单
        $DISPATCH_NOTE_IDS = [];
        if ($post['batchMTC'] !== null && $post['batchMTC'] !== "") {
            $DISPATCH_NOTE_IDS = explode(",", ArrayHelper::getValue($post, 'batchMTC'));
        }
        //上级单据单号
        //好货时间
        $DELIVERY_AT = 'CASE WHEN T1.IMPORT_STATE = 1 THEN
	(SELECT (SELECT DELIVERY_AT from pu_qctables WHERE PSKU_ID = T3.PSKU_ID and PU_ORDER_CD = T3.PU_PURCHASE_CD and INSPECTION_AT <= unix_timestamp(now()) ORDER BY INSPECTION_AT desc LIMIT 0,1)DELIVERY_AT from pu_purchase_detail T3 WHERE T3.PURCHASE_DETAIL_ID = T1.PU_ORDER_ID)
 WHEN T1.IMPORT_STATE =2 THEN \'\' END DELIVERY_AT';

        $product_id = Yii::$app->session->get('product_id') ?: null;
        $ORGANISATION = Yii::$app->session->get('organization') ?: null;
        $DispatchNoteListDB = (new Query())->from('sh_dispatch_note T1')
            ->select(['T4.PARTNER_CODE', 'T1.PO_NUMBER', 'T1.PSKU_CODE', 'T1.DEMANDSKU_CODE', 'T1.ACTUAL_SHIPM_NUM', 'T1.DISPATCH_REMARKS', 'T1.FNSKU'
                , 'T1.PlAN_SHIPMENT_AT', 'T1.ORGANISATION_ID', 'T1.KUKAI_NUMBER', 'T1.WAREHOUSE_ID', 'T1.TRANSPORT_MODE'
                , 'T2.PU_PURCHASE_CD', 'T3.MONEY_ID', 'T2.PSKU_NAME_CN', 'T1.PACKING_NUMBER', 'T1.FCL_LONG', 'T1.FCL_WIDE', 'T1.FCL_HIGH', 'T1.GROSS_WEIGHT', 'T1.FCL_NET_WEIGHT', 'T2.FNSKU as LOGFNSKU', 'T2.TAX_UNITPRICE', 'T2.INSPECTION_STATE'
                , 'T4.PARTNER_NAME_CN', 'T4.PARTNER_ANAME_CN', 'T5.ORGANISATION_NAME_CN', 'T6.WAREHOUSE_NAME_CN', $DELIVERY_AT, 'T1.PSKU_ID', 'T1.DEMANDSKU_ID'
            ])
            ->leftJoin('pu_purchase_detail T2', 'T2.PURCHASE_DETAIL_ID = T1.PU_ORDER_ID')
            ->leftJoin('pu_purchase T3', 'T3.PU_PURCHASE_CD = T2.PU_PURCHASE_CD')
            ->leftJoin('pa_partner T4', 'T4.PARTNER_ID = T1.PARTNER_ID')
            ->leftJoin('o_organisation T5', 'T5.ORGANISATION_ID = T1.ORGANISATION_ID')
            ->leftJoin('b_warehouse T6', 'T6.WAREHOUSE_ID = T1.WAREHOUSE_ID')
            ->where(['and', ['<>', 'T1.DELETED_STATE', '1'], ['T1.DISPATCH_NOTE_ID' => $DISPATCH_NOTE_IDS]]);


        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            $DispatchNoteListDB->andWhere(['T1.ORGANISATION_ID' => $ORGANISATION])
                ->andWhere(['T1.PSKU_ID' => $product_id])
                ->andWhere(['or', ['T1.DEMANDSKU_ID' => $product_id], ['T1.DEMANDSKU_ID' => null], ['T1.DEMANDSKU_ID' => '']]);
        }

        $DispatchNoteList = $DispatchNoteListDB->all();

        #3 循环发运单数据，拼装打印需要的数据结构
        $data = [];
        $list = [];
        if (count($DispatchNoteList) > 0) {
            //分组
            foreach ($DispatchNoteList as $value) {
                $data[$value['PARTNER_CODE'] . $value['PlAN_SHIPMENT_AT'] . $value['ORGANISATION_ID'] . $value['KUKAI_NUMBER'] . $value['WAREHOUSE_ID'] . $value['TRANSPORT_MODE']][] = $value;
            }
            // 开始拼装数据
            $i = 0;
            foreach ($data as $is => $v) {
                $list[$i] = [];
                $list[$i]['main'] = [];
                $list[$i]['other'] = [];

                //计划发运日期 需求国家 空海次数 目的仓 运输方式
                $w = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getorganization_list'], [$dictionary_list, ['TRANSPORTS', $v[0]['TRANSPORT_MODE']], ['D_GROUP', 'D_VALUE'], 'D_NAME_CN']]);
                $times = $v[0]['PlAN_SHIPMENT_AT'] ? date("m.j", $v[0]['PlAN_SHIPMENT_AT']) : '';
                $title = $times . " " . $v[0]['ORGANISATION_NAME_CN'] . " " . $v[0]['KUKAI_NUMBER'] . " " . $v[0]['WAREHOUSE_NAME_CN'] . $w . '出货计划';
                $isy = 0;
                $list[$i]['other']['title'] = $title;
                $list[$i]['other']['total'] = [];

                //总运输数量
                $Total_transport_quantity = 0;
                //总总价
                $Total_price = 0;
                //总运输箱数
                $Total_number_containers = 0;
                //总体积(cbm)
                $Total_volume = 0;
                //总总净重 (KGS)
                $Gross_net_weight = 0;
                // 总总毛重（KGS)
                $Total_gross_weight = 0;
                //总计费重
                $Total_total_cost = 0;
                foreach ($v as $vs) {
                    $vs['PACKING_NUMBER'] = $vs['PACKING_NUMBER'] ? $vs['PACKING_NUMBER'] : 0;
                    $list[$i]['main'][$isy] = [];
                    $list[$i]['main'][$isy][] = $vs['PARTNER_CODE'];//供应商代码
                    $list[$i]['main'][$isy][] = $vs['PARTNER_NAME_CN'];//供应商名称
                    $list[$i]['main'][$isy][] = $vs['PU_PURCHASE_CD'];//PO号-采购单号
                    $list[$i]['main'][$isy][] = $vs['PSKU_CODE'];//型号 - 采购单SKU
                    $list[$i]['main'][$isy][] = $vs['DEMANDSKU_CODE'];//调货后创外箱SKU - 实际发运SKU
                    $list[$i]['main'][$isy][] = $vs['PSKU_NAME_CN'];//中文描述 - sku名称
                    $list[$i]['main'][$isy][] = $vs['ACTUAL_SHIPM_NUM'];//运输数量 - 实际发运数量
                    $list[$i]['main'][$isy][] = $vs['TAX_UNITPRICE'];//单价 - 采购单价
                    $list[$i]['main'][$isy][] = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getorganization_list'], [$money_list, $vs['MONEY_ID'], 'MONEY_ID', 'MONEY_NAME_CN']]);//币种 - 采购币种
                    //总价
                    $Total = floatval($vs['TAX_UNITPRICE']) * floatval($vs['ACTUAL_SHIPM_NUM']);
                    $list[$i]['main'][$isy][] = $Total;//总价 - 采购单价*实际发运数量
                    $list[$i]['main'][$isy][] = $vs['PACKING_NUMBER'];//每箱PC-每箱箱数
                    //运输箱数- 实际发运数量/每箱箱数
                    $traveling_box = floatval($vs['PACKING_NUMBER']) ? floatval($vs['ACTUAL_SHIPM_NUM']) / floatval($vs['PACKING_NUMBER']) : 0;
                    $list[$i]['main'][$isy][] = $traveling_box;
                    $list[$i]['main'][$isy][] = $vs['FCL_LONG'];//长cm
                    $list[$i]['main'][$isy][] = $vs['FCL_WIDE'];//宽cm
                    $list[$i]['main'][$isy][] = $vs['FCL_HIGH'];//高cm
                    $list[$i]['main'][$isy][] = $vs['FCL_NET_WEIGHT'];//净重kg/ctn
                    $list[$i]['main'][$isy][] = $vs['GROSS_WEIGHT'];//毛重kg/ctn
                    //长in
                    $Long_in = floatval($vs['FCL_LONG']) / 2.54;
                    $list[$i]['main'][$isy][] = $Long_in;//长in

                    //宽in
                    $width_in = floatval($vs['FCL_WIDE']) / 2.54;
                    $list[$i]['main'][$isy][] = $width_in;//宽in

                    //高in
                    $heith_in = floatval($vs['FCL_HIGH']) / 2.54;
                    $list[$i]['main'][$isy][] = $heith_in;//高in

                    //体积cbm 长cm*宽cm*高cm/1000000*(实际发运数量/每箱箱数)
                    $volume_cbm = floatval($vs['FCL_LONG']) * floatval($vs['FCL_WIDE']) * floatval($vs['FCL_HIGH']) / 1000000 * $traveling_box;
                    $list[$i]['main'][$isy][] = $volume_cbm;

                    //体积重ctn 整箱体积重:（整箱长*整箱宽*整箱高） /1000000
                    $Volume_weight_ctn = floatval($vs['FCL_LONG']) * floatval($vs['FCL_WIDE']) * floatval($vs['FCL_HIGH']) / 1000000;
                    $list[$i]['main'][$isy][] = $Volume_weight_ctn;

                    //毛重lb/ctn 毛净重(lb) 分别等于毛净重(kg) / 0.45359
                    $Gross_weight_ctn = floatval($vs['GROSS_WEIGHT']) / 0.45359;
                    $list[$i]['main'][$isy][] = $Gross_weight_ctn;

                    //总净重KGS 净重kg*运输数量（实际发运数量）
                    $Gross_net_weight_ctn = floatval($vs['FCL_NET_WEIGHT']) * $traveling_box;
                    $list[$i]['main'][$isy][] = $Gross_net_weight_ctn;

                    //总净重LB 净重kg/0.45359*运输数量（实际发运数量）
                    $Gross_net_weight_lb = floatval($vs['FCL_NET_WEIGHT']) / 0.45359 * $traveling_box;
                    $list[$i]['main'][$isy][] = $Gross_net_weight_lb;

                    //总毛重KGS 毛重kg*运输数量（实际发运数量）
                    $Gross_net_weight_ksg = floatval($vs['GROSS_WEIGHT']) * $traveling_box;
                    $list[$i]['main'][$isy][] = $Gross_net_weight_ksg;

                    //总毛重LB 毛重kg*运输数量（实际发运数量）/0.45359
                    $Gross_net_weight_lb = floatval($vs['GROSS_WEIGHT']) * $traveling_box / 0.45359;
                    $list[$i]['main'][$isy][] = $Gross_net_weight_lb;

                    //计费重kg MAX(Q3,V3)*L3 毛重kG和体积重比大小，大的值*运输数量
                    $Charging_weight_kg = floatval($vs['GROSS_WEIGHT']) > $Volume_weight_ctn ? floatval($vs['GROSS_WEIGHT']) * $traveling_box : $Volume_weight_ctn * $traveling_box;
                    $list[$i]['main'][$isy][] = $Charging_weight_kg;
                    $list[$i]['main'][$isy][] = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getorganization_list'], [$dictionary_list, ['INSPECTION_STATE', $vs['INSPECTION_STATE']], ['D_GROUP', 'D_VALUE'], 'D_NAME_CN']]);//验货状态
                    $list[$i]['main'][$isy][] = $vs['DELIVERY_AT'] ? date("Y-m-j", $vs['DELIVERY_AT']) : '';//好货时间
                    $list[$i]['main'][$isy][] = $vs['DISPATCH_REMARKS'];//备注
                    $list[$i]['main'][$isy][] = $vs['LOGFNSKU'];//原标贴
                    $list[$i]['main'][$isy][] = $vs['FNSKU'];//改后产品标贴

                    #合计
                    //总运输数量
                    $Total_transport_quantity = floatval($vs['ACTUAL_SHIPM_NUM']) + $Total_transport_quantity;
                    //总总价
                    $Total_price = $Total + $Total_price;
                    //总运输箱数
                    $Total_number_containers = $traveling_box + $Total_number_containers;
                    //总体积(cbm)
                    $Total_volume = $volume_cbm + $Total_volume;
                    //总总净重 (KGS)
                    $Gross_net_weight = $Gross_net_weight_ctn + $Gross_net_weight;
                    // 总总毛重（KGS)
                    $Total_gross_weight = $Gross_net_weight_ksg + $Total_gross_weight;
                    //总计费重
                    $Total_total_cost = $Charging_weight_kg + $Total_total_cost;
                    $isy++;
                }
                //合计存储-一行一个数组
                $list[$i]['other']['total'][0] = [
                    $Total_transport_quantity,
                    $Total_price,
                    $Total_number_containers,
                    $Total_volume,
                    $Gross_net_weight,
                    $Total_gross_weight,
                    $Total_total_cost
                ];
                $i++;
            }
        }

        return $list;
    }


    /**更新实际发运数量
     * @param $paramArray
     * @return array
     */
    public static function updateDispatShipnum($paramArray)
    {
        foreach ($paramArray as $param) {
            $ShDispatchNote = ShDispatchNote::find()->where(['DISPATCH_NOTE_ID' => $param['DISPATCH_NOTE_ID']])->one();
            if ($ShDispatchNote) {
                $ShDispatchNote->ACTUAL_SHIPM_NUM += $param['ACTUAL_SHIPM_NUM'];
                $ShDispatchNote->save();
            }
        }

    }

    /**
     * 自定义关账入口
     * newrefuse
     * @param $is
     * @return bool
     * */
    public static function newrefuse($is)
    {
        $ShDispatchNotenew = new ShDispatchNote();
        $ShDispatchNotenew->ACTUAL_SHIPM_AT = $is['ACTUAL_SHIPM_AT'];
        $ShDispatchNotenew->ORGANISATION_ID = $is['ORGANISATION_ID'];
        $ShDispatchNotenew->ORGANISATION_PID = isset($is['Purchase']) ? $is['Purchase']['ORGANISATION_ID'] : $is['Adjustment']['PRGANISATION_ID'];
        $ShDispatchNotenew->CLOSING_STATE = $is['CLOSING_STATE'];

        $return_test = Yii::$app->rpc->create('base')->sendAndrecv([['\addons\common\base\modellogic\refuseLogic', 'refuse'], [
            $ShDispatchNotenew,
            ['ACTUAL_SHIPM_AT', ['ORGANISATION_ID', 'ORGANISATION_PID'], 'CLOSING_STATE', ['addWhere' => []]
            ]
        ]]);
        return $return_test;
    }
}