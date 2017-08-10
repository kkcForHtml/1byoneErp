<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/22 0022
 * Time: 14:31
 */

namespace addons\purchase\modellogic;

use addons\common\base\models\PDictionary;
use addons\master\basics\models\BChannel;
use addons\master\product\models\GCurrencySku;
use addons\master\product\models\GProductSku;
use addons\organization\models\OOrganisation;
use addons\purchase\models\PuPlan;
use addons\purchase\models\PuPurchaseDetail;
use yii\swoole\modellogic\BaseLogic;
use yii\web\ServerErrorHttpException;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\helpers\ArrayHelper;
use Yii;

class planLogic extends BaseLogic
{
    public static $modelClass = 'addons\purchase\models\PuPlan';

    //反审核
    public static function reAudit($post)
    {
        foreach ($post['condition']['where']['PU_PLAN_ID'] as $key => $value) {
            $exitData = PuPurchaseDetail::find()->where(['PU_PLAN_ID' => $value])->exists();
            if ($exitData) {
                throw new ServerErrorHttpException(Yii::t('purchase', "This document has been used by other documents and cannot be performed this operation!"));
            }
        }
        return self::Update($post);
    }

    //导入采购计划
    public static function importPlan($post)
    {
        $tmp_name = $_FILES["file"]["tmp_name"];
        $resultMsg = "";
        $phpexcel = new \PHPExcel();
        $PHPReader = new \PHPExcel_Reader_Excel2007();
        if (!$PHPReader->canRead($tmp_name)) {
            throw new ServerErrorHttpException(Yii::t('purchase', 'The file cannot be read!'));
        }
        //start filter pu_plan
        $phpexcel = $PHPReader->load($tmp_name)->getSheet(0);
        $phpexcel = $phpexcel->toArray();
        array_shift($phpexcel);
        $resultMsg = self::filterPuPlan($phpexcel);
        return $resultMsg;
    }

    //筛选是否生成采购计划
    public static function filterPuPlan($phpexcel)
    {
        $mOOrganisationValueList = Yii::$app->session->get('organization');
        $mOOrganisationTempList = OOrganisation::find()->where(["o_organisation.ORGANISATION_STATE" => "1"])->all();
        $mBChannelList = BChannel::find()->where(['and', ['=', 'CHANNEL_STATE', '1']])->all();
        $mGProductSkuList = GProductSku::find()->where(['and', ['=', 'g_product_sku.PSKU_STATE', "1"]])->all();
        $mGCurrencySkuList = GCurrencySku::find()->where(['and', ['=', 'CSKU_STATE', '1']])->all();

        //限制用户权限
        $mOOrganisationList = array();
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            foreach ($mOOrganisationValueList as $key => $mOOrganisationValue) {
                foreach ($mOOrganisationTempList as $key => $mOOrganisationTemp) {
                    if ($mOOrganisationValue == $mOOrganisationTemp->ORGANISATION_ID) {
                        $mOOrganisationList[] = $mOOrganisationTemp;
                        continue;
                    }
                }
            }
        } else {
            $mOOrganisationList = $mOOrganisationTempList;
        }

        //TODO 可考虑写死平台类型 亚马逊为1， eBay为2
        //平台Amazon TypeID
        $mPDictionaryList = PDictionary::find()->where(['D_GROUP' => 'CHANNEL'])->all();
        $amazonID = "";
        $eBayID = "";
        foreach ($mPDictionaryList as $key => $mPDictionary) {
            if ($mPDictionary->D_NAME_CN == "Amazon") {
                $amazonID = $mPDictionary->D_VALUE;
            } else if ($mPDictionary->D_NAME_CN == "eBay") {
                $eBayID = $mPDictionary->D_VALUE;
            }
        }
        if ($amazonID == "" || $eBayID == "") {
            throw new ServerErrorHttpException(Yii::t('purchase', "Dictionary cache did not find platform type!"));
        }

        $orgIndexNameArray = [];
        $orgIndexNameArray['US'] = ['index' => 9, 'channel' => $amazonID, 'org' => 'US', 'name' => 'US Amazon'];
        $orgIndexNameArray['CA'] = ['index' => 10, 'channel' => $amazonID, 'org' => 'CA', 'name' => 'CA Amazon'];
        $orgIndexNameArray['UK'] = ['index' => 11, 'channel' => $amazonID, 'org' => 'UK', 'name' => 'UK Amazon'];
        $orgIndexNameArray['JP'] = ['index' => 13, 'channel' => $amazonID, 'org' => 'JP', 'name' => 'JP Amazon'];
        $orgIndexNameArray['DE'] = ['index' => 14, 'channel' => $amazonID, 'org' => 'DE', 'name' => 'DE Amazon'];
        $orgIndexNameArray['FR'] = ['index' => 15, 'channel' => $amazonID, 'org' => 'FR', 'name' => 'FR Amazon'];
        $orgIndexNameArray['ES'] = ['index' => 16, 'channel' => $amazonID, 'org' => 'ES', 'name' => 'ES Amazon'];
        $orgIndexNameArray['IT'] = ['index' => 17, 'channel' => $amazonID, 'org' => 'IT', 'name' => 'IT Amazon'];
        $orgIndexNameArray['USE'] = ['index' => 18, 'channel' => $eBayID, 'org' => 'US', 'name' => 'US eBay'];
        $orgIndexNameArray['UKE'] = ['index' => 19, 'channel' => $eBayID, 'org' => 'UK', 'name' => 'UK eBay'];
        $orgIndexNameArray['DEE'] = ['index' => 20, 'channel' => $eBayID, 'org' => 'DE', 'name' => 'DE eBay'];
        $orgIndexNameArray['AUE'] = ['index' => 21, 'channel' => $eBayID, 'org' => 'AU', 'name' => 'AU eBay'];

        $data = array();
        $errorMsg = "";
        $no = 0;//excel下标位置
        foreach ($phpexcel as $key => $row) {
            $no++;
            //判断该行合计是否>0, false, 下一行
            //if (isset($row["24"]) && $row["24"] && $row["24"] > 0) {
            foreach ($orgIndexNameArray as $key => $value) {
                if (isset($row[$value['index']]) && $row[$value['index']] && $row[$value['index']] > 0) {
                    $resultTemp = self::importPuPlan($value['org'], $value['channel'], $row[$value['index']], $row, $mOOrganisationList, $mBChannelList, $mGCurrencySkuList, $mGProductSkuList);
                    if (is_array($resultTemp)) {
                        $data[] = $resultTemp;
                    } else if (substr($resultTemp, 0, 5) == "error") {
                        $errorMsg = $errorMsg . "Row." . $no . " " . Yii::t('purchase', $value['name']) . " " . substr($resultTemp, 5, strlen($resultTemp)) . "\n";
                    }
                }
            }
        }
        if ($errorMsg != "") {
            throw new ServerErrorHttpException(Yii::t('purchase', $errorMsg));
        }
        if (count($data) > 0) {
            $dataModel = array("batch" => $data);
            $result = self::Create($dataModel);
            if ($result instanceof ResponeModel) {
                return $result;
            } else {
                return Yii::t('purchase', "Successful operation!");
            }
        } else {
            throw new ServerErrorHttpException(Yii::t('purchase', "No data! The currecy SKU,Turnover quantity and Total number are required!"));
        }

    }

    //生成采购计划单
    public static function importPuPlan($organisation, $channel, $qty, $row, $mOOrganisationList, $mBChannelList, $mGCurrencySkuList, $mGProductSkuList)
    {
        //组织
        $mOrganisation = "";
        foreach ($mOOrganisationList as $key => $mOrganisationTemp) {
            if ($mOrganisationTemp->ORGANISATION_CODE == $organisation) {
                $mOrganisation = $mOrganisationTemp;
                break;
            }
        }
        if ($mOrganisation == "") {
            return "error" . Yii::t('purchase', "No found organization!");
        }
        //查找平台
        $mBChannel = "";
        foreach ($mBChannelList as $key => $mBChannelTemp) {
            if ($mBChannelTemp->ORGANISATION_ID == $mOrganisation->ORGANISATION_ID && $mBChannelTemp->PLATFORM_TYPE_ID == $channel) {
                $mBChannel = $mBChannelTemp;
                break;
            }
        }
        if ($mBChannel == "") {
            return "error" . Yii::t('purchase', "No found channel!");
        }

        //查询通用SKU
        $mGCurrencySku = "";
        foreach ($mGCurrencySkuList as $key => $mGCurrencySkuTemp) {
            if ($mGCurrencySkuTemp->CSKU_CODE == $row["4"]) {
                $mGCurrencySku = $mGCurrencySkuTemp;
                break;
            }
        }
        if ($mGCurrencySku == "") {
            return "error" . Yii::t('purchase', "No found currency SKU!");
        }

        //库存组织下和通用SKU下对应的产品SKU
        $mGProductSku = "";
        foreach ($mGProductSkuList as $key => $mGProductSkuTemp) {
            if ($mGProductSkuTemp->CSKU_ID == $mGCurrencySku->CSKU_ID && $mGProductSkuTemp->ORGAN_ID_DEMAND == $mOrganisation->ORGANISATION_ID) {
                $mGProductSku = $mGProductSkuTemp;
                break;
            }
        }
        if ($mGProductSku == "") {
            return "error" . Yii::t('purchase', "No found SKU!");
        }
        //拼接json数组
        $data = array();
        $data["DORGANISATION_ID"] = $mOrganisation->ORGANISATION_ID;
        $data["PSKU_CODE"] = $mGProductSku->PSKU_CODE;
        $data["PSKU_ID"] = $mGProductSku->PSKU_ID;
        $data["PSKU_NAME_CN"] = $mGProductSku->PSKU_NAME_CN;
        $data["PURCHASE"] = $qty;
        $data["PLAN_TYPE"] = "1";
        $data["PLAN_STATE"] = "1";
        $data["IMPORT_STATE"] = "99";
        $data["DEMAND_AT"] = time();
        $data["CHANNEL_ID"] = $mBChannel->CHANNEL_ID;
        $data["FNSKU"] = "";
        $data["PLATFORM_SKU"] = "";
        $data["ACCOUNT_ID"] = "0";
        //平台、产品条码、平台SKU编码和账号ID
        $mGProductSkuFnskuList = $mGProductSku->g_product_sku_fnsku;
        for ($i = 0; $i < count($mGProductSkuFnskuList); $i++) {
            $mGProductSkuFnskuTemp = $mGProductSkuFnskuList[$i];
            if ($mGProductSkuFnskuTemp["CHANNEL_ID"] == $mBChannel->CHANNEL_ID) {
                $data["FNSKU"] = $mGProductSkuFnskuTemp["FNSKU"];
                $data["PLATFORM_SKU"] = $mGProductSkuFnskuTemp["PLATFORM_SKU"];
                $data["ACCOUNT_ID"] = $mGProductSkuFnskuTemp["ACCOUNT_ID"];
                if ($mGProductSkuFnskuTemp['DEFAULTS'] == "1") {
                    break;
                }
            }
        }
        return $data;
    }

    //生成采购订单
    public static function generatePurchase($post)
    {
        //校验数据
        $errorMsg = "";
        if (count($post) <= 0) {
            $errorMsg = "No data!";
        }
        foreach ($post as $key => $value) {
            if ($value['PLAN_STATE'] != 2) {
                $errorMsg = "This operation cannot be performed because the current document is not audited!";
            }
        }
        if ($errorMsg != "") {
            throw new ServerErrorHttpException(Yii::t('purchase', $errorMsg));
        }
        //根据条件排序
        ArrayHelper::multisort($post, ["PARTNER_ID", "ORGANISATION_ID", "CHANNEL_ID", "MONEY_ID", "SMETHOD", "PLAN_TYPE"], [SORT_ASC, SORT_ASC, SORT_ASC, SORT_ASC, SORT_ASC, SORT_ASC]);
        $partnerID = "";
        $organisationID = "";
        $channerID = "";
        $moneyID = "";
        $sMethod = "";
        $planType = "";
        $idArray = array();
        $puPurchaseArray = array();
        $puPurchase = array();
        //拼接采购订单和采购订单明细的json数组
        foreach ($post as $key => $plan) {
            if ($partnerID != $plan['PARTNER_ID']
                || $organisationID != $plan['ORGANISATION_ID']
                || $channerID != $plan['CHANNEL_ID']
                || $moneyID != $plan['MONEY_ID']
                || $sMethod != $plan['SMETHOD']
                || $planType != $plan['PLAN_TYPE']
            ) {
                if (count($puPurchase)) {
                    $puPurchaseArray[] = $puPurchase;
                }
                $puPurchase = $plan;
                $puPurchase['ORDER_AMOUNT'] = 0;
                $puPurchase['IMPORT_STATE'] = "2";
                $puPurchase['ORDER_TYPE'] = "1";
                $stringDate = date("Y-m-d", intval(time()));
                $puPurchase['PRE_ORDER_AT'] = strtotime($stringDate);
                $partnerID = $plan['PARTNER_ID'];
                $organisationID = $plan['ORGANISATION_ID'];
                $channerID = $plan['CHANNEL_ID'];
                $moneyID = $plan['MONEY_ID'];
                $sMethod = $plan['SMETHOD'];
                $planType = $plan['PLAN_TYPE'];
            }
            $puPurchase["pu_purchase_detail"][] = $plan;
            $puPurchase['ORDER_AMOUNT'] += $plan["TAX_AMOUNT"];
            $idArray[] = $plan['PU_PLAN_ID'];
        }
        $puPurchaseArray[] = $puPurchase;
        $puPurchaseModel = array("batchMTC" => $puPurchaseArray);
        //调用PuPurchase接口Create
        $result = Yii::$app->rpc->create('purchase')->sendAndrecv([['\addons\purchase\modellogic\purchaseLogic', 'Create'], [$puPurchaseModel]]);
        if ($result instanceof ResponeModel) {
            return $result;
        }
        //将采购计划状态修改为已下推
        PuPlan::updateAll(["PLAN_STATE" => "3"], ["PU_PLAN_ID" => $idArray]);
        return Yii::t('purchase', "total Generate {item} document", ['item' => count($puPurchaseArray)]);
    }

}