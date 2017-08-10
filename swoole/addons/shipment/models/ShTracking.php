<?php

namespace addons\shipment\models;

use addons\master\basics\models\BChannel;
use addons\master\basics\models\BWarehouse;
use addons\organization\models\OOrganisation;
use addons\users\models\UUserInfo;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\swoole\db\ActiveRecord;
use Yii;

/**
 *
 * @SWG\Definition(
 *   definition="ShTracking",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="TRACKING_ID", type="integer",description="发运跟踪ID"),
 *           @SWG\Property(property="PLAN_AT",type="integer",format="int32",description="计划日期"),
 *           @SWG\Property(property="TRANSPORT_MODE", type="integer",description="运输方式1：空运  2：海运  3：龙舟海运，4：快递,5：陆运"),
 *           @SWG\Property(property="CNUMBER", type="string",description="次数"),
 *           @SWG\Property(property="DRYCONTAINER", type="string",description="柜型"),
 *           @SWG\Property(property="LOADING_AT",type="integer",format="int32",description="装柜日期"),
 *           @SWG\Property(property="ACTUAL_SHIPM_AT",type="integer",format="int32",description="实际发运日期"),
 *           @SWG\Property(property="EXPECTED_SERVICE_AT",type="integer",format="int32",description="预计送达日期"),
 *           @SWG\Property(property="ACTUAL_SERVICE_AT",type="integer",format="int32",description="实际送达日期"),
 *           @SWG\Property(property="CABINET_NO",  type="string",description="柜号"),
 *           @SWG\Property(property="TRACK_NO",  type="string",description="提单号/追踪号"),
 *           @SWG\Property(property="TOTAL_BOX",  type="double",description="总箱数"),
 *           @SWG\Property(property="TAILBOX_WEIGHT",  type="double",description="总净重(kg)"),
 *           @SWG\Property(property="TAILBOX_NETWEIGHT",  type="double",description="总毛重(kg)"),
 *           @SWG\Property(property="FREIGHT_LOMONEY_ID",  type="integer",description="发运港本地费币种"),
 *           @SWG\Property(property="FREIGHT_LOMONEY",  type="double",description="发运港本地费"),
 *           @SWG\Property(property="TRAILER_MONEY_ID",  type="integer",description="拖车费币种"),
 *           @SWG\Property(property="TRAILER_MONEY",  type="double",description="拖车费"),
 *           @SWG\Property(property="OBJECTIVE_MONEY_ID",  type="integer",description="目的港本地费币种"),
 *           @SWG\Property(property="OBJECTIVE_MONEY",  type="double",description="目的港本地费"),
 *           @SWG\Property(property="CHARGE_WEIGHT",  type="double",description="计费重"),
 *           @SWG\Property(property="UNIT_PRICE",  type="double",description="单价"),
 *           @SWG\Property(property="FREIGHT_MONEY",  type="double",description="运费"),
 *           @SWG\Property(property="DUTIEST_MONEY_ID",  type="integer",description="关税增值税币种"),
 *           @SWG\Property(property="DUTIEST_MONEY",  type="double",description="关税增值税"),
 *           @SWG\Property(property="TARIFF_BREFEREN_CODE",  type="string",description="关税账单参考编码"),
 *           @SWG\Property(property="PAYMENT_BALANCE",  type="integer",description="付款差额"),
 *           @SWG\Property(property="WINIT_WAREHOUSE",  type="string",description="Winit入库单号"),
 *           @SWG\Property(property="PLAN_EXCEPTION",  type="string",description="计划异常记录"),
 *           @SWG\Property(property="ABNORMAL_SHIPMENT",  type="string",description="发运异常记录"),
 *           @SWG\Property(property="FOREIGN_ANOMALY",  type="string",description="国外异常记录"),
 *           @SWG\Property(property="ABNORMAL_CAUSE",  type="string",description="异常原因"),
 *           @SWG\Property(property="TREATMENT_RESULT",  type="string",description="处理结果"),
 *           @SWG\Property(property="NOTE_REMARKS",  type="string",description="备注"),
 *           @SWG\Property(property="PLAN_STATE", type="integer",description="单据状态:1.已发运、2.已送达"),
 *           @SWG\Property(property="DELETED_STATE", type="integer",description="是否删除,1：删除 0：未删除"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="ORGANISATION_ID",  type="integer",description="国家/组织"),
 *           @SWG\Property(property="CHANNEL_ID",  type="integer",description="平台ID"),
 *           @SWG\Property(property="FREIGHT_MONEY_ID",  type="integer",description="运费币种"),
 *           @SWG\Property(property="WAREHOUSE_ID",  type="integer",description="目的仓"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class ShTracking extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sh_tracking';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PLAN_AT', 'TRANSPORT_MODE', 'LOADING_AT', 'ACTUAL_SHIPM_AT', 'EXPECTED_SERVICE_AT', 'ACTUAL_SERVICE_AT', 'TOTAL_BOX', 'PLAN_STATE', 'DELETED_STATE', 'CREATED_AT', 'UPDATED_AT',
                'ORGANISATION_ID', 'CHANNEL_ID', 'FREIGHT_MONEY_ID', 'WAREHOUSE_ID', 'UUSER_ID', 'CUSER_ID', 'DUTIEST_MONEY_ID', 'OBJECTIVE_MONEY_ID', 'TRAILER_MONEY_ID', 'FREIGHT_LOMONEY_ID'], 'integer'],
            [['TAILBOX_WEIGHT', 'TAILBOX_NETWEIGHT', 'FREIGHT_LOMONEY', 'TRAILER_MONEY', 'OBJECTIVE_MONEY', 'I_WEIGH', 'CHARGE_WEIGHT', 'UNIT_PRICE', 'FREIGHT_MONEY', 'DUTIEST_MONEY', 'PAYMENT_BALANCE'], 'number'],
            [['CABINET_NO', 'TARIFF_BREFEREN_CODE', 'WINIT_WAREHOUSE', 'CNUMBER'], 'string', 'max' => 20],
            [['DRYCONTAINER'], 'string', 'max' => 10],
            [['TRACK_NO'], 'string', 'max' => 100],
            [['PLAN_EXCEPTION', 'ABNORMAL_SHIPMENT', 'FOREIGN_ANOMALY', 'ABNORMAL_CAUSE', 'TREATMENT_RESULT', 'NOTE_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'TRACKING_ID' => Yii::t('shipment', '发运跟踪ID'),
            'PLAN_AT' => Yii::t('shipment', '计划日期'),
            'TRANSPORT_MODE' => Yii::t('shipment', '运输方式1：空运  2：海运  3：龙舟海运，4：快递,5：陆运'),
            'CNUMBER' => Yii::t('shipment', '次数'),
            'DRYCONTAINER' => Yii::t('shipment', '柜型'),
            'LOADING_AT' => Yii::t('shipment', '装柜日期'),
            'ACTUAL_SHIPM_AT' => Yii::t('shipment', '实际发运日期'),
            'EXPECTED_SERVICE_AT' => Yii::t('shipment', '预计送达日期'),
            'ACTUAL_SERVICE_AT' => Yii::t('shipment', '实际送达日期'),
            'CABINET_NO' => Yii::t('shipment', '柜号'),
            'TRACK_NO' => Yii::t('shipment', '提单号/追踪号'),
            'TOTAL_BOX' => Yii::t('shipment', '总箱数'),
            'TAILBOX_WEIGHT' => Yii::t('shipment', '总净重(kg)'),
            'TAILBOX_NETWEIGHT' => Yii::t('shipment', '总毛重(kg)'),
            'FREIGHT_LOMONEY_ID' => Yii::t('shipment', '发运港本地费币种'),
            'FREIGHT_LOMONEY' => Yii::t('shipment', '发运港本地费'),
            'TRAILER_MONEY_ID' => Yii::t('shipment', '拖车费币种'),
            'TRAILER_MONEY' => Yii::t('shipment', '拖车费'),
            'OBJECTIVE_MONEY_ID' => Yii::t('shipment', '目的港本地费币种'),
            'OBJECTIVE_MONEY' => Yii::t('shipment', '目的港本地费'),
            'I_WEIGH' => Yii::t('shipment', '我司测重'),
            'CHARGE_WEIGHT' => Yii::t('shipment', '计费重'),
            'UNIT_PRICE' => Yii::t('shipment', '单价'),
            'FREIGHT_MONEY' => Yii::t('shipment', '运费'),
            'DUTIEST_MONEY_ID' => Yii::t('shipment', '关税增值税币种'),
            'DUTIEST_MONEY' => Yii::t('shipment', '关税增值税'),
            'TARIFF_BREFEREN_CODE' => Yii::t('shipment', '关税账单参考编码'),
            'PAYMENT_BALANCE' => Yii::t('shipment', '付款差额'),
            'WINIT_WAREHOUSE' => Yii::t('shipment', 'Winit入库单号'),
            'PLAN_EXCEPTION' => Yii::t('shipment', '计划异常记录'),
            'ABNORMAL_SHIPMENT' => Yii::t('shipment', '发运异常记录'),
            'FOREIGN_ANOMALY' => Yii::t('shipment', '国外异常记录'),
            'ABNORMAL_CAUSE' => Yii::t('shipment', '异常原因'),
            'TREATMENT_RESULT' => Yii::t('shipment', '处理结果'),
            'NOTE_REMARKS' => Yii::t('shipment', '备注'),
            'PLAN_STATE' => Yii::t('shipment', '单据状态:1.已发运、2.已送达'),
            'DELETED_STATE' => Yii::t('shipment', '是否删除1：删除 0：未删除'),
            'CREATED_AT' => Yii::t('shipment', '制单日期'),
            'UPDATED_AT' => Yii::t('shipment', '更新时间'),
            'ORGANISATION_ID' => Yii::t('shipment', '国家/组织'),
            'CHANNEL_ID' => Yii::t('shipment', '平台ID'),
            'FREIGHT_MONEY_ID' => Yii::t('shipment', '运费币种'),
            'WAREHOUSE_ID' => Yii::t('shipment', '目的仓'),
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
            $query->andWhere([$alias . '.ORGANISATION_ID' => Yii::$app->session->get('organization') ?: null]);
        }
    }

    public $realation = ['sh_tracking_detail' => ['TRACKING_ID' => 'TRACKING_ID']];

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

    //物流跟踪明细
    public function getSh_tracking_detail()
    {
        return $this->hasMany(ShTrackingDetail::className(), ['TRACKING_ID' => 'TRACKING_ID']);
    }

    //国家/组织
    public function getO_organisation()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'ORGANISATION_ID'])->select(['ORGANISATION_ID', 'ORGANISATION_NAME_CN']);
    }

    //平台
    public function getB_channel()
    {
        return $this->hasOne(BChannel::className(), ['CHANNEL_ID' => 'CHANNEL_ID'])->select(['CHANNEL_ID', 'CHANNEL_NAME_CN']);
    }

    //仓库
    public function getB_warehouse()
    {
        return $this->hasOne(BWarehouse::className(), ['WAREHOUSE_ID' => 'WAREHOUSE_ID'])->select(['WAREHOUSE_ID', 'WAREHOUSE_NAME_CN']);
    }


}
