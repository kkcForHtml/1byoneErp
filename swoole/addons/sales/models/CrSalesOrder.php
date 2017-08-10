<?php

namespace addons\sales\models;

use addons\master\partint\models\PaPartner;
use yii\behaviors\AttributeBehavior;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\swoole\db\ActiveRecord;
use Yii;
use yii\swoole\rest\ResponeModel;

/**
 *
 * @SWG\Definition(
 *   definition="CrSalesOrder",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="SALES_ORDER_ID", type="integer",description="销售订单ID"),
 *           @SWG\Property(property="SALES_ORDER_CD", type="string",description="销售订单编号"),
 *           @SWG\Property(property="ORDER_TYPE", type="integer",description="单据类型1.内部销售订单"),
 *           @SWG\Property(property="PLATFORM_SKU", type="string",description="平台"),
 *           @SWG\Property(property="PRE_ORDER_AT",type="integer",format="int32",description="下单时间"),
 *           @SWG\Property(property="SALES_REMARKS",  type="string",description="备注"),
 *           @SWG\Property(property="TOTAL_AMOUNT", type="double",description="合计金额"),
 *           @SWG\Property(property="ORDER_STATE",  type="integer",description="单据状态1.未审核、2.已审核"),
 *           @SWG\Property(property="AUTITO_AT", type="integer",format="int32",description="审核时间"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="制单时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="SYSTEM_GENERATION",type="integer",format="int32",description="是否系统生成,0:否 1：是"),
 *           @SWG\Property(property="CLOSING_STATE",type="integer",format="int32",description="是否关账，0：未关账 1：已关账"),
 *           @SWG\Property(property="CRGANISATION_ID",type="integer",description="销售组织ID"),
 *           @SWG\Property(property="CHANNEL_ID",type="integer",description="平台ID"),
 *           @SWG\Property(property="PARTNER_ID",  type="integer",description="客户"),
 *           @SWG\Property(property="MONEY_ID",  type="integer",description="币种ID"),
 *           @SWG\Property(property="AUTITO_ID",  type="integer",description="审核人"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class CrSalesOrder extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'cr_sales_order';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['SYSTEM_GENERATION', 'ORDER_TYPE', 'PRE_ORDER_AT', 'ORDER_STATE', 'AUTITO_AT', 'CREATED_AT', 'UPDATED_AT', 'CLOSING_STATE',
                'CRGANISATION_ID', 'CHANNEL_ID', 'PARTNER_ID', 'MONEY_ID', 'AUTITO_ID', 'UUSER_ID', 'CUSER_ID'], 'integer'],
            [['TOTAL_AMOUNT'], 'number'],
            [['PLATFORM_SKU'], 'string', 'max' => 20],
            [['SALES_ORDER_CD'], 'string', 'max' => 30],
            [['SALES_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'SALES_ORDER_ID' => Yii::t('sales', '销售订单ID'),
            'SALES_ORDER_CD' => Yii::t('sales', '销售订单编号'),
            'ORDER_TYPE' => Yii::t('sales', '单据类型1.内部销售订单'),
            'PLATFORM_SKU' => Yii::t('sales', '平台'),
            'PRE_ORDER_AT' => Yii::t('sales', '下单时间'),
            'SALES_REMARKS' => Yii::t('sales', '备注'),
            'TOTAL_AMOUNT' => Yii::t('sales', '合计金额'),
            'ORDER_STATE' => Yii::t('sales', '审核状态,1：未审核 2：已审核'),
            'AUTITO_AT' => Yii::t('sales', '审核时间'),
            'CREATED_AT' => Yii::t('sales', '制单时间'),
            'UPDATED_AT' => Yii::t('sales', '修改时间'),
            'SYSTEM_GENERATION' => Yii::t('sales', '是否系统生成,0:否 1：是'),
            'CLOSING_STATE' => Yii::t('inventory', '是否关账，0：未关账 1：已关账'),
            'CRGANISATION_ID' => Yii::t('inventory', '销售组织ID'),
            'CHANNEL_ID' => Yii::t('inventory', '平台ID'),
            'PARTNER_ID' => Yii::t('inventory', '客户'),
            'MONEY_ID' => Yii::t('inventory', '币种ID'),
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
        return [
            [
                'class' => AttributeBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => 'SALES_ORDER_CD',
                ],
                'value' => function ($event) {
                    return Yii::$app->rpc->create('base')->sendAndrecv([['addons\common\base\modellogic\CreateNO', 'createOrderNo'],
                        [8, $this->CRGANISATION_ID, 'SO', $this->PRE_ORDER_AT]]);
                },
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
            ]
        ];
    }

    public $realation = ['cr_sales_order_detail' => ['SALES_ORDER_ID' => 'SALES_ORDER_ID'], 'pa_pather' => ['PARTNER_ID' => 'PARTNER_ID']];

    //明细
    public function getCr_sales_order_detail()
    {
        return $this->hasMany(CrSalesOrderDetail::className(), ['SALES_ORDER_ID' => 'SALES_ORDER_ID']);
    }


    //获取客户
    public function getpa_partner()
    {
        return $this->hasOne(PaPartner::className(), ['PARTNER_ID' => 'PARTNER_ID'])->select(['PARTNER_ID', 'PARTNER_ID', 'PARTNER_NAME_CN', 'PARTNER_NAME_EN', 'PARTNER_CLASSIFY_ID']);
    }


    /**
     * before_AUpdate
     * 编辑前
     * @param $body
     * @param  $class
     * @return array
     * */
    public function before_AUpdate($body, $class = null)
    {

        $respone = new ResponeModel();
        #审核
        if (!isset($body['SALES_ORDER_ID'])) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('sales', 'Parameter is incomplete, edit is not allowed!'), [$body])];
        }

        $query = static::find()->where(['SALES_ORDER_ID' => $body['SALES_ORDER_ID']])->asArray()->one();
//        //校验会计期间
//        if ($query['CLOSING_STATE'] == '1') {
//            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('sales', '当前单据处于关账期间，不允许编辑！'), [$body])];
//        }

        #审核参数 authFlag =1  CRGANISATION_ID  PRE_ORDER_AT  SALES_ORDER_ID ORDER_STATE
        if (isset($body['authFlag']) && $body['authFlag'] == '1') {
            if (!isset($body['CRGANISATION_ID']) && !isset($body['PRE_ORDER_AT'])) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('sales', 'Audit parameters are incomplete, audit is not allowed!'), [$body])];
            }


            if ($query['ORDER_STATE'] == '2') {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('sales', 'The current document has been audited and cannot be re examined!'), [$body])];
            }
        }
        #反审核
        if (isset($body['authFlag']) && $body['authFlag'] == '2') {
            if (!isset($body['CRGANISATION_ID']) && !isset($body['PRE_ORDER_AT'])) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('sales', 'Audit parameters are incomplete, audit is not allowed!'), [$body])];
            }
            //校验会计期间
            if (!isset($body['allow_back_review'])) {
                if ($query['ORDER_STATE'] == '1') {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('sales', 'The current document is not audited and cannot be audited!'), [$body])];
                }
                //系统反审核标志
                if ($query['SYSTEM_GENERATION'] == '1') {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('sales', "The system automatically generated documents can not be audited"), [])];
                }
            }
        }

        return parent::before_AUpdate($body, $class); // TODO: Change the autogenerated stub
    }

    /**
     * after_ADelete
     * 删除主表后
     * @param $body
     * @param $class
     * @return parent
     * */
    public function after_ADelete($body, $class = null)
    {
        if (isset($body['SALES_ORDER_ID'])) {
            CrSalesOrderDetail::deleteAll(['SALES_ORDER_ID' => $body['SALES_ORDER_ID']]);
        }
        return parent::after_ADelete($body, $class); // TODO: Change the autogenerated stub
    }

    public function before_ACreate($body, $class = null)
    {
        $respone = new ResponeModel();
        if (isset($body['CRGANISATION_ID']) && isset($body['PRE_ORDER_AT'])) {
//            $acPeriod = Yii::$app->rpc->create('finance')->sendAndrecv([['\addons\finance\modellogic\accountingperiodLogic', 'accounting_period_method'], [$body['CRGANISATION_ID'], $body['PRE_ORDER_AT']]]);
//            if ($acPeriod) {
//                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('sales', '当前时间已关账，不能新增！'), [$body])];
//            }
        } else {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('sales', '新增参数不全，不允许新增！'), [$body])];
        }
        return parent::before_ACreate($body, $class); // TODO: Change the autogenerated stub
    }

    /**
     * after_ACreate
     * 新增后
     * @param $body
     * @param  $class
     * @return array
     * */
    public function after_ACreate($body, $class = null)
    {
        #待出库列表
        if (isset($body['PENDING_DELIVERY_ID'])) {
            $set = array('INTERNAL_SALES_CD' => $this->SALES_ORDER_CD);

            $where = array('PENDING_DELIVERY_ID' => $body['PENDING_DELIVERY_ID']);
            Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PenddeliveryLogic', 'updateAllPenddelivery'], [$set, $where]]);
        }

        return parent::after_ACreate($body, $class); // TODO: Change the autogenerated stub
    }


}
