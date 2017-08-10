<?php
namespace addons\purchase\modellogic;
use Yii;
use yii\swoole\modellogic\BaseLogic;
use yii\swoole\db\Query;
use addons\purchase\models\PuPurchase;
use addons\purchase\models\PuPurchaseDetail;
use addons\shipment\models\ShDispatchNote;
use addons\purchase\models\PuQctables;
use yii\swoole\rest\ResponeModel;
use yii\swoole\rest\UpdateExt;
use yii\web\ServerErrorHttpException;
use yii\db\Expression;
class ptrackLogic extends BaseLogic
{
    public static $modelClass = 'addons\purchase\models\PuPurchase';

    // 审核
    public static function ptAudit($post)
    {
        $cd = [];
        foreach ($post['batchMTC'] as $_post) {
            $p = PuPurchase::find()->where(['PU_PURCHASE_CD'=>$_post['PU_PURCHASE_CD'],'DELETED_STATE'=>0])->asArray()->one();
            if(!$p){
                throw new ServerErrorHttpException(Yii::t('purchase', 'The document has been lost and cannot be operated on!'));
            }
            //订单状态
            if($p['ORDER_STATE'] != 1){
                throw new ServerErrorHttpException(Yii::t('purchase', 'The current document has been audited and cannot be operated on!'));
            }
            $cd[] = $_post['PU_PURCHASE_CD'];
        }
        $user = Yii::$app->getUser();
        $userC = $user && !$user->isGuest ? $user->getIdentity()->USER_INFO_ID : 0;
        $data = ['condition'=>['where'=>['PU_PURCHASE_CD'=>$cd]],'edit'=>['ORDER_STATE'=>2,'AUTITO_ID'=>$userC,'AUTITO_AT'=>time()]];
        $flag = UpdateExt::actionDo(new PuPurchase(), $data);
        if($flag instanceof ResponeModel){
            return $flag;
        }
        $result = UpdateExt::actionDo(new PuPurchaseDetail(), $post);
        if($result instanceof ResponeModel){
            return $result;
        }
    }

    // 反审核
    public static function ptReAudit($post)
    {
        //先排查
        foreach ($post as $v) {
            $p = PuPurchase::find()->where(['PU_PURCHASE_CD'=>$v,'DELETED_STATE'=>0])->asArray()->one();
            if(!$p){
                throw new ServerErrorHttpException(Yii::t('purchase', 'The document has been lost and cannot be operated on!'));
            }
            //订单状态
            if($p['ORDER_STATE'] != 2){
                throw new ServerErrorHttpException(Yii::t('purchase', 'This operation cannot be performed because the current document is not audited!'));
            }
            $pDetail = PuPurchaseDetail::find()->select(['PURCHASE_DETAIL_ID','PSKU_ID'])->where(['PU_PURCHASE_CD'=>$v])->asArray()->all();
            if(empty($pDetail)){
                throw new ServerErrorHttpException(Yii::t('purchase', 'The document has been lost and cannot be operated on!'));
            }
            $pdId = [];
            $pdSkuId = [];
            foreach ($pDetail as $item) {
                $pdId[] = $item['PURCHASE_DETAIL_ID'];
                $pdSkuId[] = $item['PSKU_ID'];
            }
            //已经入库
            $s = (new Query())->from('sk_storage_detail sd')
                ->leftJoin('sk_storage s',"sd.STORAGE_ID = s.STORAGE_ID")
                ->where(['sd.PURCHASE_DETAIL_ID' => $pdId,'sd.PSKU_ID' => $pdSkuId,'s.DELETED_STATE'=>0,'s.ORDER_STATE'=>2])
                ->count(0);
            if ($s > 0) {
                throw new ServerErrorHttpException(Yii::t('purchase', 'This document has been used by other documents and cannot be performed this operation!'));
            }
            //已生成发运单
            $pdn = (new Query())->from('sh_dispatch_note')->where(['PU_ORDER_ID' => $pdId,'PSKU_ID' => $pdSkuId,'IMPORT_STATE'=>1,'DELETED_STATE'=>0 ])->count(0);
            if ($pdn > 0) {
                throw new ServerErrorHttpException(Yii::t('purchase', 'This document has been used by other documents and cannot be performed this operation!'));
            }
            //已申请付款
            $isPay = (new Query())->from('pu_payment_detail yd')
                ->leftJoin('pu_payment y',"yd.PAYMENT_CD = y.PAYMENT_CD")
                ->where(['yd.PURCHASE_DETAIL_ID' => $pdId,'y.DELETED_STATE'=>0])
                ->count(0);
            if ($isPay > 0) {
                throw new ServerErrorHttpException(Yii::t('purchase', 'This document has been used by other documents and cannot be performed this operation!'));
            }
            //品检排程已审核
            $pq = PuQctables::find()->where(['PURCHASE_DETAIL_ID' => $pdId, 'PSKU_ID' => $pdSkuId,'AUDIT_STATE' => 2])->count(0);
            if ($pq > 0) {
                throw new ServerErrorHttpException(Yii::t('purchase', 'This document has been used by other documents and cannot be performed this operation!'));
            }
        }
        //验证通过
        $user = Yii::$app->getUser();
        $userC = $user && !$user->isGuest ? $user->getIdentity()->USER_INFO_ID : 0;
        array_walk($post,function (&$v) use ($userC){
            $pDetail = PuPurchaseDetail::find()->select(['PURCHASE_DETAIL_ID','PSKU_ID'])->where(['PU_PURCHASE_CD'=>$v])->asArray()->all();
            $pdId = [];
            $pdSkuId = [];
            foreach ($pDetail as $item) {
                $pdId[] = $item['PURCHASE_DETAIL_ID'];
                $pdSkuId[] = $item['PSKU_ID'];
            }
            //已经入库且未审核
            $s = (new Query())->from('sk_storage_detail sd')
                ->select(['sd.STORAGE_ID'])
                ->leftJoin('sk_storage s',"sd.STORAGE_ID = s.STORAGE_ID")
                ->where(['sd.PURCHASE_DETAIL_ID' => $pdId,'sd.PSKU_ID' => $pdSkuId,'s.DELETED_STATE'=>0,'s.ORDER_STATE'=>1])
                ->scalar();
            //采购入库单 主表修改删除状态 子表删除表
            if ($s) {
                Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\storageLogic', 'setStorageOper'], [['STORAGE_ID' => $s, 'DELETED_STATE' => '1']]]);
            }
            //品检排程
            $pqIds = PuQctables::find()
                ->select('QCTABLES_ID,PURCHASE_DETAIL_ID,TCHEDULING_NUMBER')
                ->where(['PURCHASE_DETAIL_ID' => $pdId, 'PSKU_ID' => $pdSkuId,'DELETED_STATE'=>0,'AUDIT_STATE' => 1])
                ->all();
            foreach($pqIds as $item){
                $_flag = PuQctables::updateAll(['DELETED_STATE' => 1], ['QCTABLES_ID' => $item['QCTABLES_ID']]);
                //回写明细
                $pd = PuPurchaseDetail::find()->where(['PURCHASE_DETAIL_ID'=>$item['PURCHASE_DETAIL_ID']])->one();
                if(!empty($pd)){
                    $sch_num = $pd->SCHEDULING_NUMBER?$pd->SCHEDULING_NUMBER:0;//已排程数量
                    $tch_num = $item['TCHEDULING_NUMBER']?$item['TCHEDULING_NUMBER']:0;//本次排程数量
                    $pd->SCHEDULING_NUMBER = $sch_num - $tch_num;//将已排程数量重置
                    $_flag&&$pd->save();
                }
            }
            //更新反审核时间、反审核人、状态
            PuPurchase::updateAll(['ORDER_STATE' => 1,'AUTITO_ID'=>$userC,'AUTITO_AT'=>time()], ['PU_PURCHASE_CD' => $v]);
        });
    }

    //加入排程
    public static function upPuQ($post)
    {
        foreach ($post as $v) {
            $pd_t = PuPurchaseDetail::find()->where(['PURCHASE_DETAIL_ID' => $v['PURCHASE_DETAIL_ID']]);
            $pd_rw = clone $pd_t ;
            $pd = $pd_t->asArray()->one();
            $request = [];
            $request['PU_ORDER_CD'] = $pd['PU_PURCHASE_CD'];
            $request['PSKU_ID'] = $pd['PSKU_ID'];
            $request['PSKU_CODE'] = $pd['PSKU_CODE'];
            $request['PURCHASE_DETAIL_ID'] = $pd['PURCHASE_DETAIL_ID'];
            $request['PSKU_NAME_CN'] = $pd['PSKU_NAME_CN'];
            $request['TCHEDULING_NUMBER'] = isset($v['TCHEDULING_NUMBER'])?$v['TCHEDULING_NUMBER']:0;
            $request['DELIVERY_AT'] = $pd['COMMI_PERIOD'];
            $request['EACH_BOX_NUMBER'] = $pd['EACH_NUMBER'];
            $request['FCL_NUMBER'] = $pd['FCL_NUMBER'];
            $request['FCL_LONG'] = $pd['FCL_LONG'];
            $request['FCL_WIDE'] = $pd['FCL_WIDE'];
            $request['FCL_HIGH'] = $pd['FCL_HIGH'];
            $request['FCL_NET_WEIGHT'] = $pd['FCL_NET_WEIGHT'];
            $request['FCL_GROSS_WEIGHT'] = $pd['GROSS_WEIGHT'];
            $request['TAILBOX_NUMBER'] = $pd['TAILBOX_NUMBER'];
            $request['TAILBOX_BNUMBER'] = $pd['TAILBOX_BNUMBER'];
            $request['TAILBOX_LONG'] = $pd['TAILBOX_LONG'];
            $request['TAILBOX_WIDE'] = $pd['TAILBOX_WIDE'];
            $request['TAILBOX_HIGH'] = $pd['TAILBOX_HIGH'];
            $request['TAILBOX_WEIGHT'] = $pd['TAILBOX_WEIGHT'];
            $request['TAILBOX_NETWEIGHT'] = $pd['TAILBOX_NETWEIGHT'];
            $request['AUDIT_STATE'] = 1;//初始未审核
            $request['DELETED_STATE'] = 0;
            $request['INSPECTION_STATE'] = 3;//初始未验货
            //加入排程
            $pq = new PuQctables();
            $pq->setAttributes($request);
            $flag = $pq->save();
            //回写已排程数量
            $pdr = $pd_rw->one();
            $pdr->SCHEDULING_NUMBER = ($pd['SCHEDULING_NUMBER']?$pd['SCHEDULING_NUMBER']:0)+(isset($v['TCHEDULING_NUMBER'])?$v['TCHEDULING_NUMBER']:0);
            $flag&&$pdr->save();
        }
    }

    //导出
    public static function exportPt($post)
    {
        $searchPayment = array_key_exists('searchPayment', $post)&&$post['searchPayment'] ? $post['searchPayment'] : 0;
        $payStatus = $searchPayment==2?"=":($searchPayment==1?">":0);
        $searchInspection = array_key_exists('searchInspection', $post)&&$post['searchInspection'] ? $post['searchInspection'] : 0;
        $inspection= $searchInspection==2?"=":($searchInspection==1?">":0);
        $searchReceipt = array_key_exists('searchReceipt', $post)&&$post['searchReceipt'] ? $post['searchReceipt'] : 0;
        $receipt = $searchReceipt==2?"=":($searchReceipt==1?">":0);
        $from = array_key_exists('timeFrom', $post)&&$post['timeFrom']?$post['timeFrom']:strtotime('-90 days');
        $to = array_key_exists('timeTo', $post)&&$post['timeTo']?$post['timeTo']:time();

        $fields = 'pd.PURCHASE_DETAIL_ID,pd.PU_PURCHASE_CD,p.PRE_ORDER_AT,p.PARTNER_ID,p.CHANNEL_ID,p.ORGANISATION_ID,p.DORGANISATION_ID,p.MONEY_ID,p.ORDER_STATE';
        $fields .= ',';
        $fields .= 'pd.PSKU_CODE,pd.PSKU_NAME_CN,pd.PURCHASE,pd.TAX_UNITPRICE,pd.TAX_AMOUNT,IFNULL(pd.THIS_APPLY_AMOUNT,0),pd.TAX_AMOUNT-IFNULL(pd.THIS_APPLY_AMOUNT,0)';
        $fields .= ',';
        $fields .= "pd.FNSKU,pd.PLATFORM_SKU,pd.ACCOUNT_ID,IFNULL(pd.RGOODS_NUMBER,0),pd.PURCHASE-IFNULL(pd.RGOODS_NUMBER,0),pd.COMMI_PERIOD";
        $fields .= ',';
        $fields .= 'pd.INSPECTION_STATE,IFNULL(pd.INSPECTION_NUMBER,0),IFNULL(pd.SCHEDULING_NUMBER,0),pd.PURCHASE-IFNULL(pd.INSPECTION_NUMBER,0)-IFNULL(pd.SCHEDULING_NUMBER,0)';
        $fields .= ',';
        $fields .= 'p.FUPUSER_ID,pd.UNIT_ID,pd.FCL_NUMBER,pd.EACH_NUMBER,pd.FCL_LONG,pd.FCL_WIDE,pd.FCL_HIGH,pd.GROSS_WEIGHT,pd.FCL_NET_WEIGHT';
        $fields .= ',';
        $fields .= 'pd.TAILBOX_BNUMBER,pd.TAILBOX_NUMBER,pd.TAILBOX_LONG,pd.TAILBOX_WIDE,pd.TAILBOX_HIGH,pd.TAILBOX_WEIGHT,pd.TAILBOX_NETWEIGHT';
        $details = (new Query())->from('pu_purchase_detail pd')->select(new Expression($fields))
            ->leftJoin('pu_purchase p','pd.PU_PURCHASE_CD = p.PU_PURCHASE_CD')
            ->andWhere(["=", "p.DELETED_STATE", 0])
            ->andWhere(["=", "p.ORDER_TYPE", 1])
            ->andWhere(['between','p.PRE_ORDER_AT',$from, $to]);
        if($payStatus){
            $details->andWhere([$payStatus, "(pd.TAX_AMOUNT  - pd.THIS_APPLY_AMOUNT)", 0]);
        }
        if($inspection){
            $details->andWhere([$inspection, "(pd.PURCHASE - pd.INSPECTION_NUMBER- pd.SCHEDULING_NUMBER)", 0]);
        }
        if($receipt){
            $details->andWhere([$receipt, "(pd.PURCHASE - pd.RGOODS_NUMBER)", 0]);
        }
        PuPurchase::addQuery($details,'p');

        $details = $details->all();

        $firstLine = ['采购订单明细ID',
                      '采购订单号',
                      '下单时间',
                      '供应商',
                      '平台',
                      '采购组织',
                      '需求组织',
                      '币种',
                      '单据状态',
                      'SKU',
                      '产品名称',
                      '数量',
                      '单价',
                      '总额',
                      '已申付金额',
                      '未申付金额',
                      '产品条码',
                      '平台SKU',
                      '账号',
                      '已收货数量',
                      '未收货数量',
                      '交货日期',
                      '验货状态',
                      '已验货数量',
                      '已排程数量',
                      '未验货数量',
                      '采购跟进人',
                      '单位',
                      '整箱数',
                      '每箱箱数',
                      '整箱-长(CM)',
                      '整箱-宽(CM)',
                      '整箱-高(CM)',
                      '整箱-毛重(KG)',
                      '整箱-净重(KG)',
                      '尾箱每箱数量',
                      '尾箱数',
                      '尾箱-长(CM)',
                      '尾箱-宽(CM)',
                      '尾箱-高(CM)',
                      '尾箱-毛重(KG)',
                      '尾箱-净重(KG)'];
        if(empty($details)){
            self::exportExcel($details,'采购跟踪列表-' . date("Y-m-j"),'采购跟踪列表',$firstLine);
        }

        //采购组织编码 需求组织编码
        $organisations = Yii::$app->rpc->create('organization')->send([['\addons\organization\modellogic\organizLogic', 'GetORGANISATION'], [['ORGANISATION_ID', 'ORGANISATION_NAME_CN']]])->recv();

        //供应商编码
        $partners = Yii::$app->rpc->create('partint')->send([['\addons\master\partint\modellogic\partintLogic', 'getpartner'], [['PARTNER_ID', 'PARTNER_NAME_CN']]])->recv();

        //平台编码
        $channels = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\basicsLogic', 'getchannel'], [['CHANNEL_ID', 'CHANNEL_NAME_CN']]])->recv();

        //币种编码
        $moneys = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\basicsLogic', 'getmoney'], [['MONEY_ID', 'MONEY_NAME_CN']]])->recv();

        //账号
        $accounts = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\basicsLogic', 'getaccount'], [['ACCOUNT_ID', 'ACCOUNT']]])->recv();

        //采购跟进人编码
        $userId = Yii::$app->rpc->create('users')->send([['\addons\users\modellogic\usersLogic', 'getuser_info'], [['USER_INFO_ID', 'STAFF_ID']]])->recv();
        $userName = Yii::$app->rpc->create('users')->send([['\addons\users\modellogic\staffinfologic', 'getStaffInfo'], [['STAFF_ID', 'STAFF_NAME_CN'], []]])->recv();

        //订单状态PU_PURCHASE
        $statuses = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\baseLogic', 'getdictionary'], [['D_NAME_CN', 'D_GROUP', 'D_VALUE'], ['INSPECTION_STATE', 'PU_PURCHASE']]])->recv();

        //单位编码
        $units = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\basicsLogic', 'getunit'], [['UNIT_ID', 'UNIT_NAME_CN']]])->recv();

        array_walk($details,function (&$v,$k,$paras){
            $v['PRE_ORDER_AT'] = $v['PRE_ORDER_AT']?date('Y-m-d',$v['PRE_ORDER_AT']):'';
            $v['COMMI_PERIOD'] = $v['COMMI_PERIOD']?date('Y-m-d',$v['COMMI_PERIOD']):'';
            $v['PARTNER_ID'] = self::getCnByCode($paras['p'],$v['PARTNER_ID'],'PARTNER_ID','PARTNER_NAME_CN');
            $v['CHANNEL_ID'] = self::getCnByCode($paras['c'],$v['CHANNEL_ID'],'CHANNEL_ID','CHANNEL_NAME_CN');
            $v['ORGANISATION_ID'] = self::getCnByCode($paras['o'],$v['ORGANISATION_ID'],'ORGANISATION_ID','ORGANISATION_NAME_CN');
            $v['DORGANISATION_ID'] = self::getCnByCode($paras['o'],$v['DORGANISATION_ID'],'ORGANISATION_ID','ORGANISATION_NAME_CN');
            $v['MONEY_ID'] = self::getCnByCode($paras['m'],$v['MONEY_ID'],'MONEY_ID','MONEY_NAME_CN');
            $v['ORDER_STATE'] = self::getCnByCode($paras['s'],['PU_PURCHASE', $v['ORDER_STATE']], ['D_GROUP', 'D_VALUE'], 'D_NAME_CN');
            $v['INSPECTION_STATE'] = self::getCnByCode($paras['s'],['INSPECTION_STATE', $v['INSPECTION_STATE']], ['D_GROUP', 'D_VALUE'], 'D_NAME_CN');
            $v['ACCOUNT_ID'] = self::getCnByCode($paras['a'],$v['ACCOUNT_ID'],'ACCOUNT_ID','ACCOUNT');
            $fupUserId = self::getCnByCode($paras['uid'],$v['FUPUSER_ID'],'USER_INFO_ID','STAFF_ID');
            $v['FUPUSER_CODE'] = self::getCnByCode($paras['una'],$fupUserId,'STAFF_ID','STAFF_NAME_CN');
            $v['UNIT_ID'] = self::getCnByCode($paras['un'],$v['UNIT_ID'],'UNIT_ID','UNIT_NAME_CN');
        },['s'=>$statuses,'o'=>$organisations,'p'=>$partners,'uid'=>$userId,'una'=>$userName,'c'=>$channels,'m'=>$moneys,'a'=>$accounts,'un'=>$units]);

        self::exportExcel($details,'采购跟踪列表-' . date("Y-m-j"),'采购跟踪列表',$firstLine);
    }

    //导出Excel表格
    public static function exportExcel($data,$excelFileName,$sheetTitle,$firstLine=null){
        /* 实例化类 */
        $objPHPExcel = new \PHPExcel();
        $objPHPExcel->getProperties()
            ->setCreator("1ByOne")
            ->setLastModifiedBy("1ByOne")
            ->setTitle("Office 2003 XLSX Test Document")
            ->setSubject("Office 2003 XLSX Test Document")
            ->setDescription("Test document for Office 2003 XLSX, generated using PHP classes.")
            ->setKeywords("office 2003 openxml php")
            ->setCategory("Test result file");

        /* 设置当前的sheet */
        $objActSheet = $objPHPExcel->setActiveSheetIndex(0);
        if($firstLine){
            $r = 'A';
            foreach($firstLine as $v){
                $objActSheet->setCellValue($r.'1',$v);
                $r++;
            }
        }

        $i = 2;
        foreach($data as $value)
        {
            /* excel文件内容 */
            $j = 'A';
            foreach($value as $value2)
            {
                $objActSheet->setCellValue($j.$i,$value2);
                $j++;
            }
            $i++;
        }

        /* sheet标题 */
        $objPHPExcel->getActiveSheet()->setTitle($sheetTitle);
        $objPHPExcel->setActiveSheetIndex(0);

        if (ob_get_contents()) ob_end_clean();
        header("Content-Type: application/vnd.ms-excel; charset=utf-8");
        header('Content-Disposition: attachment;filename='.$excelFileName.'.xls');
        header('Cache-Control: max-age=0');
        $objWriter = \PHPExcel_IOFactory::createWriter($objPHPExcel,'Excel5');
        $objWriter->save('php://output');
        exit;
    }

    //导入excel内容转换成数组
    public function importExcel($filePath){
        /**默认用excel2007读取excel，若格式不对，则用之前的版本进行读取*/
        $PHPReader = new \PHPExcel_Reader_Excel2007();
        if(!$PHPReader->canRead($filePath)){
            $PHPReader = new \PHPExcel_Reader_Excel5();
            if(!$PHPReader->canRead($filePath)){
                echo 'no Excel';
                return;
            }
        }

        $PHPExcel = $PHPReader->load($filePath);
        $currentSheet = $PHPExcel->getSheet(0);  //读取excel文件中的第一个工作表
        $allColumn = $currentSheet->getHighestColumn(); //取得最大的列号
        $allRow = $currentSheet->getHighestRow(); //取得一共有多少行
        $data = array();  //声明数组

        /**从第二行开始输出，因为excel表中第一行为列名*/
        for($currentRow = 1;$currentRow <= $allRow;$currentRow++){
            /**从第A列开始输出*/
            for($currentColumn= 'A';$currentColumn<= $allColumn; $currentColumn++){
                $val = $currentSheet->getCellByColumnAndRow(ord($currentColumn) - 65,$currentRow)->getValue();/**ord()将字符转为十进制数*/
                if($val!=''){
                    $data[] = $val;
                }

            }
        }
        return $data;
    }

    public static function getCnByCode($model, $code, $model_where, $name)
    {
        if (count($model) > 0) {
            foreach ($model as $value) {
                if (count($code) > 1 && count($model_where) > 1) {
                    if ($value[$model_where[0]] == $code[0] && $value[$model_where[1]] == $code[1]) {
                        return $value[$name];
                    }
                } else {
                    if ($value[$model_where] == $code) {
                        return $value[$name];
                    }
                }
            }
        } else {
            return "";
        }
    }
}