<?php

/**
 * Created by PhpStorm.
 * User: AM02
 * Date: 2017/5/3
 * Time: 15:38
 */

namespace addons\inventory\modellogic;

use addons\inventory\models\SkPlacing;
use Yii;
use addons\inventory\models\SkPlacingDetail;
use addons\inventory\models\SkInstantInventory;

use yii\db\Expression;
use yii\swoole\db\Query;
use yii\swoole\rest\CreateExt;
use \yii\swoole\rest\ResponeModel;
use alexgx\phpexcel\PhpExcel;
use yii\swoole\helpers\ArrayHelper;
use yii\swoole\rest\UpdateExt;

class placingLogic
{
    /**
     * getPlacingSALES_CD
     * 通过 内部销售顶订单单号INTERNAL_SALES_CD 查询出库单主表
     * @param $INTERNAL_SALES_CD
     * @return array
     * */
    public static function getPlacingSALES_CD($INTERNAL_SALES_CD)
    {
        $query = (new Query())->from('sk_placing')->where($INTERNAL_SALES_CD)->all();
        $list = [];
        foreach ($query as $i => $item) {
            $list[$i] = [];
            $list[$i] = $item;
            $query_l = (new Query())->from('sk_placing_detail')->where(array('PLACING_ID' => $item['PLACING_ID']))->all();
            $list[$i]['sk_placing_detail'] = $query_l;
        }

        return $list;
    }

    /**
     * getSkPlacing
     * 查询出库单主表信息
     * @param $select
     * @param $where
     * @return array
     * */
    public static function getSkPlacing($select = [], $where)
    {
        if (count($select) > 0) {
            return SkPlacing::find()->select($select)->where($where)->asArray()->all();
        } else {
            return SkPlacing::find()->where($where)->asArray()->all();
        }
    }

    /**检查会计期间和出库单SKU的库存
     * @param $postarray
     * @return array
     */
    public static function checkSkuInventory($postarray)
    {

        $respone = new ResponeModel();
        $returnArray['flag'] = true;
        $placeidarr = array();

        //校验会计期间
        foreach ($postarray as $post) {
            if (!isset($post['orderclassify'])) {
                $returnArray['flag'] = false;
                return $respone->setModel(500, 0, Yii::t('inventory', 'The orderclassify parameter cannot be null!'), $returnArray);
//                return $respone->setModel(500, 0, "orderclassify参数不能为空", $returnArray);
            }
            switch ($post['orderclassify']) {
                case 2:
                    $idAttribute = "STORAGE_ID";
                    $cdAttribute = "STORAGE_CD";
                    $warehouseAttribute = "SWAREHOUSE_ID";
                    $model = "addons\\inventory\\models\\SkStorageDetail";
                    $skucodeAttribute = "PSKU_CODE";
                    $skuNumberAttribute = "STORAGE_DNUMBER";
                    break;
                case 3:
                    $idAttribute = "PLACING_ID";
                    $cdAttribute = "PLACING_CD";
                    $warehouseAttribute = "PDWAREHOUSE_ID";
                    $model = "addons\\inventory\\models\\SkPlacingDetail";
                    $skucodeAttribute = "PDSKU_CODE";
                    $skuNumberAttribute = "PDNUMBER";

                    break;
                case 6:
                    $idAttribute = "FIALLOCATION_ID";
                    $cdAttribute = "FIALLOCATION_CD";
                    $warehouseAttribute = $post["warehouseAttribute"];
                    $model = "addons\\inventory\\models\\SkFiallocationDetail";
                    $skucodeAttribute = "ATSKU_ID";
                    $skuNumberAttribute = "ALLOCATION_NUMBER";

                    break;
            }

            array_push($placeidarr, isset($post[$idAttribute]) ? $post[$idAttribute] : 0);
            if (array_key_exists("PRE_ORDER_AT", $post)) {
                /*暂时屏蔽会计校验
                $result = Yii::$app->rpc->create('finance')->sendAndrecv([['\addons\finance\modellogic\accountingperiodLogic', 'accounting_period_method'], [$post['ORGANISATION_ID'], $post['PRE_ORDER_AT']]]);
                if (!$result) {
                    $returnArray['flag'] = false;
                    $returnArray['type'] = 1;
                    $returnArray[$cdAttribute] = isset($post[$cdAttribute]) ? $post[$cdAttribute] : "";

                    return $respone->setModel(200, 0, "查询成功", $returnArray);
                }
                */
            }
        }
        if (!array_key_exists("ONLY_CHECK_DATE", $post)) {
            //若是还需要校验SKU库存的
            $con[$idAttribute] = $placeidarr;

            $Details = $model::findAll($con);


            $skuarray = [];
            //计算整合对应仓的对应SKU数量
            foreach ($Details as $detail) {
                if (!array_key_exists($detail->$warehouseAttribute, $skuarray)) {

                    $skuarray[$detail->$warehouseAttribute] = array();
                }
                if (array_key_exists($detail->$skucodeAttribute, $skuarray[$detail->$warehouseAttribute])) {
                    $skuarray[$detail->$warehouseAttribute][$detail->$skucodeAttribute] += $detail->$skuNumberAttribute;
                } else {
                    $skuarray[$detail->$warehouseAttribute][$detail->$skucodeAttribute] = $detail->$skuNumberAttribute;
                }

            }

            $condition = [];
            //查询库存
            foreach ($skuarray as $key => $value) {

                foreach ($value as $k => $v) {
                    $condition['s.WAREHOUSE_ID'] = $key;
                    $condition['s.PSKU_CODE'] = $k;
                    $skuInventory = (new \yii\db\Query())
                        ->select('*')
                        ->from('sk_instant_inventory as s')
                        ->leftJoin("g_product_sku as g", "g.PSKU_CODE = g.PSKU_CODE")
                        ->where($condition)
                        ->one();

                    //小于即时库存
                    if ($skuInventory['INSTANT_NUMBER'] < $v) {
                        $returnArray['flag'] = false;
                        $returnArray['type'] = 2;
                        $returnArray['sku'] = $skuInventory['PSKU_NAME_CN'] ? $skuInventory['PSKU_NAME_CN'] : $k;
                        return $respone->setModel(200, 0, Yii::t('inventory', 'Query was successful!'), $returnArray);
//                        return $respone->setModel(200, 0, "查询成功", $returnArray);
                    }
                }
            }
            return $respone->setModel(200, 0, Yii::t('inventory', 'Query was successful!'), $returnArray);
//            return $respone->setModel(200, 0, "查询成功", $returnArray);
        }
        return $respone->setModel(200, 0, Yii::t('inventory', 'Query was successful!'), array('flag' => false, 'type' => 0));
    }

    /**出库单导出
     * @param $post
     * @return string
     */
    public static function export($post)
    {
        $post['search'] = ArrayHelper::getValue($post, 'search');

        $con = ["and", ["or", ["like", "og.ORGANISATION_NAME_CN", $post['search']],
            ["like", "w.WAREHOUSE_NAME_CN", $post['search']],
            ["like", "s.PLACING_CD", $post['search']]], "s.DELETED_STATE=0"];
        //获取出库单明细数据
        $placingDetailDB = (new \yii\db\Query())
            ->select('sd.PLACING_CD,og.ORGANISATION_NAME_CN,pa.PARTNER_ANAME_CN,s.PLACING_AT,w.WAREHOUSE_NAME_CN,sku.PSKU_CODE,sku.PSKU_NAME_CN,bu.UNIT_NAME_CN,sd.PDNUMBER,sd.UNIT_PRICE
                ,sd.PDMONEY,m.MONEY_NAME_CN,s.ORDER_TYPE,s.PLAN_STATE,s.AUTITO_AT,a.USERNAME AS AUTHNAME,c.USERNAME AS CREATNAME,s.CLOSING_STATE,s.PLACING_REMARKS')
            ->from('sk_placing_detail sd')
            ->leftJoin("sk_placing s", "sd.PLACING_ID = s.PLACING_ID")
            ->leftJoin("pa_partner pa", "pa.PARTNER_ID = s.PPARTNER_ID")
            ->leftJoin("o_organisation og", "s.PRGANISATION_ID = og.ORGANISATION_ID")
            ->leftJoin("b_warehouse w", "sd.PDWAREHOUSE_ID = w.WAREHOUSE_ID")
            ->leftJoin("b_unit bu", "sd.UNIT_ID = bu.UNIT_ID")
//            ->leftJoin("g_product_sku sku", "sd.PDSKU_ID = sku.PSKU_ID and sku.ORGAN_ID_DEMAND = s.PRGANISATION_ID")
            ->leftJoin('g_product_sku sku', 'sd.PSKU_ID = sku.PSKU_ID')
            ->leftJoin("u_user_info c", "sd.CUSER_ID = c.USER_INFO_ID")
            ->leftJoin("u_user_info a", "s.AUTITO_ID = a.USER_INFO_ID")
            ->leftJoin("b_money m", "s.PMONEY_ID = m.MONEY_ID")
            ->groupBy('PLACING_DETAIL_ID')
            ->where($con);

        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            $placingDetailDB->andWhere(['s.PRGANISATION_ID' => Yii::$app->session->get('organization')]);
            $placingDetailDB->andWhere(['sd.PSKU_ID' => Yii::$app->session->get('product_id')]);
        }
        $placingDetails = $placingDetailDB->all();

        if (count($placingDetails) > 0) {

            //拼装返回导出数据
            $array = static::Assemble($placingDetails);
            //导出excel2007
            static::export_excel($array);

        } else {
            return Yii::t('inventory', 'No data!');
//            return Yii::t('inventory', '没有需要导出的数据！');
        }
    }

    public static function Assemble($placingDetails)
    {
        $Pu = [];//数据拼装
        foreach ($placingDetails as $key => $value) {
            $Pu[$key] = [];

            $Pu[$key][] = $value['PLACING_CD'];
            $Pu[$key][] = $value['ORGANISATION_NAME_CN'];
            $Pu[$key][] = $value['PARTNER_ANAME_CN'];
            $Pu[$key][] = $value['PLACING_AT'] == null ? "" : date("Y-m-j", $value['PLACING_AT']);
            $Pu[$key][] = $value['WAREHOUSE_NAME_CN'];
            $Pu[$key][] = $value['PSKU_CODE'];
            $Pu[$key][] = $value['PSKU_NAME_CN'];
            $Pu[$key][] = $value['UNIT_NAME_CN'];
            $Pu[$key][] = $value['PDNUMBER'];
            $Pu[$key][] = $value['UNIT_PRICE'];
            $Pu[$key][] = $value['PDMONEY'];
            $Pu[$key][] = $value['MONEY_NAME_CN'];;
            if ($value['ORDER_TYPE'] == 1) {
                $type = "销售出库";
            } elseif ($value['ORDER_TYPE'] == 2) {
                $type = "内部销售出库";
            } else {
                $type = "其他出库";
            }
            $Pu[$key][] = $type;
            $Pu[$key][] = $value['PLAN_STATE'] == 1 ? '未审核' : '已审核';
            $Pu[$key][] = $value['AUTITO_AT'] == null ? "" : date("Y-m-j", $value['AUTITO_AT']);
            $Pu[$key][] = $value['AUTHNAME'];
            $Pu[$key][] = $value['CREATNAME'];
            $Pu[$key][] = $value['CLOSING_STATE'] == '0' ? '未关账' : '已关账';
            $Pu[$key][] = $value['PLACING_REMARKS'];


        }
        return $Pu;
    }

    /**
     * 导出excel
     * php office
     * */
    public static function export_excel($list)
    {
        $filePrefix = '出库单据-' . date("Y-m-j");
        $fileSuffix = '.xlsx';
        $file = \Yii::createObject([
            'class' => 'yii\swoole\files\ExcelFile',
            'fileOptions' => ['suffix' => $fileSuffix],
            'sheets' => [

                'Active Users' => [
                    'data' => $list,
                    'titles' => [
                        'A' => '出库单号',
                        'B' => '组织',
                        'C' => '客户',
                        'D' => '出库日期',
                        'E' => '出库仓库',
                        'F' => 'SKU',
                        'G' => '产品名称',
                        'H' => '单位',
                        'I' => '数量',
                        'J' => '单价',
                        'K' => '金额',
                        'L' => '币种',
                        'M' => '单据类型',
                        'N' => '单据状态',
                        'O' => '审核时间',
                        'P' => '审核人',
                        'Q' => '制单人',
                        'R' => '是否关账',
                        'S' => '备注'


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
     * addPlacing
     * 新增出库表
     * @param $data
     *
     * */
    public static function addPlacing($data)
    {

        foreach ($data as $dispatchModel) {
            $post = Yii::$app->getRequest()->getBodyParams();
            Yii::$app->getRequest()->setBodyParams($dispatchModel);
            $result = CreateExt::actionDo(new SkPlacing(), $dispatchModel);
            Yii::$app->getRequest()->setBodyParams($post);
            if ($result instanceof ResponeModel) {
                return $result;
            }
        }
    }

    /**
     * SetPlacing
     * 审核出库表
     * @param $data
     * @return bool
     * */
    public static function SetPlacing($data)
    {
        $dispatchModel = array("batchMTC" => $data);
        $post = Yii::$app->getRequest()->getBodyParams();
        Yii::$app->getRequest()->setBodyParams($dispatchModel);
        $result = UpdateExt::actionDo(new SkPlacing(), $dispatchModel);
        Yii::$app->getRequest()->setBodyParams($post);


        if($result && ($data[0]['DELETED_STATE'] != 1 || !isset($data[0]['DELETED_STATE'])) ){
            $placing_data = self::formatInventory($dispatchModel);
            Yii::$app->rpc->create('purchase')->sendAndrecv([['addons\inventory\modellogic\instantInventoryLogic', 'skuInventory'], [new SkPlacing(), $placing_data]]);
        }

        if ($result instanceof ResponeModel) {
            return $result;
        }
    }

    /**
     * SetPlacing
     * 审核出库表
     * @param $data
     * @return bool
     * */
    public static function SetPlacingT($data)
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        Yii::$app->getRequest()->setBodyParams($data);
        $result = UpdateExt::actionDo(new SkPlacing(), $data);
        Yii::$app->getRequest()->setBodyParams($post);
        if ($result instanceof ResponeModel) {
            return $result;
        }
    }

    /*
     * 格式化库存数据
     */
    public static function formatInventory($row)
    {
        if(!isset($row['batchMTC']) && !isset($row['batch'])){
            $post['batchMTC'][0] = $row;
        }elseif(!isset($row['batchMTC']) && $row['batch']){
            $post['batchMTC'] = $row['batch'];
        }else{
            $post = $row;
        }

        $data = array();
        if (isset($post['batchMTC'])) {
            foreach ($post['batchMTC'] as $placing) {
                if(!isset($placing['PLACING_ID']))
                    continue;

                if (isset($placing['sk_placing_detail'])) {
                    $detials = $placing['sk_placing_detail'];
                } else {
                    $detials = SkPlacingDetail::find()->where(array('PLACING_ID' => $placing['PLACING_ID']))->asArray()->all();
                }
                foreach ($detials as $value) {
                    $row = array();
                    $row['ORDER_CD'] = $placing['PLACING_CD'];
                    if ($placing['authFlag'] == 1 && $placing['PLAN_STATE'] == 2) {
                        $row['AUTH_FLAG'] = 1;
                        $detial['INSTANT_NUMBER'] = (-1) * $value['PDNUMBER'];
                        $detial['NUMBERS'] = (-1) * $value['PDNUMBER'];
                    } elseif ($placing['authFlag'] == 2 && $placing['PLAN_STATE'] == 1) {
                        $row['AUTH_FLAG'] = 0;
                        $detial['INSTANT_NUMBER'] =  $value['PDNUMBER'];
                        $detial['NUMBERS'] = $value['PDNUMBER'];
                    }
                    $detial['ORDER_CD'] = $placing['PLACING_CD'];
                    $detial['WAREHOUSE_ID'] = $placing['PWAREHOUSE_ID'];
                    $detial['ORGANISATION_ID'] = $placing['PRGANISATION_ID'];
                    $detial['ORDER_AT'] = $placing['PLACING_AT'];
                    $detial['PSKU_ID'] = $value['PSKU_ID'];
                    $detial['PSKU_CODE'] = $value['PDSKU_CODE'];
                    $detial['UNITPRICE'] = $value['UNIT_PRICE'];
                    $detial['ORDER_TYPE'] = 2;

                    $row['DATA'][] = $detial;
                    $data[] = $row;
                }
            }
        }
        return $data;
    }

    /*
     * 物理删除出库单和出库单详情
     */
    public static function delPlacing($where)
    {

        $res = SkPlacing::updateAll(array('DELETED_STATE' => 1), $where);

        $placingDetail_ids = SkPlacingDetail::find()->select('PLACING_DETAIL_ID')->where($where)->asArray()->all();

        $detail_res = SkPlacingDetail::deleteAll(array('PLACING_DETAIL_ID' => $placingDetail_ids));

        return $res && $detail_res;
    }

    /**
     * 弹出框 复合查询
     */
    public static function queryPlacingChoose($search = "", $pagesize = 20, $page = 1, $condition = array(),$existsID = array())
    {
//        $where = " where (pd.PDNUMBER + IFNULL((select spd.PDNUMBER from `sk_placing_detail` spd where `spd`.PLACING_DETAIL_ID=pd.RED_PLACING_DETAIL_ID),0)) >0 and  p.PLAN_STATE =2 and pd.RED_PLACING_DETAIL_ID is null";

        $num_condition = "(pd.PDNUMBER +
            (
                SELECT
                    COALESCE(sum(sspd.PDNUMBER),0)
                FROM
                    sk_placing_detail sspd
                INNER JOIN sk_placing spp ON spp.PLACING_ID = sspd.PLACING_ID
                WHERE
                    sspd.RED_PLACING_DETAIL_ID = pd.PLACING_DETAIL_ID
                AND spp.PLAN_STATE = 2
            )) > 0 and";

        $where = " where ".$num_condition." p.PLAN_STATE =2 and pd.RED_PLACING_DETAIL_ID is null ";

        //$where = " where  p.PLAN_STATE =2 and pd.RED_PLACING_DETAIL_ID is null ";
        if ($search != "") {
            $where .= "and (p.PLACING_CD LIKE '%{$search}%' or pd.SALES_ORDER LIKE '%{$search}%' or ps.PSKU_NAME_CN LIKE '%{$search}%' or ps.PSKU_CODE LIKE '%{$search}%')  ";
        }

        if (isset($condition['PPARTNER_ID'])){
            $where .= " and p.PPARTNER_ID = '" . $condition['PPARTNER_ID'] . "' ";
        }

        if (isset($condition['PRGANISATION_ID'])) {
            $where .= " and p.PRGANISATION_ID = '" . $condition['PRGANISATION_ID'] . "' ";
        }

        if($existsID){
            $existsID_str = implode(',',$existsID);
            $where .=" and pd.PLACING_DETAIL_ID not in (".$existsID_str.") ";
        }
        //权限过滤
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            //组织权限
            $organization = implode(",", Yii::$app->session->get('organization')) ?: -1;
            $where .= " and p.PRGANISATION_ID in ($organization) ";
            //sku权限
            $product_id = implode(",", Yii::$app->session->get('product_id')) ?: -1;
            $where .= " and pd.PSKU_ID in ($product_id) ";
        }

//        $count_sql = "select count(pd.PDNUMBER + IFNULL((select spd.PDNUMBER from `sk_placing_detail` spd where `spd`.RED_PLACING_DETAIL_ID=pd.PLACING_DETAIL_ID),0)) as psd_num  from `sk_placing_detail` pd INNER JOIN sk_placing p on pd.PLACING_ID=p.PLACING_ID INNER JOIN b_unit u on pd.UNIT_ID=u.UNIT_ID INNER JOIN `g_product_sku` ps on pd.PDSKU_CODE = ps.PSKU_CODE " . $where;
        $from = " FROM `sk_placing_detail` pd ";
        //$from .= " LEFT JOIN sk_placing_detail spd ON spd.RED_PLACING_DETAIL_ID=pd.PLACING_DETAIL_ID ";
        $from .= " INNER JOIN sk_placing p ON pd.PLACING_ID=p.PLACING_ID ";
        $from .= " LEFT JOIN b_unit u ON pd.UNIT_ID=u.UNIT_ID ";
        $from .= " LEFT JOIN g_product_sku ps ON pd.PSKU_ID = ps.PSKU_ID ";
        $count_sql = "select count(1) " . $from . $where;

        $start = ($page - 1) * $pagesize;

//        $sql = "select pd.*,u.*,p.*,ps.*,(pd.PDNUMBER + IFNULL((select spd.PDNUMBER from `sk_placing_detail` spd where `spd`.RED_PLACING_DETAIL_ID=pd.PLACING_DETAIL_ID),0)) as psd_num  from `sk_placing_detail` pd INNER JOIN sk_placing p on pd.PLACING_ID=p.PLACING_ID INNER JOIN b_unit u on pd.UNIT_ID=u.UNIT_ID INNER JOIN `g_product_sku` ps on pd.PDSKU_CODE = ps.PSKU_CODE " . $where . " ORDER BY p.PLACING_AT limit {$start},{$pagesize}";

        $child_sql = " pd.PDNUMBER +
            (
                SELECT
                    COALESCE(sum(sspd.PDNUMBER),0)
                FROM
                    sk_placing_detail sspd
                INNER JOIN sk_placing spp ON spp.PLACING_ID = sspd.PLACING_ID
                WHERE
                    sspd.RED_PLACING_DETAIL_ID = pd.PLACING_DETAIL_ID
                AND spp.PLAN_STATE = 2
            ) AS psd_num";


        //$sql = "select pd.*,u.*,p.*,ps.*,(pd.PDNUMBER + IFNULL(spd.PDNUMBER,0)) as psd_num " . $from . $where . " ORDER BY p.PLACING_AT limit {$start},{$pagesize}";

        $sql = "select DISTINCT pd.*,u.*,p.*,ps.*,". $child_sql . $from . $where . " ORDER BY p.PLACING_AT limit {$start},{$pagesize}";

        $connection = Yii::$app->db;
        $total_command = $connection->createCommand($count_sql);
        $postCount = $total_command->queryScalar();

        $connection = Yii::$app->db;
        $command = $connection->createCommand($sql);

        $result = $command->queryAll();

        //格式化返回数据
        $return_data = array();
        foreach ($result as $value) {
            $data = array();
            $sk_placing = array();
            $b_unit = array();
            $g_product_sku = array();

            $data['PLACING_DETAIL_ID'] = $value['PLACING_DETAIL_ID'];
            $data['PLACING_ID'] = $value['PLACING_ID'];
            $data['PLACING_CD'] = $value['PLACING_CD'];
            $data['RED_PLACING_CD'] = $value['RED_PLACING_CD'];
            $data['RED_PLACING_DETAIL_ID'] = $value['RED_PLACING_DETAIL_ID'];
            $data['SALES_ORDER'] = $value['SALES_ORDER'];
            $data['SALES_ORDER_DETAIL_ID'] = $value['SALES_ORDER_DETAIL_ID'];
            $data['PSKU_ID'] = $value['PSKU_ID'];
            $data['PSKU_CODE'] = $value['PSKU_CODE'];
            $data['PDSKU_CODE'] = $value['PDSKU_CODE'];
            $data['PRODUCT_DE'] = $value['PRODUCT_DE'];
            $data['UNIT_ID'] = $value['UNIT_ID'];
            $data['UNIT_ID'] = $value['UNIT_ID'];
            $data['PDNUMBER'] = $value['PDNUMBER'];
            $data['UNIT_PRICE'] = $value['UNIT_PRICE'];
            $data['PDMONEY'] = $value['PDMONEY'];
            $data['TAX_RATE'] = $value['TAX_RATE'];
            $data['NOT_TAX_UNITPRICE'] = $value['NOT_TAX_UNITPRICE'];
            $data['NOT_TAX_AMOUNT'] = $value['NOT_TAX_AMOUNT'];
            $data['PDWAREHOUSE_ID'] = $value['PDWAREHOUSE_ID'];
            $data['CREATED_AT'] = $value['CREATED_AT'];
            $data['UUSER_ID'] = $value['UUSER_ID'];
            $data['CUSER_ID'] = $value['CUSER_ID'];
            $data['UPDATED_AT'] = $value['UPDATED_AT'];
            $data['psd_num'] = $value['psd_num'];


            $sk_placing['PLACING_ID'] = $value['PLACING_ID'];
            $sk_placing['PRGANISATION_ID'] = $value['PRGANISATION_ID'];
            $sk_placing['PLACING_CD'] = $value['PLACING_CD'];
            $sk_placing['PLACING_AT'] = $value['PLACING_AT'];
            $sk_placing['ORDER_TYPE'] = $value['ORDER_TYPE'];
            $sk_placing['PPARTNER_ID'] = $value['PPARTNER_ID'];
            $sk_placing['PWAREHOUSE_ID'] = $value['PWAREHOUSE_ID'];
            $sk_placing['PLAN_STATE'] = $value['PLAN_STATE'];
            $sk_placing['PMONEY_ID'] = $value['PMONEY_ID'];
            $sk_placing['PMONEY'] = $value['PMONEY'];
            $sk_placing['PLACING_REMARKS'] = $value['PLACING_REMARKS'];
            $sk_placing['DELETED_STATE'] = $value['DELETED_STATE'];
            $sk_placing['AUTITO_ID'] = $value['AUTITO_ID'];
            $sk_placing['AUTITO_AT'] = $value['AUTITO_AT'];
            $sk_placing['CREATED_AT'] = $value['CREATED_AT'];
            $sk_placing['UUSER_ID'] = $value['UUSER_ID'];
            $sk_placing['CUSER_ID'] = $value['CUSER_ID'];
            $sk_placing['UPDATED_AT'] = $value['UPDATED_AT'];
            $sk_placing['CLOSING_STATE'] = $value['CLOSING_STATE'];
            $sk_placing['SYSTEM_GENERATION'] = $value['SYSTEM_GENERATION'];

            $b_unit['UNIT_ID'] = $value['UNIT_ID'];
            $b_unit['UNIT_NAME_CN'] = $value['UNIT_NAME_CN'];
            $b_unit['UNIT_NAME_EN'] = $value['UNIT_NAME_EN'];
            $b_unit['UNIT_SYMBOLS'] = $value['UNIT_SYMBOLS'];
            $b_unit['UNIT_STATE'] = $value['UNIT_STATE'];
            $b_unit['CREATED_AT'] = $value['CREATED_AT'];
            $b_unit['UPDATED_AT'] = $value['UPDATED_AT'];
            $b_unit['CUSER_ID'] = $value['CUSER_ID'];
            $b_unit['UUSER_ID'] = $value['UUSER_ID'];

            $g_product_sku['PSKU_ID'] = $value['PSKU_ID'];
            $g_product_sku['PSKU_CODE'] = $value['PSKU_CODE'];
            $g_product_sku['CSKU_ID'] = $value['CSKU_ID'];
            $g_product_sku['ORGAN_ID_DEMAND'] = $value['ORGAN_ID_DEMAND'];
            $g_product_sku['ORGAN_ID_PURCHASE'] = $value['ORGAN_ID_PURCHASE'];
            $g_product_sku['PSKU_NAME_CN'] = $value['PSKU_NAME_CN'];
            $g_product_sku['PSKU_NAME_EN'] = $value['PSKU_NAME_EN'];


            $g_product_sku['PRODUCT_TYPE_PATH'] = $value['PRODUCT_TYPE_PATH'];
            $g_product_sku['UNIT_ID'] = $value['UNIT_ID'];
            $g_product_sku['PSKU_MOQ'] = $value['PSKU_MOQ'];
            $g_product_sku['AMAZON_SIZE_ID'] = $value['AMAZON_SIZE_ID'];
            $g_product_sku['PSKU_STATE'] = $value['PSKU_STATE'];
            $g_product_sku['PSKU_REMARKS'] = $value['PSKU_REMARKS'];
            $g_product_sku['CREATED_AT'] = $value['CREATED_AT'];
            $g_product_sku['UPDATED_AT'] = $value['UPDATED_AT'];
            $g_product_sku['TRANSPORT'] = $value['TRANSPORT'];

            $g_product_sku['CUSER_ID'] = $value['CUSER_ID'];
            $g_product_sku['UNIVERSAL_STATE'] = $value['UNIVERSAL_STATE'];

            $data['sk_placing'] = $sk_placing;
            $data['b_unit'] = $b_unit;
            $data['g_product_sku'] = $g_product_sku;

            $return_data[] = $data;
        }

        $repose = new ResponeModel();

        return $repose->setModel('200', 0, '操作成功', $return_data, array('totalCount' => $postCount));

    }
}