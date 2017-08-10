<?php

namespace addons\inventory\models;

use Yii;
use yii\swoole\db\ActiveRecord;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use yii\behaviors\AttributeBehavior;
use yii\swoole\behaviors\CustomBehaviors;
use \yii\swoole\rest\ResponeModel;
use addons\organization\models\OOrganisation;
use addons\master\basics\models\BWarehouse;
use addons\master\partint\models\PaPartner;
use addons\users\models\UUserInfo;


/**
 * @SWG\Definition(
 *   definition="SkStorage",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="STORAGE_ID", type="integer",description="入库ID"),
 *           @SWG\Property(property="STORAGE_CD", type="string",description="入库单号"),
 *           @SWG\Property(property="STORAGE_AT", type="integer",format="int32",description="入库日期"),
 *           @SWG\Property(property="STORAGE_MONEY", type="double",description="金额"),
 *           @SWG\Property(property="ORDER_TYPE", type="integer",format="int32",description="单据类型:1.采购入库、2.内部采购入库、3.其他入库"),
 *           @SWG\Property(property="DELETED_STATE", type="integer",format="int32",description="是否删除:1：删除 0：未删除"),
 *           @SWG\Property(property="STORAGE_REMARKS", type="string",description="备注"),
 *           @SWG\Property(property="ORDER_STATE", type="integer",format="int32",description="审核状态,1：未审核 2：已审核"),
 *           @SWG\Property(property="AUTITO_AT",type="integer",format="int32",description="审核时间"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="制单日期"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="更新时间"),
 *           @SWG\Property(property="CLOSING_STATE",type="integer",format="int32",description="是否关账，0：未关账 1：已关账"),
 *           @SWG\Property(property="SYSTEM_GENERATION",type="integer",format="int32",description="是否系统生成,0:否 1：是"),
 *           @SWG\Property(property="ORGANISATION_ID",  type="integer",description="组织ID"),
 *           @SWG\Property(property="PARTNER_ID",  type="integer",description="供应商ID"),
 *           @SWG\Property(property="WAREHOUSE_ID",  type="integer",description="入库仓库"),
 *           @SWG\Property(property="MONEY_ID",  type="integer",description="币种ID"),
 *           @SWG\Property(property="AUTITO_ID",  type="integer",description="审核人ID"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class SkStorage extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_storage';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['STORAGE_ID'], 'safe'],
            [['SYSTEM_GENERATION', 'STORAGE_AT', 'ORDER_TYPE', 'DELETED_STATE', 'ORDER_STATE', 'AUTITO_AT', 'CREATED_AT', 'UPDATED_AT', 'CLOSING_STATE',
                'ORGANISATION_ID', 'PARTNER_ID', 'WAREHOUSE_ID', 'MONEY_ID', 'AUTITO_ID', 'UUSER_ID', 'CUSER_ID'], 'integer'],
            [['STORAGE_MONEY'], 'number'],
            [['STORAGE_CD'], 'string', 'max' => 30],
            [['STORAGE_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'STORAGE_ID' => Yii::t('inventory', '入库ID'),
            'STORAGE_CD' => Yii::t('inventory', '入库单号'),
            'STORAGE_AT' => Yii::t('inventory', '入库日期'),
            'STORAGE_MONEY' => Yii::t('inventory', '金额'),
            'ORDER_TYPE' => Yii::t('inventory', '单据类型:1.采购入库、2.内部采购入库、3.其他入库'),
            'DELETED_STATE' => Yii::t('inventory', '是否删除:1：删除 0：未删除'),
            'STORAGE_REMARKS' => Yii::t('inventory', '备注'),
            'ORDER_STATE' => Yii::t('inventory', '审核状态,1：未审核 2：已审核'),
            'AUTITO_AT' => Yii::t('inventory', '审核时间'),
            'CREATED_AT' => Yii::t('inventory', '制单日期'),
            'UPDATED_AT' => Yii::t('inventory', '更新时间'),
            'CLOSING_STATE' => Yii::t('inventory', '是否关账，0：未关账 1：已关账'),
            'SYSTEM_GENERATION' => Yii::t('inventory', '是否系统生成,0:否 1：是'),
            'ORGANISATION_ID' => Yii::t('inventory', '组织ID'),
            'PARTNER_ID' => Yii::t('inventory', '供应商ID'),
            'WAREHOUSE_ID' => Yii::t('inventory', '入库仓库'),
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
        $post = Yii::$app->getRequest()->getBodyParams();//获取post参数

        $type = isset($post['ORDER_TYPE']) ? $post['ORDER_TYPE'] : 0;
        switch ($type) {
            case 1:
                $post['head'] = "GRN";
                break;
            case 2:
                $post['head'] = "GRN";
                break;
            case 3:
                $post['head'] = "MI";
                break;
            default:
                $post['head'] = "GRN";
                break;
        }

        return [
            [
                'class' => AttributeBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['STORAGE_CD'],
                ],
                'value' => function ($event) use ($post) {
                    return Yii::$app->rpc->create('base')->sendAndrecv([['addons\common\base\modellogic\CreateNO', 'createOrderNo'],
                        [2, $this->ORGANISATION_ID, $post['head'], $this->STORAGE_AT]]);
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
                                                'STORAGE_AT',        //关帐校验时间字段
                                                'ORGANISATION_ID',//关帐校验组织编码可以写多个,用数组包装
                                                'CLOSING_STATE',//关帐标识字段
                                                ['addWhere' => []]
                                            ]
                                        ]
                                    ],
                            ]
                        ]
                    ]
            ]
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

    //关联添加配置()
    public $realation = ['sk_storage_detail' => ['STORAGE_ID' => 'STORAGE_ID', 'STORAGE_CD' => 'STORAGE_CD']];

    //入库单详细
    public function getSk_storage_detail()
    {
        return $this->hasMany(SkStorageDetail::className(), ['STORAGE_ID' => 'STORAGE_ID'])->joinWith('b_unit');
    }

    //入库单详细-只查询
    public function getSk_storage_detaild()
    {
        return $this->hasMany(SkStorageDetail::className(), ['STORAGE_ID' => 'STORAGE_ID'])->alias('d');
    }

    //组织
    public function getO_organisation()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'ORGANISATION_ID']);
    }

    //仓库
    public function getB_warehouse()
    {
        return $this->hasOne(BWarehouse::className(), ['WAREHOUSE_ID' => 'WAREHOUSE_ID']);
    }

    //供应商
    public function getPa_partner()
    {
        return $this->hasOne(PaPartner::className(), ['PARTNER_ID' => 'PARTNER_ID']);
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

    public function before_AUpdate($body, $class = null)
    {
        $respone = new ResponeModel();
        if (isset($body['DELETED_STATE']) && $body['DELETED_STATE'] == 1) {
            $ORDER = static::find()->where(['STORAGE_ID' => $body['STORAGE_ID']])->asArray()->one();
            if ($ORDER['ORDER_STATE'] == 2) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "The current document has been audited and cannot be operated on!"), [])];
//                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "已经审核的不能删除"), [])];
            }
            //删掉明细
            $STORAGE_DETAIL_ID = SkStorageDetail::find()->where(["STORAGE_ID" => $ORDER['STORAGE_ID']])->column();
            SkStorageDetail::deleteAll(["STORAGE_DETAIL_ID" => $STORAGE_DETAIL_ID]);
        }

        return [$this::ACTION_NEXT, $body];
    }
/*
    public function after_AUpdate($body, $class = null)
    {
        if (isset($body['DELETED_STATE']) && $body['DELETED_STATE'] == 1) {
            $ORDER = static::find()->where(['STORAGE_ID' => $body['STORAGE_ID']])->asArray()->one();
            //删掉明细
            $STORAGE_DETAIL_ID = SkStorageDetail::find()->where(["STORAGE_ID" => $ORDER['STORAGE_ID']])->column();
            SkStorageDetail::deleteAll(["STORAGE_DETAIL_ID" => $STORAGE_DETAIL_ID]);
        }
        return parent::after_AUpdate($body, $class); // TODO: Change the autogenerated stub
    }*/

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
            if ($body['UPDATE_TYPE'] == 1)    //反写 调出仓红字内部采购入库单
                $set = array('PURCHASING_WAREHOUSING_CD_RED' => $this->STORAGE_CD);
            if ($body['UPDATE_TYPE'] == 2)    //反写 调入组织的内部入库单
                $set = array('INTERNAL_PURCHASINGST_CD' => $this->STORAGE_CD);

            $where = array('PENDING_DELIVERY_ID' => $body['PENDING_DELIVERY_ID']);
            Yii::$app->rpc->create('inventory')->sendAndrecv([['\addons\inventory\modellogic\PenddeliveryLogic', 'updateAllPenddelivery'], [$set, $where]]);
        }

        #发运单id存在则
        if (isset($body['DISPATCH_NOTE_ID'])) {

            $set = [];
            if ($body['ORDER_TYPE'] == '1') {
                $set = array('PURCHASING_WAREHOUSING_CD' => $this->STORAGE_CD);
            }
            if ($body['ORDER_TYPE'] == '2') {
                $set = array('INTERNAL_PURCHASINGST_CD' => $this->STORAGE_CD);
            }

            $where = array('DISPATCH_NOTE_ID' => $body['DISPATCH_NOTE_ID']);
            Yii::$app->rpc->create('shipment')->sendAndrecv([['\addons\shipment\modellogic\dispatchLogic', 'addDispatchNote'], [$set, $where]]);

        }

        return parent::after_ACreate($body, $class); // TODO: Change the autogenerated stub
    }
}
