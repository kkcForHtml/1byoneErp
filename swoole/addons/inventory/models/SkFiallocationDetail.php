<?php

namespace addons\inventory\models;

use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use yii\behaviors\AttributeBehavior;
use \yii\swoole\db\ActiveRecord;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\helpers\ArrayHelper;

use addons\organization\models\OOrganisation;
use addons\master\basics\models\BWarehouse;
use addons\master\partint\models\PaPartner;
use addons\inventory\models\SkFiallocation;
use addons\users\models\UUserInfo;
use addons\master\basics\models\BUnit;
use addons\master\product\models\GProductSku;

/**
 * @SWG\Definition(
 *   definition="SkFiallocationDetail",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="FIALLOCATION_DETAIL_ID", type="integer",description="调拨单明细ID"),
 *           @SWG\Property(property="FIALLOCATION_ID",type="integer",format="int32",description="调拨单ID"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="ATSKU_CODE", type="string",description="SKU"),
 *           @SWG\Property(property="TDRODUCT_DE", type="string",description="产品说明"),
 *           @SWG\Property(property="ALLOCATION_NUMBER", type="string",description="调拨数量"),
 *           @SWG\Property(property="ATWAREHOUSE_CODE", type="string",description="调入仓库"),
 *           @SWG\Property(property="ETWAREHOUSE_CODE",type="string",description="调出仓库"),
 *           @SWG\Property(property="ALLOCATION_REMARKS", type="string",description="备注"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="制单日期"),
 *           @SWG\Property(property="CUSER_CODE",type="string",description="制单人"),
 *           @SWG\Property(property="UUSER_CODE",type="string",description="更新人"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="更新时间"),
 *           @SWG\Property(property="UNIT_ID",  type="integer",description="单位ID"),
 *           @SWG\Property(property="ATWAREHOUSE_ID",  type="integer",description="调入仓库"),
 *           @SWG\Property(property="ETWAREHOUSE_ID",  type="integer",description="调出仓库"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class SkFiallocationDetail extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_fiallocation_detail';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PSKU_ID', 'ATSKU_CODE', 'UNIT_ID'], 'required'],
            [['PSKU_ID', 'FIALLOCATION_ID', 'ALLOCATION_NUMBER', 'CREATED_AT', 'UPDATED_AT', 'UNIT_ID', 'ATWAREHOUSE_ID', 'ETWAREHOUSE_ID', 'UUSER_ID', 'CUSER_ID'], 'integer'],
            [['ATSKU_CODE'], 'string', 'max' => 20],
            [['TDRODUCT_DE', 'ALLOCATION_REMARKS'], 'string', 'max' => 255]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'FIALLOCATION_DETAIL_ID' => Yii::t('inventory', '调拨单明细ID'),
            'FIALLOCATION_ID' => Yii::t('inventory', '调拨单ID'),
            'PSKU_ID' => Yii::t('inventory', 'SKU ID'),
            'ATSKU_CODE' => Yii::t('inventory', 'SKU'),
            'TDRODUCT_DE' => Yii::t('inventory', '产品说明'),
            'ALLOCATION_NUMBER' => Yii::t('inventory', '调拨数量'),
            'ALLOCATION_REMARKS' => Yii::t('inventory', '备注'),
            'CREATED_AT' => Yii::t('inventory', '创建时间'),
            'UPDATED_AT' => Yii::t('inventory', '修改时间'),
            'UNIT_ID' => Yii::t('inventory', '单位ID'),
            'ATWAREHOUSE_ID' => Yii::t('inventory', '调入仓库'),
            'ETWAREHOUSE_ID' => Yii::t('inventory', '调出仓库'),
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

    //调拨单
    public function getSk_fiallocation()
    {
        return $this->hasOne(SkFiallocation::className(), ['FIALLOCATION_ID' => 'FIALLOCATION_ID']);
    }


    //创建人
    public function getU_userinfoc()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'CUSER_ID'])->alias('c');
    }

    //更新人
    public function getU_userinfou()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'UUSER_ID'])->alias('u');
    }

    //SKU
    public function getG_product_sku()
    {
        return $this->hasOne(GProductSku::className(), ['PSKU_ID' => 'PSKU_ID'])->select(['PSKU_ID', 'PSKU_CODE', 'PSKU_NAME_CN']);
    }

    //单位
    public function getB_unit()
    {
        return $this->hasOne(BUnit::className(), ['UNIT_ID' => 'UNIT_ID'])->select(['UNIT_ID', 'UNIT_NAME_CN']);
    }

    public function after_ACreate($body, $class = null)
    {
        #发运单id存在则 回写调拨单(在途)明细ID
        if (isset($body['DISPATCH_NOTE_ID'])) {
            $set = array('ALLOCATION_ONTHEWAY_ID' => $this->FIALLOCATION_DETAIL_ID);
            $where = array('DISPATCH_NOTE_ID' => $body['DISPATCH_NOTE_ID']);
            Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\dispatchLogic', 'addDispatchNote'], [$set, $where]]);
        }

        #发运单id存在则 回写调拨单(目的)明细ID
        if(isset($body['DISPATCH_NOTE_ID_GOAL'])){
            $set = array('ALLOCATION_GOAL_ID' => $this->FIALLOCATION_DETAIL_ID);
            $where = array('DISPATCH_NOTE_ID' => $body['DISPATCH_NOTE_ID_GOAL']);
            Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\dispatchLogic', 'addDispatchNote'], [$set, $where]]);
        }

        return parent::after_ACreate($body, $class); // TODO: Change the autogenerated stub
    }
}