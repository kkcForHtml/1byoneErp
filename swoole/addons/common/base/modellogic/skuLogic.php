<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/25 0025
 * Time: 10:25
 */
namespace addons\common\base\modellogic;

use yii\swoole\db\Query;

class skuLogic
{
    /*
     * 获取SKUID
     */
    public static function getSku(string $channel_code, int $account_id, string $fnsku)
    {
        $fnskuTable=(new Query())->select(['PSKU_ID'])->from(['g_product_sku_fnsku'])
            ->where(['CHANNEL_ID'=>$channel_code,'ACCOUNT_ID'=>$account_id,'PLATFORM_SKU'=>$fnsku]);

        $skuTable=(new Query())->select(['PSKU_ID'])->from(['g_product_sku'])->where(['PSKU_ID'=>$fnsku]);
    }
}