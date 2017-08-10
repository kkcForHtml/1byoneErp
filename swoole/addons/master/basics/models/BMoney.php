<?php

namespace addons\master\basics\models;

use addons\inventory\models\SkPlacing;
use addons\inventory\models\SkStorage;
use addons\master\partint\models\PaPartner;
use addons\master\product\models\GProductSkuPurchasingPrice;
use addons\purchase\models\PuPayment;
use addons\purchase\models\PuPurchase;
use addons\sales\models\CrSalesOrder;
use addons\shipment\models\ShAllocation;
use addons\shipment\models\ShDispatchNote;
use addons\shipment\models\ShTracking;
use addons\shipment\models\ShTrackingDetail;
use addons\users\models\UUserInfo;
use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
use \yii\swoole\db\ActiveRecord;
use yii\swoole\db\Query;
use \yii\swoole\rest\ResponeModel;

/**
 * @SWG\Definition(
 *   definition="BMoney",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"MONEY_ID"},
 *           @SWG\Property(property="MONEY_ID", type="int",description="币种ID"),
 *           @SWG\Property(property="MONEY_CODE", type="string",description="IOS币种编码"),
 *           @SWG\Property(property="MONEY_NAME_CN", type="string",description="币种名称(中文)"),
 *           @SWG\Property(property="MONEY_NAME_EN", type="string",description="币种名称(英文)"),
 *           @SWG\Property(property="MONEY_SYMBOLS", type="string",description="币种符号"),
 *           @SWG\Property(property="MONEY_STATE", type="int",description="是否启用,1：Y 0：N"),
 *           @SWG\Property(property="CREATED_AT", type="int",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT", type="int",description="更新时间"),
 *           @SWG\Property(property="CUSER_ID", type="int",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="string",description="更新人ID")
 *       )
 *   }
 * )
 */
class BMoney extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'b_money';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['MONEY_ID'],'safe'],
            [['MONEY_CODE', 'MONEY_NAME_CN'], 'required'],
            [['MONEY_STATE', 'CREATED_AT', 'UPDATED_AT', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['MONEY_CODE'], 'string', 'max' => 20],
            [['MONEY_NAME_CN', 'MONEY_NAME_EN'], 'string', 'max' => 100],
            [['MONEY_SYMBOLS'], 'string', 'max' => 10],
            [['MONEY_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'MONEY_ID' => Yii::t('basics', '币种ID'),
            'MONEY_CODE' => Yii::t('basics', 'ISO币种编码'),
            'MONEY_NAME_CN' => Yii::t('basics', '币种名称(中文)'),
            'MONEY_NAME_EN' => Yii::t('basics', '币种名称(英文)'),
            'MONEY_SYMBOLS' => Yii::t('basics', '币种符号'),
            'MONEY_STATE' => Yii::t('basics', '是否启用,1：Y 0：N'),
            'CREATED_AT' => Yii::t('basics', '创建时间'),
            'UPDATED_AT' => Yii::t('basics', '修改时间'),
            'MONEY_REMARKS' => Yii::t('basics', '备注'),
            'CUSER_ID' => Yii::t('basics', '创建人ID'),
            'UUSER_ID' => Yii::t('basics', '更新人ID'),
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

    public $realation = ['b_exchange_rate' => ['MONEY_ID' => 'MONEY_ID']];

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

    //汇率
    public function getB_exchange_rate()
    {
        return $this->hasMany(BExchangeRate::className(), ['MONEY_ID' => 'MONEY_ID']);
    }

    /**
     * 币种新增的操作
     * before_ACreate 新增前
     * after_ACreate 新增后
     */
    public function before_ACreate($body, $class = null)
    {
        $respone = new ResponeModel();
        // 查询数据库表，判断IOS货币编码是否是唯一性
        $exitData = self::find()->where(['MONEY_CODE' => $body['MONEY_CODE']])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "The encoding already exists. Please do not submit again!"), [$body])];
        }
        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 币种更新的操作
     * before_AUpdate 更新前
     * after_AUpdate 更新后
     */
    public function before_AUpdate($body, $class = null)
    {
        $respone = new ResponeModel();
        if (isset($body['MONEY_CODE'])) {
            // 查询数据库表，判断IOS货币编码是否是唯一性
            $exitData = static::find()->andFilterWhere(['<>', 'MONEY_ID', $body['MONEY_ID']])->andWhere(['MONEY_CODE' => $body['MONEY_CODE']])->exists();
            if ($exitData) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "The IOS currency encoding already exists. Please do not submit again!"), [$body])];
            }
        }
        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 币种删除的操作
     * before_ADelete 删除前
     * after_ADelete 删除后
     */
    public function before_ADelete($body, $class = null)
    {
        $respone = new ResponeModel();
        //汇率
        $exitData = (new Query())->from(BExchangeRate::tableName())->where(['or', ['=', 'MONEY_ID', $this->MONEY_ID], ['=', 'TARGET_MONEY_ID', $this->MONEY_ID]])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This currency has been used by other documents and cannot be deleted!"), [$body])];
        }
        //伙伴信息
        $exitData = (new Query())->from(PaPartner::tableName())->where(['=', 'MONEY_ID', $this->MONEY_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This currency has been used by other documents and cannot be deleted!"), [$body])];
        }
        //产品SKU采购价格列表
        $exitData = (new Query())->from(GProductSkuPurchasingPrice::tableName())->where(['=', 'MONEY_ID', $this->MONEY_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This currency has been used by other documents and cannot be deleted!"), [$body])];
        }
        //采购订单
        $exitData = (new Query())->from(PuPurchase::tableName())->where(['=', 'MONEY_ID', $this->MONEY_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This currency has been used by other documents and cannot be deleted!"), [$body])];
        }
        //付款申请
        $exitData = (new Query())->from(PuPayment::tableName())->where(['or', ['=', 'PMONEY_ID', $this->MONEY_ID], ['=', 'PAMONEY_ID', $this->MONEY_ID]])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This currency has been used by other documents and cannot be deleted!"), [$body])];
        }
        //发运单
        $exitData = (new Query())->from(ShDispatchNote::tableName())->where(['=', 'MONEY_ID', $this->MONEY_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This currency has been used by other documents and cannot be deleted!"), [$body])];
        }
        //发运跟踪
        $exitData = (new Query())->from(ShTracking::tableName())->where(['or', ['=', 'FREIGHT_LOMONEY_ID', $this->MONEY_ID], ['=', 'TRAILER_MONEY_ID', $this->MONEY_ID], ['=', 'OBJECTIVE_MONEY_ID', $this->MONEY_ID], ['=', 'FREIGHT_MONEY_ID', $this->MONEY_ID], ['=', 'DUTIEST_MONEY_ID', $this->MONEY_ID]])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This currency has been used by other documents and cannot be deleted!"), [$body])];
        }
        //发运跟踪明细
        $exitData = (new Query())->from(ShTrackingDetail::tableName())->where(['or', ['=', 'PU_MONEY_ID', $this->MONEY_ID], ['=', 'CLEARANCE_MONEY_ID', $this->MONEY_ID]])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This currency has been used by other documents and cannot be deleted!"), [$body])];
        }
        //调拨跟踪
        $exitData = (new Query())->from(ShAllocation::tableName())->where(['or', ['=', 'LOAD_MONEY_ID', $this->MONEY_ID], ['=', 'FREIGHT_MONEY_ID', $this->MONEY_ID], ['=', 'INCIDEN_MONEY_ID', $this->MONEY_ID]])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This currency has been used by other documents and cannot be deleted!"), [$body])];
        }
        //入库表
        $exitData = (new Query())->from(SkStorage::tableName())->where(['=', 'MONEY_ID', $this->MONEY_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This currency has been used by other documents and cannot be deleted!"), [$body])];
        }
        //出库表
        $exitData = (new Query())->from(SkPlacing::tableName())->where(['=', 'PMONEY_ID', $this->MONEY_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This currency has been used by other documents and cannot be deleted!"), [$body])];
        }
        //销售订单
        $exitData = (new Query())->from(CrSalesOrder::tableName())->where(['=', 'MONEY_ID', $this->MONEY_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This currency has been used by other documents and cannot be deleted!"), [$body])];
        }
        return [$this::ACTION_NEXT, $body];
    }
}
