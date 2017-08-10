<?php

namespace addons\tools\models;

use addons\master\basics\models\BChannel;
use addons\master\product\models\GProductSku;
use addons\master\product\models\GProductSkuPurchasingPrice;
use Yii;

/**
 * @SWG\Definition(
 *   definition="ToPlatformData",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="PLATFORM_DATA_ID", type="integer",description="平台资料ID"),
 *           @SWG\Property(property="CHANNEL_ID", type="integer",description="平台ID"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="CHANNEL_REMARKS", type="string",description="描述"),
 *           @SWG\Property(property="PLATFORM_SKU", type="string",description="平台SKU"),
 *           @SWG\Property(property="ASIN", type="string",description="ASIN"),
 *           @SWG\Property(property="PRODUCT_TYPE", type="string",description="小分类"),
 *           @SWG\Property(property="SEASONAL_PRODUCTS", type="integer",description="季节性产品:1是，0不是"),
 *           @SWG\Property(property="MAIN_IMAGE_URL", type="string",description="主要图片地址"),
 *           @SWG\Property(property="OTHER_IMAGE_URL1", type="string",description="其他图片地址1"),
 *           @SWG\Property(property="OTHER_IMAGE_URL2", type="string",description="其他图片地址2"),
 *           @SWG\Property(property="OTHER_IMAGE_URL3", type="string",description="其他图片地址3"),
 *           @SWG\Property(property="OTHER_IMAGE_URL4", type="string",description="其他图片地址4"),
 *           @SWG\Property(property="OTHER_IMAGE_URL5", type="string",description="其他图片地址5"),
 *           @SWG\Property(property="OTHER_IMAGE_URL6", type="string",description="其他图片地址6"),
 *           @SWG\Property(property="OTHER_IMAGE_URL7", type="string",description="其他图片地址7"),
 *           @SWG\Property(property="OTHER_IMAGE_URL8", type="string",description="其他图片地址8"),
 *           @SWG\Property(property="WEB_NAME", type="string",description="网站名称"),
 *           @SWG\Property(property="ITEM_NAME", type="string",description="项目名称"),
 *           @SWG\Property(property="BULLET_POINT1", type="string",description="产品要点1"),
 *           @SWG\Property(property="BULLET_POINT2", type="string",description="产品要点2"),
 *           @SWG\Property(property="BULLET_POINT3", type="string",description="产品要点3"),
 *           @SWG\Property(property="BULLET_POINT4", type="string",description="产品要点4"),
 *           @SWG\Property(property="BULLET_POINT5", type="string",description="产品要点5"),
 *           @SWG\Property(property="GENERIC_KEYWORDS1", type="string",description="通用关键词1"),
 *           @SWG\Property(property="GENERIC_KEYWORDS2", type="string",description="通用关键词2"),
 *           @SWG\Property(property="GENERIC_KEYWORDS3", type="string",description="通用关键词3"),
 *           @SWG\Property(property="GENERIC_KEYWORDS4", type="string",description="通用关键词4"),
 *           @SWG\Property(property="GENERIC_KEYWORDS5", type="string",description="通用关键词5"),
 *           @SWG\Property(property="TARGET_AUDIENCE_KEYWORDS", type="string",description="目标受众的关键词"),
 *           @SWG\Property(property="PRODUCT_DESCRIPTION", type="string",description="产品说明"),
 *           @SWG\Property(property="MORE_DETAILS", type="string",description="更详细的说明"),
 *           @SWG\Property(property="ITEM_WEIGHT_UNIT", type="integer",description="产品重量单位:1 GR,2 KG,3 LB,4 OZ"),
 *           @SWG\Property(property="ITEM_WEIGHT", type="number",description="产品宽度"),
 *           @SWG\Property(property="ITEM_LENGTH", type="number",description="产品长度"),
 *           @SWG\Property(property="ITEM_WIDTH", type="number",description="产品高度"),
 *           @SWG\Property(property="ITEM_HEIGHT", type="number",description="产品重量"),
 *           @SWG\Property(property="ITEM_LENGTH_UNIT", type="integer",description="产品长度单位:1 CM,2 FT,3 IN,4 M,5 MM"),
 *           @SWG\Property(property="PACKAGE_WEIGHT", type="number",description="装箱重量"),
 *           @SWG\Property(property="PACKAGE_WEIGHT_UNIT", type="integer",description="装箱重量单位:1 GR,2 KG,3 LB,4 OZ"),
 *           @SWG\Property(property="PACKAGE_LENGTH", type="number",description="装箱长度"),
 *           @SWG\Property(property="PACKAGE_WIDTH", type="number",description="装箱宽度"),
 *           @SWG\Property(property="PACKAGE_HEIGHT", type="number",description="装箱高度"),
 *           @SWG\Property(property="PACKAGE_LENGTH_UNIT", type="integer",description="装箱长度单位:1 CM,2 FT,3 IN,4 M,5 MM"),
 *           @SWG\Property(property="OUT_PACKAGE_WEIGHT", type="number",description="外包装重量"),
 *           @SWG\Property(property="OUT_PACKAGE_WEIGHT_UNIT", type="integer",description="外包装长度单位:1 GR,2 KG,3 LB,4 OZ"),
 *           @SWG\Property(property="OUT_PACKAGE_LENGTH", type="number",description="外包装长度"),
 *           @SWG\Property(property="OUT_PACKAGE_WIDTH", type="number",description="外包装宽度"),
 *           @SWG\Property(property="OUT_PACKAGE_HEIGHT", type="number",description="外包装高度"),
 *           @SWG\Property(property="OUT_PACKAGE_LENGTH_UNIT", type="integer",description="装箱长度单位:1 CM,2 FT,3 IN,4 M,5 MM"),
 *           @SWG\Property(property="QUANTITY_OF_PACKAGE", type="integer",description="装箱数量"),
 *           @SWG\Property(property="MAX_ORDER_QANTITY", type="integer",description="最大订货量"),
 *           @SWG\Property(property="APLUS_INFO", type="string",description="A+信息"),
 *           @SWG\Property(property="SALE_PRICE", type="number",description="销售价格"),
 *           @SWG\Property(property="FBA_FEE", type="string",description="FBA费"),
 *           @SWG\Property(property="TEMPLATE_ID", type="integer",description="模板ID:1 DE_ALL,2 JP_ALL,3 UK_ALL,4 US_ALL"),
 *           @SWG\Property(property="TEMPLATE", type="string",description="模板"),
 *           @SWG\Property(property="ITEM_STATUS", type="integer",description="项目状态:1 OFF,2 ON,3 WAIT,"),
 *           @SWG\Property(property="COUNTRY", type="string",description="国"),
 *           @SWG\Property(property="ITEM_TYPE", type="string",description="项目类型"),
 *           @SWG\Property(property="FEE_PRODUCT_TYPE", type="string",description="FEE产品类型"),
 *           @SWG\Property(property="MODEL", type="string",description="模型"),
 *           @SWG\Property(property="EXTERNAL_PRODUCT", type="string",description="你的excel模板路"),
 *           @SWG\Property(property="EXTERNAL_PRODUCT_ID_TYPE", type="integer",description="你的excel模板路径类型:1 EAN,2 GCID,3 GTIN,4 UPC"),
 *           @SWG\Property(property="MANUFACTURER", type="string",description="制造商"),
 *           @SWG\Property(property="BRAND_NAME", type="string",description="品牌名称"),
 *           @SWG\Property(property="PRODUCT_TAX_CODE", type="string",description="产品税代码"),
 *           @SWG\Property(property="FULFILLMENT_CENTER_ID", type="integer",description="完成中心标识:1 AMAZON_EU,2 AMAZON_US,3 AMAZON_NA"),
 *           @SWG\Property(property="CONDITION_TYPE", type="integer",description="条件类型:1 NEW,2 OLD"),
 *           @SWG\Property(property="UPDATE_DELETE", type="integer",description="修改删除:1 DELETE,2 UPDATE"),
 *           @SWG\Property(property="LIST_PRICE", type="string",description="产品价目表"),
 *           @SWG\Property(property="STANDARD_PRICE", type="string",description="标准成本"),
 *           @SWG\Property(property="CURRENCY", type="string",description="货币"),
 *           @SWG\Property(property="SALE_FROM_DATE", type="string",description="开始出售时间"),
 *           @SWG\Property(property="SALE_END_DATE", type="string",description="结束出售时间"),
 *           @SWG\Property(property="PARENT_CHILD", type="integer",description="父子:1 child,2 parent"),
 *           @SWG\Property(property="PARENT_SKU", type="string",description="父级SKU"),
 *           @SWG\Property(property="VARIATION_THEME", type="string",description="变化的主题"),
 *           @SWG\Property(property="SIZE_NAME", type="string",description="尺寸名称"),
 *           @SWG\Property(property="SIZE_MAP", type="string",description="尺寸图"),
 *           @SWG\Property(property="COLOR_NAME", type="string",description="颜色名称"),
 *           @SWG\Property(property="COLOR_MAP", type="string",description="颜色图"),
 *           @SWG\Property(property="STYLE_NAME", type="string",description="风格名称"),
 *           @SWG\Property(property="PATTERN_NAME", type="string",description="模式名称"),
 *           @SWG\Property(property="WEBSITE_VARIATION", type="string",description="网站的变化"),
 *           @SWG\Property(property="MAIN_SKU", type="string",description="主要SKU"),
 *           @SWG\Property(property="OCEANFRE_TEST", type="number",description="快递"),
 *           @SWG\Property(property="SALEPRICE_TEST", type="number",description="售价"),
 *           @SWG\Property(property="AIREX_TEST", type="number",description="空运"),
 *           @SWG\Property(property="AIRSHIP_TEST", type="number",description="海运"),
 *           @SWG\Property(property="DRAGONSHIP_TEST", type="number",description="龙舟海运"),
 *           @SWG\Property(property="LANDSHIP_TEST", type="number",description="陆运")
 *       )
 *   }
 * )
 */
class ToPlatformData extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'to_platform_data';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['CHANNEL_ID', 'PSKU_ID'], 'required'],
            [['CHANNEL_ID', 'PSKU_ID', 'SEASONAL_PRODUCTS', 'ITEM_WEIGHT_UNIT', 'ITEM_LENGTH_UNIT', 'PACKAGE_WEIGHT_UNIT', 'PACKAGE_LENGTH_UNIT', 'OUT_PACKAGE_WEIGHT_UNIT', 'OUT_PACKAGE_LENGTH_UNIT', 'QUANTITY_OF_PACKAGE', 'MAX_ORDER_QANTITY', 'TEMPLATE_ID', 'ITEM_STATUS', 'EXTERNAL_PRODUCT_ID_TYPE', 'FULFILLMENT_CENTER_ID', 'CONDITION_TYPE', 'UPDATE_DELETE', 'PARENT_CHILD'], 'integer'],
            [['BULLET_POINT1', 'BULLET_POINT2', 'BULLET_POINT3', 'BULLET_POINT4', 'BULLET_POINT5', 'GENERIC_KEYWORDS1', 'GENERIC_KEYWORDS2', 'GENERIC_KEYWORDS3', 'GENERIC_KEYWORDS4', 'GENERIC_KEYWORDS5', 'TARGET_AUDIENCE_KEYWORDS', 'PRODUCT_DESCRIPTION', 'MORE_DETAILS', 'APLUS_INFO'], 'string'],
            [['ITEM_WEIGHT', 'ITEM_LENGTH', 'ITEM_WIDTH', 'ITEM_HEIGHT', 'PACKAGE_WEIGHT', 'PACKAGE_LENGTH', 'PACKAGE_WIDTH', 'PACKAGE_HEIGHT', 'OUT_PACKAGE_WEIGHT', 'OUT_PACKAGE_LENGTH', 'OUT_PACKAGE_WIDTH', 'OUT_PACKAGE_HEIGHT', 'SALE_PRICE', 'OCEANFRE_TEST', 'SALEPRICE_TEST', 'AIREX_TEST', 'AIRSHIP_TEST', 'DRAGONSHIP_TEST', 'LANDSHIP_TEST'], 'number'],
            [['CHANNEL_REMARKS', 'MAIN_IMAGE_URL', 'OTHER_IMAGE_URL1', 'OTHER_IMAGE_URL2', 'OTHER_IMAGE_URL3', 'OTHER_IMAGE_URL4', 'OTHER_IMAGE_URL5', 'OTHER_IMAGE_URL6', 'OTHER_IMAGE_URL7', 'OTHER_IMAGE_URL8'], 'string', 'max' => 255],
            [['PLATFORM_SKU'], 'string', 'max' => 20],
            [['ASIN', 'PRODUCT_TYPE', 'FBA_FEE', 'TEMPLATE', 'COUNTRY', 'ITEM_TYPE', 'FEE_PRODUCT_TYPE', 'MODEL', 'EXTERNAL_PRODUCT', 'MANUFACTURER', 'BRAND_NAME', 'PRODUCT_TAX_CODE', 'LIST_PRICE', 'STANDARD_PRICE', 'CURRENCY', 'SALE_FROM_DATE', 'SALE_END_DATE', 'PARENT_SKU', 'VARIATION_THEME', 'SIZE_NAME', 'SIZE_MAP', 'COLOR_NAME', 'COLOR_MAP', 'STYLE_NAME', 'PATTERN_NAME', 'WEBSITE_VARIATION', 'MAIN_SKU'], 'string', 'max' => 30],
            [['WEB_NAME', 'ITEM_NAME'], 'string', 'max' => 100],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'PLATFORM_DATA_ID' => Yii::t('tools', '平台资料ID'),
            'CHANNEL_ID' => Yii::t('tools', '平台ID'),
            'PSKU_ID' => Yii::t('tools', '产品SKU ID'),
            'CHANNEL_REMARKS' => Yii::t('tools', '描述'),
            'PLATFORM_SKU' => Yii::t('tools', '平台SKU'),
            'ASIN' => Yii::t('tools', 'ASIN'),
            'PRODUCT_TYPE' => Yii::t('tools', '小分类'),
            'SEASONAL_PRODUCTS' => Yii::t('tools', '季节性产品:1是，0不是'),
            'MAIN_IMAGE_URL' => Yii::t('tools', '主要图片地址'),
            'OTHER_IMAGE_URL1' => Yii::t('tools', '其他图片地址1'),
            'OTHER_IMAGE_URL2' => Yii::t('tools', '其他图片地址2'),
            'OTHER_IMAGE_URL3' => Yii::t('tools', '其他图片地址3'),
            'OTHER_IMAGE_URL4' => Yii::t('tools', '其他图片地址4'),
            'OTHER_IMAGE_URL5' => Yii::t('tools', '其他图片地址5'),
            'OTHER_IMAGE_URL6' => Yii::t('tools', '其他图片地址6'),
            'OTHER_IMAGE_URL7' => Yii::t('tools', '其他图片地址7'),
            'OTHER_IMAGE_URL8' => Yii::t('tools', '其他图片地址8'),
            'WEB_NAME' => Yii::t('tools', '网站名称'),
            'ITEM_NAME' => Yii::t('tools', '项目名称'),
            'BULLET_POINT1' => Yii::t('tools', '产品要点1'),
            'BULLET_POINT2' => Yii::t('tools', '产品要点2'),
            'BULLET_POINT3' => Yii::t('tools', '产品要点3'),
            'BULLET_POINT4' => Yii::t('tools', '产品要点4'),
            'BULLET_POINT5' => Yii::t('tools', '产品要点5'),
            'GENERIC_KEYWORDS1' => Yii::t('tools', '通用关键词1'),
            'GENERIC_KEYWORDS2' => Yii::t('tools', '通用关键词2'),
            'GENERIC_KEYWORDS3' => Yii::t('tools', '通用关键词3'),
            'GENERIC_KEYWORDS4' => Yii::t('tools', '通用关键词4'),
            'GENERIC_KEYWORDS5' => Yii::t('tools', '通用关键词5'),
            'TARGET_AUDIENCE_KEYWORDS' => Yii::t('tools', '目标受众的关键词'),
            'PRODUCT_DESCRIPTION' => Yii::t('tools', '产品说明'),
            'MORE_DETAILS' => Yii::t('tools', '更详细的说明'),
            'ITEM_WEIGHT_UNIT' => Yii::t('tools', '产品重量单位:1 GR,2 KG,3 LB,4 OZ'),
            'ITEM_WEIGHT' => Yii::t('tools', '产品宽度'),
            'ITEM_LENGTH' => Yii::t('tools', '产品长度'),
            'ITEM_WIDTH' => Yii::t('tools', '产品高度'),
            'ITEM_HEIGHT' => Yii::t('tools', '产品重量'),
            'ITEM_LENGTH_UNIT' => Yii::t('tools', '产品长度单位:1 CM,2 FT,3 IN,4 M,5 MM'),
            'PACKAGE_WEIGHT' => Yii::t('tools', '装箱重量'),
            'PACKAGE_WEIGHT_UNIT' => Yii::t('tools', '装箱重量单位:1 GR,2 KG,3 LB,4 OZ'),
            'PACKAGE_LENGTH' => Yii::t('tools', '装箱长度'),
            'PACKAGE_WIDTH' => Yii::t('tools', '装箱宽度'),
            'PACKAGE_HEIGHT' => Yii::t('tools', '装箱高度'),
            'PACKAGE_LENGTH_UNIT' => Yii::t('tools', '装箱长度单位:1 CM,2 FT,3 IN,4 M,5 MM'),
            'OUT_PACKAGE_WEIGHT' => Yii::t('tools', '外包装重量'),
            'OUT_PACKAGE_WEIGHT_UNIT' => Yii::t('tools', '外包装长度单位:1 GR,2 KG,3 LB,4 OZ'),
            'OUT_PACKAGE_LENGTH' => Yii::t('tools', '外包装长度'),
            'OUT_PACKAGE_WIDTH' => Yii::t('tools', '外包装宽度'),
            'OUT_PACKAGE_HEIGHT' => Yii::t('tools', '外包装高度'),
            'OUT_PACKAGE_LENGTH_UNIT' => Yii::t('tools', '装箱长度单位:1 CM,2 FT,3 IN,4 M,5 MM'),
            'QUANTITY_OF_PACKAGE' => Yii::t('tools', '装箱数量'),
            'MAX_ORDER_QANTITY' => Yii::t('tools', '最大订货量'),
            'APLUS_INFO' => Yii::t('tools', 'A+信息'),
            'SALE_PRICE' => Yii::t('tools', '销售价格'),
            'FBA_FEE' => Yii::t('tools', 'FBA费'),
            'TEMPLATE_ID' => Yii::t('tools', '模板ID:1 DE_ALL,2 JP_ALL,3 UK_ALL,4 US_ALL'),
            'TEMPLATE' => Yii::t('tools', '模板'),
            'ITEM_STATUS' => Yii::t('tools', '项目状态:1 OFF,2 ON,3 WAIT,'),
            'COUNTRY' => Yii::t('tools', '国'),
            'ITEM_TYPE' => Yii::t('tools', '项目类型'),
            'FEE_PRODUCT_TYPE' => Yii::t('tools', 'FEE产品类型'),
            'MODEL' => Yii::t('tools', '模型'),
            'EXTERNAL_PRODUCT' => Yii::t('tools', '你的excel模板路'),
            'EXTERNAL_PRODUCT_ID_TYPE' => Yii::t('tools', '你的excel模板路径类型:1 EAN,2 GCID,3 GTIN,4 UPC'),
            'MANUFACTURER' => Yii::t('tools', '制造商'),
            'BRAND_NAME' => Yii::t('tools', '品牌名称'),
            'PRODUCT_TAX_CODE' => Yii::t('tools', '产品税代码'),
            'FULFILLMENT_CENTER_ID' => Yii::t('tools', '完成中心标识:1 AMAZON_EU,2 AMAZON_US,3 AMAZON_NA'),
            'CONDITION_TYPE' => Yii::t('tools', '条件类型:1 NEW,2 OLD'),
            'UPDATE_DELETE' => Yii::t('tools', '修改删除:1 DELETE,2 UPDATE'),
            'LIST_PRICE' => Yii::t('tools', '产品价目表'),
            'STANDARD_PRICE' => Yii::t('tools', '标准成本'),
            'CURRENCY' => Yii::t('tools', '货币'),
            'SALE_FROM_DATE' => Yii::t('tools', '开始出售时间'),
            'SALE_END_DATE' => Yii::t('tools', '结束出售时间'),
            'PARENT_CHILD' => Yii::t('tools', '父子:1 child,2 parent'),
            'PARENT_SKU' => Yii::t('tools', '父级SKU'),
            'VARIATION_THEME' => Yii::t('tools', '变化的主题'),
            'SIZE_NAME' => Yii::t('tools', '尺寸名称'),
            'SIZE_MAP' => Yii::t('tools', '尺寸图'),
            'COLOR_NAME' => Yii::t('tools', '颜色名称'),
            'COLOR_MAP' => Yii::t('tools', '颜色图'),
            'STYLE_NAME' => Yii::t('tools', '风格名称'),
            'PATTERN_NAME' => Yii::t('tools', '模式名称'),
            'WEBSITE_VARIATION' => Yii::t('tools', '网站的变化'),
            'MAIN_SKU' => Yii::t('tools', '主要SKU'),
            'OCEANFRE_TEST' => Yii::t('tools', '快递'),
            'SALEPRICE_TEST' => Yii::t('tools', '售价'),
            'AIREX_TEST' => Yii::t('tools', '空运'),
            'AIRSHIP_TEST' => Yii::t('tools', '海运'),
            'DRAGONSHIP_TEST' => Yii::t('tools', '龙舟海运'),
            'LANDSHIP_TEST' => Yii::t('tools', '陆运'),
        ];
    }

    public static function addQuery(&$query, $alias)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if($str){
            $query->andWhere([$alias . '.CHANNEL_ID' => Yii::$app->session->get('channel') ?: null]);
            $query->andWhere([$alias . '.PSKU_ID' => Yii::$app->session->get('product_id') ?: null]);
        }
    }

    //平台
    public function getB_channel()
    {
        return $this->hasOne(BChannel::className(), ['CHANNEL_ID' => 'CHANNEL_ID'])->select(['CHANNEL_ID', 'CHANNEL_NAME_CN', 'PLATFORM_TYPE_ID','SEABORNE_PRICE','EXPRESS_PRICE','AIR_FREIGHT_PRICE','AMAZON_COMMISSION','SHIPPING_PRICE','FBA_FREIGHT','LAND_CARRIAGE_PRICE']);
    }
    //产品sku
    public function getG_product_sku()
    {
        return $this->hasOne(GProductSku::className(), ['PSKU_ID' => 'PSKU_ID'])->select(['PSKU_ID', 'PSKU_NAME_CN','PSKU_CODE']);
    }
    //产品sku采购价格表
    public function getG_product_sku_purchasing_price()
    {
        return $this->hasMany(GProductSkuPurchasingPrice::className(), ['PSKU_ID' => 'PSKU_ID']);
    }
    

}
