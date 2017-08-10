<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/27
 * Time: 17:45
 */
namespace addons\master\product\modellogic;

use addons\master\product\models\GProductSku;
use addons\master\product\models\GProductSkuFnsku;
use addons\master\product\models\GProductSkuPacking;
use yii\swoole\db\Query;
use yii\swoole\helpers\ArrayHelper;
use Yii;

class  ProductskuLogic
{
    /**
     * getGProductSkuPacking
     * 获取装箱资料SKU
     * 通过产品SKU编码获取
     * @param $PSKU_ID
     * @return array
     * */
    public static function getGProductSkuPacking($PSKU_ID)
    {
        $GProductSku = GProductSku::find()->where(['PSKU_ID' => $PSKU_ID])->asArray()->one();
        if ($GProductSku) {
            return GProductSkuPacking::find()->where(array('PSKU_ID' => $GProductSku['PSKU_ID']))->asArray()->all();
        } else {
            return [];
        }

    }

    /**
     * getGProductSkuFnsku
     * 获取SKU映射表
     * 通过产品SKU编码获取
     * @param $PSKU_ID
     * @return array
     * */
    public static function getGProductSkuFnsku($PSKU_ID)
    {
        $GProductSku = GProductSku::find()->where(['PSKU_ID' => $PSKU_ID])->asArray()->one();
        if ($GProductSku) {
            return GProductSkuFnsku::find()->where(array('PSKU_ID' => $GProductSku['PSKU_ID']))->asArray()->all();
        } else {
            return [];
        }
    }

    /**
     * 通过需求组织获取sku
     * @param $ORGAN_ID_DEMAND
     * @return array
     */
    public static function getGProductSkuByOrgDemand($ORGAN_ID_DEMAND)
    {
        return GProductSku::find()->where(['ORGAN_ID_DEMAND' => $ORGAN_ID_DEMAND])->asArray()->all();
    }

    /**
     * 获取sku
     * @param array $select
     * @param array $where
     * @return array
     */
    public static function getGProductSku($select = [], $where = [])
    {
        if (empty($select)) {
            $select = "*";
        }
        return GProductSku::find()->select($select)->where($where)->asArray()->all();
    }

    /**
     * 通过平台SKU匹配系统SKU
     * @param $platFromSku
     * @param $accountId
     * @param $orgId
     * @return array|bool
     */
    public static function getSkuInfoByPlatformSku($platFromSku, $accountId, $orgId)
    {
        $platFromSku = str_replace('-FBA', '', $platFromSku);
        $info = (new Query())->from('g_product_sku_fnsku')
                ->select('PSKU_ID')
                ->where(['ACCOUNT_ID' => $accountId,'PLATFORM_SKU' => $platFromSku])
                ->one();
        if (!$info) {
            $info = (new Query())->from('g_product_sku')
                ->select('PSKU_ID')
                ->where(['PSKU_CODE' => $platFromSku])
                ->andWhere(['or', ['=', 'ORGAN_ID_PURCHASE', $orgId], ['=', 'ORGAN_ID_DEMAND', $orgId]])
                ->one();
        }
        return $info ? $info : array();
    }
}