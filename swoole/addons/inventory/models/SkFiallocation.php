<?php

namespace addons\inventory\models;

use addons\master\product\models\GProductSkuPurchasingPrice;
use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use yii\behaviors\AttributeBehavior;
use yii\swoole\behaviors\CustomBehaviors;
use \yii\swoole\db\ActiveRecord;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\helpers\ArrayHelper;

use addons\organization\models\OOrganisation;
use addons\master\basics\models\BWarehouse;
use addons\master\partint\models\PaPartner;
use addons\inventory\models\SkFiallocationDetail;
use addons\inventory\modellogic\instantInventoryLogic;
use addons\users\models\UUserInfo;

/**
 * @SWG\Definition(
 *   definition="SkFiallocation",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="FIALLOCATION_ID", type="integer",description="调拨单ID"),
 *           @SWG\Property(property="FIALLOCATION_CD", type="string",description="调拨单号"),
 *           @SWG\Property(property="ALLOCATION_AT", type="integer",format="int32",description="调拨日期"),
 *           @SWG\Property(property="ATWAREHOUSE_CODE", type="string",description="调入仓库"),
 *           @SWG\Property(property="ETWAREHOUSE_CODE",type="string",description="调出仓库"),
 *           @SWG\Property(property="ALLOCATION_STATE", type="integer",format="int32",description="审核状态,1：未审核 2：已审核"),
 *           @SWG\Property(property="DELETED_STATE", type="integer",format="int32",description="是否删除1：删除 0：未删除"),
 *           @SWG\Property(property="ALLOCATION_REMARKS",type="string",description="备注"),
 *           @SWG\Property(property="AUTITO_CODE",type="string",description="审核人"),
 *           @SWG\Property(property="AUTITO_AT",type="integer",format="int32",description="审核时间"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="制单日期"),
 *           @SWG\Property(property="CUSER_CODE",type="integer",format="int32",description="制单人"),
 *           @SWG\Property(property="UUSER_CODE",type="integer",format="int32",description="更新人"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="更新时间"),
 *           @SWG\Property(property="SYSTEM_GENERATION",type="integer",format="int32",description="是否系统生成,0:否 1：是"),
 *           @SWG\Property(property="CLOSING_STATE",type="integer",format="int32",description="是否关账，0：未关账 1：已关账"),
 *           @SWG\Property(property="ORGANISATION_ID",type="integer",description="组织ID"),
 *           @SWG\Property(property="ATWAREHOUSE_ID",  type="integer",description="调入仓库"),
 *           @SWG\Property(property="ETWAREHOUSE_ID",  type="integer",description="调出仓库"),
 *           @SWG\Property(property="AUTITO_ID",  type="integer",description="审核人ID"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class SkFiallocation extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_fiallocation';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ORGANISATION_ID','ATWAREHOUSE_ID','ETWAREHOUSE_ID','ALLOCATION_AT'],'required'],
            [['SYSTEM_GENERATION','ALLOCATION_AT','ALLOCATION_STATE','DELETED_STATE','CREATED_AT','UPDATED_AT','AUTITO_AT','CLOSING_STATE','ORGANISATION_ID','ATWAREHOUSE_ID','ETWAREHOUSE_ID','AUTITO_ID','UUSER_ID','CUSER_ID'],'integer'],
            [['FIALLOCATION_CD'],'string','max' => 30],
            [['ALLOCATION_REMARKS'],'string','max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'FIALLOCATION_ID' => Yii::t('inventory', '调拨单ID'),
            'FIALLOCATION_CD' => Yii::t('inventory', '调拨单号'),
            'ALLOCATION_AT' => Yii::t('inventory', '调拨日期'),
            'ALLOCATION_STATE' => Yii::t('inventory', '审核状态,1：未审核 2：已审核'),
            'DELETED_STATE' => Yii::t('inventory', '是否删除,1：删除 0：未删除'),
            'ALLOCATION_REMARKS' => Yii::t('inventory', '备注'),
            'CREATED_AT' => Yii::t('inventory', '创建时间'),
            'UPDATED_AT' => Yii::t('inventory', '修改时间'),
            'AUTITO_AT' => Yii::t('inventory', '审核时间'),
            'SYSTEM_GENERATION' => Yii::t('inventory', '是否系统生成,0:否 1：是'),
            'CLOSING_STATE' => Yii::t('inventory', '是否关账，0：未关账 1：已关账'),
            'ORGANISATION_ID' => Yii::t('inventory', '组织ID'),
            'ATWAREHOUSE_ID' => Yii::t('inventory', '调入仓库'),
            'ETWAREHOUSE_ID' => Yii::t('inventory', '调出仓库'),
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
            $query->andWhere([$alias . '.ORGANISATION_ID' => Yii::$app->session->get('organization') ?: null]);
        }
    }

    /**
     * 新增修改前把指定字段值写入时间戳
     */
    public function behaviors()
    {
        $post = Yii::$app->getRequest()->getBodyParams();//获取post参数
        $paramArray = static::getParamarray($post);
        return [
            [
                'class' => AttributeBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['FIALLOCATION_CD'],
                ],
                'value' => function ($event) use ($post) {
                    return Yii::$app->rpc->create('base')->sendAndrecv(
                        [
                            ['addons\common\base\modellogic\CreateNO','createOrderNo'],[6,$this->ORGANISATION_ID,"MV",$this->ALLOCATION_AT]
                        ]
                    );
                }
            ],
            [
                'class' => TimestampBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CREATED_AT','UPDATED_AT'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UPDATED_AT'],
                ],
            ],
            [
                'class' => OperatorBehaviors::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CUSER_ID','UUSER_ID'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UUSER_ID'],
                ],
            ],
            [
                'class' => CustomBehaviors::className(),
                'afterSaveConfig' => [
                    [
                        [
                            [count($paramArray) > 0]
                        ],
                        [
                            'inventory' => [
                                [
                                    ['addons\\inventory\\modellogic\\instantInventoryLogic', 'skuInventory'],//暂时直接调用。不加入队列
                                    $paramArray
                                ]
                            ]
                        ]
                    ]
                ]
            ],
            [
                'class' => CustomBehaviors::className(),
                'beforeSaveConfig' => [
                    [
                        [
                            [TRUE]
                        ],
                        [
                            'base' => [
                                [
                                    ['addons\common\base\modellogic\refuseLogic', 'refuse'],
                                    [
                                        'ALLOCATION_AT',
                                        'ORGANISATION_ID',
                                        'CLOSING_STATE',
                                        ['andWhere' => []]
                                    ]
                                ]
                            ]
                        ]
                    ]
                ],
            ]
        ];
    }

    //关联添加配置()
    public $realation = ['sk_fiallocation_detail' => ['FIALLOCATION_ID' => 'FIALLOCATION_ID']];

    //调拨单单详细
    public function getSk_fiallocation_detail()
    {
        return $this->hasMany(SkFiallocationDetail::className(), ['FIALLOCATION_ID' => 'FIALLOCATION_ID'])->joinWith(['b_unit','g_product_sku']);
    }

    //调拨组织
    public function getO_organisation()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'ORGANISATION_ID'])->select(['ORGANISATION_ID','ORGANISATION_NAME_CN']);
    }

    //调入仓库
    public function getB_warehouse_a()
    {
        return $this->hasOne(BWarehouse::className(), ['WAREHOUSE_ID' => 'ATWAREHOUSE_ID'])->alias('wara')->select(['WAREHOUSE_ID','WAREHOUSE_NAME_CN']);
    }

    //调出仓库
    public function getB_warehouse_e()
    {
        return $this->hasOne(BWarehouse::className(), ['WAREHOUSE_ID' => 'ETWAREHOUSE_ID'])->alias('ware')->select(['WAREHOUSE_ID','WAREHOUSE_NAME_CN']);
    }

    //创建人
    public function getU_userinfoc()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'CUSER_ID'])->alias('c')->joinWith(['u_staff_info']);
    }

    //更新人
    public function getU_userinfou()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'UUSER_ID'])->alias('u');
    }

    //审核人
    public function getU_userinfo_a()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'AUTITO_ID'])->alias('a')->select(['a.USER_INFO_ID','a.STAFF_ID']);
    }

    /**
     * 新增前的操作
     * @param      $body
     * @param null $class
     * @return array
     */
    public function before_ACreate($body, $class = NULL)
    {
        $response = new ResponeModel();
        if (!isset($body['ORGANISATION_ID']) || !isset($body['ALLOCATION_AT'])) {
            return [static::ACTION_RETURN,$response->setModel(500, 0, Yii::t('inventory', 'New parameters are incomplete, new additions are not allowed!'), [$body])];
        }
        $body['DELETED_STATE'] = 0;
        $body['CLOSING_STATE'] = 0;
        $body['ALLOCATION_STATE'] = 1;
        $this->load($body, '');
        Yii::$app->BaseHelper->validate($this);
        return [$this::ACTION_NEXT,$body];
    }

    /**
     * 新增后的操作
     * @param      $body
     * @param null $class
     * @return array
     */
    public function after_ACreate($body, $class = NULL)
    {
        #发运单id存在则 回写调拨单(在途)明细ID
        if (isset($body['DISPATCH_NOTE_ID'])) {
            $set = array('ALLOCATION_ONTHEWAY_CD' => $this->FIALLOCATION_CD);
            $where = array('DISPATCH_NOTE_ID' => $body['DISPATCH_NOTE_ID']);
            Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\dispatchLogic', 'addDispatchNote'], [$set, $where]]);
        }

        #发运单id存在则 回写调拨单(目的)明细ID
        if(isset($body['DISPATCH_NOTE_ID_GOAL'])){
            $set = array('ALLOCATION_GOAL_CD' => $this->FIALLOCATION_CD);
            $where = array('DISPATCH_NOTE_ID' => $body['DISPATCH_NOTE_ID_GOAL']);
            Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\dispatchLogic', 'addDispatchNote'], [$set, $where]]);
        }

        #待出库订单存在则
        if (isset($body['PENDING_DELIVERY_ID'])) {
            $where['PENDING_DELIVERY_ID'] = $body['PENDING_DELIVERY_ID'];
            $set['ALLOCATION_ONTHEWAY_CD'] = $this->FIALLOCATION_CD;
            Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PenddeliveryLogic','updateAllPenddelivery'],[$set,$where]]);
        }
        return parent::after_ACreate($body, $class);
    }

    /**
     * 批量更新前的操作
     * @param      $body
     * @param null $class
     * @return array
     */
    public function before_BUpdate($body, $class = NULL)
    {
        $response = new ResponeModel();
        if (isset($body['batchMTC']) && count($body['batchMTC']) > 0) {
            foreach ($body['batchMTC'] as $item) {
                $skFiallocation = SkFiallocation::findOne($item['FIALLOCATION_ID']);
                //如果是审核
                if (isset($item['authFlag']) && $item['authFlag'] == 1 && $item['ALLOCATION_STATE'] == 2) {
                    if (!isset($item['sk_fiallocation_detail']) || empty($item['sk_fiallocation_detail'])) {
                        return [static::ACTION_RETURN,$response->setModel(500, 0, Yii::t('inventory', "Document details must have at least one!"), [])];
                    }
                    if ($skFiallocation->ALLOCATION_STATE == 2) {
                        return [static::ACTION_RETURN,$response->setModel(500, 0, Yii::t('inventory', "The current document has been audited and cannot be operated on!"), [])];
                    }
                } else {
                    if (isset($item['authFlag']) && $item['authFlag'] == 2 && $item['ALLOCATION_STATE'] == 1) {
                        if (!isset($item['sk_fiallocation_detail']) || empty($item['sk_fiallocation_detail'])) {
                            return [static::ACTION_RETURN,$response->setModel(500, 0, Yii::t('inventory', "Document details must have at least one!"), [])];
                        }
                        if (!isset($item['allow_back_review'])) {
                            if ($skFiallocation->ALLOCATION_STATE == 1) {
                                return [static::ACTION_RETURN,$response->setModel(500, 0, Yii::t('inventory', "This operation cannot be performed because the current document is not audited!"), [])];
                            } else {
                                if ($skFiallocation->SYSTEM_GENERATION == 1) {
                                    return [static::ACTION_RETURN,$response->setModel(500, 0, Yii::t('inventory', "The system automatically generated documents can not be reverse audited"), [])];
                                }
                            }
                        }
                    } else {
                        if (isset($item['DELETED_STATE']) && $item['DELETED_STATE'] == 1) {
                            if ($skFiallocation->ALLOCATION_STATE == 2) {
                                return [static::ACTION_RETURN,$response->setModel(500, 0, Yii::t('inventory', "The current document has been audited and cannot be operated on!"), [])];
                            }
                        }
                    }
                }
            }
        }
        return [$this::ACTION_NEXT,$body];
    }

    /**
     * 更新前的操作
     * @param      $body
     * @param null $class
     * @return array
     */
    public function before_AUpdate($body, $class = NULL)
    {
        $response = new ResponeModel();
        if (!isset($body['FIALLOCATION_ID']) || !$body['FIALLOCATION_ID']) {
            return [static::ACTION_RETURN, $response->setModel(500, 0, Yii::t('inventory', "Parameter check failed"), [])];
        }
        if (isset($body['DETAIL_CODE']) && $body['DETAIL_CODE']) {
            SkFiallocationDetail::deleteAll(["FIALLOCATION_ID" => $body['FIALLOCATION_ID']]);
        }
        return [$this::ACTION_NEXT,$body];
    }

    public static function getParamarray($post)
    {
        $paramArray = array();
        if (isset($post['batchMTC']) && count($post['batchMTC']) > 0) {
            foreach ($post['batchMTC'] as $item) {
                $paramArray = static::buildArray($paramArray, $item);
            }
        } else {
            $paramArray = static::buildArray($paramArray, $post);
        }
        return $paramArray;
    }

    public static function buildArray($paramArray, $item)
    {
        //如果是审核/反审核
        //审核  调出仓库减库存，调入仓库加库存
        //反审核  调入仓库减库存，调出仓库加库存
        if (isset($item['authFlag'])) {
            $arr = [];
            $arr['ORDER_CD'] = $item['FIALLOCATION_CD'];
            $details = SkFiallocationDetail::find()
                ->where(['FIALLOCATION_ID' => $item['FIALLOCATION_ID']])
                ->asArray()
                ->all();
            $arr['AUTH_FLAG'] = $item['authFlag'] == 1 ? 1 : 0;//审核为1，反审核为0
            $data = [];
            foreach ($details as $detail) {
                $o_arr = $i_arr = [];
                $o_arr['WAREHOUSE_ID'] = $detail['ETWAREHOUSE_ID'];
                $i_arr['WAREHOUSE_ID'] = $detail['ATWAREHOUSE_ID'];
                $o_arr['ORGANISATION_ID'] = $i_arr['ORGANISATION_ID'] = $item['ORGANISATION_ID'];
                $o_arr['PSKU_ID'] = $i_arr['PSKU_ID'] = $detail['PSKU_ID'];
                $o_arr['PSKU_CODE'] = $i_arr['PSKU_CODE'] = $detail['ATSKU_CODE'];
                if ($item['authFlag'] == 1) {
                    $gpp = GProductSkuPurchasingPrice::find()
                        ->select('UNIT_PRICE')
                        ->where(['PSKU_ID' => $detail['PSKU_ID'], 'PURCHASING_PRICE_STATE' => 1])
                        ->asArray()
                        ->one();
                    $o_arr['ORDER_TYPE'] = 4;//SLR
                    $i_arr['ORDER_TYPE'] = 5;//SLR
                    $o_arr['ORDER_CD'] = $i_arr['ORDER_CD'] = $item['FIALLOCATION_CD'];//SLR
                    $o_arr['ORDER_AT'] = $i_arr['ORDER_AT'] = $item['ALLOCATION_AT'];//SLR
                    $o_arr['UNITPRICE'] = $i_arr['UNITPRICE'] = isset($gpp['UNIT_PRICE']) ? $gpp['UNIT_PRICE'] : 0;//SLR
                    $o_arr['NUMBERS'] = $o_arr['INSTANT_NUMBER'] = $detail['ALLOCATION_NUMBER'] * (-1);
                    $i_arr['NUMBERS'] = $i_arr['INSTANT_NUMBER'] = $detail['ALLOCATION_NUMBER'];
                } else {
                    $o_arr['INSTANT_NUMBER'] = $detail['ALLOCATION_NUMBER'];
                    $i_arr['INSTANT_NUMBER'] = $detail['ALLOCATION_NUMBER'] * (-1);
                }
                array_push($data, $o_arr);
                array_push($data, $i_arr);
            }
            $arr['DATA'] = $data;
            array_push($paramArray, $arr);
        }
        return $paramArray;
    }
}