<?php

namespace addons\master\product\models;

use addons\inventory\models\SkAdjustmentDetail;
use addons\inventory\models\SkAllocationDetail;
use addons\inventory\models\SkFiallocationDetail;
use addons\inventory\models\SkPendingDelivery;
use addons\inventory\models\SkPendingStorage;
use addons\inventory\models\SkPlacingDetail;
use addons\inventory\models\SkStorageDetail;
use addons\purchase\models\PuPlan;
use addons\purchase\models\PuPurchaseDetail;
use addons\purchase\models\PuQctables;
use addons\sales\models\CrSalesOrderDetail;
use addons\shipment\models\ShAllocationDetail;
use addons\shipment\models\ShDispatchNote;
use addons\shipment\models\ShTrackingDetail;
use Yii;
use yii\db\Expression;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;
use yii\swoole\db\Query;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\helpers\ArrayHelper;

use addons\users\models\UUserInfo;
use addons\organization\models\OOrganisation;
use addons\master\basics\models\BUnit;

/**
 * @SWG\Definition(
 *   definition="GProductSku",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="PSKU_CODE", type="string",description="产品SKU编码"),
 *           @SWG\Property(property="PSKU_NAME_CN", type="string",description="名称(中文)"),
 *           @SWG\Property(property="PSKU_NAME_EN", type="string",description="名称(英文)"),
 *           @SWG\Property(property="PRODUCT_TYPE_PATH",  type="string",description="产品分类路径"),
 *           @SWG\Property(property="PSKU_MOQ",type="integer",format="int32",description="最小起订量"),
 *           @SWG\Property(property="TRANSPORT",type="integer",format="int32",description="默认运输方式1海运，2空运"),
 *           @SWG\Property(property="AMAZON_SIZE_ID",type="integer",format="int32",description="亚马逊尺寸ID"),
 *           @SWG\Property(property="CSKU_STATE", type="integer",format="int32",description="是否启用,1：Y 0：N"),
 *           @SWG\Property(property="PSKU_REMARKS",  type="string",description="备注"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="UNIVERSAL_STATE", type="integer",format="int32",description="是否全球通用1:Y，0:N"),
 *           @SWG\Property(property="CSKU_ID", type="integer",description="通用SKU_ID"),
 *           @SWG\Property(property="ORGAN_ID_DEMAND", type="integer",description="需求组织"),
 *           @SWG\Property(property="ORGAN_ID_PURCHASE", type="integer",description="默认采购组织"),
 *           @SWG\Property(property="UNIT_ID", type="integer",description="单位ID"),
 *			 @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *
 *       )
 *   }
 * )
 */
class GProductSku extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'g_product_sku';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PSKU_ID'], 'safe'],
            [['PSKU_CODE',  'PSKU_NAME_CN'], 'required'],
            [['PSKU_MOQ', 'AMAZON_SIZE_ID', 'PSKU_STATE', 'CREATED_AT', 'UPDATED_AT', 'TRANSPORT', 'UNIVERSAL_STATE', 'CSKU_ID', 'ORGAN_ID_DEMAND', 'ORGAN_ID_PURCHASE', 'UNIT_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['PSKU_CODE',  'PRODUCT_TYPE_PATH'], 'string', 'max' => 20],
            [['PSKU_NAME_CN'], 'string', 'max' => 128],
            [['PSKU_NAME_EN'], 'string', 'max' => 50],
            [['PSKU_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'PSKU_ID' => Yii::t('product', '产品SKU ID'),
            'PSKU_CODE' => Yii::t('product', '产品SKU编码'),
            'PSKU_NAME_CN' => Yii::t('product', '名称(中文)'),
            'PSKU_NAME_EN' => Yii::t('product', '名称(英文)'),
            'PRODUCT_TYPE_PATH' => Yii::t('product', '产品分类路径'),
            'PSKU_MOQ' => Yii::t('product', '最小起订量'),
            'AMAZON_SIZE_ID' => Yii::t('product', '亚马逊尺寸ID'),
            'PSKU_STATE' => Yii::t('product', '是否启用,1：Y 0：N'),
            'PSKU_REMARKS' => Yii::t('product', '备注'),
            'CREATED_AT' => Yii::t('product', '创建时间'),
            'UPDATED_AT' => Yii::t('product', '修改时间'),
            'TRANSPORT' => Yii::t('product', '默认运输方式1海运，2空运'),
            'UNIVERSAL_STATE' => Yii::t('product', '是否全球通用1:Y，0:N'),
            'CSKU_ID' => Yii::t('product', '通用SKU_ID'),
            'ORGAN_ID_DEMAND' => Yii::t('product', '需求组织'),
            'ORGAN_ID_PURCHASE' => Yii::t('product', '默认采购组织'),
            'UNIT_ID' => Yii::t('product', '单位ID'),
            'CUSER_ID' => Yii::t('product', '创建人ID'),
            'UUSER_ID' => Yii::t('product', '更新人ID'),
        ];
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

    public $realation = [
        'g_product_sku_packing' => ['PSKU_ID' => 'PSKU_ID'],
        'g_product_sku_declare' => ['PSKU_ID' => 'PSKU_ID'],
        'g_product_sku_upc' => ['PSKU_ID' => 'PSKU_ID'],
        'g_product_sku_fnsku' => ['PSKU_ID' => 'PSKU_ID'],
        'g_product_sku_supplier' => ['PSKU_ID' => 'PSKU_ID'],
        'g_product_sku_price' => ['PSKU_ID' => 'PSKU_ID'],
        'g_next_cycle' => ['PSKU_ID' => 'PSKU_ID']
    ];


    public static function addQuery(&$query, $alias)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();

        if ($str) {
            $category = Yii::$app->session->get('categoryd') ?: null;
            if ($category !== null) {
                $list = ['or'];
                foreach ($category as $i => $item) {
                    $list[] = new Expression("FIND_IN_SET(:{$i}, {$alias}.PRODUCT_TYPE_PATH)", [":{$i}" => $item]);
                }
                $query->andWhere($list);
            } else {
                $query->andWhere(['or', new Expression("FIND_IN_SET(:category, {$alias}.PRODUCT_TYPE_PATH)", [":category" => $category])]);
            }
            #组织权限
            $query->andWhere([$alias . '.ORGAN_ID_DEMAND' => Yii::$app->session->get('organization') ?: null]);
            $query->andWhere(['or', [$alias . '.ORGAN_ID_PURCHASE' => Yii::$app->session->get('organization') ?: null],
                [$alias . '.ORGAN_ID_PURCHASE' => null], [$alias . '.ORGAN_ID_PURCHASE' => '']]);
        }


    }

    //创建人
    public function getU_userinfo()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'CUSER_ID'])->alias('u');
    }

    //更新人
    public function getU_userinfos()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'UUSER_ID']);
    }

    //需求组织
    public function getG_organisation()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'ORGAN_ID_DEMAND'])->joinWith('b_channel')->alias('o');
    }

    //默认组织
    public function getG_organisationp()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'ORGAN_ID_PURCHASE'])->alias('p');
    }

    //单位
    public function getB_unit()
    {
        return $this->hasOne(BUnit::className(), ['UNIT_ID' => 'UNIT_ID']);
    }

    //通用suk
    public function getG_currency_sku()
    {
        return $this->hasOne(GCurrencySku::className(), ['CSKU_ID' => 'CSKU_ID']);
    }

    //通用SKU关联小分类
    public function getG_currency_skus()
    {
        return $this->hasOne(GCurrencySku::className(), ['CSKU_ID' => 'CSKU_ID'])->joinWith('g_product_type');
    }

    //装箱资料
    public function getG_product_sku_packing()
    {
        return $this->hasOne(GProductSkuPacking::className(), ['PSKU_ID' => 'PSKU_ID']);
    }

    //报关资料
    public function getG_product_sku_declare()
    {
        return $this->hasOne(GProductSkuDeclare::className(), ['PSKU_ID' => 'PSKU_ID']);
    }

    //UPC/EAN
    public function getG_product_sku_upc()
    {
        return $this->hasMany(GProductSkuUpc::className(), ['PSKU_ID' => 'PSKU_ID']);
    }

    //映射表(过滤了删除状态的数据)
    public function getG_product_sku_fnsku()
    {
        return $this->hasMany(GProductSkuFnsku::className(), ['PSKU_ID' => 'PSKU_ID'])->joinWith(["b_channel", 'b_account']);
    }

    //映射表，查不删除数据
    public function getG_product_sku_fnsku1()
    {
        return $this->hasMany(GProductSkuFnsku::className(), ['PSKU_ID' => 'PSKU_ID']);
    }

    //采购记录不

    //供应商
    public function getG_product_sku_supplier()
    {
        return $this->hasMany(GProductSkuSupplier::className(), ['PSKU_ID' => 'PSKU_ID'])->joinWith(['pa_partner']);
    }

    //采购价格
    public function getG_product_sku_price()
    {
        return $this->hasMany(GProductSkuPurchasingPrice::className(), ['PSKU_ID' => 'PSKU_ID']);
    }

    //下单周期
    public function getG_next_cycle()
    {
        return $this->hasOne(GNextCycle::className(), ['PSKU_ID' => 'PSKU_ID']);
    }


    /**
     * 产品SKU查询的操作
     * before_AIndex 查询前
     * after_AIndex 查询后
     */
    public function before_AIndex($body, $class = null)
    {
        if ($goodsType = ArrayHelper::remove($body, 'goodsType')) {
            $val = GProductType::find()->select(['PRODUCT_TYPE_ID'])->andFilterWhere(['or', ['like', 'SYSTEM_NAME_CN', $goodsType], ['like', 'SYSTEM_NAMER_CN', $goodsType], ['like', 'SYSTEM_NAME_EN', $goodsType], ['like', 'SYSTEM_NAMER_EN', $goodsType]])->asArray()->all();
            //相关分类信息
            if (count($val) > 0) {
                if (count($val) > 1) {
                    foreach ($val as $index => $items) {
                        $body['andFilterWhere'][] = new Expression("FIND_IN_SET(:{$index}, g_product_sku.PRODUCT_TYPE_PATH)", [":{$index}" => $items['PRODUCT_TYPE_ID']]);
                    }
                } else {
                    $body['andFilterWhere'][] = new Expression("FIND_IN_SET(:category, g_product_sku.PRODUCT_TYPE_PATH)", [":category" => $val[0]['PRODUCT_TYPE_ID']]);
                }

            }
        }
        return parent::before_AIndex($body); // TODO: Change the autogenerated stub
    }

    /**
     * 产品SKU查询的操作
     * before_AIndex 查询前
     * after_AIndex 查询后
     */
    public function after_AIndex($body, $class = null)
    {
        $conten = [];
        foreach ($body as $index => $item) {
            $conten[$index] = [];
            $Types = "";
            $Types1 = "";
            //拆分分类
            $array = explode(',', $item['PRODUCT_TYPE_PATH']);
            $area1 = (new Query())->from('g_product_type')->where(['PRODUCT_TYPE_ID' => $array[0]])->all();
            $area2 = (new Query())->from('g_product_type')->where(['PRODUCT_TYPE_ID' => $array[1]])->all();
            $conten[$index] = $item;
            if ($area1) {
                $Types = $area1[0];
            }
            if ($area2) {
                $Types1 = $area2[0];
            }
            $conten[$index]['bigType'] = $Types;
            $conten[$index]['smallType'] = $Types1;
        }
        return parent::after_AIndex($conten); //TODO: Change the autogenerated stub
    }

    /**
     * 产品SKU新增的操作
     * before_ACreate 新增前
     * after_ACreate 新增后
     */

    public function before_ACreate($body, $class = null)
    {
        $respone = new ResponeModel();

        // 判断SKU是否为空
        $this->load($body, '');
        Yii::$app->BaseHelper->validate($this);

        // 查询数据库表，判断SKU是否是唯一性
        $SKUDB = (new Query())->from('g_product_sku')
            ->where(['PSKU_CODE' => $body['PSKU_CODE'], 'ORGAN_ID_DEMAND' => $body['ORGAN_ID_DEMAND'], 'CSKU_ID' => $body['CSKU_ID']])
            ->exists();

        if ($SKUDB) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "The SKU or Chinese name has been repeated. Please do not submit it again!"), [$body])];
        }
        //在同一个国家新建两个通用SKU一样的产品。
        $SKUDBT = (new Query())->from('g_product_sku')
            ->where(['ORGAN_ID_DEMAND' => $body['ORGAN_ID_DEMAND'], 'CSKU_ID' => $body['CSKU_ID']])
            ->exists();
        if ($SKUDBT) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "Each generic SKU can only have one product number in each country of need!"), [$body])];
        }
        return [$this::ACTION_NEXT, $body];
    }

    public function after_ACreate($body, $class = null)
    {
        Yii::$app->rpc->create('users')->sendAndrecv([['\addons\users\modellogic\usersLogic', 'getUserCheck'], []]);
        return parent::after_ACreate($body, $class); // TODO: Change the autogenerated stub
    }

    /**
     * 产品SKU修改的操作
     * before_AUpdate 修改前
     * after_AUpdate 修改后
     */
    public function before_AUpdate($body, $class = null)
    {
        $respone = new ResponeModel();

        // 判断分类名称是否为空
        $this->load($body, '');
        Yii::$app->BaseHelper->validate($this);
        $body = ArrayHelper::merge($this->toArray(), $body);
        if (isset($body['PSKU_ID'])) {
            $Gproduct = (new Query())->from('g_product_sku')->where(['PSKU_ID' => $body['PSKU_ID']])->one();
            if ($Gproduct['PSKU_CODE'] !== $body['PSKU_CODE']) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "The SKU encoding  prohibits modification!"), [$body])];
            }
        }


        // 查询数据库表，判断是否是唯一性
        $GproductType = (new Query())->from('g_product_sku')
            ->andFilterWhere(['<>', 'PSKU_ID', ArrayHelper::getValue($body, 'PSKU_ID')])->andWhere(['PSKU_CODE' => $body['PSKU_CODE'], 'ORGAN_ID_DEMAND' => $body['ORGAN_ID_DEMAND']])
            ->exists();

        if ($GproductType) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "The SKU or Chinese name has been repeated. Please do not submit it again!"), [$body])];
        }
        $GproductTypes = (new Query())->from('g_product_sku')
            ->andFilterWhere(['<>', 'PSKU_ID', ArrayHelper::getValue($body, 'PSKU_ID')])->andWhere(['ORGAN_ID_DEMAND' => $body['ORGAN_ID_DEMAND'], 'CSKU_ID' => $body['CSKU_ID']])
            ->exists();

        if ($GproductTypes) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "Each generic SKU can only have one product number in each country of need!"), [$body])];
        }
        return [$this::ACTION_NEXT, $body];
    }

    public function after_AUpdate($body, $class = null)
    {
        Yii::$app->rpc->create('users')->sendAndrecv([['\addons\users\modellogic\usersLogic', 'getUserCheck'], []]);
        return parent::after_AUpdate($body, $class); // TODO: Change the autogenerated stub
    }

    public function after_AView($body, $class = null)
    {
        $respone = new ResponeModel();
        if (!$body) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "You do not have permissions for this SKU!"), [$body])];

        }
        return [$this::ACTION_NEXT, $body]; // TODO: Change the autogenerated stub
    }

    /**
     * 产品SKU删除的操作
     * before_ADelete 删除前
     * after_ADelete 删除后
     */
    public function before_ADelete($body, $class = null)
    {
        $respone = new ResponeModel();
        //采购计划表
        $exitData = (new Query())->from(PuPlan::tableName())->where(['=', 'PSKU_ID', $this->PSKU_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This SKU has been used by other documents and cannot be deleted!"), [$body])];
        }
        //采购订单明细表
        $exitData = (new Query())->from(PuPurchaseDetail::tableName())->where(['=', 'PSKU_ID', $this->PSKU_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This SKU has been used by other documents and cannot be deleted!"), [$body])];
        }
        //品检信息表
        $exitData = (new Query())->from(PuQctables::tableName())->where(['=', 'PSKU_ID', $this->PSKU_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This SKU has been used by other documents and cannot be deleted!"), [$body])];
        }
        //发运单表
        $exitData = (new Query())->from(ShDispatchNote::tableName())->where(['or', ['=', 'DEMANDSKU_ID', $this->PSKU_ID], ['=', 'PSKU_ID', $this->PSKU_ID]])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This SKU has been used by other documents and cannot be deleted!"), [$body])];
        }
        //发运跟踪明细表
        $exitData = (new Query())->from(ShTrackingDetail::tableName())->where(['=', 'PSKU_ID', $this->PSKU_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This SKU has been used by other documents and cannot be deleted!"), [$body])];
        }
        //调拨跟踪明细表
        $exitData = (new Query())->from(ShAllocationDetail::tableName())->where(['=', 'PSKU_ID', $this->PSKU_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This SKU has been used by other documents and cannot be deleted!"), [$body])];
        }
        //入库明细表
        $exitData = (new Query())->from(SkStorageDetail::tableName())->where(['=', 'PSKU_ID', $this->PSKU_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This SKU has been used by other documents and cannot be deleted!"), [$body])];
        }
        //出库明细表
        $exitData = (new Query())->from(SkPlacingDetail::tableName())->where(['=', 'PSKU_ID', $this->PSKU_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This SKU has been used by other documents and cannot be deleted!"), [$body])];
        }
        //库存调整单明细表
        $exitData = (new Query())->from(SkAdjustmentDetail::tableName())->where(['=', 'PSKU_ID', $this->PSKU_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This SKU has been used by other documents and cannot be deleted!"), [$body])];
        }
        //调拨单明细表
        $exitData = (new Query())->from(SkFiallocationDetail::tableName())->where(['=', 'PSKU_ID', $this->PSKU_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This SKU has been used by other documents and cannot be deleted!"), [$body])];
        }
        //调拨计划单明细表
        $exitData = (new Query())->from(SkAllocationDetail::tableName())->where(['or', ['=', 'ATPSKU_ID', $this->PSKU_ID], ['=', 'ETPSKU_ID', $this->PSKU_ID]])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This SKU has been used by other documents and cannot be deleted!"), [$body])];
        }
        //销售订单明细表
        $exitData = (new Query())->from(CrSalesOrderDetail::tableName())->where(['=', 'PSKU_ID', $this->PSKU_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This SKU has been used by other documents and cannot be deleted!"), [$body])];
        }
        //待入库表
        $exitData = (new Query())->from(SkPendingStorage::tableName())->where(['=', 'PSKU_ID', $this->PSKU_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This SKU has been used by other documents and cannot be deleted!"), [$body])];
        }
        //待出库表
        $exitData = (new Query())->from(SkPendingDelivery::tableName())->where(['=', 'PSKU_ID', $this->PSKU_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This SKU has been used by other documents and cannot be deleted!"), [$body])];
        }
        //SKU映射表
        $exitData = (new Query())->from(GProductSkuFnsku::tableName())->where(['=', 'PSKU_ID', $this->PSKU_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This SKU has been used by other documents and cannot be deleted!"), [$body])];
        }
        /*//改变映射表表对应的删除状态
        GProductSkuFnsku::deleteAll(['PRODUCT_SKU_CODE' => 'PSKU_CODE']);*/
        return [$this::ACTION_NEXT, $body];
    }

    public function after_ADelete($body, $class = null)
    {
        Yii::$app->rpc->create('users')->sendAndrecv([['\addons\users\modellogic\usersLogic', 'getUserCheck'], []]);
        return parent::after_ADelete($body, $class); // TODO: Change the autogenerated stub
    }

}
