<?php
namespace addons\purchase\modellogic;

/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/19 0019
 * Time: 15:47
 */
use Yii;
use yii\swoole\files\Pdf;
use yii\swoole\modellogic\BaseLogic;
use yii\swoole\helpers\ArrayHelper;
use yii\swoole\db\Query;

use addons\purchase\models\PuPurchase;
use addons\purchase\models\PuPurchaseDetail;
use addons\purchase\models\PuQctables;
use addons\purchase\models\PuPaymentDetail;
use yii\swoole\rest\CreateExt;
use yii\swoole\rest\IndexExt;
use yii\swoole\rest\ResponeModel;
use yii\swoole\rest\UpdateExt;

class purchaseLogic extends BaseLogic
{
    public static $modelClass = 'addons\purchase\models\PuPurchase';

    /**
     * setPurchaseDetail
     * 修改采购订单明细
     * @param array $where @修改条件
     * @param array $setr @修改的值
     * @return bool
     * */
    public static function setPurchaseDetail($setr, $where)
    {
        return PuPurchaseDetail::updateAll($setr, $where);
    }

    /**
     * getPurchase
     * 获取采购订单
     * @access public
     * @param $where
     * @param $select
     * @param $joinwith
     * @return array
     * */
    public static function getPurchase($where, $select = [], $joinwith = [])
    {
        if (count($select) == 0) {
            if (count($joinwith) == 0) {
                return PuPurchase::find()->where($where)->asArray()->all();
            } else {
                return PuPurchase::find()->joinWith($joinwith)->where($where)->asArray()->all();
            }
        } else {
            if (count($joinwith) == 0) {
                return PuPurchase::find()->select($select)->where($where)->asArray()->all();
            } else {
                return PuPurchase::find()->select($select)->joinWith($joinwith)->where($where)->asArray()->all();
            }
        }


    }

    /**
     * getPurchaseDetail
     * 获取采购订单明细
     * @access public
     * @param $where
     * @param $select
     * @return array
     * */
    public static function getPurchaseDetail($where, $select = [])
    {
        if (count($select) == 0) {
            return PuPurchaseDetail::find()->where($where)->asArray()->all();
        } else {
            return PuPurchaseDetail::find()->select($select)->where($where)->asArray()->all();
        }

    }

    // 采购订单 - 反审核
    public static function purchase_method($PuPurchase, $body)
    {

        if ($PuPurchase) {
            //获取采购订单明细信息
            $PuPurchaseDetail = PuPurchaseDetail::find()->select(['PURCHASE_DETAIL_ID', 'PSKU_ID'])->where(['=', 'PU_PURCHASE_CD', $PuPurchase['PU_PURCHASE_CD']])->asArray()->all();
            if (count($PuPurchaseDetail) > 0) {

                $PSKU_CODE = [];//sku
                $PURCHASE_DETAIL_ID = [];//明细id
                foreach ($PuPurchaseDetail as $index2 => $item2) {
                    $PSKU_CODE[] = $item2['PSKU_ID'];
                    $PURCHASE_DETAIL_ID[] = $item2['PURCHASE_DETAIL_ID'];
                }
                //1采购入库单已审核
                $storage_where = array('sd.PSKU_ID' => $PSKU_CODE, 'sd.PU_ORDER_CD' => $PuPurchase['PU_PURCHASE_CD']);//条件
                $paydetaillist = (new Query())->from('sk_storage s')
                    ->select(['s.STORAGE_ID', 's.ORDER_STATE'])
                    ->leftJoin("sk_storage_detail sd", "sd.STORAGE_ID = s.STORAGE_ID")
                    ->where($storage_where)
                    ->one();
                if ($paydetaillist) {
                    if ($paydetaillist['ORDER_STATE'] == '2') {
                        //系统反审核参数
                        if (!isset($body['allow_back_review'])) {
                            return Yii::t('purchase', 'The generated purchasing warehouse receipt has been audited and cannot be audited!');
                        }
//                        return Yii::t('purchase', '生成的采购入库单已审核，不能反审核！');
                    }
                }
                //1发运单
                $PuDispatchNote_where = array('IMPORT_STATE' => '1', 'DELETED_STATE' => 0, 'PU_ORDER_ID' => $PURCHASE_DETAIL_ID);//条件
                $PuDispatchNoteDB = Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\dispatchLogic', 'search_dispatch'], [$PuDispatchNote_where]]);

                if (count($PuDispatchNoteDB) > 0) {
                    return Yii::t('purchase', 'The shipment bill has been issued and cannot be checked back!');
//                    return Yii::t('purchase', '已经生成发运单，不能反审核！');
                }
                //1品检排程已审核时
                $PuQctablesDB = PuQctables::find()->where(array('PU_ORDER_CD' => $PuPurchase['PU_PURCHASE_CD'], 'PSKU_ID' => $PSKU_CODE))->asArray()->all();
                $PuQctablesDB_ID = [];
                if (count($PuQctablesDB)>0) {
                    foreach($PuQctablesDB as $v){
                        if($v['AUDIT_STATE']=='2'){
                            return Yii::t('purchase', 'The generated inspection schedule has been reviewed and cannot be audited!');
//                    return Yii::t('purchase', '生成的品检排程单已审核，不能反审核！');
                        }
                        $PuQctablesDB_ID[] = $v['QCTABLES_ID'];
                    }
                }
                //1付款申请记录
                $PuPayment_where = array('PURCHASE_DETAIL_ID' => $PURCHASE_DETAIL_ID);
                $PuPaymentDetailDB = PuPaymentDetail::find()->where($PuPayment_where)->asArray()->all();
                if ($PuPaymentDetailDB) {
                    return Yii::t('purchase', 'The current purchase order has been generated and the payment request form cannot be audited!');
//                    return Yii::t('purchase', '当前采购订单已经生成付款申请单，不能反审核！');
                }
                //2采购入库单 主表修改删除状态 字表删除表
                if ($paydetaillist) {
                    $arrays = array('STORAGE_ID' => $paydetaillist['STORAGE_ID'], 'DELETED_STATE' => '1');
                    Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'setStorageOper'], [$arrays]]);
                }
                //2品检排程
                if(count($PuQctablesDB_ID)>0){
                   pinspectLogic::piDel($PuQctablesDB_ID);
                }
                return false;
            } else {
                return false;
            }
        }
    }

    /**
     * 采购订单 导出
     * @param $post ['search']
     * @return array
     * */
    public static function export_purchase($post)
    {
        $post['search'] = ArrayHelper::getValue($post, 'search');
        $PURCHASE_ID = [];
        if ($post['PURCHASE_ID'] !== null && $post['PURCHASE_ID'] !== "") {
            $PURCHASE_ID = explode(",", ArrayHelper::getValue($post, 'PURCHASE_ID'));
        }
        //获取采购订单主表数据
        $pu_purchase_db = (new Query())->from('pu_purchase p')
            ->select(['p.*'])
            ->leftJoin('o_organisation o', 'o.ORGANISATION_ID = p.ORGANISATION_ID')
            ->where('FIND_IN_SET(:BUSINESS, o.ORGANISATION_BUSINESS)')
            ->andWhere(array('p.DELETED_STATE' => '0'))
            ->andFilterWhere(['p.PU_PURCHASE_ID' => $PURCHASE_ID])
            ->andFilterWhere(['or', ['LIKE', 'o.ORGANISATION_NAME_CN', $post['search']], ['like', 'o.ORGANISATION_ID', $post['search']], ['like', 'p.PU_PURCHASE_CD', $post['search']]])
            ->addParams([':BUSINESS' => 2]);

        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            $pu_purchase_db->andWhere(['p.ORGANISATION_ID' => Yii::$app->session->get('organization') ?: null]);
        }
        $pu_purchase = $pu_purchase_db->all();

        if (count($pu_purchase) > 0) {
            //请求 采购组织编码 需求组织编码
            $o_client = Yii::$app->rpc->create('organization')->send([['\addons\organization\modellogic\organizLogic', 'GetORGANISATION'], [['ORGANISATION_ID', 'ORGANISATION_NAME_CN']]]);
            //请求 供应商编码
            $p_client = Yii::$app->rpc->create('partint')->send([['\addons\master\partint\modellogic\partintLogic', 'getpartner_where'], [['PARTNER_ID', 'PARTNER_NAME_CN', 'PARTNER_ANAME_CN'], []]]);

            //请求 平台编码
            $c_client = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\basicsLogic', 'getchannel'], [['CHANNEL_ID', 'CHANNEL_NAME_CN']]]);

            //请求 币种编码
            $m_client = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\basicsLogic', 'getmoney'], [['MONEY_ID', 'MONEY_NAME_CN']]]);

            //请求 采购跟进人编码
            $u_client = Yii::$app->rpc->create('users')->send([['\addons\users\modellogic\usersLogic', 'getuser_info'], [['USERNAME', 'USER_INFO_ID', 'STAFF_ID']]]);

            //请求 采购跟进人名称
            $us_client = Yii::$app->rpc->create('users')->send([['\addons\users\modellogic\staffinfologic', 'getStaffInfo'], [['STAFF_ID', 'STAFF_NAME_CN'], []]]);

            //请求 账号
            $a_client = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\basicsLogic', 'getaccount'], [['ACCOUNT_ID', 'ACCOUNT', 'MERCHANTID']]]);

            //请求 字典表  单据类型 PU_PURCHASE_TYPE 采购类型 PLAN_TYPE 验货状态 INSPECTION_STATE 订单状态PU_PURCHASE 结算方式 PARTNER_SMETHOD
            $d_client = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\baseLogic', 'getdictionary'], [['D_NAME_CN', 'D_GROUP', 'D_VALUE'], ['PU_PURCHASE_TYPE', 'PLAN_TYPE', 'INSPECTION_STATE', 'PU_PURCHASE', 'PARTNER_SMETHOD']]]);

            //请求 单位编码
            $uu_client = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\basicsLogic', 'getunit'], [['UNIT_ID', 'UNIT_NAME_CN']]]);

            $PU_PURCHASE_CD = [];

            foreach ($pu_purchase as $i => $value) {
                $PU_PURCHASE_CD[] = $value['PU_PURCHASE_CD'];
            }

            //获取所有字表数据
            $PuPurchaseDB_list = PuPurchaseDetail::find()->where(array('PU_PURCHASE_CD' => $PU_PURCHASE_CD))->asArray()->all();

            // 接收
            $organization_list = $o_client->recv();
            $partint_list = $p_client->recv();
            $channel_list = $c_client->recv();
            $money_list = $m_client->recv();
            $users_list = $u_client->recv();
            $userus_list = $us_client->recv();
            $account_list = $a_client->recv();
            $dictionary_list = $d_client->recv();
            $unit_list = $uu_client->recv();

            if (count($PuPurchaseDB_list) > 0) {
                //拼装返回导出数据
                $array = static::Assemble($PuPurchaseDB_list, $pu_purchase, $organization_list, $partint_list, $channel_list, $money_list, $users_list, $dictionary_list, $unit_list, $account_list, $userus_list);
                //导出excel2007
                static::export_excel($array);
            }

        } else {
            return Yii::t('purchase', 'No data!');
        }
    }


    /**
     * 导出excel
     * php office
     * */
    public static function export_excel($list)
    {
        $filePrefix = '采购订单-' . date("Y-m-j");
        $fileSuffix = '.xlsx';
        $file = \Yii::createObject([
            'class' => 'yii\swoole\files\ExcelFile',
            'fileOptions' => ['suffix' => $fileSuffix],
            'sheets' => [

                'Active Users' => [
                    'data' => $list,
                    'titles' => [
                        'A' => '采购订单ID',
                        'B' => '采购订单号',
                        'C' => '采购组织',
                        'D' => '供应商',
                        'E' => '平台',
                        'F' => '币种',
                        'G' => '采购跟进人',
                        'H' => '需求组织',
                        'I' => '结算方式',
                        'J' => '单据类型',
                        'K' => '单据状态',
                        'L' => '数据来源',
                        'M' => '采购类型',
                        'N' => '备注1',
                        'O' => '下单时间',
                        'P' => '是否关账',
                        'Q' => '审核时间',
                        'R' => '审核人',
                        'S' => '采购订单明细ID',
                        'T' => 'SKU',
                        'U' => '产品名称',
                        'V' => '单位',
                        'W' => '数量',
                        'X' => '承诺交期',
                        'Y' => '需求日期',
                        'Z' => '产品条码',
                        'AA' => '平台SKU',
                        'AB' => '平台',
                        'AC' => '账号',
                        'AD' => '已收货数量',
                        'AE' => '已付款金额',
                        'AF' => '提货方式',
                        'AG' => '验货状态',
                        'AH' => '已验数量',
                        'AI' => '已排程数量',
                        'AJ' => '每箱箱数',
                        'AK' => '整箱数',
                        'AL' => '整箱-长(CM)',
                        'AM' => '整箱-宽(CM)',
                        'AN' => '整箱-高(CM)',
                        'AO' => '整箱-毛重(KG)',
                        'AP' => '整箱-净重(KG)',
                        'AQ' => '尾箱每箱数量',
                        'AR' => '尾箱数',
                        'AS' => '尾箱-长(CM)',
                        'AT' => '尾箱-宽(CM)',
                        'AU' => '尾箱-高(CM)',
                        'AV' => '尾箱-毛重(KG)',
                        'AW' => '尾箱-净重(KG)',
                        'AX' => '已发运数量',
                        'AY' => '已收货数量',
                        'AZ' => '不含税单价',
                        'BA' => '不含税金额',
                        'BB' => '含税单价',
                        'BC' => '含税金额',
                        'BD' => '税率',
                        'BE' => '已申付金额',
                        'BF' => '备注2'
                    ],
                ],

            ],
        ]);
        $phpExcel = $file->getWorkbook();
        $phpExcel->getSheet()->getRowDimension(1)->setRowHeight(20);
        //所有垂直居中
        $phpExcel->getSheet()->getStyle('A1:BF' . (count($list) + 1))->getAlignment()->setVertical(\PHPExcel_Style_Alignment::VERTICAL_CENTER);
        //设置单元格边框
        $phpExcel->getSheet()->getStyle('A1:BF' . (count($list) + 1))->getBorders()->getAllBorders()->setBorderStyle(\PHPExcel_Style_Border::BORDER_THIN);
        //设置第一列的字体大小
        $phpExcel->getSheet()->getStyle("A1:BF1")->getFont()->setSize(12);
        //第一行字体加粗
        $phpExcel->getSheet()->getStyle("A1:BF1")->getFont()->setBold(true);

        $phpExcel->getSheet()->getDefaultColumnDimension()->setWidth(10);//设置单元格宽度

        $file->send($filePrefix . $fileSuffix);
    }

    /**
     * 拼装数据
     * $PuPurchaseDB_list 采购订单子表数据
     * $pu_purchase 采购订单主表数据
     * $organization_list 组织架构数据
     * $partint_list 合作伙伴数据
     * $channel_list 平台数据
     * $money_list 单位数据
     * $users_list 用户数据
     * $dictionary_list 字典表数据
     * $unit_list 单位数据
     * $account_list 账号数据
     * $员工数据
     * @return array
     * */
    public static function Assemble($PuPurchaseDB_list, $pu_purchase, $organization_list, $partint_list, $channel_list, $money_list, $users_list, $dictionary_list, $unit_list, $account_list, $userus_list)
    {
        //获取全部的关联数据
        $Pu = [];//数据拼装
        foreach ($PuPurchaseDB_list as $in => $text) {
            $Pu[$in] = [];
            foreach ($pu_purchase as $value) {
                if ($value['PU_PURCHASE_CD'] == $text['PU_PURCHASE_CD']) {
                    //拼装主表19
                    $Pu[$in][] = $value['PU_PURCHASE_ID'];
                    $Pu[$in][] = $value['PU_PURCHASE_CD'];
                    $Pu[$in][] = static::getorganization_list($organization_list, $value['ORGANISATION_ID'], 'ORGANISATION_ID', 'ORGANISATION_NAME_CN');
                    $Pu[$in][] = static::getorganization_list($partint_list, $value['PARTNER_ID'], 'PARTNER_ID', 'PARTNER_NAME_CN');
                    $Pu[$in][] = static::getorganization_list($channel_list, $value['CHANNEL_ID'], 'CHANNEL_ID', 'CHANNEL_NAME_CN');
                    $Pu[$in][] = static::getorganization_list($money_list, $value['MONEY_ID'], 'MONEY_ID', 'MONEY_NAME_CN');
                    $STAFF_CODE = static::getorganization_list($users_list, $value['FUPUSER_ID'], 'USER_INFO_ID', 'STAFF_ID');
                    $Pu[$in][] = static::getorganization_list($userus_list, $STAFF_CODE, 'STAFF_ID', 'STAFF_NAME_CN');
                    $Pu[$in][] = static::getorganization_list($organization_list, $value['DORGANISATION_ID'], 'ORGANISATION_ID', 'ORGANISATION_NAME_CN');
                    $Pu[$in][] = static::getorganization_list($dictionary_list, ['PARTNER_SMETHOD', $value['SMETHOD']], ['D_GROUP', 'D_VALUE'], 'D_NAME_CN');
                    $Pu[$in][] = static::getorganization_list($dictionary_list, ['PU_PURCHASE_TYPE', $value['ORDER_TYPE']], ['D_GROUP', 'D_VALUE'], 'D_NAME_CN');
                    $Pu[$in][] = static::getorganization_list($dictionary_list, ['PU_PURCHASE', $value['ORDER_STATE']], ['D_GROUP', 'D_VALUE'], 'D_NAME_CN');
                    $Pu[$in][] = $value['IMPORT_STATE'] == '1' ? '手工创建' : '采购计划下推';
                    $Pu[$in][] = static::getorganization_list($dictionary_list, ['PLAN_TYPE', $value['PLAN_TYPE']], ['D_GROUP', 'D_VALUE'], 'D_NAME_CN');
                    $Pu[$in][] = $value['ORDER_REMARKS'];
                    $Pu[$in][] = $value['PRE_ORDER_AT'] ? date("Y-m-j H:i:s", $value['PRE_ORDER_AT']) : null;
                    $Pu[$in][] = $value['CLOSING_STATE'] == '0' ? '未关账' : '已关账';
                    $Pu[$in][] = $value['AUTITO_AT'] ? date("Y-m-j H:i:s", $value['AUTITO_AT']) : null;
                    $STAFF_CODE2 = static::getorganization_list($users_list, $value['AUTITO_ID'], 'USER_INFO_ID', 'STAFF_ID');
                    $Pu[$in][] = static::getorganization_list($userus_list, $STAFF_CODE2, 'STAFF_ID', 'STAFF_NAME_CN');

                }
            }
            //拼装明细41
            $Pu[$in][] = $text['PURCHASE_DETAIL_ID'];
            $Pu[$in][] = $text['PSKU_CODE'];
            $Pu[$in][] = $text['PSKU_NAME_CN'];
            $Pu[$in][] = static::getorganization_list($unit_list, $text['UNIT_ID'], 'UNIT_ID', 'UNIT_NAME_CN');
            $Pu[$in][] = $text['PURCHASE'];
            $Pu[$in][] = $text['COMMI_PERIOD'] ? date("Y-m-j", $text['COMMI_PERIOD']) : null;
            $Pu[$in][] = $text['DEMAND_AT'] ? date("Y-m-j", $text['DEMAND_AT']) : null;
            $Pu[$in][] = $text['FNSKU'];
            $Pu[$in][] = $text['PLATFORM_SKU'];
            $Pu[$in][] = static::getorganization_list($channel_list, $text['CHANNEL_ID'], 'CHANNEL_ID', 'CHANNEL_NAME_CN');
            $Pu[$in][] = static::getorganization_list($account_list, $text['ACCOUNT_ID'], 'ACCOUNT_ID', 'ACCOUNT');
            $Pu[$in][] = $text['RGOODS_NUMBER'];
            $Pu[$in][] = $text['RGOODS_AMOUNT'];
            $Pu[$in][] = $text['DELIVERY_METHOD'];
            $Pu[$in][] = static::getorganization_list($dictionary_list, ['INSPECTION_STATE', $text['INSPECTION_STATE']], ['D_GROUP', 'D_VALUE'], 'D_NAME_CN');
            $Pu[$in][] = $text['INSPECTION_NUMBER'];
            $Pu[$in][] = $text['SCHEDULING_NUMBER'];
            $Pu[$in][] = $text['EACH_NUMBER'];
            $Pu[$in][] = $text['FCL_NUMBER'];
            $Pu[$in][] = $text['FCL_LONG'];
            $Pu[$in][] = $text['FCL_WIDE'];
            $Pu[$in][] = $text['FCL_HIGH'];
            $Pu[$in][] = $text['GROSS_WEIGHT'];
            $Pu[$in][] = $text['FCL_NET_WEIGHT'];
            $Pu[$in][] = $text['TAILBOX_BNUMBER'];
            $Pu[$in][] = $text['TAILBOX_NUMBER'];
            $Pu[$in][] = $text['TAILBOX_LONG'];
            $Pu[$in][] = $text['TAILBOX_WIDE'];
            $Pu[$in][] = $text['TAILBOX_HIGH'];
            $Pu[$in][] = $text['TAILBOX_WEIGHT'];
            $Pu[$in][] = $text['TAILBOX_NETWEIGHT'];
            $Pu[$in][] = $text['SHIPPED_QUANTITY'];
            $Pu[$in][] = $text['RGOODS_NUMBER'];
            $Pu[$in][] = $text['NOT_TAX_UNITPRICE'];
            $Pu[$in][] = $text['NOT_TAX_AMOUNT'];
            $Pu[$in][] = $text['TAX_UNITPRICE'];
            $Pu[$in][] = $text['TAX_AMOUNT'];
            $Pu[$in][] = $text['TAX_RATE'];
            $Pu[$in][] = floatval($text['THIS_APPLY_AMOUNT']);
            $Pu[$in][] = $text['DETAIL_REMARKS'];
        }
        return $Pu;
    }

    /**
     * 循环获取名称
     * $model 数据结构
     * $code 条件值
     * $model_where 条件字段
     * 支持2条件
     * $name 返回字段
     */
    public static function getorganization_list($model, $code, $model_where, $name)
    {
        if (count($model) > 0) {

            foreach ($model as $value) {
                $names = [];
                if (count($code) > 1 && count($model_where) > 1) {
                    if ($value[$model_where[0]] == $code[0] && $value[$model_where[1]] == $code[1]) {
                        if (is_array($name)) {
                            foreach ($name as $name_s) {
                                $names[] = $value[$name_s];
                            }
                            return $names;
                        } else {
                            return $value[$name];
                        }
                    }
                } else {
                    if ($value[$model_where] == $code) {
                        if (is_array($name)) {
                            foreach ($name as $name_s) {
                                $names[] = $value[$name_s];
                            }
                            return $names;
                        } else {
                            return $value[$name];
                        }
                    }
                }
            }

        } else {
            return "";
        }
    }

    /**
     * export_pdf
     * 导出pdf
     * */
    public static function export_pdf($post)
    {
        if (!isset($post['PURCHASE_CD'])) {
            return Yii::t('purchase', 'Please fill in the complete condition!');
//            return Yii::t('purchase', '条件不完整，不允许打印！');
        }

        if (!isset($post['PDF_NUM'])) {
            $post['PDF_NUM'] = '1';
        }

        //拼装需要的数据
        $list = static::PDFDATE($post['PURCHASE_CD']);

        //没有明细
        if ($list == 1) {
            return Yii::t('purchase', 'Document details must have at least one!');
//            return Yii::t('purchase', '没有明细不允许打印！');

        }
        $print = Pdf::DEST_BROWSER;//默认

        //判断是打印还是浏览
        if (isset($post['NOT_PRINT']) && $post['NOT_PRINT'] == '2') {
            $print = Pdf::DEST_DOWNLOAD;
        }

        $html = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\temppdfLogin', 'GetTemplate'], [$list, $post['PDF_NUM']]]);

        //输出页眉页脚内容
        $pdf = Yii::createObject(['class' => '\yii\swoole\files\Pdf',
            'filename' => '采购订单' . $list['PU_PURCHASE_CD'] . $list['PARTNER_ANAME_CN'] . '.pdf',
            'title' => '采购订单' . $list['PU_PURCHASE_CD'] . $list['PARTNER_ANAME_CN'],
            'content' => $html,
            'destination' => $print,
            'methods' => ['SetFooter' => [['C' => array(
                'content' => '{PAGENO}/{nb}',
                'font-size' => 10,
                'font-style' => '',
                'font-family' => 'serif',
                'color' => '#000000'
            )], "O"]]
        ]);
        $pdf->render();
    }

    /**
     * 1 export_pdf
     * 拼装需要的数据
     * */
    public static function PDFDATE($PU_PURCHASE_CD)
    {
        $StaffInfoList = Yii::$app->rpc->create('users')->sendAndrecv([['\addons\users\modellogic\staffinfologic', 'getStaffInfo'], [['STAFF_ID', 'STAFF_NAME_CN'], []]]);
        //主表
        $list_db = (new Query())->from('pu_purchase T1')
            ->select(['T1.PRE_ORDER_AT', 'T4.HEADER_STATE', 'T4.ORGANISATION_NAME_EN', 'T1.AUTITO_AT', 'T1.PU_PURCHASE_CD', 'T1.ORDER_REMARKS', 'T2.PARTNER_NAME_CN', 'T2.PARTNER_ANAME_CN', 'T3.CONTACT', 'T3.PHONE', 'T3.FAX', 'T4.ORGANISATION_NAME_CN', 'T4.CONTACT as ORCONTACT', 'T4.PHONE as ORPHONE', 'T4.FAX as ORFAX', 'T5.MONEY_NAME_CN', 'T5.MONEY_SYMBOLS', 'T6.STAFF_ID as CSTAFF_CODES', 'T7.STAFF_ID as AUSTAFF_CODES', 'T8.STAFF_ID as FUSTAFF_CODES', 'T9.ORGANISATION_NAME_CN as BUMEN'])
            ->leftJoin('pa_partner T2', 'T2.PARTNER_ID = T1.PARTNER_ID')
            ->leftJoin('pa_partner_contact T3', 'T3.PARTNER_ID = T2.PARTNER_ID')//供应商
            ->leftJoin('o_organisation T4', 'T4.ORGANISATION_ID = T1.ORGANISATION_ID')//组织
            ->leftJoin('b_money T5', 'T5.MONEY_ID = T1.MONEY_ID')//币种
            ->leftJoin('u_user_info T6', 'T6.USER_INFO_ID = T1.CUSER_ID')//制单人
            ->leftJoin('u_user_info T7', 'T7.USER_INFO_ID = T1.AUTITO_ID')//审核人
            ->leftJoin('u_user_info T8', 'T8.USER_INFO_ID = T1.FUPUSER_ID')//采购跟进人
            ->leftJoin('o_organisation T9', 'T9.ORGANISATION_ID = T7.ORGANISATION_ID')
            ->where(array('T1.PU_PURCHASE_CD' => $PU_PURCHASE_CD))
            ->distinct();

        //子表
        $purchase_detail_db = (new Query())->from('pu_purchase_detail T1')
            ->select(['T1.PURCHASE_DETAIL_ID', 'T4.UNIT_NAME_CN', 'T3.CUSTOMS_NAME', 'T1.PSKU_CODE', 'T1.PSKU_NAME_CN', 'T1.FNSKU', 'T1.PURCHASE', 'T1.TAX_UNITPRICE', 'T1.COMMI_PERIOD'])
            ->distinct()
            ->leftJoin('g_product_sku T2', 'T2.PSKU_ID = T1.PSKU_ID')
            ->leftJoin('g_product_sku_declare T3', 'T3.PSKU_ID = T2.PSKU_ID')
            ->leftJoin('b_unit T4', 'T4.UNIT_ID = T1.UNIT_ID')
            ->where(array('T1.PU_PURCHASE_CD' => $PU_PURCHASE_CD));

        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            $list_db->andWhere(['T1.ORGANISATION_ID' => Yii::$app->session->get('organization') ?: null]);
            $purchase_detail_db->andWhere(['T1.PSKU_ID' => Yii::$app->session->get('product_id') ?: null]);
        }
        $list = $list_db->one();
        $purchase_detail = $purchase_detail_db->all();

        $detail = [];
        $detailNum = 0;
        $detailMoeny = 0;
        if (count($purchase_detail) > 0) {
            foreach ($purchase_detail as $index => $item) {
                $detail[$index] = [];
                //序号
                $detail[$index]['index'] = $index + 1;
                //产品编码
                $detail[$index]['PSKU_CODE'] = $item['PSKU_CODE'];
                //产品名称
                $detail[$index]['PSKU_NAME_CN'] = $item['PSKU_NAME_CN'];
                //规格
                $detail[$index]['FNSKU'] = $item['FNSKU'];
                //报关品名 模板2
                $detail[$index]['CUSTOMS_NAME'] = $item['CUSTOMS_NAME'];
                //单位 模板2
                $detail[$index]['UNIT_NAME_CN'] = $item['UNIT_NAME_CN'];
                //数量
                $detail[$index]['PURCHASE'] = $item['PURCHASE'] == null ? 0 : $item['PURCHASE'];
                //单价
                $detail[$index]['TAX_UNITPRICE'] = $item['TAX_UNITPRICE'] == null ? '0.00' : number_format($item['TAX_UNITPRICE'], 2);
                //总价 格式为999,999.00
                $detail[$index]['NUMPRICE'] = number_format(floatval($item['PURCHASE']) * floatval($item['TAX_UNITPRICE']), 2);
                //交货日期
                $detail[$index]['COMMI_PERIOD'] = $item['COMMI_PERIOD'] !== null && $item['COMMI_PERIOD'] ? date('Y-m-d', $item['COMMI_PERIOD']) : "";
                //合计数量
                $detailNum = floatval($item['PURCHASE']) + $detailNum;
                //合计金额
                $detailMoeny = floatval($item['PURCHASE']) * floatval($item['TAX_UNITPRICE']) + $detailMoeny;
            }
        } else {
            return 1;
        }
        //制单人
        $list['CSTAFF_CODE'] = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getorganization_list'], [$StaffInfoList, $list['CSTAFF_CODES'], 'STAFF_ID', 'STAFF_NAME_CN']]);
        //审核人
        $list['AUSTAFF_CODE'] = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getorganization_list'], [$StaffInfoList, $list['AUSTAFF_CODES'], 'STAFF_ID', 'STAFF_NAME_CN']]);
        //采购跟进人
        $list['FUSTAFF_CODE'] = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'getorganization_list'], [$StaffInfoList, $list['FUSTAFF_CODES'], 'STAFF_ID', 'STAFF_NAME_CN']]);
        //批准
        $list['PIZHUN'] = "Ken";
        $list['detailNum'] = $detailNum; //合计数量
        $list['detailMoeny'] = number_format($detailMoeny, 2);//合计金额
        $list['detailMoenyCh'] = static::num_to_rmb($detailMoeny);//大写合计金额 模板2
        $list['detail'] = $detail;
        return $list;
    }

    /**
     * 1export_pdf
     * 数字金额转换成中文大写金额的函数
     * String Int $num 要转换的小写数字或小写字符串
     * return 大写字母
     * 小数位为两位
     * */
    public static function num_to_rmb($num)
    {
        $c1 = "零壹贰叁肆伍陆柒捌玖";
        $c2 = "分角元拾佰仟万拾佰仟亿";
        //精确到分后面就不要了，所以只留两个小数位
        $num = round($num, 2);
        //将数字转化为整数
        $num = $num * 100;
        if (strlen($num) > 10) {
            return "金额太大，请检查";
        }
        $i = 0;
        $c = "";
        while (1) {
            if ($i == 0) {
                //获取最后一位数字
                $n = substr($num, strlen($num) - 1, 1);
            } else {
                $n = $num % 10;
            }
            //每次将最后一位数字转化为中文
            $p1 = substr($c1, 3 * $n, 3);
            $p2 = substr($c2, 3 * $i, 3);
            if ($n != '0' || ($n == '0' && ($p2 == '亿' || $p2 == '万' || $p2 == '元'))) {
                $c = $p1 . $p2 . $c;
            } else {
                $c = $p1 . $c;
            }
            $i = $i + 1;
            //去掉数字最后一位了
            $num = $num / 10;
            $num = (int)$num;
            //结束循环
            if ($num == 0) {
                break;
            }
        }
        $j = 0;
        $slen = strlen($c);
        while ($j < $slen) {
            //utf8一个汉字相当3个字符
            $m = substr($c, $j, 6);
            //处理数字中很多0的情况,每次循环去掉一个汉字“零”
            if ($m == '零元' || $m == '零万' || $m == '零亿' || $m == '零零') {
                $left = substr($c, 0, $j);
                $right = substr($c, $j + 3);
                $c = $left . $right;
                $j = $j - 3;
                $slen = $slen - 3;
            }
            $j = $j + 3;
        }
        //这个是为了去掉类似23.0中最后一个“零”字
        if (substr($c, strlen($c) - 3, 3) == '零') {
            $c = substr($c, 0, strlen($c) - 3);
        }
        //将处理的汉字加上“整”
        if (empty($c)) {
            return "零元整";
        } else {
            return $c . "整";
        }
    }

    /**
     * addStorage
     * 新增内部采购订单
     * @param $data
     *
     * */
    public static function addPurchase($data)
    {

        foreach ($data as $dispatchModel) {
            $post = Yii::$app->getRequest()->getBodyParams();
            Yii::$app->getRequest()->setBodyParams($dispatchModel);
            $result = CreateExt::actionDo(new PuPurchase(), $dispatchModel);
            Yii::$app->getRequest()->setBodyParams($post);
            if ($result instanceof addPurchase) {
                return $result;
            }
        }

    }

    public static function addPurchaseReturn($data)
    {

        foreach ($data as $dispatchModel) {
            $post = Yii::$app->getRequest()->getBodyParams();
            Yii::$app->getRequest()->setBodyParams($dispatchModel);
            $result = CreateExt::actionDo(new PuPurchase(), $dispatchModel);
            Yii::$app->getRequest()->setBodyParams($post);

            return $result;
        }
    }

    /**
     * SetPurchase
     * 审核内部采购订单
     * @param $data
     * @return bool
     * */
    public static function SetPurchase($data)
    {
        $dispatchModel = array("batchMTC" => $data);
        $post = Yii::$app->getRequest()->getBodyParams();
        Yii::$app->getRequest()->setBodyParams($dispatchModel);
        $result = UpdateExt::actionDo(new PuPurchase(), $dispatchModel);
        Yii::$app->getRequest()->setBodyParams($post);
        if ($result instanceof ResponeModel) {
            return $result;
        }
    }

    /**
     * GetPurchaseIndex
     * 查询采购订单
     * @param $data
     * @return array
     * */
    public static function GetPurchaseIndex($data)
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        Yii::$app->getRequest()->setBodyParams($data);
        $result = IndexExt::actionDo(new PuPurchaseDetail(), $data);
        Yii::$app->getRequest()->setBodyParams($post);
        if ($result instanceof ResponeModel) {
            return $result;
        }
    }

    /**
     * 物理删除采购订单 和 采购订单明细
     */
    public static function delPurchase($where)
    {
        $res = PuPurchase::updateAll(array('DELETED_STATE' => 1), $where);

        $purchaseDetail_ids = PuPurchaseDetail::find()->where($where)->select('PURCHASE_DETAIL_ID')->asArray()->all();
        $detail_res = PuPurchaseDetail::deleteAll(array('PURCHASE_DETAIL_ID' => $purchaseDetail_ids));
        return $res && $detail_res;
    }
}