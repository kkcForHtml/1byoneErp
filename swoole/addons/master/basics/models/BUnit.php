<?php

namespace addons\master\basics\models;

use addons\inventory\models\SkAdjustmentDetail;
use addons\inventory\models\SkAllocation;
use addons\inventory\models\SkAllocationDetail;
use addons\inventory\models\SkPlacingDetail;
use addons\inventory\models\SkStorageDetail;
use addons\master\product\models\GCurrencySku;
use addons\master\product\models\GProductSku;
use addons\master\product\models\GProductSkuDeclare;
use addons\purchase\models\PuPurchaseDetail;
use addons\sales\models\CrSalesOrderDetail;
use addons\tools\models\ToFbaFeeRule;
use addons\users\models\UUserInfo;
use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\db\Query;
use yii\swoole\rest\ResponeModel;
use yii\swoole\behaviors\OperatorBehaviors;
use \yii\swoole\db\ActiveRecord;
use yii\swoole\helpers\ArrayHelper;

/**
 * @SWG\Definition(
 *   definition="BUnit",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"UNIT_ID"},
 *           @SWG\Property(property="UNIT_ID", type="int",description="计量单位ID"),
 *           @SWG\Property(property="UNIT_CODE", type="string",description="计量单位编码"),
 *           @SWG\Property(property="UNIT_NAME_CN", type="string",description="计量单位名称(中文)"),
 *           @SWG\Property(property="UNIT_NAME_EN", type="string",description="计量单位名称(英文)"),
 *           @SWG\Property(property="UNIT_SYMBOLS", type="string",description="计量单位符号"),
 *           @SWG\Property(property="UNIT_STATE", type="int",description="是否启用,1：Y 0：N"),
 *           @SWG\Property(property="CREATED_AT", type="int",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT", type="int",description="修改时间"),
 *           @SWG\Property(property="CUSER_ID", type="int",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="int",description="更新人ID")
 *       )
 *   }
 * )
 */
class BUnit extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'b_unit';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['UNIT_ID'], 'safe'],
            [['UNIT_CODE', 'UNIT_NAME_CN'], 'required'],
            [['UNIT_STATE', 'CREATED_AT', 'UPDATED_AT', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['UNIT_CODE'], 'string', 'max' => 20],
            [['UNIT_NAME_CN', 'UNIT_NAME_EN'], 'string', 'max' => 100],
            [['UNIT_SYMBOLS'], 'string', 'max' => 10],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'UNIT_ID' => Yii::t('basics', '计量单位ID'),
            'UNIT_CODE' => Yii::t('basics', '计量单位编码'),
            'UNIT_NAME_CN' => Yii::t('basics', '计量单位名称(中文)'),
            'UNIT_NAME_EN' => Yii::t('basics', '计量单位名称(英文)'),
            'UNIT_SYMBOLS' => Yii::t('basics', '计量单位符号'),
            'UNIT_STATE' => Yii::t('basics', '是否启用,1：Y 0：N'),
            'CREATED_AT' => Yii::t('basics', '创建时间'),
            'UPDATED_AT' => Yii::t('basics', '修改时间'),
            'CUSER_ID' => Yii::t('basics', '创建人ID'),
            'UUSER_ID' => Yii::t('basics', '更新人ID'),
        ];
    }

    public function getU_userinfo()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'CUSER_ID'])->alias('u');
    }

    //更新人
    public function getU_userinfos()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'UUSER_ID']);
    }

    public function before_ACreate($body, $class = null)
    {
        //批量新增
        if (isset($body['batchMTC']) && count($body['batchMTC']) > 0) {
            foreach ($body['batchMTC'] as $item) {
                $respone = new ResponeModel();
                $this->load($item, '');
                Yii::$app->BaseHelper->validate($this);
                $BunitCode = false;
                if (isset($item["UNIT_CODE"])) {
                    $BunitCode = BUnit::find()->where(["UNIT_CODE" => $item["UNIT_CODE"]])->exists();
                }
                if ($BunitCode) {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "The encoding already exists. Please do not submit again!"), [$body])];
                }
            }
        } else {
            $respone = new ResponeModel();
            $this->load($body, '');
            Yii::$app->BaseHelper->validate($this);
            //检测编码是否唯一
            if (isset($body["UNIT_CODE"])) {
                $BunitCode = BUnit::find()->where(["UNIT_CODE" => $body["UNIT_CODE"]])->exists();
            }
            if ($BunitCode) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "The encoding already exists. Please do not submit again!"), [$body])];
            }
            //检测计量单位名称是否唯一
            if (isset($body["UNIT_NAME_CN"])) {
                $Ubitnamecn = BUnit::find()->where(["UNIT_NAME_CN" => $body["UNIT_NAME_CN"]])->exists();
            }
            if ($Ubitnamecn) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "The name has already exists. Please do not submit again!"), [$body])];
            }

        }
        return [$this::ACTION_NEXT, $body];
    }

    public function before_AUpdate($body, $class = null)
    {
        //批量更新
        $respone = new ResponeModel();
        $this->load($body, '');
        Yii::$app->BaseHelper->validate($this);
        $BunitCode = false;
        $body = ArrayHelper::merge($this->toArray(), $body);
        if (isset($body["UNIT_CODE"]) && isset($body["UNIT_ID"])) {
            $BunitCode = BUnit::find()->where(["UNIT_CODE" => $body["UNIT_CODE"]])->andWhere(["<>", "UNIT_ID", $body["UNIT_ID"]])->exists();
        }
        if ($BunitCode) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "The encoding already exists. Please do not submit again!"), [$body])];
        }

        if (isset($body["UNIT_CODE"]) && isset($body["UNIT_ID"])) {
            $BunitCn = BUnit::find()->where(["UNIT_NAME_CN" => $body["UNIT_NAME_CN"]])->andWhere(["<>", "UNIT_ID", $body["UNIT_ID"]])->exists();
        }
        if ($BunitCn) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "The name has already exists. Please do not submit again!"), [$body])];
        }

        return [$this::ACTION_NEXT, $body];
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
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['CUSER_ID'],
                ],
            ]
        ];
    }


    /**
     * 计量单位删除的操作
     * before_ADelete 删除前
     * after_ADelete 删除后
     */
    public function before_ADelete($body, $class = null)
    {
        $respone = new ResponeModel();
        //通用SKU表
        $exitData = (new Query())->from(GCurrencySku::tableName())->where(['=', 'UNIT_ID', $this->UNIT_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This unit of measurement has been used by other documents and cannot be deleted!"), [$body])];
        }
        //产品SKU表
        $exitData = (new Query())->from(GProductSku::tableName())->where(['=', 'UNIT_ID', $this->UNIT_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This unit of measurement has been used by other documents and cannot be deleted!"), [$body])];
        }
        //产品SKU报关资料表
        $exitData = (new Query())->from(GProductSkuDeclare::tableName())->where(['=', 'UNIT_ID', $this->UNIT_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This unit of measurement has been used by other documents and cannot be deleted!"), [$body])];
        }
        //FBA费规则表
        $exitData = (new Query())->from(ToFbaFeeRule::tableName())->where(['or', ['=', 'LENGTHUNIT', $this->UNIT_CODE], ['=', 'WEIGHTUNIT', '']])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This unit of measurement has been used by other documents and cannot be deleted!"), [$body])];
        }
        //采购订单明细表
        $exitData = (new Query())->from(PuPurchaseDetail::tableName())->where(['=', 'UNIT_ID', $this->UNIT_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This unit of measurement has been used by other documents and cannot be deleted!"), [$body])];
        }
        //入库明细表
        $exitData = (new Query())->from(SkStorageDetail::tableName())->where(['=', 'UNIT_ID', $this->UNIT_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This unit of measurement has been used by other documents and cannot be deleted!"), [$body])];
        }
        //出库明细表
        $exitData = (new Query())->from(SkPlacingDetail::tableName())->where(['=', 'UNIT_ID', $this->UNIT_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This unit of measurement has been used by other documents and cannot be deleted!"), [$body])];
        }
        //库存调整单明细表
        $exitData = (new Query())->from(SkAdjustmentDetail::tableName())->where(['=', 'UNIT_ID', $this->UNIT_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This unit of measurement has been used by other documents and cannot be deleted!"), [$body])];
        }
        //调拨单明细表
        $exitData = (new Query())->from(SkAdjustmentDetail::tableName())->where(['=', 'UNIT_ID', $this->UNIT_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This unit of measurement has been used by other documents and cannot be deleted!"), [$body])];
        }
        //销售订单明细
        $exitData = (new Query())->from(CrSalesOrderDetail::tableName())->where(['=', 'UNIT_ID', $this->UNIT_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This unit of measurement has been used by other documents and cannot be deleted!"), [$body])];
        }
        //调拨计划单
        $exitData = (new Query())->from(SkAllocationDetail::tableName())->where(['=', 'UNIT_ID', $this->UNIT_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This unit of measurement has been used by other documents and cannot be deleted!"), [$body])];
        }
        return [$this::ACTION_NEXT, $body];
    }
}
