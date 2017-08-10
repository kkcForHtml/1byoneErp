<?php

namespace addons\inventory\models;


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
use addons\inventory\models\SkPlacingDetail;
use addons\inventory\modellogic\instantInventoryLogic;


use addons\users\models\UUserInfo;

/**
 * @SWG\Definition(
 *   definition="SkPlacing",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="PLACING_ID", type="integer",description="出库单ID"),
 *           @SWG\Property(property="PLACING_CD", type="string",description="出库单号"),
 *           @SWG\Property(property="PLACING_AT", type="integer",description="出库日期"),
 *           @SWG\Property(property="ORDER_TYPE", type="integer",description="单据类型1.销售出库、2.内部销售出库、3.其他出库"),
 *           @SWG\Property(property="PPARTNER_ID", type="string",description="客户名称"),
 *           @SWG\Property(property="PWAREHOUSE_ID", type="string",description="出库仓库"),
 *           @SWG\Property(property="PLAN_STATE", type="integer",description="审核状态,1：未审核 2：已审核"),
 *           @SWG\Property(property="PMONEY", type="number",description="金额"),
 *           @SWG\Property(property="PLACING_REMARKS",type="string",description="备注"),
 *           @SWG\Property(property="DELETED_STATE",type="integer",description="是否删除,1：删除 0：未删除"),
 *           @SWG\Property(property="CLOSING_STATE",type="integer",description="是否关账，0：未关账 1：已关账"),
 *           @SWG\Property(property="AUTITO_AT",type="integer",format="int32",description="审核时间"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="制单日期"),
 *           @SWG\Property(property="UPDATED_AT", type="integer",description="更新时间"),
 *           @SWG\Property(property="CLOSING_STATE",type="integer",format="int32",description="是否关账，0：未关账 1：已关账"),
 *           @SWG\Property(property="SYSTEM_GENERATION",type="integer",format="int32",description="是否系统生成,0:否 1：是"),
 *           @SWG\Property(property="PRGANISATION_ID",  type="integer",description="组织ID"),
 *           @SWG\Property(property="PPARTNER_ID",  type="integer",description="客户名称"),
 *           @SWG\Property(property="PWAREHOUSE_ID",  type="integer",description="出库仓库"),
 *           @SWG\Property(property="PMONEY_ID",  type="integer",description="币种ID"),
 *           @SWG\Property(property="AUTITO_ID",  type="integer",description="审核人ID"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class SkPlacing extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_placing';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['SYSTEM_GENERATION', 'CLOSING_STATE', 'PLACING_AT', 'ORDER_TYPE', 'DELETED_STATE', 'PLAN_STATE', 'UPDATED_AT',
                'AUTITO_AT', 'PRGANISATION_ID', 'PPARTNER_ID', 'PWAREHOUSE_ID', 'PMONEY_ID', 'AUTITO_ID', 'UUSER_ID', 'CUSER_ID', 'CREATED_AT'], 'integer'],
            [['PLACING_CD'], 'string', 'max' => 30],
            [['PMONEY'], 'number'],
            [['PLACING_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'PLACING_ID' => Yii::t('inventory', '出库单ID'),
            'PLACING_CD' => Yii::t('inventory', '出库单号'),
            'PLACING_AT' => Yii::t('inventory', '出库日期'),
            'ORDER_TYPE' => Yii::t('inventory', '单据类型1.销售出库、2.内部销售出库、3.其他出库'),
            'PLAN_STATE' => Yii::t('inventory', '审核状态,1：未审核 2：已审核'),
            'PMONEY' => Yii::t('inventory', '金额'),
            'PLACING_REMARKS' => Yii::t('inventory', '备注'),
            'DELETED_STATE' => Yii::t('inventory', '是否删除1：删除 0：未删除'),
            'CLOSING_STATE' => Yii::t('inventory', '是否关账，0：未关账 1：已关账'),
            'AUTITO_AT' => Yii::t('inventory', '审核时间'),
            'CREATED_AT' => Yii::t('inventory', '制单日期'),
            'UPDATED_AT' => Yii::t('inventory', '更新时间'),
            'SYSTEM_GENERATION' => Yii::t('inventory', '是否系统生成,0:否 1：是'),
            'PRGANISATION_ID' => Yii::t('inventory', '组织ID'),
            'PPARTNER_ID' => Yii::t('inventory', '客户名称'),
            'PWAREHOUSE_ID' => Yii::t('inventory', '出库仓库'),
            'PMONEY_ID' => Yii::t('inventory', '币种ID'),
            'AUTITO_ID' => Yii::t('inventory', '审核人ID'),
            'UUSER_ID' => Yii::t('inventory', '更新人ID'),
            'CUSER_ID' => Yii::t('inventory', '创建人ID'),
        ];
    }

    /**
     * 新增修改前把指定字段值写入时间戳
     */
    public function behaviors()
    {
        $post = Yii::$app->getRequest()->getBodyParams();//获取post参数

        $type = isset($post['ORDER_TYPE']) ? $post['ORDER_TYPE'] : 0;
        switch ($type) {
            case 1:
                $post['head'] = "DN";
                break;
            case 2:
                $post['head'] = "DN";
                break;
            case 3:
                $post['head'] = "MO";
                break;
            default:
                $post['head'] = "DN";
                break;
        }

        $paramArray = static::getParamarray($post);

        return [
            [
                'class' => AttributeBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['PLACING_CD'],
                ],
                'value' => function ($event) use ($post) {

                    return Yii::$app->rpc->create('base')->sendAndrecv([['addons\common\base\modellogic\CreateNO', 'createOrderNo'],

                        [3, $post['PRGANISATION_ID'], $post['head'],$this->PLACING_AT]]);

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
                                [count($placing_data) > 0]
                            ],
                            [
                                'inventory' =>
                                    [
                                        [['addons\\inventory\\modellogic\\instantInventoryLogic', 'skuInventory'], $placing_data]
                                    ]
                            ]
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
                                                'PLACING_AT',        //关帐校验时间字段
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

    public static function addQuery(&$query, $alias)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            #组织权限
            $query->andWhere([$alias . '.PRGANISATION_ID' => Yii::$app->session->get('organization') ?: null]);
        }
    }

    //关联添加配置()
    /*public $realation = ['o_organisation' => ['ORGANISATION_CODE' => 'PRGANISATION_CODE'], 'b_warehouse' => ['WAREHOUSE_CODE' => 'PWAREHOUSE_CODE'],
        'pa_partner' => ['PARTNER_CODE' => 'PPARTNER_CODE'], 'sk_placing_detail' => ['PLACING_ID' => 'PLACING_ID']];*/
    public $realation = ['sk_placing_detail' => ['PLACING_ID' => 'PLACING_ID']];

    //出库单详细
    public function getSk_placing_detail()
    {
        return $this->hasMany(SkPlacingDetail::className(), ['PLACING_ID' => 'PLACING_ID'])
            ->joinWith(['b_unit', 'g_product_sku']);
    }

    //组织
    public function getO_organisation()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'PRGANISATION_ID']);
    }

    //仓库
    public function getB_warehouse()
    {
        return $this->hasOne(BWarehouse::className(), ['WAREHOUSE_ID' => 'PWAREHOUSE_ID']);
    }

    //客户
    public function getPa_partner()
    {
        return $this->hasOne(PaPartner::className(), ['PARTNER_ID' => 'PPARTNER_ID']);
    }


    //创建人
    public function getU_userinfoc()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'CUSER_ID'])->alias('c')->joinWith(['u_staff_info']);;
    }

    //更新人
    public function getU_userinfou()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'UUSER_ID'])->alias('u');
    }

    //审核人
    public function getU_userinfo_a()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'AUTITO_ID'])->alias('a')->select(['a.USER_INFO_ID', 'a.STAFF_ID']);
    }


    /**
     * 新增的操作
     * before_ACreate 新增前
     * after_ACreate 新增后
     */

    public function before_ACreate($body, $class = null)
    {
        $respone = new ResponeModel();

        $body['DELETED_STATE'] = 0;
        $body['CLOSING_STATE'] = 0;
        $body['PLAN_STATE'] = 1;
        $this->load($body, '');
        Yii::$app->BaseHelper->validate($this);

        return [$this::ACTION_NEXT, $body];
    }

    public function after_ACreate($body, $class = null)
    {


        if (isset($body['sk_placing_detail']) && count($body['sk_placing_detail']) > 0) {
            $details = $body['sk_placing_detail'];
            $varray = [];
            foreach ($details as $detail) {
                $detail['PLACING_CD'] = $this->PLACING_CD;
                array_push($varray, $detail);
            }
            unset($body['sk_placing_detail']);
            $body['sk_placing_detail'] = $varray;
        }


        #待出库列表
        if (isset($body['PENDING_DELIVERY_ID'])) {
            if ($body['UPDATE_TYPE'] == 1)    //反写 中转仓红字内部销售出库单号
                $set = array('INTERNAL_SALESTH_CD_RED' => $this->PLACING_CD);
            if ($body['UPDATE_TYPE'] == 2)    //反写 代采组织内部销售出库订单
                $set = array('INTERNAL_SALESTH_CD' => $this->PLACING_CD);

            $where = array('PENDING_DELIVERY_ID' => $body['PENDING_DELIVERY_ID']);
            Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PenddeliveryLogic', 'updateAllPenddelivery'], [$set, $where]]);
        }

        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 批量更新前的操作
     */
    public function before_BUpdate($body, $class = null)
    {
        $respone = new ResponeModel();
        if (isset($body['batch']) && count($body['batch']) > 0) {
            foreach ($body['batch'] as $item) {
                $skplacing = SkPlacing::findOne($item['PLACING_ID']);
                //如果是审核
                if (isset($item['authFlag']) && $item['authFlag'] == 1 && $item['PLAN_STATE'] == 2) {

                    if ($skplacing->PLAN_STATE == 2) {
                        //需校验是未审核的
                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "The current document has been audited and cannot be operated on!"), [])];
//                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "已经审核过的不能再审核"), [])];
                    }
                } else if (isset($item['authFlag']) && $item['authFlag'] == 2 && $item['PLAN_STATE'] == 1) {
                    if (!isset($body['batch'][0]['allow_back_review'])) {
                        if ($skplacing->PLAN_STATE == 1) {
                            //需校验是已审核的
                            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "This operation cannot be performed because the current document is not audited"), [])];
//                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "未审核的单据不能反审核"), [])];
                        } else if ($skplacing->SYSTEM_GENERATION == 1) {
                            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "The system automatically generated documents can not be reverse audited"), [])];
//                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "系统自动生成的单据不能反审核"), [])];
                        }
                    }

                } else if (isset($item['DELETED_STATE']) && $item['DELETED_STATE'] == 1) {
                    //删掉明细
                    if ($skplacing->PLAN_STATE == 2) {
                        //需校验是未审核的
                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "The current document has been audited and cannot be operated on!"), [])];
//                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "已经审核的不能删除"), [])];
                    }
                    SkPlacingDetail::deleteAll(["PLACING_ID" => $item['PLACING_ID']]);
                }
            }
        }
        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 更新前的操作
     */

    public function before_AUpdate($body, $class = null)
    {
        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 更新后操作
     * @param $body
     * @param null $class
     * @return array
     */
    public function after_AUpdate($body, $class = null)
    {
        return [$this::ACTION_NEXT, $body];
    }


    public static function getParamarray($post)
    {

        $paramArray = array();
        if (isset($post['batch']) && count($post['batch']) > 0) {
            foreach ($post['batch'] as $item) {
                $paramArray = static::buildArray($paramArray, $item);
            }
        } else {
            $paramArray = static::buildArray($paramArray, $post);
        }

        return $paramArray;
    }

    public static function buildArray($paramArray, $item)
    {

        //如果是审核
        if (isset($item['authFlag'])) {
            $details = SkPlacingDetail::find()->where(['PLACING_ID' => $item['PLACING_ID']])->all();

            foreach ($details as $detail) {
                $param = array();
                $param['WAREHOUSE_ID'] = $detail->PDWAREHOUSE_ID;
                $param['PSKU_ID'] = $detail->PSKU_ID;
                if ($item['authFlag'] == 1 && $item['PLAN_STATE'] == 2) {
                    $param['INSTANT_NUMBER'] = $detail->PDNUMBER * (-1);
                } else if ($item['authFlag'] == 2 && $item['PLAN_STATE'] == 1) {
                    //反审核
                    $param['INSTANT_NUMBER'] = $detail->PDNUMBER;
                }

                array_push($paramArray, $param);
            }


        }
        return $paramArray;
    }

    /*
    * 格式化库存数据
    */
    public static function formatInventory($row)
    {
        if (!isset($row['batchMTC']) && !isset($row['batch'])) {
            $post['batchMTC'][0] = $row;
        } elseif (!isset($row['batchMTC']) && $row['batch']) {
            $post['batchMTC'] = $row['batch'];
        } else {
            $post = $row;
        }

        $data = array();
        if (isset($post['batchMTC'])) {
            foreach ($post['batchMTC'] as $placing) {
                if (!isset($placing['PLACING_ID']))
                    continue;

                if (isset($placing['sk_placing_detail']) && $placing['sk_placing_detail'] && count($placing['sk_placing_detail']) > 0) {
                    $detials = $placing['sk_placing_detail'];
                } else {
                    $detials = SkPlacingDetail::find()->where(array('PLACING_ID' => $placing['PLACING_ID']))->asArray()->all();
                }
                foreach ($detials as $value) {
                    $row = array();
                    $row['ORDER_CD'] = $placing['PLACING_CD'];
                    if ($placing['authFlag'] == 1 && $placing['PLAN_STATE'] == 2) {
                        $row['AUTH_FLAG'] = 1;
                        $detials['INSTANT_NUMBER'] = (-1) * $value['PDNUMBER'];
                    } elseif ($placing['authFlag'] == 2 && $placing['PLAN_STATE'] == 1) {
                        $row['AUTH_FLAG'] = 0;
                        $detials['INSTANT_NUMBER'] =  $value['PDNUMBER'];                    }
                    $detial['ORDER_CD'] = $placing['PLACING_CD'];
                    $detial['WAREHOUSE_ID'] = $placing['PWAREHOUSE_ID'];
                    $detial['ORGANISATION_ID'] = $placing['PRGANISATION_ID'];
                    $detial['NUMBERS'] = $value['PDNUMBER'];
                    $detial['ORDER_AT'] = time();
                    $detial['PSKU_ID'] = $value['PSKU_ID'];
                    $detial['PSKU_CODE'] = $value['PDSKU_CODE'];
                    $detial['UNITPRICE'] = $value['UNIT_PRICE'];
                    $detial['ORDER_TYPE'] = 2;

                    $row['DATA'][] = $detial;
                    $data[] = $row;
                }
            }
        }
        return $data;
    }
}
