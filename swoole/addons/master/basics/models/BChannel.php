<?php

namespace addons\master\basics\models;

use addons\organization\models\OOrganisation;
use addons\master\partint\models\PaPartner;
use addons\purchase\models\PuPlan;
use addons\purchase\models\PuPurchase;
use addons\purchase\models\PuPurchaseDetail;
use addons\sales\models\CrSalesOrder;
use addons\shipment\models\ShAllocation;
use addons\shipment\models\ShDispatchNote;
use addons\shipment\models\ShTracking;
use addons\tools\models\ToFbaFeeDetail;
use Yii;
use addons\users\models\UUserInfo;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;
use yii\swoole\db\Query;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\behaviors\OperatorBehaviors;


/**
 * @SWG\Definition(
 *   definition="BChannel",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"CHANNEL_ID"},
 *           @SWG\Property(property="CHANNEL_ID", type="int",description="平台D"),
 *           @SWG\Property(property="CHANNEL_CODE", type="string",description="平台编码"),
 *           @SWG\Property(property="CHANNEL_NAME_CN", type="string",description="平台名称(中文)"),
 *           @SWG\Property(property="CHANNEL_NAME_EN", type="string",description="平台名称(英文)"),
 *           @SWG\Property(property="PLATFORM_TYPE_ID", type="int",description="平台分类"),
 *           @SWG\Property(property="CHANNEL_ABBREVIATION", type="string",description="符号(或简称)"),
 *           @SWG\Property(property="WAREHOUSE_TYPE_ID", type="int",description="仓库分类ID"),
 *           @SWG\Property(property="CHANNEL_STATE", type="int",description="是否启用"),
 *           @SWG\Property(property="CHANNEL_REMARKS", type="string",description="备注"),
 *           @SWG\Property(property="CREATED_AT", type="int",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT", type="int",description="更新时间"),
 *           @SWG\Property(property="SEABORNE_PRICE", type="double",description="海运价格(RMB/M3)"),
 *           @SWG\Property(property="EXPRESS_PRICE", type="double",description="快递价格(RMB/KG)"),
 *           @SWG\Property(property="AIR_FREIGHT_PRICE", type="double",description="空运价格(RMB/KG)"),
 *           @SWG\Property(property="AMAZON_COMMISSION", type="double",description="亚马逊Commission"),
 *           @SWG\Property(property="SHIPPING_PRICE", type="double",description="龙舟海运价格(RMB/M3)"),
 *           @SWG\Property(property="SHIPPING_PRICE_TO", type="double",description="龙舟海运价格2(RMB/M3)"),
 *           @SWG\Property(property="IMPORT_TARIFF_RATE", type="double",description="进口分类税率"),
 *           @SWG\Property(property="FBA_FREIGHT", type="double",description="当地至FBA运费(RMB/KG)"),
 *           @SWG\Property(property="IMPORT_VAT_TAXRATE", type="double",description="进口VAT税率"),
 *           @SWG\Property(property="LAND_CARRIAGE_PRICE", type="double",description="陆运价格(RMB/KG)"),
 *           @SWG\Property(property="TAX_COST_COEFFICIENT", type="double",description="税率成本系数"),
 *           @SWG\Property(property="ORGANISATION_ID", type="int",description="所属组织ID"),
 *           @SWG\Property(property="PARTNER_ID", type="int",description="伙伴ID"),
 *           @SWG\Property(property="CUSER_ID", type="int",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="int",description="更新人ID")
 *       )
 *   }
 * )
 */
class BChannel extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'b_channel';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['CHANNEL_ID'], 'safe'],
            [['CHANNEL_CODE', 'CHANNEL_NAME_CN','ORGANISATION_ID','PLATFORM_TYPE_ID','PARTNER_ID'], 'required'],
            [['PLATFORM_TYPE_ID', 'CHANNEL_STATE', 'CREATED_AT', 'UPDATED_AT', 'CUSER_ID', 'UUSER_ID','ORGANISATION_ID','PARTNER_ID'], 'integer'],
            [['CHANNEL_CODE'], 'string', 'max' => 20],
            [['CHANNEL_NAME_CN', 'CHANNEL_NAME_EN'], 'string', 'max' => 100],
            [['CHANNEL_ABBREVIATION'], 'string', 'max' => 50],
            [['CHANNEL_REMARKS'], 'string', 'max' => 255],
            [['SEABORNE_PRICE', 'EXPRESS_PRICE', 'AIR_FREIGHT_PRICE', 'AMAZON_COMMISSION', 'SHIPPING_PRICE', 'SHIPPING_PRICE_TO', 'IMPORT_TARIFF_RATE', 'FBA_FREIGHT', 'IMPORT_VAT_TAXRATE', 'LAND_CARRIAGE_PRICE', 'TAX_COST_COEFFICIENT'], 'number', 'min' => 0, 'max' => 9999999999],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'CHANNEL_ID' => Yii::t('basics', '平台ID'),
            'CHANNEL_CODE' => Yii::t('basics', '平台编码'),
            'CHANNEL_NAME_CN' => Yii::t('basics', '平台名称(中文)'),
            'CHANNEL_NAME_EN' => Yii::t('basics', '平台名称(英文)'),
            'PLATFORM_TYPE_ID' => Yii::t('basics', '平台分类ID'),
            'CHANNEL_ABBREVIATION' => Yii::t('basics', '符号（或简称）'),
            'SEABORNE_PRICE' => Yii::t('basics', '海运价格(RMB/M3)'),
            'EXPRESS_PRICE' => Yii::t('basics', '快递价格(RMB/KG)'),
            'AIR_FREIGHT_PRICE' => Yii::t('basics', '空运价格(RMB/KG)'),
            'AMAZON_COMMISSION' => Yii::t('basics', '亚马逊Commission'),
            'SHIPPING_PRICE' => Yii::t('basics', '龙舟海运价格(RMB/M3)'),
            'SHIPPING_PRICE_TO' => Yii::t('basics', '龙舟海运价格2(RMB/M3)'),
            'IMPORT_TARIFF_RATE' => Yii::t('basics', '进口分类税率'),
            'FBA_FREIGHT' => Yii::t('basics', '当地至FBA运费(RMB/KG)'),
            'IMPORT_VAT_TAXRATE' => Yii::t('basics', '进口VAT税率'),
            'LAND_CARRIAGE_PRICE' => Yii::t('basics', '陆运价格(RMB/KG)'),
            'TAX_COST_COEFFICIENT' => Yii::t('basics', '税率成本系数'),
            'CHANNEL_STATE' => Yii::t('basics', '是否启用,1：Y 0：N'),
            'CHANNEL_REMARKS' => Yii::t('basics', '备注'),
            'CREATED_AT' => Yii::t('basics', '创建时间'),
            'UPDATED_AT' => Yii::t('basics', '修改时间'),
            'ORGANISATION_ID' => Yii::t('basics', '所属组织ID'),
            'PARTNER_ID' => Yii::t('basics', '伙伴ID'),
            'CUSER_ID' => Yii::t('basics', '创建人ID'),
            'UUSER_ID' => Yii::t('basics', '更新人ID'),
        ];
    }

    /*public static function addQuery(&$query, $alias)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            #组织权限
            $query->andWhere([$alias . '.ORGANIZE_CODE' => Yii::$app->session->get('organization') ?: null]);
        }
    }*/


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

    //所属组织
    public function getO_organisation()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'ORGANISATION_ID']);
    }

    //业务伙伴
    public function getPa_partner()
    {
        return $this->hasOne(PaPartner::className(), ['PARTNER_ID' => 'PARTNER_ID']);
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
            ]
        ];
    }

    /**
     * 账号信息新增的操作
     * before_ACreate 新增前
     * after_ACreate 新增后
     */
    public function before_ACreate($body, $class = null)
    {
        $respone = new ResponeModel();
        $this->load($body, '');
        Yii::$app->BaseHelper->validate($this);
        // 查询数据库表，判断编码及名称是否是唯一性
        $Channel = self::find()->where(["or", ['CHANNEL_CODE' => $body['CHANNEL_CODE']], ['CHANNEL_NAME_CN' => $body['CHANNEL_NAME_CN']]])->andWhere(['=', 'PLATFORM_TYPE_ID', $body['PLATFORM_TYPE_ID']])->exists();
        if ($Channel) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "The platform already exists. Please do not submit again!"), [$body])];
        }
        return [$this::ACTION_NEXT, $body];
    }

    public function before_AUpdate($body, $class = null)
    {
        $respone = new ResponeModel();
        if (isset($body['CHANNEL_ID']) && $body['CHANNEL_ID']) {
            $this->load($body, '');
            Yii::$app->BaseHelper->validate($this);
            // 查询数据库表，判断编码及名称是否是唯一性
            $Organisation = self::find()->where(['<>', 'CHANNEL_ID', $body['CHANNEL_ID']])->andWhere(['or', ['CHANNEL_CODE' => $body['CHANNEL_CODE']], ['CHANNEL_NAME_CN' => $body['CHANNEL_NAME_CN']]])->andWhere(['=', 'PLATFORM_TYPE_ID', $body['PLATFORM_TYPE_ID']])->exists();
            if ($Organisation) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "The encoding or Chinese name has been repeated. Please do not submit it again!"), [$body])];
            }
        } else {
            $this->load($body, '');
            Yii::$app->BaseHelper->validate($this);
            $channel = self::find()->Where(['or', ['CHANNEL_CODE' => $body['CHANNEL_CODE']], ['CHANNEL_NAME_CN' => $body['CHANNEL_NAME_CN']]])->andWhere(['=', 'PLATFORM_TYPE_ID', $body['PLATFORM_TYPE_ID']])->exists();
            if ($channel) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "The platform type corresponding to the encoding or name already exists. Please do not submit again!"), [$body])];
            }
        }
        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 平台删除的操作
     * before_ADelete 删除前
     * after_ADelete 删除后
     */
    public function before_ADelete($body, $class = null)
    {
        $respone = new ResponeModel();
        //仓库表
        $exitData = (new Query())->from(BWarehouse::tableName())->where(['=', 'CHANNEL_ID', $this->CHANNEL_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This platform has been used by other documents and cannot be deleted!"), [$body])];
        }
        //账号表
        $exitData = (new Query())->from(BAccount::tableName())->where(['=', 'CHANNEL_ID', $this->CHANNEL_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This platform has been used by other documents and cannot be deleted!"), [$body])];
        }
        //采购计划表
        $exitData = (new Query())->from(PuPlan::tableName())->where(['=', 'CHANNEL_ID', $this->CHANNEL_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This platform has been used by other documents and cannot be deleted!"), [$body])];
        }
        //采购订单表
        $exitData = (new Query())->from(PuPurchase::tableName())->where(['=', 'CHANNEL_ID', $this->CHANNEL_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This platform has been used by other documents and cannot be deleted!"), [$body])];
        }
        //采购订单明细表
        $exitData = (new Query())->from(PuPurchaseDetail::tableName())->where(['=', 'CHANNEL_ID', $this->CHANNEL_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This platform has been used by other documents and cannot be deleted!"), [$body])];
        }
        //发运单表
        $exitData = (new Query())->from(ShDispatchNote::tableName())->where(['=', 'CHANNEL_ID', $this->CHANNEL_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This platform has been used by other documents and cannot be deleted!"), [$body])];
        }
        //发运跟踪表
        $exitData = (new Query())->from(ShTracking::tableName())->where(['=', 'CHANNEL_ID', $this->CHANNEL_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This platform has been used by other documents and cannot be deleted!"), [$body])];
        }
        //调拨跟踪表
        $exitData = (new Query())->from(ShAllocation::tableName())->where(['=', 'CHANNEL_ID', $this->CHANNEL_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This platform has been used by other documents and cannot be deleted!"), [$body])];
        }
        //销售订单表
        $exitData = (new Query())->from(CrSalesOrder::tableName())->where(['=', 'CHANNEL_ID', $this->CHANNEL_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This platform has been used by other documents and cannot be deleted!"), [$body])];
        }
        //FBA表
        $exitData = (new Query())->from(ToFbaFeeDetail::tableName())->where(['=', 'C_PROJECT_ID', $this->CHANNEL_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This platform has been used by other documents and cannot be deleted!"), [$body])];
        }
        return [$this::ACTION_NEXT, $body];
    }
}
