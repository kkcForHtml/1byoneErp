<?php

namespace addons\shipment\models;

use addons\master\basics\models\BMoney;
use addons\master\basics\models\BWarehouse;
use addons\organization\models\OOrganisation;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\swoole\db\ActiveRecord;
use Yii;

/**
 *
 * @SWG\Definition(
 *   definition="ShAllocation",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="ALLOCATION_ID", type="integer",description="调拨跟踪ID"),
 *           @SWG\Property(property="CNUMBER", type="string",description="次数"),
 *           @SWG\Property(property="ESTIMATE_CALLOUT_AT", type="integer",description="预计调出日期"),
 *           @SWG\Property(property="ACTUAL_CALLOUT_AT",  type="integer",description="实际调出日期"),
 *           @SWG\Property(property="ESTIMATE_TRANSFER_AT",type="integer",format="int32",description="预计调入日期"),
 *           @SWG\Property(property="ACTUAL_TRANSFER_AT",  type="integer",description="实际调入日期"),
 *           @SWG\Property(property="TRACK_NO", type="string",description="追踪号"),
 *           @SWG\Property(property="LOAD_MONEY", type="double",description="装卸费"),
 *           @SWG\Property(property="FREIGHT_MONEY", type="double",description="运费"),
 *           @SWG\Property(property="INCIDEN_MONEY", type="double",description="杂费"),
 *           @SWG\Property(property="PLAN_STATE", type="integer",description="单据状态：1.已完成,2.已递送，3.未递送"),
 *           @SWG\Property(property="DELETED_STATE", type="integer",description="是否删除1：删除 0：未删除"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="制单日期"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="CLOSING_STATE",type="integer",format="int32",description="是否关账，0：未关账 1：已关账"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",description="修改时间"),
 *           @SWG\Property(property="AORGANISATION_ID", type="integer",description="组织ID"),
 *           @SWG\Property(property="CHANNEL_ID",  type="integer",description="平台ID"),
 *           @SWG\Property(property="OUT_WAREHOUSE_ID",  type="integer",description="调出仓库"),
 *           @SWG\Property(property="IN_WAREHOUSE_ID",  type="integer",description="调入仓库"),
 *           @SWG\Property(property="LOAD_MONEY_ID",  type="integer",description="装卸费币种"),
 *           @SWG\Property(property="FREIGHT_MONEY_ID",  type="integer",description="运费币种"),
 *           @SWG\Property(property="INCIDEN_MONEY_ID",  type="integer",description="杂费币种"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class ShAllocation extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sh_allocation';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ACTUAL_TRANSFER_AT', 'ESTIMATE_CALLOUT_AT', 'ACTUAL_CALLOUT_AT', 'ESTIMATE_TRANSFER_AT', 'PLAN_STATE', 'DELETED_STATE', 'CREATED_AT', 'UPDATED_AT',
                'CLOSING_STATE', 'AORGANISATION_ID', 'CHANNEL_ID', 'OUT_WAREHOUSE_ID', 'IN_WAREHOUSE_ID', 'LOAD_MONEY_ID', 'FREIGHT_MONEY_ID', 'INCIDEN_MONEY_ID', 'UUSER_ID', 'CUSER_ID'], 'integer'],
            [['LOAD_MONEY', 'FREIGHT_MONEY', 'INCIDEN_MONEY'], 'number'],
            [['CNUMBER'], 'string', 'max' => 20],
            [['TRACK_NO'], 'string', 'max' => 100],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ALLOCATION_ID' => Yii::t('shipment', '调拨跟踪ID'),
            'CNUMBER' => Yii::t('shipment', '次数'),
            'ESTIMATE_CALLOUT_AT' => Yii::t('shipment', '预计调出日期'),
            'ACTUAL_CALLOUT_AT' => Yii::t('shipment', '实际调出日期'),
            'ESTIMATE_TRANSFER_AT' => Yii::t('shipment', '预计调入日期'),
            'ACTUAL_TRANSFER_AT' => Yii::t('shipment', '实际调入日期'),
            'TRACK_NO' => Yii::t('shipment', '追踪号'),
            'LOAD_MONEY' => Yii::t('shipment', '装卸费'),
            'FREIGHT_MONEY' => Yii::t('shipment', '运费'),
            'INCIDEN_MONEY' => Yii::t('shipment', '杂费'),
            'PLAN_STATE' => Yii::t('shipment', '单据状态：1.已完成,2.已递送，3.未递送'),
            'DELETED_STATE' => Yii::t('shipment', '是否删除1：删除 0：未删除'),
            'CREATED_AT' => Yii::t('shipment', '制单日期'),
            'UPDATED_AT' => Yii::t('shipment', '更新时间'),
            'CLOSING_STATE' => Yii::t('shipment', '是否关账，0：未关账 1：已关账'),
            'AORGANISATION_ID' => Yii::t('shipment', '组织ID'),
            'CHANNEL_ID' => Yii::t('shipment', '平台ID'),
            'OUT_WAREHOUSE_ID' => Yii::t('shipment', '调出仓库'),
            'IN_WAREHOUSE_ID' => Yii::t('shipment', '调入仓库'),
            'LOAD_MONEY_ID' => Yii::t('shipment', '装卸费币种'),
            'FREIGHT_MONEY_ID' => Yii::t('shipment', '运费币种'),
            'INCIDEN_MONEY_ID' => Yii::t('shipment', '杂费币种'),
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

    public static function addQuery(&$query, $alias)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            $query->andWhere([$alias . '.AORGANISATION_ID' => Yii::$app->session->get('organization') ?: null]);
        }

    }

    public $realation = ['sh_allocation_detail' => ['ALLOCATION_ID' => 'ALLOCATION_ID']];


    //调拨跟踪明细表
    public function getSh_allocation_detail()
    {
        return $this->hasMany(ShAllocationDetail::className(), ['ALLOCATION_ID' => 'ALLOCATION_ID']);
    }

    //国家/组织
    public function getO_organisation()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'AORGANISATION_ID'])->select(['ORGANISATION_ID', 'ORGANISATION_NAME_CN']);
    }

    //调出仓库
    public function getB_warehouse_out()
    {
        return $this->hasOne(BWarehouse::className(), ['WAREHOUSE_ID' => 'OUT_WAREHOUSE_ID'])->select(['WAREHOUSE_ID', 'WAREHOUSE_NAME_CN'])->alias('out');
    }

    //调入仓库
    public function getB_warehouse_in()
    {
        return $this->hasOne(BWarehouse::className(), ['WAREHOUSE_ID' => 'IN_WAREHOUSE_ID'])->select(['WAREHOUSE_ID', 'WAREHOUSE_NAME_CN'])->alias('in');
    }

    //装卸币种
    public function getB_money_load()
    {
        return $this->hasOne(BMoney::className(), ['MONEY_ID' => 'LOAD_MONEY_ID'])->select(['MONEY_ID', 'MONEY_NAME_CN'])->alias('l');
    }

    //运费币种
    public function getB_money_freight()
    {
        return $this->hasOne(BMoney::className(), ['MONEY_ID' => 'FREIGHT_MONEY_ID'])->select(['MONEY_ID', 'MONEY_NAME_CN'])->alias('f');
    }

    //运费币种
    public function getB_money_inciden()
    {
        return $this->hasOne(BMoney::className(), ['MONEY_ID' => 'INCIDEN_MONEY_ID'])->select(['MONEY_ID', 'MONEY_NAME_CN'])->alias('i');
    }


    public function after_ACreate($body, $class = null)
    {

        return parent::after_ACreate($body, $class);
    }

}
