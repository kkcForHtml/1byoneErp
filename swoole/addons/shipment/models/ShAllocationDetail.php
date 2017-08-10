<?php

namespace addons\shipment\models;

use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\swoole\db\ActiveRecord;
use Yii;

/**
 *
 * @SWG\Definition(
 *   definition="ShAllocationDetail",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="ALLOCATION_DETAIL_ID", type="integer",description="调拨跟踪明细ID"),
 *           @SWG\Property(property="ALLOCATION_ID", type="integer",description="调拨跟踪ID"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="PSKU_CODE", type="string",description="SKU"),
 *           @SWG\Property(property="GOODS_DESCRIBE", type="string",description="货描"),
 *           @SWG\Property(property="SHIPMENT_NUMBER", type="integer",description="发货数量"),
 *           @SWG\Property(property="ARECIPIENT_NUM", type="integer",description="已收数量"),
 *           @SWG\Property(property="DETAIL_REMARKS",  type="string",description="备注"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="SALLOCATION_DETAIL_ID", type="integer",description="调拨计划单明细ID"),
 *           @SWG\Property(property="ADJUSTMENT_NUMBER",type="integer",description="调整数量"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class ShAllocationDetail extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sh_allocation_detail';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PSKU_ID','ALLOCATION_ID', 'SHIPMENT_NUMBER', 'ARECIPIENT_NUM', 'CREATED_AT', 'UPDATED_AT','ADJUSTMENT_NUMBER','SALLOCATION_DETAIL_ID', 'UUSER_ID', 'CUSER_ID'], 'integer'],
            [['PSKU_CODE'], 'string', 'max' => 20],
            [['GOODS_DESCRIBE', 'DETAIL_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ALLOCATION_DETAIL_ID' => Yii::t('shipment', '调拨跟踪明细ID'),
            'ALLOCATION_ID' => Yii::t('shipment', '调拨跟踪ID'),
            'PSKU_ID' => Yii::t('shipment', 'SKU ID'),
            'PSKU_CODE' => Yii::t('shipment', 'SKU编码'),
            'GOODS_DESCRIBE' => Yii::t('shipment', '货描'),
            'SHIPMENT_NUMBER' => Yii::t('shipment', '发货数量'),
            'ARECIPIENT_NUM' => Yii::t('shipment', '已收数量'),
            'DETAIL_REMARKS' => Yii::t('shipment', '备注'),
            'CREATED_AT' => Yii::t('shipment', '制单日期'),
            'UPDATED_AT' => Yii::t('shipment', '更新时间'),
            'SALLOCATION_DETAIL_ID' => Yii::t('shipment', '调拨计划单明细ID'),
            'ADJUSTMENT_NUMBER' => Yii::t('shipment', '调整数量'),
            'UUSER_ID' => Yii::t('shipment', '更新人ID'),
            'CUSER_ID' => Yii::t('shipment', '创建人ID'),
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

    public function after_ACreate($body, $class = null)
    {
        #反写 待入库调拨跟踪明细id
        if (isset($body['PENDING_STORAGE_ID'])) {
            $set = array('ALLOCATION_DETAIL_ID' => $this->ALLOCATION_DETAIL_ID);
            $where = array('PENDING_STORAGE_ID' => $body['PENDING_STORAGE_ID']);
            Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PendstorageLogic', 'updateAllPendstorage'], [$set, $where]]);
        }

        #待出库列表
        if (isset($body['PENDING_DELIVERY_ID'])) {
            $set = array('ALLOCATION_ID_AFTER' => $this->ALLOCATION_ID);
            $where = array('PENDING_DELIVERY_ID' => $body['PENDING_DELIVERY_ID']);
            Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PenddeliveryLogic', 'updateAllPenddelivery'], [$set, $where]]);
        }

        return parent::after_ACreate($body, $class);
    }

}
