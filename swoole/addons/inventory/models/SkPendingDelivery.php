<?php

namespace addons\inventory\models;

use addons\users\models\UUserWarehouse;
use yii\swoole\db\ActiveRecord;
use Yii;

use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
use addons\organization\models\OOrganisation;
use yii\swoole\behaviors\CustomBehaviors;
use addons\master\basics\models\BWarehouse;
use addons\users\models\UUserInfo;
use \yii\swoole\rest\ResponeModel;
use addons\inventory\models\SkAllocation;

/**
 * @SWG\Definition(
 *   definition="SkPendingDelivery",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="PENDING_DELIVERY_ID", type="integer",description="待出库ID"),
 *           @SWG\Property(property="ALLOCATION_ID", type="integer",format="int32",description="调拨计划单ID"),
 *           @SWG\Property(property="ALLOCATION_DETAIL_ID", type="integer",format="int32",description="调拨计划详情ID"),
 *           @SWG\Property(property="PLAN_AT", type="integer",format="int32",description="计划调拨日期"),
 *           @SWG\Property(property="ACTUAL_AT", type="integer",format="int32",description="实际调拨日期"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="PSKU_CODE", type="string",description="SKU编码"),
 *           @SWG\Property(property="TDRODUCT_DE",type="string",description="产品描述"),
 *           @SWG\Property(property="SHIPMENT_NUMBER", type="integer",description="计划调拨数量"),
 *           @SWG\Property(property="RECEIVE_NUMBER", type="integer",description="实际调拨数量"),
 *           @SWG\Property(property="PLAN_STATE",type="integer",description="状态：0未发货，1已发货"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建日期"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="更新时间"),
 *           @SWG\Property(property="CLOSING_STATE",type="integer",format="int32",description="是否关账，0：未关账 1：已关账"),
 *           @SWG\Property(property="OUTBOUND_TYPE",type="integer",format="int32",description="出库类型 0：调拨出库 1：退货出库 2：内部交易出库")
 *           @SWG\Property(property="GOODS_REJECTED_ID",type="integer",format="int32",description="退货确认ID"),
 *           @SWG\Property(property="INSIDER_TRADING_ID",type="integer",format="int32",description="内部交易ID"),
 *           @SWG\Property(property="PURCHASING_WAREHOUSING_CD_RED",type="string",description="调出仓红字内部采购入库单"),
 *           @SWG\Property(property="INTERNAL_SALESTH_CD_RED",type="string",description="中转仓红字内部销售出库单号"),
 *           @SWG\Property(property="INTERNAL_SALES_CD",type="string",description="代采组织/调出组织内部销售订单"),
 *           @SWG\Property(property="INTERNAL_SALESTH_CD",type="string",description="代采组织/调出组织内部销售出库订单"),
 *           @SWG\Property(property="INTERNAL_PURCHASING_CD",type="string",description="调入组织内部采购订单"),
 *           @SWG\Property(property="INTERNAL_PURCHASINGST_CD",type="string",description="调入组织内部采购入库单号"),
 *           @SWG\Property(property="ALLOCATION_ONTHEWAY_CD",type="string",description="调拨单（在途）单号"),
 *           @SWG\Property(property="ALLOCATION_ID_AFTER",type="integer",description="调拨跟踪id"),
 *           @SWG\Property(property="PRGANISATION_ID",type="integer",description="组织"),
 *           @SWG\Property(property="ATWAREHOUSE_ID",  type="integer",description="调出仓库"),
 *           @SWG\Property(property="ETWAREHOUSE_ID",  type="integer",description="调入仓库"),
 *           @SWG\Property(property="HANDLER_ID",  type="integer",description="经手人"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class SkPendingDelivery extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_pending_delivery';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PSKU_ID', 'OUTBOUND_TYPE', 'GOODS_REJECTED_ID', 'INSIDER_TRADING_ID', 'ALLOCATION_ID', 'ALLOCATION_DETAIL_ID', 'PLAN_AT', 'ACTUAL_AT',
                'SHIPMENT_NUMBER', 'RECEIVE_NUMBER', 'PLAN_STATE', 'CREATED_AT', 'UPDATED_AT', 'CLOSING_STATE', 'PRGANISATION_ID', 'ATWAREHOUSE_ID', 'ETWAREHOUSE_ID', 'HANDLER_ID', 'UUSER_ID', 'CUSER_ID'], 'integer'],
            [['PSKU_CODE'], 'string', 'max' => 20],
            [['TDRODUCT_DE'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'PENDING_DELIVERY_ID' => Yii::t('inventory', '待出库ID'),
            'PRGANISATION_ID' => Yii::t('inventory', '组织'),
            'ALLOCATION_ID' => Yii::t('inventory', '调拨计划单ID'),
            'ALLOCATION_DETAIL_ID' => Yii::t('inventory', '调拨计划详情ID'),
            'PLAN_AT' => Yii::t('inventory', '计划调拨日期'),
            'ACTUAL_AT' => Yii::t('inventory', '实际调拨日期'),
            'PSKU_ID' => Yii::t('inventory', 'SKU ID'),
            'PSKU_CODE' => Yii::t('inventory', 'SKU编码'),
            'TDRODUCT_DE' => Yii::t('inventory', '产品描述'),
            'SHIPMENT_NUMBER' => Yii::t('inventory', '计划调拨数量'),
            'RECEIVE_NUMBER' => Yii::t('inventory', '实际调拨数量'),
            'ATWAREHOUSE_ID' => Yii::t('inventory', '调入仓库'),
            'ETWAREHOUSE_ID' => Yii::t('inventory', '调出仓库'),
            'PLAN_STATE' => Yii::t('inventory', '状态：0未发货，1已发货'),
            'HANDLER_ID' => Yii::t('inventory', '经手人'),
            'CREATED_AT' => Yii::t('inventory', '创建日期'),
            'CUSER_ID' => Yii::t('inventory', '创建人ID'),
            'UUSER_ID' => Yii::t('inventory', '更新人ID'),
            'UPDATED_AT' => Yii::t('inventory', '更新时间'),
            'CLOSING_STATE' => Yii::t('inventory', '是否关账，0：未关账 1：已关账'),
            'OUTBOUND_TYPE' => Yii::t('inventory', '出库类型 0：调拨出库 1：退货出库 2：内部交易出库'),
            'GOODS_REJECTED_ID' => Yii::t('inventory', '退货确认ID'),
            'INSIDER_TRADING_ID' => Yii::t('inventory', '内部交易ID'),
            'PURCHASING_WAREHOUSING_CD_RED' => Yii::t('inventory', '调出仓红字内部采购入库单'),
            'INTERNAL_SALESTH_CD_RED' => Yii::t('inventory', '中转仓红字内部销售出库单号 '),
            'INTERNAL_SALES_CD' => Yii::t('inventory', '代采组织/调出组织内部销售订单'),
            'INTERNAL_SALESTH_CD' => Yii::t('inventory', '代采组织/调出组织内部销售出库订单'),
            'INTERNAL_PURCHASING_CD' => Yii::t('inventory', '调入组织内部采购订单'),
            'INTERNAL_PURCHASINGST_CD' => Yii::t('inventory', '调入组织内部采购入库单号'),
            'ALLOCATION_ONTHEWAY_CD' => Yii::t('inventory', '调拨单（在途）单号'),
            'ALLOCATION_ID_AFTER' => Yii::t('inventory', '调拨跟踪id'),
        ];
    }

    public static function addQuery(&$query, $alias)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            #组织权限
            $query->andWhere([$alias . '.PRGANISATION_ID' => Yii::$app->session->get('organization') ?: null]);

            #品类权限
            $query->andWhere([$alias . '.PSKU_ID' => Yii::$app->session->get('product_id') ?: null]);
        }

        //判断用户是不是仓管员
        $userId = Yii::$app->user->getIdentity()->getId();

        $user_warehouse = UUserWarehouse::find()->where(array('USER_INFO_ID'=>$userId))->asArray()->all();

        if($user_warehouse){
            $warehouse = array();
            foreach($user_warehouse as $value){
                if($value['USER_WAREHOUSE_STATE'] == 1){
                    $warehouse[] = $value['WAREHOUSE_ID'];
                }
            }
            $query->andWhere(['or',[$alias . '.ATWAREHOUSE_ID' =>$warehouse],[$alias . '.ETWAREHOUSE_ID'=>$warehouse]]);
        }
    }

    //关联添加配置()
    public $realation = ['o_organisation' => ['ORGANISATION_ID' => 'PRGANISATION_ID'], 'a_warehouse' => ['WAREHOUSE_ID' => 'ATWAREHOUSE_ID'], 'e_warehouse' => ['WAREHOUSE_ID' => 'ETWAREHOUSE_ID'], 'u_user_info' => ['USER_INFO_ID' => 'HANDLER_ID'], 'allocation' => ['ALLOCATION_ID' => 'ALLOCATION_ID']];

    //关联组织
    public function getO_organisation()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'PRGANISATION_ID']);
    }

    //关联调出仓库
    public function getA_warehouse()
    {
        return $this->hasOne(BWarehouse::className(), ['WAREHOUSE_ID' => 'ATWAREHOUSE_ID']);
    }

    //关联调入仓库
    public function getE_warehouse()
    {
        return $this->hasOne(BWarehouse::className(), ['WAREHOUSE_ID' => 'ETWAREHOUSE_ID']);
    }

    //获取经手人
    public function getU_user_info()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'HANDLER_ID'])->joinWith(['u_staff_info']);
    }

    //关联调拨计划单
    public function getSk_allocation()
    {
        return $this->hasOne(SkAllocation::className(), ['ALLOCATION_ID' => 'ALLOCATION_ID']);
    }

    /**
     * @param $body
     * @param null $class
     * @return array
     * 更新之前
     */
    public function before_AUpdate($body, $class = null)
    {
        return [$this::ACTION_NEXT, $body];
    }

    /**
     * @param $body
     * @param null $class
     * @return array
     * 更新之后
     */
    public function after_AUpdate($body, $class = null)
    {
        return [$this::ACTION_NEXT, $body];
    }

    /*
     * 查询之后
     */
    public function after_AIndex($body,$class=null){

        foreach($body as &$value){
            $info = BWarehouse::find()->where(array('WAREHOUSE_ID'=>$value['ATWAREHOUSE_ID']))->asArray()->one();

            $condition['ORGANISATION_ID'] = $info['ORGANISATION_ID'];
            $condition['CHANNEL_ID'] = $info['CHANNEL_ID'];

            if($info['WAREHOUSE_TYPE_ID'] == 2)
                $condition['WAREHOUSE_TYPE_ID'] = 4;
            elseif($info['WAREHOUSE_TYPE_ID'] == 5)
                $condition['WAREHOUSE_TYPE_ID'] = 7;
            elseif($info['WAREHOUSE_TYPE_ID'] == 8)
                $condition['WAREHOUSE_TYPE_ID'] = 9;

            $value['i_warehouse'] = BWarehouse::find()->where($condition)->asArray()->one();
        }
        return [$this::ACTION_NEXT, $body];
    }


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
            ],
            [
                'class' => CustomBehaviors::className(),
                'beforeSaveConfig' =>
                    [
                        [
                            [
                                [true]
                            ],
                            [
                                'base' =>
                                    [
                                        [
                                            ['addons\common\base\modellogic\refuseLogic', 'refuse'],
                                            [
                                                'PLAN_AT',        //关帐校验时间字段
                                                'PRGANISATION_ID',//关帐校验组织编码可以写多个,用数组包装
                                                'CLOSING_STATE',//关帐标识字段
                                                ['addWhere' => []]
                                            ]
                                        ]
                                    ],
                            ]
                        ]
                    ]
            ],
        ];
    }
}
