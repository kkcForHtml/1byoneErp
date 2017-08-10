<?php

namespace addons\purchase\models;

use Yii;
use addons\master\product\models\GProductSku;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;
use \yii\swoole\rest\ResponeModel;
use addons\users\models\UUserInfo;


/**
 *
 * @SWG\Definition(
 *   definition="PuPlan",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="PU_PLAN_ID", type="integer",description="采购计划ID"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="PSKU_CODE", type="string",description="产品SKU编码"),
 *           @SWG\Property(property="PSKU_NAME_CN", type="string",description="产品名称"),
 *           @SWG\Property(property="PURCHASE", type="integer",description="需求数量"),
 *           @SWG\Property(property="DEMAND_AT",type="integer",format="int32",description="需求日期"),
 *           @SWG\Property(property="FNSKU",  type="string",description="产品条码"),
 *           @SWG\Property(property="PLATFORM_SKU",  type="string",description="平台SKU编码"),
 *           @SWG\Property(property="ACCOUNT_ID",  type="integer",description="账号ID"),
 *           @SWG\Property(property="IMPORT_STATE", type="integer",description="数据来源:1.手工创建 99.导入"),
 *           @SWG\Property(property="PLAN_TYPE",  type="string",description="采购类型:1.翻单、2.首单、3.备品"),
 *           @SWG\Property(property="PLAN_REMARKS",  type="string",description="备注"),
 *           @SWG\Property(property="PLAN_STATE", type="integer",description="单据状态:1.未审核、2.已审核、3.已下推"),
 *           @SWG\Property(property="DELETED_STATE", type="integer",description="是否删除,1：删除 0：未删除"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="CHANNEL_ID", type="integer",description="平台ID"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class PuPlan extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'pu_plan';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PSKU_CODE', 'PURCHASE', 'PSKU_ID'], 'required'],
            [['PURCHASE', 'PSKU_ID', 'DORGANISATION_ID', 'DEMAND_AT', 'PLAN_TYPE', 'PLAN_STATE', 'DELETED_STATE', 'IMPORT_STATE', 'CREATED_AT', 'UPDATED_AT', 'ACCOUNT_ID', 'CHANNEL_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['PURCHASE'], 'integer', 'max' => 2147483647],
            [['PSKU_CODE', 'PLATFORM_SKU'], 'string', 'max' => 20],
            [['PSKU_NAME_CN'], 'string', 'max' => 128],
            [['FNSKU', ], 'string', 'max' => 30],
            [['PLAN_REMARKS'], 'string', 'max' => 255],
            [['CREATED_AT', 'UPDATED_AT'], 'default', 'value' => function () {
                return time();
            }],
            /*[['UUSER_CODE', 'CUSER_CODE'], 'default', 'value' => function () {
                $user = Yii::$app->getUser();
                return $user && !$user->isGuest ? $user->getIdentity()->USER_INFO_CODE : 'admin';
            }]*/
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'PU_PLAN_ID' => Yii::t('purchase', '采购计划ID'),
            'PSKU_CODE' => Yii::t('purchase', '产品SKU编码'),
            'PSKU_ID' => Yii::t('purchase', '产品SKUID'),
            'PSKU_NAME_CN' => Yii::t('purchase', '产品名称'),
            'DORGANISATION_ID' => Yii::t('purchase', '需求组织ID'),
            'PURCHASE' => Yii::t('purchase', '需求数量'),
            'DEMAND_AT' => Yii::t('purchase', '需求日期'),
            'FNSKU' => Yii::t('purchase', '产品条码'),
            'PLATFORM_SKU' => Yii::t('purchase', '平台SKU编码'),
            'ACCOUNT_ID' => Yii::t('purchase', '账号ID'),
            'PLAN_REMARKS' => Yii::t('purchase', '备注'),
            'PLAN_TYPE' => Yii::t('purchase', '采购类型:1.翻单、2.首单、3.备品'),
            'PLAN_STATE' => Yii::t('purchase', '单据状态:1.未审核、2.已审核、3.已下推'),
            'DELETED_STATE' => Yii::t('purchase', '是否删除:1：删除 0：未删除'),
            'IMPORT_STATE' => Yii::t('purchase', '数据来源:1.手工创建 99.导入'),
            'CREATED_AT' => Yii::t('purchase', '创建时间'),
            'UPDATED_AT' => Yii::t('purchase', '修改时间'),
            'CHANNEL_ID' => Yii::t('purchase', '平台ID'),
            'CUSER_ID' => Yii::t('purchase', '创建人ID'),
            'UUSER_ID' => Yii::t('purchase', '更新人ID'),
        ];
    }

    public static function addQuery(&$query, $alias)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            #组织权限
            $query->andWhere([$alias . '.DORGANISATION_ID' => Yii::$app->session->get('organization') ?: null]);
            $query->andWhere([$alias . '.PSKU_ID' => Yii::$app->session->get('product_id') ?: null]);
        }
    }

    //创建人
    public function getU_userinfo()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'CUSER_ID'])->alias('u')->joinWith("u_staffinfo");
    }

    //更新人
    public function getU_userinfos()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'UUSER_ID']);
    }

    //产品SKU(过滤删除的产品)
    public function getG_product_sku()
    {
        return $this->hasOne(GProductSku::className(), ['PSKU_ID' => 'PSKU_ID', 'ORGAN_ID_DEMAND' => 'DORGANISATION_ID'])->joinWith(['b_unit', 'g_organisation', 'g_product_sku_packing', 'g_product_sku_supplier', 'g_product_sku_fnsku', 'g_product_sku_price', 'g_next_cycle']);
    }

    /**
     * 新增修改前把指定字段值写入时间戳
     */
    public function behaviors()
    {
        return [
            [
                'class' => TimestampBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CREATED_AT', 'UPDATED_AT'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UPDATED_AT'],
                ],
            ],
            [
                'class' => OperatorBehaviors::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CUSER_ID', 'UUSER_ID'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UUSER_ID'],
                ],
            ]
        ];
    }

    /*public $realation = ['g_product_sku_packing' => ['PRODUCT_SKU_ID' => 'PSKU_ID'],
        'g_product_sku_declare' => ['PRODUCT_SKU_ID' => 'PSKU_ID'],
        'g_product_sku_upc' => ['PRODUCT_SKU_ID' => 'PSKU_ID'],
        'g_product_sku_fnsku' => ['PRODUCT_SKU_ID' => 'PSKU_ID'],
        'g_product_sku_supplier' => ['PRODUCT_SKU_ID' => 'PSKU_ID'],
        'g_product_sku_price' => ['PRODUCT_SKU_ID' => 'PSKU_ID'],
        'g_next_cycle' => ['PRODUCT_SKU_ID' => 'PSKU_ID']
    ];*/

    /**
     * 采购计划修改的操作
     * before_AUpdate 修改前
     * after_AUpdate 修改后
     */
    public function before_AUpdate($body, $class = null)
    {
        $respone = new ResponeModel();
        //检验必填项是否为空
        $this->load($body, '');
        Yii::$app->BaseHelper->validate($this);
        //校验数据
        /*$errorMsg = "";
        if (!isset($body['PLAN_STATE']) || !$body['PLAN_STATE'] || $body['PLAN_STATE'] != 1) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('purchase', '已审核状态不允许修改'), [$body])];
        }*/
        return [$this::ACTION_NEXT, $body];
    }

}
