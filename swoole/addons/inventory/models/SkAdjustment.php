<?php

namespace addons\inventory\models;

use yii\swoole\db\ActiveRecord;
use Yii;

use addons\organization\models\OOrganisation;
use addons\master\basics\models\BWarehouse;
use addons\inventory\models\SkAdjustmentDetail;
use addons\users\models\UUserInfo;
use yii\behaviors\TimestampBehavior;
use yii\behaviors\AttributeBehavior;
use yii\swoole\behaviors\CustomBehaviors;
use yii\swoole\behaviors\OperatorBehaviors;

/**
 * @SWG\Definition(
 *   definition="SkAdjustment",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="ADJUSTMENT_ID", type="integer",description="库存调整单ID"),
 *           @SWG\Property(property="ADJUSTMENT_CD", type="string",description="调整单号"),
 *           @SWG\Property(property="ADJUSTMENT_AT", type="integer",format="int32",description="调整日期"),
 *           @SWG\Property(property="ADJUSTMENT_REASON", type="integer",description="调整原因"),
 *           @SWG\Property(property="PLAN_STATE",type="integer",format="int32",description="审核状态,1：未审核 2：已审核"),
 *           @SWG\Property(property="ADJUSTMENT_REMARKS", type="string",description="备注"),
 *           @SWG\Property(property="AUTITO_AT",type="integer",format="int32",description="审核时间"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="制单日期"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="更新时间"),
 *           @SWG\Property(property="CLOSING_STATE",type="integer",format="int32",description="是否关账，0：未关账 1：已关账"),
 *           @SWG\Property(property="PENDING_STORAGE_ID",type="integer",format="int32",description="待入库ID,收货差异关联"),
 *           @SWG\Property(property="SYSTEM_GENERATION",type="integer",format="int32",description="是否系统生成,0:否 1：是"),
 *           @SWG\Property(property="PRGANISATION_ID",  type="integer",description="组织"),
 *           @SWG\Property(property="AWAREHOUSE_ID",  type="integer",description="调整仓库"),
 *           @SWG\Property(property="AUTITO_ID",  type="integer",description="审核人ID"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class SkAdjustment extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_adjustment';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ADJUSTMENT_REASON', 'ADJUSTMENT_AT'], 'required'],
            [['SYSTEM_GENERATION', 'ADJUSTMENT_REASON', 'ADJUSTMENT_AT', 'PLAN_STATE', 'AUTITO_AT', 'CREATED_AT', 'UPDATED_AT', 'CLOSING_STATE',
                'PRGANISATION_ID', 'AWAREHOUSE_ID', 'AUTITO_ID', 'UUSER_ID', 'CUSER_ID','PENDING_STORAGE_ID'], 'integer'],
            [['ADJUSTMENT_CD'], 'string', 'max' => 30],
            [['ADJUSTMENT_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ADJUSTMENT_ID' => Yii::t('inventory', '库存调整单ID'),
            'ADJUSTMENT_CD' => Yii::t('inventory', '调整单号'),
            'ADJUSTMENT_AT' => Yii::t('inventory', '调整日期'),
            'ADJUSTMENT_REASON' => Yii::t('inventory', '调整原因'),
            'PLAN_STATE' => Yii::t('inventory', '审核状态,1：未审核 2：已审核'),
            'ADJUSTMENT_REMARKS' => Yii::t('inventory', '备注'),
            'AUTITO_AT' => Yii::t('inventory', '审核时间'),
            'CREATED_AT' => Yii::t('inventory', '制单日期'),
            'UPDATED_AT' => Yii::t('inventory', '更新时间'),
            'CLOSING_STATE' => Yii::t('inventory', '是否关账，0：未关账 1：已关账'),
            'PENDING_STORAGE_ID' => Yii::t('inventory', '待入库ID,收货差异关联'),
            'SYSTEM_GENERATION' => Yii::t('inventory', '是否系统生成,0:否 1：是'),
            'PRGANISATION_ID' => Yii::t('inventory', '组织'),
            'AWAREHOUSE_ID' => Yii::t('inventory', '调整仓库'),
            'AUTITO_ID' => Yii::t('inventory', '审核人ID'),
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
        }
    }

    //关联添加配置()
    public $realation = ['o_organisation' => ['ORGANISATION_ID' => 'PRGANISATION_ID'], 'b_warehouse' => ['WAREHOUSE_ID' => 'AWAREHOUSE_ID'], 'sk_adjustment_detail' => ['ADJUSTMENT_ID' => 'ADJUSTMENT_ID'], 'cuser_info' => ['USER_INFO_ID' => 'CUSER_ID']];

    //出库单详细
    public function getsk_adjustment_detail()
    {
        return $this->hasMany(SkAdjustmentDetail::className(), ['ADJUSTMENT_ID' => 'ADJUSTMENT_ID']);
    }

    //组织
    public function getO_organisation()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'PRGANISATION_ID']);
    }

    //仓库
    public function getB_warehouse()
    {
        return $this->hasOne(BWarehouse::className(), ['WAREHOUSE_ID' => 'AWAREHOUSE_ID']);
    }

    //获取制单人
    public function getU_user_info()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'CUSER_ID'])->joinWith(['u_staff_info']);
    }


    /**
     * @param $post
     * @return array
     * 更新之后组装数据
     */
    public static function getParamarray($post)
    {
        $paramArray = array();
        if (isset($post['batch']) && count($post['batch']) > 0) {
            foreach ($post['batch'] as $item) {

                //如果是审核
                if (isset($item['authFlag'])) {
                    $details = SkAdjustmentDetail::find()->where(['ADJUSTMENT_ID' => $item['ADJUSTMENT_ID']])->all();
                    $paramArray = array();
                    foreach ($details as $detail) {
                        $param = array();
                        $param['WAREHOUSE_ID'] = $detail->TDAREHOUSE_ID;
                        $param['PSKU_ID'] = $detail->PSKU_ID;
                        if ($item['authFlag'] == 1 && $item['PLAN_STATE'] == 1) {
                            $param['INSTANT_NUMBER'] = $detail->TDNUMBER;
                        } else if ($item['authFlag'] == 2 && $item['PLAN_STATE'] == 0) {
                            //反审核
                            $param['INSTANT_NUMBER'] = $detail->TDNUMBER * (-1);
                        }

                        array_push($paramArray, $param);
                    }
                }
            }
        }
        return $paramArray;
    }

    /*
     * 格式化库存数据
     */
    public static function formatInventory($post)
    {
        $data = array();
        if (isset($post['batchMTC'])) {
            foreach ($post['batchMTC'] as $adjustment) {
                if (isset($adjustment['sk_adjustment_detail'])) {
                    $detials = $adjustment['sk_adjustment_detail'];
                } else {
                    $detials = SkAdjustmentDetail::find()->where(array('ADJUSTMENT_ID' => $adjustment['ADJUSTMENT_ID']))->asArray()->all();
                }
                foreach ($detials as $value) {
                    $row = array();
                    $row['ORDER_CD'] = $adjustment['ADJUSTMENT_CD'];
                    if ($adjustment['authFlag'] == 1 && $adjustment['PLAN_STATE'] == 2) {
                        $row['AUTH_FLAG'] = 1;
                        $detials['INSTANT_NUMBER'] = $value['TDNUMBER'];
                    } elseif ($adjustment['authFlag'] == 2 && $adjustment['PLAN_STATE'] == 1) {
                        $row['AUTH_FLAG'] = 0;
                        $detials['INSTANT_NUMBER'] = (-1) * $value['TDNUMBER'];
                    }
                    $detials['ORDER_CD'] = $adjustment['ADJUSTMENT_CD'];
                    $detials['WAREHOUSE_ID'] = $value['TDAREHOUSE_ID'];
                    $detials['ORGANISATION_ID'] = $adjustment['PRGANISATION_ID'];
                    $detials['NUMBERS'] = $value['TDNUMBER'];
                    $detials['ORDER_AT'] = $adjustment['ADJUSTMENT_AT'];
                    $detials['PSKU_ID'] = $value['PSKU_ID'];
                    $detials['PSKU_CODE'] = $value['TDSKU_CODE'];
                    $detials['UNITPRICE'] = $value['UNIT_PRICE'];
                    $detials['ORDER_TYPE'] = 3;

                    $row['DATA'][] = $detials;
                    $data[] = $row;
                }
            }
        }
        return $data;
    }

    public function after_AUpdate($body, $class = null)
    {
        //检测是否有关联待入库订单
        if (isset($body['authFlag'])&&isset($body['PENDING_STORAGE_ID']) && $body['PENDING_STORAGE_ID']) {
            Yii::$app->rpc->create('users')->sendAndrecv([['\addons\inventory\modellogic\AdjustmentLogic', 'checkAboutPendst'], [$body]]);
        }

        if (isset($body['batch'])) {
            foreach ($body['batch'] as $row) {
                if ($row['DELETED_STATE'] == 1) {
                    SkAdjustmentDetail::deleteAll(array('ADJUSTMENT_ID' => $row['ADJUSTMENT_ID']));
                }
            }
        }

        if(isset($body['PLAN_STATE']) && isset($body['authFlag'])){
            $adjment_data = self::formatInventory(array('batchMTC'=>array($body)));
            if($adjment_data){
                Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\instantInventoryLogic', 'skuInventory'], [new SkAdjustment(),$adjment_data]]);
            }
        }

        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 新增修改前把指定字段值写入时间戳
     */
    public function behaviors()
    {
        $post = Yii::$app->getRequest()->getBodyParams();//获取post参数
        $paramArray = self::getParamarray($post);

        return [
            [
                'class' => AttributeBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['ADJUSTMENT_CD'],
                ],
                'value' => function ($event) use ($post) {

                    return Yii::$app->rpc->create('base')->sendAndrecv([['addons\common\base\modellogic\CreateNO', 'createOrderNo'],

                        [3, $this->PRGANISATION_ID, "K", $this->ADJUSTMENT_AT]]);

                }

            ],
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
            /*
            [
                'class' => CustomBehaviors::className(),
                'afterSaveConfig' =>
                    [
                        [
                            [
                                [count($adjment_data) > 0]
                            ],
                            [
                                'inventory' =>
                                    [
                                        [['addons\\inventory\\modellogic\\instantInventoryLogic', 'skuInventory'], $adjment_data]
                                    ]
                            ],
                        ]
                    ]
            ],
            */
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
                                                'ADJUSTMENT_AT',        //关帐校验时间字段
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
