<?php

namespace addons\inventory\models;

use addons\shipment\models\ShDispatchNote;
use addons\users\models\UUserWarehouse;
use yii\swoole\db\ActiveRecord;
use Yii;

use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
use addons\organization\models\OOrganisation;
use addons\inventory\models\SkAdjustment;
use yii\swoole\behaviors\CustomBehaviors;
use addons\master\basics\models\BWarehouse;
use addons\users\models\UUserInfo;
use \yii\swoole\rest\ResponeModel;

/**
 * @SWG\Definition(
 *   definition="SkPendingStorage",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="PENDING_DELIVERY_ID", type="integer",description="待入库ID"),
 *           @SWG\Property(property="NOTE_ID", type="integer",format="int32",description="发运单/调拨计划单ID"),
 *           @SWG\Property(property="IMPORT_STATE", type="integer",format="int32",description="数据来源1：发运单，调拨计划单"),
 *           @SWG\Property(property="PLAN_AT", type="integer",format="int32",description="预计收货日期"),
 *           @SWG\Property(property="ACTUAL_AT", type="integer",format="int32",description="实际收货日期"),
 *           @SWG\Property(property="PSKU_ID", type="integer",description="产品SKU ID"),
 *           @SWG\Property(property="PSKU_CODE", type="string",description="SKU编码"),
 *           @SWG\Property(property="TDRODUCT_DE",type="string",description="产品描述"),
 *           @SWG\Property(property="SHIPMENT_NUMBER", type="integer",description="发运数量"),
 *           @SWG\Property(property="RECEIVE_NUMBER", type="integer",description="接收数量"),
 *           @SWG\Property(property="PLAN_STATE",type="integer",description="状态：0未收货，1正在收货，2,已收货"),
 *           @SWG\Property(property="PENDING_REMARKS",type="string",description="入库差异备注"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建日期"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="更新时间"),
 *           @SWG\Property(property="CLOSING_STATE",type="integer",format="int32",description="是否关账，0：未关账 1：已关账"),
 *           @SWG\Property(property="ADJUSTMENT_NUMBER",type="integer",description="调整数量"),
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
class SkPendingStorage extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_pending_storage';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PSKU_ID', 'PENDING_STORAGE_ID', 'ADJUSTMENT_NUMBER', 'NOTE_ID', 'IMPORT_STATE', 'PLAN_AT', 'ACTUAL_AT', 'SHIPMENT_NUMBER', 'RECEIVE_NUMBER',
                'PLAN_STATE', 'CREATED_AT', 'UPDATED_AT', 'CLOSING_STATE', 'PRGANISATION_ID', 'ATWAREHOUSE_ID', 'ETWAREHOUSE_ID', 'HANDLER_ID', 'UUSER_ID', 'CUSER_ID'], 'integer'],
            [['PSKU_CODE'], 'string', 'max' => 20],
            [['TDRODUCT_DE', 'PENDING_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'PENDING_STORAGE_ID' => Yii::t('inventory', '待入库ID'),
            'NOTE_ID' => Yii::t('inventory', '发运单/调拨计划单ID'),
            'IMPORT_STATE' => Yii::t('inventory', '数据来源1：发运单，调拨计划单'),
            'PLAN_AT' => Yii::t('inventory', '预计收货日期'),
            'ACTUAL_AT' => Yii::t('inventory', '实际收货日期'),
            'PSKU_ID' => Yii::t('inventory', 'SKU ID'),
            'PSKU_CODE' => Yii::t('inventory', 'SKU编码'),
            'TDRODUCT_DE' => Yii::t('inventory', '产品描述'),
            'SHIPMENT_NUMBER' => Yii::t('inventory', '发运数量'),
            'RECEIVE_NUMBER' => Yii::t('inventory', '接收数量'),
            'PLAN_STATE' => Yii::t('inventory', '状态：0未收货，1正在收货，2,已收货'),
            'PENDING_REMARKS' => Yii::t('inventory', '入库差异备注'),
            'CREATED_AT' => Yii::t('inventory', '创建日期'),
            'UPDATED_AT' => Yii::t('inventory', '更新时间'),
            'CLOSING_STATE' => Yii::t('inventory', '是否关账，0：未关账 1：已关账'),
            'ADJUSTMENT_NUMBER' => Yii::t('inventory', '调整数量'),
            'PRGANISATION_ID' => Yii::t('inventory', '组织'),
            'ATWAREHOUSE_ID' => Yii::t('inventory', '调入仓库'),
            'ETWAREHOUSE_ID' => Yii::t('inventory', '调出仓库'),
            'HANDLER_ID' => Yii::t('inventory', '经手人'),
            'UUSER_ID' => Yii::t('inventory', '更新人ID'),
            'CUSER_ID' => Yii::t('inventory', '创建人ID'),
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
    public $realation = ['o_organisation' => ['ORGANISATION_ID' => 'PRGANISATION_ID'], 'a_warehouse' => ['WAREHOUSE_ID' => 'ATWAREHOUSE_ID'], 'e_warehouse' => ['WAREHOUSE_ID' => 'ETWAREHOUSE_ID'], 'u_user_info' => ['USER_INFO_ID' => 'HANDLER_ID']
        , 'sk_adjustment' => ['PENDING_STORAGE_ID' => 'PENDING_STORAGE_ID'], 'sk_allocation' => ['ALLOCATION_ID' => 'NOTE_ID'], 'sh_dispatch_note' => ['DISPATCH_NOTE_ID' => 'NOTE_ID']];

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

    //获取关系表
    public function getSK_pending_stroage_relation()
    {
        return $this->hasOne(SkPendingStorage::className(), ['PENDING_STORAGE_ID' => 'PENDING_STORAGE_ID']);
    }

    //关联库存调整单表
    public function getSk_adjustment()
    {
        return $this->hasMany(SkAdjustment::className(), ['PENDING_STORAGE_ID' => 'PENDING_STORAGE_ID']);
    }

    //关联调拨计划单
    public function getSk_allocation()
    {
        return $this->hasOne(SkAllocation::className(), ['ALLOCATION_ID' => 'NOTE_ID']);
    }

    //关联发运单
    public function getSh_dispatch_note()
    {
        $query=$this->hasOne(ShDispatchNote::className(), ['DISPATCH_NOTE_ID' => 'NOTE_ID']);
        $query->is_add_query=true;
        return $query;
    }


    /**
     * @param $body
     * @param null $class
     * @return array
     * 更新之前 校验
     */
    public function before_AUpdate($body, $class = null)
    {
        return [$this::ACTION_NEXT, $body];
    }

    /**
     * @param $body
     * @param null $class
     * @return array
     * 更新之后 修改状态
     */
    public function after_AUpdate($body, $class = null)
    {

        $data = $body;
        if(!isset($body['batch']) && !isset($body['batchMTC']) && isset($body['PENDING_STORAGE_ID'])){
            $info = SkPendingStorage::find()->where(array('PENDING_STORAGE_ID'=>$body['PENDING_STORAGE_ID']))->asArray()->one();

            if($info['SHIPMENT_NUMBER'] <= ($info['RECEIVE_NUMBER']+$info['ADJUSTMENT_NUMBER']) && $info['PLAN_STATE'] != 2){
                $info['PLAN_STATE'] = 2;
                SkPendingStorage::updateAll($info,array('PENDING_STORAGE_ID'=>$body['PENDING_STORAGE_ID']));
            }
        }

        return [$this::ACTION_NEXT, $body];
    }

    public function behaviors()
    {
        $post = Yii::$app->getRequest()->getBodyParams();//获取post参数
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
            /* 生成编辑的时候 不需要做校验
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
                                                'ACTUAL_AT',        //关帐校验时间字段
                                                'PRGANISATION_ID',  //关帐校验组织编码可以写多个,用数组包装
                                                'CLOSING_STATE',    //关帐标识字段
                                                ['addWhere' => []]
                                            ]
                                        ]
                                    ],
                            ]
                        ]
                    ]
            ]
            */
        ];
    }
}
