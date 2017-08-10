<?php
namespace addons\finance\modellogic;

/**
 * Created by PhpStorm.
 * User: erp
 * Date: 2017/5/25
 * Time: 15:00
 */
use addons\finance\models\AcInventoryAge;
use addons\finance\models\AcMoinventoryBalance;
use addons\finance\models\SkLibraryRecord;
use addons\inventory\models\SkAdjustment;
use addons\inventory\models\SkFiallocation;
use addons\inventory\models\SkPlacing;
use addons\inventory\models\SkStorage;
use addons\purchase\models\PuPurchase;
use addons\sales\models\CrSalesOrder;
use yii\db\Query;
use yii\swoole\modellogic\BaseLogic;
use addons\finance\models\AcAccountingPeriod;
use yii\swoole\rest\CreateExt;
use yii\swoole\rest\ResponeModel;
use Yii;
use yii\web\ServerErrorHttpException;

class acperiodcloseLogic extends BaseLogic
{
    public static $modelClass = 'addons\finance\models\AcAccountingPeriod';

    /**
     * 关闭会计期间列表-查询接口
     * @param $post
     * @return $this
     */
    public static function indexClose($post)
    {
        $model = (new Query())->from('ac_accounting_period')
            ->select(["min(CONCAT(YEARS,ACCOUNTING_PERIOD+100)) as MINPERIOD", "ORGANISATION_ID"])
            ->where(['and', ['=', 'ACCOUNTING_STATE', 1], ['<>', 'DELETED_STATE', 1]])
            ->groupBy('ORGANISATION_ID');
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            $model->andWhere(['ORGANISATION_ID' => Yii::$app->session->get('organization') ?: null]);
        }
        $model = (new Query())->from(['m' => $model])
            ->select(['aap.*', 'oo.ORGANISATION_NAME_CN'])
            ->leftJoin('ac_accounting_period aap', "aap.ORGANISATION_ID = m.ORGANISATION_ID")
            ->leftJoin('o_organisation oo', "oo.ORGANISATION_ID = m.ORGANISATION_ID")
            ->where(['and', ['=', 'ACCOUNTING_STATE', 1], ['<>', 'DELETED_STATE', 1]])
            ->andWhere("CONCAT(aap.YEARS,aap.ACCOUNTING_PERIOD+100) = MINPERIOD");

        $totalCount = $model->count('1');
        //分页
        $limit = isset($post['limit']) && $post['limit'] ? $post['limit'] : 20;
        $page = isset($post['page']) && $post['page'] >= 1 ? $post['page'] : 1;
        $offset = ($page - 1) * $limit;
        $data = $model->offset($offset)->limit($limit)->all();

        $res = new ResponeModel();
        return $res->setModel('200', 0, Yii::t('finance', 'Successful operation!'), $data, ['totalCount' => $totalCount]);
    }

    /**
     * 关账
     * @param $post
     * @return $this
     */
    public static function closeAc($post)
    {
        $res = new ResponeModel();
        if (!isset($post['ACCOUNTING_PERIOD_ID']) || !$post['ACCOUNTING_PERIOD_ID']) {
            return $res->setModel('500', 0, Yii::t('finance', 'The ID cannot be empty!'), $post);
        }
        $data = self::getAllOrgAcPeriod($post['ACCOUNTING_PERIOD_ID']);
        if (!$data) {
            return $res->setModel('500', 0, Yii::t('finance', "Can't find the accounting period record!"), $post);
        }
        if (!self::closeCheck($data)) {   //校验是否存在未审核单据
            return $res->setModel('200', 99, Yii::t('finance', 'Failure to close accounts!'), $post);
        }
        //开启事务
        $transaction = Yii::$app->db->beginTransaction();
        foreach ($data as $item) {
            $result = self::_closeAc($item);    //关账
            if (!$result) {
                $transaction->rollBack();   //回滚
                return $res->setModel('500', 0, Yii::t('finance', 'An error occurred while closing the account to generate downstream data!'), $post);
            }
        }
        $transaction->commit(); //提交
        return Yii::t('finance', 'Successful operation!');
    }

    /**
     * 获取未审核的单据（影响关账失败的单据）
     * @param $post
     * @return $this|string
     */
    public static function getUnauditedOrder($post)
    {
        $res = new ResponeModel();
        if (!isset($post['ACCOUNTING_PERIOD_ID']) || !$post['ACCOUNTING_PERIOD_ID']) {
            return $res->setModel('500', 0, Yii::t('finance', 'The ID cannot be empty!'), $post);
        }
        $data = self::getAllOrgAcPeriod($post['ACCOUNTING_PERIOD_ID']);
        if (!$data) {
            return $res->setModel('500', 0, Yii::t('finance', "Can't find the accounting period record!"), $post);
        }

        $model = self::_getUnauditedOrder($data);
        $totalCount = $model->count('1');
        //分页
        $limit = isset($post['limit']) && $post['limit'] ? $post['limit'] : 20;
        $page = isset($post['page']) && $post['page'] >= 1 ? $post['page'] : 1;
        $offset = ($page - 1) * $limit;
        $data = $model->offset($offset)->limit($limit)->all();

        return $res->setModel('200', 0, Yii::t('finance', 'Successful operation!'), $data, ['totalCount' => $totalCount]);
    }

    /**
     * 关账失败时，导出未审核的单据
     * @param $post
     */
    public static function excelUnauditedOrder($post)
    {
        $arr = explode(",", $post['ACCOUNTING_PERIOD_ID']);
        $data = self::getAllOrgAcPeriod($arr);
        $model = self::_getUnauditedOrder($data);

        $data = $model->all();
        $titles = ['单据号', '单据类型', '审核状态', '核算组织', '期间'];
        $fileName = '未审核的单据';
        libraryageLogic::export_excel($data, $titles, $fileName);
    }

    /**
     * 反关账
     * @param $post
     * @return $this
     */
    public static function reCloseAc($post)
    {
        $res = new ResponeModel();
        if (!isset($post['ACCOUNTING_PERIOD_ID']) || !$post['ACCOUNTING_PERIOD_ID']) {
            return $res->setModel('500', 0, Yii::t('finance', 'The ID cannot be empty!'), $post);
        }
        $data = self::getAllOrgAcPeriod($post['ACCOUNTING_PERIOD_ID']);
        if (!$data) {
            return $res->setModel('500', 0, Yii::t('finance', "Can't find the accounting period record!"), $post);
        }
        //开启事务
        $transaction = Yii::$app->db->beginTransaction();
        foreach ($data as $item) {
            $result = self::_reCloseAc($item);    //反关账
            if ($result) {
                $transaction->rollBack();   //回滚
                return $res->setModel('500', 0, $result, $post);
            }
        }
        $transaction->commit(); //提交
        return $res->setModel('200', 0, Yii::t('finance', 'Successful operation!'), $post);
    }

    //一次性获取选中的所有组织下影响关账失败的单据
    public static function _getUnauditedOrder($data)
    {
        $unionOrder = self::getUnionOrderModel($data[0]);
        foreach ($data as $index => $item) {
            if ($index != 0) {
                $unionOrder = self::getUnionOrderModel($item, $unionOrder);
            }
        }
        $unionOrder = (new Query())->from([$unionOrder]);
        return $unionOrder;
    }

    //通过会计期间id获取其法人下的组织会计期间
    public static function getAllOrgAcPeriod($id){
        return (new Query())->from('o_organisation oo')
            ->select('oo.ORGANISATION_ID,
            oo.ORGANISATIONOT_ID,
            aap.ACCOUNTING_PERIOD_ID,
            aap.YEARS,
            aap.ACCOUNTING_PERIOD,
            aap.START_AT,
            aap.END_AT,
            oo2.ORGANISATION_NAME_CN')
            ->leftJoin('ac_accounting_period aap', 'aap.ORGANISATION_ID = oo.ORGANISATIONOT_ID')    //组织表通过所属法人id关联会计期间表
            ->leftJoin('o_organisation oo2', 'oo2.ORGANISATION_ID = aap.ORGANISATION_ID')   //会计期间表再关联组织表，查出法人名称
            ->where(['aap.ACCOUNTING_PERIOD_ID' => $id])
            ->groupBy('oo.ORGANISATION_ID')
            ->all();
    }

    //校验，是否有未审核单据
    public static function closeCheck($data)
    {
        foreach ($data as $item) {
            $unionOrder = self::getUnionOrderModel($item);
            if ($unionOrder->exists()) {
                return false;
            }
        }
        return true;
    }

    //多个表单合并
    public static function getUnionOrderModel($item, $model = null)
    {
        $period = ["第一期", "第二期", "第三期", "第四期", "第五期", "第六期", "第七期", "第八期", "第九期", "第十期", "第十一期", "第十二期"];
        $addSelect = ["('未审核') as ORDER_STATE", "('{$item['ORGANISATION_NAME_CN']}') as ORGANISATION_NAME_CN", "('{$period[$item['ACCOUNTING_PERIOD'] - 1]}') as ACCOUNTING_PERIOD"];
        $CLOSING = ['=', 'CLOSING_STATE', 0];
        $CREATED = ['between', 'CREATED_AT', $item['START_AT'], $item['END_AT']];
        $DELETED = ['<>', 'DELETED_STATE', 1];
        $orderBy = ['ORDER_CD' => SORT_ASC];

        //采购订单
        $purchase = (new Query())->from('pu_purchase')
            ->select(['PU_PURCHASE_CD as ORDER_CD', "('采购订单') as ORDER_TYPE"])
            ->addSelect($addSelect)
            ->where(['and', ['=', 'ORDER_STATE', 1], ['=', 'ORGANISATION_ID', $item['ORGANISATION_ID']]])
            ->andWhere(['and', $CLOSING, $CREATED, $DELETED])
            ->orderBy($orderBy);
        //销售订单
        $sales = (new Query())->from('cr_sales_order')
            ->select(['SALES_ORDER_CD as ORDER_CD', "('销售订单') as ORDER_TYPE"])
            ->addSelect($addSelect)
            ->where(['and', ['=', 'ORDER_STATE', 1], ['=', 'CRGANISATION_ID', $item['ORGANISATION_ID']]])
            ->andWhere(['and', $CLOSING, $CREATED])//cr_sales_order没有DELETED_STATE字段
            ->orderBy($orderBy);
        //采购入库单,内部采购入库单,其他入库单
        $storage = (new Query())->from('sk_storage')
            ->select(['STORAGE_CD as ORDER_CD', "('入库单') as ORDER_TYPE"])
            ->addSelect($addSelect)
            ->where(['and', ['=', 'ORDER_STATE', 1], ['=', 'ORGANISATION_ID', $item['ORGANISATION_ID']]])
            ->andWhere(['and', $CLOSING, $CREATED, $DELETED])
            ->orderBy($orderBy);
        //销售出库单，内部销售出库单，其他出库单
        $placing = (new Query())->from('sk_placing')
            ->select(['PLACING_CD as ORDER_CD', "('出库单') as ORDER_TYPE"])
            ->addSelect($addSelect)
            ->where(['and', ['=', 'PLAN_STATE', 1], ['=', 'PRGANISATION_ID', $item['ORGANISATION_ID']]])
            ->andWhere(['and', $CLOSING, $CREATED, $DELETED])
            ->orderBy($orderBy);
        //库存调整单
        $adjustment = (new Query())->from('sk_adjustment')
            ->select(['ADJUSTMENT_CD as ORDER_CD', "('库存调整单') as ORDER_TYPE"])
            ->addSelect($addSelect)
            ->where(['and', ['=', 'PLAN_STATE', 1], ['=', 'PRGANISATION_ID', $item['ORGANISATION_ID']]])
            ->andWhere(['and', $CLOSING, $CREATED, $DELETED])
            ->orderBy($orderBy);
        //调拨单
        $fiallocation = (new Query())->from('sk_fiallocation')
            ->select(['FIALLOCATION_CD as ORDER_CD', "('调拨单') as ORDER_TYPE"])
            ->addSelect($addSelect)
            ->where(['and', ['=', 'ALLOCATION_STATE', 1], ['=', 'ORGANISATION_ID', $item['ORGANISATION_ID']]])
            ->andWhere(['and', $CLOSING, $CREATED, $DELETED])
            ->orderBy($orderBy);

        //采购发票/销售发票/费用发票/付款单/收款单  （暂无，不管）

        //表单连起来
        if ($model == null) {
            $unionOrderModel = $purchase->union($sales)->union($storage)->union($placing)->union($adjustment)->union($fiallocation);
        } else {
            $unionOrderModel = $model->union($purchase)->union($sales)->union($storage)->union($placing)->union($adjustment)->union($fiallocation);
        }

        return $unionOrderModel;
    }

    //关账时，生成月均库存结余 和 历史库龄，以及更新表单会计期间状态
    public static function _closeAc($item)
    {
        $result1 = self::addHisInvAge($item);   //生成月均结余
        $result2 = self::addMonAveInvBal($item);    //生成历史库龄
        self::closeAcUpdateDB($item, 1); //更新各个表的会计期间状态
        return ($result1 && $result2);
    }

    //通过组织ID获取组织下的SKU
    public static function getSkuByOrg($organisation)
    {
        return (new Query())->from('g_product_sku')
            ->select(['PSKU_ID', 'PSKU_CODE'])
            ->where(['=', 'ORGAN_ID_DEMAND', $organisation])
            ->all();
    }

    //生成全月平均库存结余表单
    public static function addMonAveInvBal($item)
    {
        $mySku = self::getSkuByOrg($item['ORGANISATION_ID']); //组织下的sku
        $inNum = self::getInventoryNum($item, 1);   //本期入库数量
        $outNum = self::getInventoryNum($item, 0);   //本期出库数量
        $lastBal = self::getLastPeriodBal($item);   //上期结余

        //组成月结余表单数据
        $data = self::putData($item, $mySku, $inNum, $outNum, $lastBal);
        if ($data) {
            $result = CreateExt::actionDo(new AcMoinventoryBalance(), ['batch' => $data]);
            if ($result instanceof ResponeModel) {
                return false;
            }
        }
        return true;
    }

    //拼月均结余表单的数据
    public static function putData($item, $mySku, $inNumList, $outNumList, $lastBalList)
    {
        $data = array();
        foreach ($mySku as $v) {
            $tmp = array();
            //入库单
            $tmp = self::getNumByData($inNumList, $v['PSKU_ID'], $tmp, 'inNum');
            //出库单
            $tmp = self::getNumByData($outNumList, $v['PSKU_ID'], $tmp, 'outNum');
            //上期结余
            $tmp = self::getNumByData($lastBalList, $v['PSKU_ID'], $tmp, 'lastNum');
            foreach ($tmp as $warehouse => $value) {
                $initNum = isset($value['lastNum']) ? $value['lastNum'] : 0;    //初期数量
                $inNum = isset($value['inNum']) ? $value['inNum'] : 0;  //本期入库数量
                $outNum = isset($value['outNum']) ? $value['outNum'] : 0;  //本期出库数量
                $data[] = array(
                    'ACCOUNTING_PERIOD_ID' => $item['ACCOUNTING_PERIOD_ID'],
                    'ORGANISATION_ID' => $item['ORGANISATION_ID'],
                    'PSKU_ID' => $v['PSKU_ID'],
                    'PSKU_CODE' => $v['PSKU_CODE'],
                    'WAREHOUSE_ID' => $warehouse,
                    'START_AT' => $item['START_AT'],
                    'END_AT' => $item['END_AT'],
                    'INITIAL_QUANTITY' => $initNum, //初期数量
                    'CWAREHOUSING_QUANTITY' => $inNum,  //本期入库数量
                    'CBALANCE_NUMBER' => $initNum + $inNum + $outNum,   //本期结余数量(正常情况下$outNum为负数，所以是相加)
                    'DELETED_STATE' => 0,
                );
            }
        }
        return $data;
    }

    //从出/入库单/上期结余单中提取对应的数量
    public static function getNumByData($data, $skuID, $arr, $str)
    {
        if (isset($data[$skuID])) {
            foreach ($data[$skuID] as $warehouse => $num) {
                $arr[$warehouse][$str] = $num;
            }
        }
        return $arr;
    }

    //获取上一期结余
    public static function getLastPeriodBal($item)
    {
        $lastPeriod = self::getLastAcPeriod($item);
        if ($lastPeriod) {
            $monBal = AcMoinventoryBalance::find()->where(['ACCOUNTING_PERIOD_ID' => $lastPeriod['ACCOUNTING_PERIOD_ID'], 'DELETED_STATE' => 0])->asArray()->all();   //上一期的月结余
            $arr = array();
            foreach ($monBal as $v) {
                $arr[$v['PSKU_ID']][$v['WAREHOUSE_ID']] = $v['CBALANCE_NUMBER'];
            }
            return $arr;
        }
        return array();
    }

    //获取上一期的年度，期间
    public static function getLastAcPeriod($item)
    {
        if ($item['ACCOUNTING_PERIOD'] == 1) {
            $year = $item['YEARS'] - 1;
            $period = 12;
        } else {
            $year = $item['YEARS'];
            $period = $item['ACCOUNTING_PERIOD'] - 1;
        }

        $lastPeriod = AcAccountingPeriod::find()
            ->where(['ORGANISATION_ID' => $item['ORGANISATIONOT_ID'], 'YEARS' => $year, 'ACCOUNTING_PERIOD' => $period])
            ->andWhere(['<>', 'DELETED_STATE', 1])
            ->asArray()
            ->one();
        if($lastPeriod){
            $lastPeriod['ORGANISATIONOT_ID'] = $item['ORGANISATIONOT_ID'];
            $lastPeriod['ORGANISATION_ID'] = $item['ORGANISATION_ID'];
        }
        return $lastPeriod;
    }

    //获取本期出/入库数量 group by WAREHOUSE_ID，sku
    //$flag=1,入库数量 = （1入库单【正负】） + （3库存调整【正数】） + （4调拨-调出【正数】） + （5调拨-调入【正数】）
    //$flag=0,出库数量 = （2出库单【正负】） + （3库存调整【负数】） + （4调拨-调出【负数】） + （5调拨-调入【负数】）
    public static function getInventoryNum($item, $flag)
    {
        $whereORDER_AT = ["between", "ORDER_AT", $item['START_AT'], $item['END_AT']];
        $data = SkLibraryRecord::find()->select(['sum(NUMBERS) as NUMBERS', 'WAREHOUSE_ID', 'PSKU_ID'])
            ->where(['and', ['=', 'ORDER_TYPE', $flag ?: 2], $whereORDER_AT])
            ->orWhere(['and', ['in', 'ORDER_TYPE', [3, 4, 5]], [$flag ? ">" : "<", 'NUMBERS', 0], $whereORDER_AT])
            ->groupBy(['PSKU_ID', 'WAREHOUSE_ID'])
            ->asArray()
            ->all();
        //转成以sku、仓库编码为key的数组
        $arr = array();
        foreach ($data as $v) {
            $arr[$v['PSKU_ID']][$v['WAREHOUSE_ID']] = $v['NUMBERS'];
        }
        return $arr;
    }

    //生成历史库龄表单
    public static function addHisInvAge($item)
    {
        $data = libraryageLogic::getHisInvAgeList($item['ORGANISATION_ID'], $item['END_AT']);
        $arr = array();
        foreach ($data as $value) {
            foreach ($value as $v) {
                $arr[] = array(
                    'ACCOUNTING_PERIOD_ID' => $item['ACCOUNTING_PERIOD_ID'],
                    'ORGANISATION_ID' => $item['ORGANISATION_ID'],
                    'PSKU_ID' => $v['PSKU_ID'],
                    'PSKU_CODE' => $v['PSKU_CODE'],
                    'STORAGE_CD' => $v['ORDER_CD'],
                    'STORAGE_AT' => $v['ORDER_AT'],
                    'INVENTORY_AGE' => $v['AGE'],
                    'STOCK_NUMBER' => $v['NUMBERS'],
                    'END_AT' => $item['END_AT'],
                    'DELETED_STATE' => 0,
                );
            }
        }
        if ($arr) {
            $result = CreateExt::actionDo(new AcInventoryAge(), ['batch' => $arr]);
            if ($result instanceof ResponeModel) {
                return false;
            }
        }
        return true;
    }

    //关账(反关账)时更新表单会计期间状态；1关账，0反关账
    public static function closeAcUpdateDB($item, $flag)
    {
        //更新会计期间表
        AcAccountingPeriod::updateAll(['ACCOUNTING_STATE' => intval(!$flag)], ['ACCOUNTING_PERIOD_ID' => $item['ACCOUNTING_PERIOD_ID']]);
        //更新采购订单表
        PuPurchase::updateAll(['CLOSING_STATE' => $flag], ["and", ["=", "ORGANISATION_ID", $item['ORGANISATION_ID']], ["between", "CREATED_AT", $item['START_AT'], $item['END_AT']]]);
        //更新销售订单表
        CrSalesOrder::updateAll(['CLOSING_STATE' => $flag], ["and", ["=", 'CRGANISATION_ID', $item['ORGANISATION_ID']], ["between", "CREATED_AT", $item['START_AT'], $item['END_AT']]]);
        //更新采购入库表
        SkStorage::updateAll(['CLOSING_STATE' => $flag], ["and", ["=", 'ORGANISATION_ID', $item['ORGANISATION_ID']], ["between", "CREATED_AT", $item['START_AT'], $item['END_AT']]]);
        //更新销售出库表
        SkPlacing::updateAll(['CLOSING_STATE' => $flag], ["and", ["=", 'PRGANISATION_ID', $item['ORGANISATION_ID']], ["between", "CREATED_AT", $item['START_AT'], $item['END_AT']]]);
        //更新库存调整
        SkAdjustment::updateAll(['CLOSING_STATE' => $flag], ["and", ["=", 'PRGANISATION_ID', $item['ORGANISATION_ID']], ["between", "CREATED_AT", $item['START_AT'], $item['END_AT']]]);
        //更新调拨单
        SkFiallocation::updateAll(['CLOSING_STATE' => $flag], ["and", ["=", 'ORGANISATION_ID', $item['ORGANISATION_ID']], ["between", "CREATED_AT", $item['START_AT'], $item['END_AT']]]);
    }

    //反关账，删除关账时生成的表，更新关账状态
    public static function _reCloseAc($item)
    {
        $lastPeriod = self::getLastAcPeriod($item);   //上一期记录
        if (!$lastPeriod) {
            return Yii::t('finance', 'The current account period is the minimum account period, can not be turned off!');
        }
        $result = self::checkTime($lastPeriod);   //校验会计期间是否早于组织启用日期
        if (!$result) {
            return Yii::t('finance', 'The accounting period date sooner than the organization start using date,can not be turned off!');
        }
        //根据上一期记录，删除或更新
        $where = ['=', 'ACCOUNTING_PERIOD_ID', $lastPeriod['ACCOUNTING_PERIOD_ID']];
        AcInventoryAge::updateAll(['DELETED_STATE' => 1], $where);   //逻辑删除月均结余
        AcMoinventoryBalance::updateAll(['DELETED_STATE' => 1], $where);    //逻辑删除历史库龄
        self::closeAcUpdateDB($lastPeriod, 0); //更新各个表的会计期间状态
        return '';
    }

    //会计期间与组织启用日期对比
    public static function checkTime($item)
    {
        $where = ['INIT_STATE' => 1, 'ORGANISATION_ID' => $item['ORGANISATION_ID']];
        $org = Yii::$app->rpc->create('organization')->send([['\addons\organization\modellogic\organizLogic', 'GetORGANISATIONIEN'], [[], $where]])->recv();
        if (count($org) == 1) {
            $orgStartTime = strtotime(date('Y-m-1 0:0:0', $org[0]['STARTUP_TIME']));    //组织启用的当前月1号0点整的时间戳
            return ($item['END_AT'] > $orgStartTime);
        }
        return false;
    }

}