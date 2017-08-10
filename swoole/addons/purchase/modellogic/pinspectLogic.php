<?php
namespace addons\purchase\modellogic;
use addons\master\product\models\GProductSkuPacking;
use addons\purchase\models\PuPurchase;
use addons\purchase\models\PuPurchaseDetail;
use Yii;
use yii\swoole\db\Query;
use yii\swoole\modellogic\BaseLogic;
use addons\purchase\models\PuQctables;
use yii\swoole\rest\ResponeModel;
use yii\web\ServerErrorHttpException;
class pinspectLogic extends BaseLogic
{
    public static $modelClass = 'addons\purchase\models\PuQctables';
    // 审核
    public static function piAudit($post)
    {
        foreach ($post['batchMTC'] as $p) {
            //审核状态
            if ($p['AUDIT_STATE'] != 1) {
                throw new ServerErrorHttpException(Yii::t('purchase', 'The current document has been audited and cannot be operated on!'));
//                throw new ServerErrorHttpException(Yii::t('purchase', '含已审核单据，不能审核！'));
            }
            if(empty($p['INSPECTION_AT'])||empty($p['INSPECTION_ID'])||empty($p['INSPECTION_STATE'])||$p['INSPECTION_STATE']==3){
                throw new ServerErrorHttpException(Yii::t('purchase', 'This operation cannot be performed without the inspection of the document!'));
//                throw new ServerErrorHttpException(Yii::t('purchase', '含未完成验货的记录，不能审核！'));
            }
            $pd = PuPurchaseDetail::find()->where(['PURCHASE_DETAIL_ID'=>$p['PURCHASE_DETAIL_ID']])->one();
            if(!$pd){
                throw new ServerErrorHttpException(Yii::t('purchase', 'The document has been lost and cannot be operated on!'));
//                throw new ServerErrorHttpException(Yii::t('purchase', '单据明细数据已丢失，不能审核！'));
            }
        }
        $result = self::Update($post);
        if ($result instanceof ResponeModel) {
            return $result;
        }
        array_walk($post['batchMTC'],function(&$v){
            $p_t = PuQctables::find()->where(['QCTABLES_ID'=>$v['QCTABLES_ID'],'DELETED_STATE'=>0]);
            $pt_rw =  clone $p_t;
            $p = $p_t->asArray()->one();
            //修改状态
            $pt = $pt_rw->one();
            $pt->AUDIT_STATE = 2;
            $flag = $pt->save();
            $pd = PuPurchaseDetail::find()->where(['PURCHASE_DETAIL_ID'=>$p['PURCHASE_DETAIL_ID']])->one();
            if(($p['INSPECTION_STATE'] == 1||$p['INSPECTION_STATE'] == 2)&&$p['TCHEDULING_NUMBER'] > 0){//验货通过/返工且本次排程数量大于0即回写数据
                //更新明细验货数据
                $sch_num = $pd->SCHEDULING_NUMBER?$pd->SCHEDULING_NUMBER:0;//已排程数量
                $ins_num = $pd->INSPECTION_NUMBER?$pd->INSPECTION_NUMBER:0;//已验数量
                $tch_num = $p['TCHEDULING_NUMBER']?$p['TCHEDULING_NUMBER']:0;//本次排程数量
                if($p['INSPECTION_STATE'] == 1){
                    //更新sku主数据
                    if(GProductSkuPacking::find()->where(['PSKU_ID'=>$p['PSKU_ID']])->exists()){
                        $gs = GProductSkuPacking::find()->where(['PSKU_ID'=>$p['PSKU_ID']])->one();
                        $gs->PACKING_NUMBER = $p['EACH_BOX_NUMBER'];
                        $gs->PACKING_LONG = $p['FCL_LONG'];
                        $gs->PACKING_WIDE = $p['FCL_WIDE'];
                        $gs->PACKING_HIGH = $p['FCL_HIGH'];
                        $gs->GROSS_WEIGHT = $p['FCL_GROSS_WEIGHT'];
                        $gs->NET_WEIGHT = $p['FCL_NET_WEIGHT'];
                    }else{
                        $req = [];
                        $req['PSKU_ID'] = $p['PSKU_ID'];
                        $req['PSKU_CODE'] = $p['PSKU_CODE'];
                        $req['PACKING_NUMBER'] = $p['EACH_BOX_NUMBER'];
                        $req['PACKING_LONG'] = $p['FCL_LONG'];
                        $req['PACKING_WIDE'] = $p['FCL_WIDE'];
                        $req['PACKING_HIGH'] = $p['FCL_HIGH'];
                        $req['GROSS_WEIGHT'] = $p['FCL_GROSS_WEIGHT'];
                        $req['NET_WEIGHT'] = $p['FCL_NET_WEIGHT'];
                        $gs = new GProductSkuPacking();
                        $gs->setAttributes($req);
                    }
                    $flag&&$gs->save();
                    //更新明细装箱和尾箱资料
                    $pd->EACH_NUMBER = $p['EACH_BOX_NUMBER'];
                    $pd->FCL_NUMBER = $p['FCL_NUMBER'];
                    $pd->FCL_LONG = $p['FCL_LONG'];
                    $pd->FCL_WIDE = $p['FCL_WIDE'];
                    $pd->FCL_HIGH = $p['FCL_HIGH'];
                    $pd->GROSS_WEIGHT = $p['FCL_GROSS_WEIGHT'];
                    $pd->FCL_NET_WEIGHT = $p['FCL_NET_WEIGHT'];
                    $pd->TAILBOX_NUMBER = $p['TAILBOX_NUMBER'];
                    $pd->TAILBOX_BNUMBER = $p['TAILBOX_BNUMBER'];
                    $pd->TAILBOX_LONG = $p['TAILBOX_LONG'];
                    $pd->TAILBOX_WIDE = $p['TAILBOX_WIDE'];
                    $pd->TAILBOX_HIGH = $p['TAILBOX_HIGH'];
                    $pd->TAILBOX_WEIGHT = $p['TAILBOX_WEIGHT'];
                    $pd->TAILBOX_NETWEIGHT = $p['TAILBOX_NETWEIGHT'];
                    $pd->INSPECTION_NUMBER = $ins_num + $tch_num;//更新已验货数量
                }
                $pd->SCHEDULING_NUMBER = $sch_num - $tch_num;//将已排程数量重置
            }
            $pd->INSPECTION_STATE = $p['INSPECTION_STATE'];//验货状态
            $flag&&$pd->save();
        });
    }

    // 反审核
    public static function piReAudit($post)
    {
        foreach ($post as $v) {
            $p = PuQctables::find()->where(['QCTABLES_ID'=>$v,'DELETED_STATE'=>0])->asArray()->one();
            if(!$p){
                throw new ServerErrorHttpException(Yii::t('purchase', 'The document has been lost and cannot be operated on!'));
//                throw new ServerErrorHttpException(Yii::t('purchase', '单据'.$v.'已丢失，不能反审核！'));
            }
            //审核状态
            if($p['AUDIT_STATE'] != 2){
                throw new ServerErrorHttpException(Yii::t('purchase', 'This operation cannot be performed because the current document is not audited!'));
//                throw new ServerErrorHttpException(Yii::t('purchase', '含未审核记录，不能反审核！'));
            }
            if(empty($p['INSPECTION_AT'])||empty($p['INSPECTION_ID'])||empty($p['INSPECTION_STATE'])){
                throw new ServerErrorHttpException(Yii::t('purchase', 'This operation cannot be performed without the inspection of the document!'));
//                throw new ServerErrorHttpException(Yii::t('purchase', '含未完成验货的记录，不能反审核！'));
            }
            $pd = PuPurchaseDetail::find()->where(['PURCHASE_DETAIL_ID'=>$p['PURCHASE_DETAIL_ID']])->one();
            if(!$pd){
                throw new ServerErrorHttpException(Yii::t('purchase', 'The document has been lost and cannot be operated on!'));
//                throw new ServerErrorHttpException(Yii::t('purchase', '单据明细数据已丢失，不能反审核！'));
            }
        }
        array_walk($post,function(&$v){
            $p_t = PuQctables::find()->where(['QCTABLES_ID'=>$v,'DELETED_STATE'=>0]);
            $pt_rw =  clone $p_t;
            $p = $p_t->asArray()->one();
            //修改状态
            $pt = $pt_rw->one();
            $pt->AUDIT_STATE = 1;
            $flag = $pt->save();
            $pd = PuPurchaseDetail::find()->where(['PURCHASE_DETAIL_ID'=>$p['PURCHASE_DETAIL_ID']])->one();
            if(( $p['INSPECTION_STATE'] == 1||$p['INSPECTION_STATE'] == 2)&&$p['TCHEDULING_NUMBER'] > 0){//验货通过/返工且本次排程数量大于0即回写数据
                $sch_num = $pd->SCHEDULING_NUMBER?$pd->SCHEDULING_NUMBER:0;//已排程数量
                $ins_num = $pd->INSPECTION_NUMBER?$pd->INSPECTION_NUMBER:0;//已验数量
                $tch_num = $p['TCHEDULING_NUMBER'];//本次排程数量
                if($p['INSPECTION_STATE'] == 1){
                    $pd->INSPECTION_NUMBER = $ins_num - $tch_num;//更新已验货数量
                }
                $pd->SCHEDULING_NUMBER = $sch_num + $tch_num;//将已排程数量重置
            }
            $pd->INSPECTION_STATE = $p['INSPECTION_STATE'];//验货状态
            $flag&&$pd->save();
        });
    }

    //删除排程
    public static function piDel($post){
        foreach ($post as $v) {
            $pq = PuQctables::find()->where(['QCTABLES_ID'=>$v,'DELETED_STATE'=>0])->asArray()->one();
            if(!$pq){
                throw new ServerErrorHttpException(Yii::t('purchase', 'The document has been lost and cannot be operated on!'));
//                throw new ServerErrorHttpException(Yii::t('purchase', '单据'.$v.'已丢失，无法进行删除操作！'));
            }
            //审核状态
            if($pq['AUDIT_STATE'] == 2){
                throw new ServerErrorHttpException(Yii::t('purchase', 'The current document has been audited and cannot be operated on!'));
//                throw new ServerErrorHttpException(Yii::t('purchase', '含已审核单据，不能删除！'));
            }
        }
        array_walk($post,function(&$v){
            $pq_t = PuQctables::find()->where(['QCTABLES_ID'=>$v,'DELETED_STATE'=>0]);
            $pq_r = clone $pq_t;
            $pq = $pq_t->asArray()->one();
            //修改状态
            $pqr = $pq_r->one();
            $pqr->DELETED_STATE = 1;
            $flag = $pqr->save();
            //回写明细
            $pd = PuPurchaseDetail::find()->where(['PURCHASE_DETAIL_ID'=>$pq['PURCHASE_DETAIL_ID']])->one();
            if(!empty($pd)){
                $sch_num = $pd->SCHEDULING_NUMBER?$pd->SCHEDULING_NUMBER:0;//已排程数量
                $tch_num = $pq['TCHEDULING_NUMBER']?$pq['TCHEDULING_NUMBER']:0;//本次排程数量
                $pd->SCHEDULING_NUMBER = $sch_num - $tch_num;//将已排程数量重置
                $flag&&$pd->save();
            }
        });
    }

    //导出
    public static function exportPi($post){
        $searchAudit = array_key_exists('searchAudit', $post)&&$post['searchAudit'] ? $post['searchAudit'] : '';//审核状态
        $searchInspection = array_key_exists('searchInspection', $post)&&$post['searchInspection'] ? $post['searchInspection'] : '';//验货状态
        $searchPartner = array_key_exists('searchPartner', $post)&&$post['searchPartner'] ? $post['searchPartner'] : '';//供应商ID
        $from = array_key_exists('timeFrom', $post)&&$post['timeFrom']?$post['timeFrom']:strtotime('-90 days');
        $to = array_key_exists('timeTo', $post)&&$post['timeTo']?$post['timeTo']:time();
        $fields = "pq.AUDIT_STATE,p.DORGANISATION_ID,pq.PU_ORDER_CD,p.PARTNER_ID,pq.PSKU_CODE,pq.PSKU_NAME_CN,cast(0 as decimal) as FNSKU,pq.TCHEDULING_NUMBER,pq.DELIVERY_AT";
        $fields .= ",";
        $fields .= "pq.INSPECTION_AT,pq.INSPECTION_ID,pq.EACH_BOX_NUMBER,pq.FCL_NUMBER,pq.FCL_LONG,pq.FCL_WIDE,pq.FCL_HIGH,pq.FCL_NET_WEIGHT";
        $fields .= ",";
        $fields .= "pq.FCL_GROSS_WEIGHT,pq.TAILBOX_NUMBER,pq.TAILBOX_BNUMBER,pq.TAILBOX_LONG,pq.TAILBOX_WIDE,pq.TAILBOX_HIGH,pq.TAILBOX_WEIGHT,pq.TAILBOX_NETWEIGHT";
        $fields .= ",";
        $fields .= "pq.INSPECTION_STATE,pq.QCTABLES_REMARKS,pq.PURCHASE_DETAIL_ID";
        $pqs_t = (new Query())->from('pu_qctables pq')->select($fields)
            ->leftJoin('pu_purchase p','pq.PU_ORDER_CD = p.PU_PURCHASE_CD')
            ->andWhere(array('pq.DELETED_STATE' => '0'))
            ->andWhere(['between','pq.DELIVERY_AT',$from, $to])
            ->andFilterWhere(['pq.AUDIT_STATE'=>$searchAudit,'pq.INSPECTION_STATE'=>$searchInspection,'p.PARTNER_ID'=>$searchPartner]);
        PuPurchase::addQuery($pqs_t,'p');
        $pqs = $pqs_t->all();
        $firstLine = ['审核状态',
                      '需求组织',
                      '采购单号',
                      '供应商',
                      'SKU',
                      '产品名称',
                      'FNSKU',
                      '品检数量',
                      '交货日期',
                      '验货日期',
                      '验货员',
                      '每箱箱数',
                      '整箱数',
                      '整箱-长(CM)',
                      '整箱-宽(CM)',
                      '整箱-高(CM)',
                      '整箱-净重(KG)',
                      '整箱-毛重(KG)',
                      '尾箱数',
                      '尾箱每箱数量',
                      '尾箱-长(CM)',
                      '尾箱-宽(CM)',
                      '尾箱-高(CM)',
                      '尾箱-净重(KG)',
                      '尾箱-毛重(KG)',
                      '验货状态',
                      '备注'];
        if(empty($pqs)){
            ptrackLogic::exportExcel($pqs,'品检排程列表-' . date("Y-m-j"),'品检排程列表',$firstLine);
        }

        //供应商编码
        $partners = Yii::$app->rpc->create('partint')->send([['\addons\master\partint\modellogic\partintLogic', 'getpartner'], [['PARTNER_ID', 'PARTNER_NAME_CN']]])->recv();

        //单据状态PU_QCTABLES  验货状态INSPECTION_STATE
        $statuses = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\baseLogic', 'getdictionary'], [['D_NAME_CN', 'D_GROUP', 'D_VALUE'], ['INSPECTION_STATE', 'PU_QCTABLES']]])->recv();

        //采购组织编码 需求组织编码
        $organisations = Yii::$app->rpc->create('organization')->send([['\addons\organization\modellogic\organizLogic', 'GetORGANISATION'], [['ORGANISATION_ID', 'ORGANISATION_NAME_CN']]])->recv();

        //验货员编码
        $userId = Yii::$app->rpc->create('users')->send([['\addons\users\modellogic\usersLogic', 'getuser_info'], [['USER_INFO_ID', 'STAFF_ID']]])->recv();
        $userName = Yii::$app->rpc->create('users')->send([['\addons\users\modellogic\staffinfologic', 'getStaffInfo'], [['STAFF_ID', 'STAFF_NAME_CN'], []]])->recv();

        array_walk($pqs,function (&$v,$k,$paras){
            $v['AUDIT_STATE'] = ptrackLogic::getCnByCode($paras['s'],['PU_QCTABLES', $v['AUDIT_STATE']], ['D_GROUP', 'D_VALUE'], 'D_NAME_CN');
            $v['DORGANISATION_ID'] = ptrackLogic::getCnByCode($paras['o'],$v['DORGANISATION_ID'],'ORGANISATION_ID','ORGANISATION_NAME_CN');
            $v['PARTNER_ID'] = ptrackLogic::getCnByCode($paras['p'],$v['PARTNER_ID'],'PARTNER_ID','PARTNER_NAME_CN');
            $v['FNSKU'] = self::getFnSku($v['PURCHASE_DETAIL_ID']);
            $v['DELIVERY_AT'] = $v['DELIVERY_AT']?date('Y-m-d',$v['DELIVERY_AT']):'';
            $v['INSPECTION_AT'] = $v['INSPECTION_AT']?date('Y-m-d',$v['INSPECTION_AT']):'';
            $staffId = ptrackLogic::getCnByCode($paras['ui'],$v['INSPECTION_ID'],'USER_INFO_ID','STAFF_ID');
            $v['INSPECTION_ID'] = ptrackLogic::getCnByCode($paras['un'],$staffId,'STAFF_ID','STAFF_NAME_CN');
            $v['INSPECTION_STATE'] = ptrackLogic::getCnByCode($paras['s'],['INSPECTION_STATE', $v['INSPECTION_STATE']], ['D_GROUP', 'D_VALUE'], 'D_NAME_CN');
        },['s'=>$statuses,'o'=>$organisations,'p'=>$partners,'ui'=>$userId,'un'=>$userName]);
        foreach($pqs as $k=>$v){
            unset($v['PURCHASE_DETAIL_ID']);
            $pqs[$k] = $v;
        }
        ptrackLogic::exportExcel($pqs,'品检排程列表-' . date("Y-m-j"),'品检排程列表',$firstLine);
    }

    //获取FNSKU
    private static function getFnSku($pdId){
        $fn_t = PuPurchaseDetail::find()->select('FNSKU')->where(['PURCHASE_DETAIL_ID'=>$pdId])->asArray()->one();
        return isset($fn_t['FNSKU'])&&$fn_t['FNSKU']?$fn_t['FNSKU']:'';
    }
}