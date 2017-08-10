<?php

namespace addons\inventory\models;

use addons\purchase\models\PuPurchaseDetail;
use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\helpers\ArrayHelper;

use addons\organization\models\OOrganisation;
use addons\master\basics\models\BWarehouse;
use addons\users\models\UUserInfo;
use addons\master\basics\models\BUnit;
use addons\master\product\models\GProductSku;


/**
 * @SWG\Definition(
 *   definition="SkStorageDetail",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="STORAGE_DETAIL_ID", type="integer",description="入库明细ID"),
 *           @SWG\Property(property="STORAGE_ID",type="integer",description="入库单号ID"),
 *           @SWG\Property(property="STORAGE_CD", type="string",description="入库单号"),
 *           @SWG\Property(property="RED_STORAGE_CD", type="string",description="红字入库单号"),
 *           @SWG\Property(property="RED_STORAGE_DETAIL_ID", type="integer",description="红字入库单明细ID"),
 *           @SWG\Property(property="PU_ORDER_CD", type="string",description="采购订单单号"),
 *           @SWG\Property(property="PURCHASE_DETAIL_ID", type="integer",description="采购订单明细id"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="PSKU_CODE", type="string",description="SKU编码"),
 *           @SWG\Property(property="PSKU_NAME_CN", type="string",description="产品名称"),
 *           @SWG\Property(property="STORAGE_DNUMBER",type="integer",description="数量"),
 *           @SWG\Property(property="UNIT_PRICE", type="double",description="单价"),
 *           @SWG\Property(property="STORAGE_DMONEY", type="double",description="金额"),
 *           @SWG\Property(property="TAX_RATE", type="double",description="税率"),
 *           @SWG\Property(property="NOT_TAX_UNITPRICE", type="double",description="不含税单价"),
 *           @SWG\Property(property="NOT_TAX_AMOUNT", type="double",description="不含税总金额"),
 *           @SWG\Property(property="STORAGE_AT", type="integer",format="int32",description="入库日期"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="制单日期"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="更新时间"),
 *           @SWG\Property(property="UNIT_ID",  type="integer",description="单位ID"),
 *           @SWG\Property(property="SWAREHOUSE_ID",  type="integer",description="入库仓库"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class SkStorageDetail extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_storage_detail';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['STORAGE_ID', 'PURCHASE_DETAIL_ID', 'STORAGE_DNUMBER'], 'required'],
            [['PSKU_ID', 'STORAGE_ID', 'STORAGE_DNUMBER', 'STORAGE_AT', 'CREATED_AT', 'UPDATED_AT', 'PURCHASE_DETAIL_ID',
                'RED_STORAGE_DETAIL_ID', 'UNIT_ID', 'SWAREHOUSE_ID', 'UUSER_ID', 'UUSER_ID'], 'integer'],
            [['UNIT_PRICE', 'TAX_RATE', 'NOT_TAX_UNITPRICE', 'NOT_TAX_AMOUNT'], 'number'],
            [['STORAGE_DMONEY'], 'number', 'max' => 99999999],
            [['STORAGE_CD', 'PU_ORDER_CD', 'RED_STORAGE_CD'], 'string', 'max' => 30],
            [['PSKU_CODE'], 'string', 'max' => 20],
            [['PSKU_NAME_CN'], 'string', 'max' => 128],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'STORAGE_DETAIL_ID' => Yii::t('inventory', '入库明细ID'),
            'STORAGE_ID' => Yii::t('inventory', '入库单号ID'),
            'RED_STORAGE_CD' => Yii::t('inventory', '红字入库单号'),
            'RED_STORAGE_DETAIL_ID' => Yii::t('inventory', '红字入库单明细ID'),
            'STORAGE_CD' => Yii::t('inventory', '入库单号'),
            'PU_ORDER_CD' => Yii::t('inventory', '采购订单单号'),
            'PURCHASE_DETAIL_ID' => Yii::t('inventory', '采购订单明细id'),
            'PSKU_ID' => Yii::t('inventory', 'SKU ID'),
            'PSKU_CODE' => Yii::t('inventory', 'SKU编码'),
            'PSKU_NAME_CN' => Yii::t('inventory', '产品名称'),
            'STORAGE_DNUMBER' => Yii::t('inventory', '数量'),
            'UNIT_PRICE' => Yii::t('inventory', '含税单价'),
            'STORAGE_DMONEY' => Yii::t('inventory', '含税总金额'),
            'TAX_RATE' => Yii::t('inventory', '税率'),
            'NOT_TAX_UNITPRICE' => Yii::t('inventory', '不含税单价'),
            'NOT_TAX_AMOUNT' => Yii::t('inventory', '不含税金额'),
            'STORAGE_AT' => Yii::t('inventory', '入库日期'),
            'CREATED_AT' => Yii::t('inventory', '制单日期'),
            'UPDATED_AT' => Yii::t('inventory', '更新时间'),
            'UNIT_ID' => Yii::t('inventory', '单位ID'),
            'SWAREHOUSE_ID' => Yii::t('inventory', '入库仓库'),
            'UUSER_ID' => Yii::t('inventory', '更新人ID'),
            'CUSER_ID' => Yii::t('inventory', '创建人ID'),
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

    public static function addQuery(&$query, $alias)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            #组织权限
            $query->andWhere([$alias . '.PSKU_ID' => Yii::$app->session->get('product_id') ?: null]);
        }
    }

    //入库单
    public function getSk_storage()
    {
        return $this->hasOne(SkStorage::className(), ['STORAGE_ID' => 'STORAGE_ID']);
    }

    //红字入库单明细
    public function getRed_storage_detail()
    {
        return $this->hasMany(SkStorageDetail::className(), ['STORAGE_DETAIL_ID' => 'RED_STORAGE_DETAIL_ID'])->alias('redstorage');
    }

    //仓库
    public function getB_warehouse()
    {
        return $this->hasMany(BWarehouse::className(), ['WAREHOUSE_ID' => 'SWAREHOUSE_ID']);
    }

    //创建人
    public function getU_userinfoc()
    {
        return $this->hasOne(static::className(), ['USER_INFO_ID' => 'CUSER_ID'])->alias('c');
    }

    //更新人
    public function getU_userinfou()
    {
        return $this->hasOne(static::className(), ['USER_INFO_ID' => 'UUSER_ID'])->alias('u');
    }

    //单位
    public function getB_unit()
    {
        return $this->hasOne(BUnit::className(), ['UNIT_ID' => 'UNIT_ID']);
    }

    //SKU
    public function getG_product_sku()
    {
        return $this->hasOne(GProductSku::className(), ['PSKU_ID' => 'PSKU_ID']);
    }

    /**
     * 新增的操作
     * before_ACreate 新增前
     * after_ACreate 新增后
     */

    public function after_ACreate($body, $class = null)
    {
        $respone = new ResponeModel();

        #发运单id存在则
        if (isset($body['DISPATCH_NOTE_ID'])) {

            $set = [];

            if ($body['ORDER_TYPE'] == '1') {
                $set = array('PURCHASING_WAREHOUSING_ID' => $this->STORAGE_DETAIL_ID, 'PURCHASING_WAREHOUSING_CD' => $this->STORAGE_CD);
            }
            if ($body['ORDER_TYPE'] == '2') {
                $set = array('INTERNAL_PURCHASINGST_ID' => $this->STORAGE_DETAIL_ID, 'INTERNAL_PURCHASINGST_CD' => $this->STORAGE_CD);
            }

            $where = array('DISPATCH_NOTE_ID' => $body['DISPATCH_NOTE_ID']);
            Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\dispatchLogic', 'addDispatchNote'], [$set, $where]]);

        }

        //TODO 入库的数量不能大于采购订单可用数量或者入库单可用数量
        if (isset($body['PURCHASE_DETAIL_ID'])) {
            if (isset($body['RED_STORAGE_DETAIL_ID']) && $body['RED_STORAGE_DETAIL_ID'] != null) {
                $mSkStorageDetail = SkStorageDetail::find()->where(['STORAGE_DETAIL_ID' => $body['RED_STORAGE_DETAIL_ID']])->asArray()->one();
                if ($mSkStorageDetail) {
                    $mRedSkStorageDetailList = self::find()
                        ->where(['RED_STORAGE_DETAIL_ID' => $mSkStorageDetail['STORAGE_DETAIL_ID']])
                        ->asArray()->all();
                    $total = $mSkStorageDetail['STORAGE_DNUMBER'];
                    foreach ($mRedSkStorageDetailList as $key => $value) {
                        $mSkStorage = SkStorage::find()->where(['STORAGE_ID' => $value['STORAGE_ID']])->asArray()->one();
                        if ($mSkStorage['ORDER_STATE'] == 2) {
                            $total += (int)$value['STORAGE_DNUMBER'];
                        }
                    }
                    if ($body['STORAGE_DNUMBER'] + $total < 0) {
                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "Storage order {STORAGE_CD} only can red storage {NUMBER} !", ['STORAGE_CD' => $mSkStorageDetail['STORAGE_CD'], 'NUMBER' => $total]), [])];
                    }
                } else {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "No find storage order!"), [])];
                }
            } else {
                $mPuPurchaseDetail = PuPurchaseDetail::find()->where(['PURCHASE_DETAIL_ID' => $body['PURCHASE_DETAIL_ID']])->one();
                if ($mPuPurchaseDetail) {
                    if ($body['STORAGE_DNUMBER'] > ($mPuPurchaseDetail->PURCHASE - $mPuPurchaseDetail->RGOODS_NUMBER)) {
                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "Purchase order {PURCHASE_CD} only can storage {NUMBER} !", ['PURCHASE_CD' => $mPuPurchaseDetail->PU_PURCHASE_CD, 'NUMBER' => ($mPuPurchaseDetail->PURCHASE - $mPuPurchaseDetail->RGOODS_NUMBER)]), [])];
                    }
                } else {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "No find purchase order!"), [])];
                }
            }
        }
        return [$this::ACTION_NEXT, $body];
    }

    public function before_AUpdate($body, $class = null)
    {
        $respone = new ResponeModel();
        //TODO 入库的数量不能大于采购订单可用数量或者入库单可用数量
        if (isset($body['PURCHASE_DETAIL_ID'])) {
            if (isset($body['RED_STORAGE_DETAIL_ID']) && $body['RED_STORAGE_DETAIL_ID'] != null) {
                $mSkStorageDetail = SkStorageDetail::find()->where(['STORAGE_DETAIL_ID' => $body['RED_STORAGE_DETAIL_ID']])->asArray()->one();
                if ($mSkStorageDetail) {
                    $mRedSkStorageDetailList = self::find()
                        ->where(['RED_STORAGE_DETAIL_ID' => $mSkStorageDetail['STORAGE_DETAIL_ID']])
                        ->andWhere(['<>','STORAGE_DETAIL_ID',$body['STORAGE_DETAIL_ID']])
                        ->asArray()->all();
                    $total = $mSkStorageDetail['STORAGE_DNUMBER'];
                    foreach ($mRedSkStorageDetailList as $key => $value) {
                        $mSkStorage = SkStorage::find()->where(['STORAGE_ID' => $value['STORAGE_ID']])->asArray()->one();
                        if ($mSkStorage['ORDER_STATE'] == 2) {
                            $total += (int)$value['STORAGE_DNUMBER'];
                        }
                    }
                    if ($body['STORAGE_DNUMBER'] + $total < 0) {
                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "Storage order {STORAGE_CD} only can red storage {NUMBER} !", ['STORAGE_CD' => $mSkStorageDetail['STORAGE_CD'], 'NUMBER' => $total]), [])];
                    }
                } else {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "No find storage order!"), [])];
                }
            } else {
                $mPuPurchaseDetail = PuPurchaseDetail::find()->where(['PURCHASE_DETAIL_ID' => $body['PURCHASE_DETAIL_ID']])->one();
                if ($mPuPurchaseDetail) {
                    if ($body['STORAGE_DNUMBER'] > ($mPuPurchaseDetail->PURCHASE - $mPuPurchaseDetail->RGOODS_NUMBER)) {
                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "Purchase order {PURCHASE_CD} only can storage {NUMBER} !", ['PURCHASE_CD' => $mPuPurchaseDetail->PU_PURCHASE_CD, 'NUMBER' => ($mPuPurchaseDetail->PURCHASE - $mPuPurchaseDetail->RGOODS_NUMBER)]), [])];
                    }
                } else {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "No find purchase order!"), [])];
                }
            }
        }
        return [$this::ACTION_NEXT, $body];
    }

    public function after_ADelete($body, $class = null)
    {
        $mSkStorage = SkStorage::find()->where(['STORAGE_ID' => $this->STORAGE_ID])->one();
        if ($mSkStorage) {
            $mSkStorage->STORAGE_MONEY -= $this->STORAGE_DMONEY;
            $mSkStorage->save();
        }
    }

}
