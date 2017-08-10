<?php

namespace addons\master\basics\models;

use addons\inventory\models\SkAdjustment;
use addons\inventory\models\SkAdjustmentDetail;
use addons\inventory\models\SkAllocation;
use addons\inventory\models\SkFiallocation;
use addons\inventory\models\SkFiallocationDetail;
use addons\inventory\models\SkPendingDelivery;
use addons\inventory\models\SkPendingStorage;
use addons\inventory\models\SkPlacing;
use addons\inventory\models\SkPlacingDetail;
use addons\inventory\models\SkStorage;
use addons\inventory\models\SkStorageDetail;
use addons\master\product\models\GProductSku;
use addons\master\product\models\GProductSkuFnsku;
use addons\master\product\models\GProductSkuPacking;
use addons\organization\models\OOrganisation;
use addons\shipment\models\ShAllocation;
use addons\shipment\models\ShDispatchNote;
use addons\shipment\models\ShTracking;
use addons\users\models\UUserInfo;
use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\db\Query;
use yii\swoole\helpers\ArrayHelper;
use \yii\swoole\db\ActiveRecord;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\behaviors\OperatorBehaviors;
use addons\inventory\models\SkInstantInventory;


/**
 * @SWG\Definition(
 *   definition="BWarehouse",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"WAREHOUSE_ID"},
 *           @SWG\Property(property="WAREHOUSE_ID", type="int",description="仓库ID"),
 *           @SWG\Property(property="WAREHOUSE_CODE", type="string",description="仓库编码"),
 *           @SWG\Property(property="WAREHOUSE_NAME_CN", type="string",description="仓库名称(中文)"),
 *           @SWG\Property(property="WAREHOUSE_NAME_EN", type="string",description="仓库名称(英文)"),
 *           @SWG\Property(property="WAREHOUSE_TYPE_ID", type="int",description="仓库分类ID"),
 *           @SWG\Property(property="WAREHOUSE_STATE", type="int",description="是否启用"),
 *           @SWG\Property(property="SPACE_INVENTORY", type="DECIMAL",description="空间库容(M³)"),
 *           @SWG\Property(property="WAREHOUSE_ADDRESS", type="DECIMAL",description="仓库详细地址"),
 *           @SWG\Property(property="WAREHOUSE_REMARKS", type="DECIMAL",description="备注"),
 *           @SWG\Property(property="CREATED_AT", type="int",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT", type="int",description="更新时间"),
 *           @SWG\Property(property="ORGANISATION_ID", type="int",description="所属组织ID"),
 *           @SWG\Property(property="CHANNEL_ID", type="int",description="平台ID"),
 *           @SWG\Property(property="WAREHOUSE_AREA_ID", type="int",description="仓库地区ID"),
 *           @SWG\Property(property="CUSER_ID", type="int",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="int",description="更新人ID")
 *       )
 *   }
 * )
 */
class BWarehouse extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'b_warehouse';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['WAREHOUSE_ID'], 'safe'],
            [['WAREHOUSE_CODE', 'WAREHOUSE_NAME_CN', 'ORGANISATION_ID'], 'required'],
            [['WAREHOUSE_TYPE_ID', 'WAREHOUSE_STATE', 'CREATED_AT', 'UPDATED_AT', 'CUSER_ID', 'UUSER_ID','ORGANISATION_ID','CHANNEL_ID','WAREHOUSE_AREA_ID'], 'integer'],
            [['SPACE_INVENTORY'], 'number','min'=>0,'max'=>9999999],
            [['WAREHOUSE_CODE'], 'string', 'max' => 20],
            [['WAREHOUSE_NAME_CN', 'WAREHOUSE_NAME_EN'], 'string', 'max' => 100],
            [['WAREHOUSE_ADDRESS', 'WAREHOUSE_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'WAREHOUSE_ID' => Yii::t('basics', '仓库ID'),
            'WAREHOUSE_CODE' => Yii::t('basics', '仓库编码'),
            'WAREHOUSE_NAME_CN' => Yii::t('basics', '仓库名称(中文)'),
            'WAREHOUSE_NAME_EN' => Yii::t('basics', '仓库名称(英文)'),
            'WAREHOUSE_TYPE_ID' => Yii::t('basics', '仓库分类ID'),
            'WAREHOUSE_STATE' => Yii::t('basics', '是否启用,1：Y 0：N'),
            'SPACE_INVENTORY' => Yii::t('basics', '空间库容(M³)'),
            'WAREHOUSE_ADDRESS' => Yii::t('basics', '仓库详细地址'),
            'WAREHOUSE_REMARKS' => Yii::t('basics', '备注'),
            'CREATED_AT' => Yii::t('basics', '创建时间'),
            'UPDATED_AT' => Yii::t('basics', '修改时间'),
            'ORGANISATION_ID' => Yii::t('basics', '所属组织ID'),
            'CHANNEL_ID' => Yii::t('basics', '平台ID'),
            'WAREHOUSE_AREA_ID' => Yii::t('basics', '仓库地区ID'),
            'CUSER_ID' => Yii::t('basics', '创建人ID'),
            'UUSER_ID' => Yii::t('basics', '更新人ID'),
        ];
    }

  /* public static function addQuery(&$query, $alias)
   {
       $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
       if($str){
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
    //库存组织信息
    public function getOrganisation()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'ORGANISATION_ID']);
    }

    //平台
    public function getAllBchannel()
    {
        return $this->hasOne(BChannel::className(), ['CHANNEL_ID' => 'CHANNEL_ID']);
    }

    //国家
    public function getB_area()
    {
        return $this->hasOne(BArea::className(), ['AREA_ID' => 'WAREHOUSE_AREA_ID']);
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
                'class'=>OperatorBehaviors::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CUSER_ID','UUSER_ID'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UUSER_ID'],
                ],
            ]
        ];
    }
    /**
     *仓库列表新增操作
     * before_ACreate 新增前
     * after_ACreate 新增后
     **/
    public function before_ACreate($body, $class = null)
    {
        $respone = new ResponeModel();
        $arry = $this->getU_userinfo();
        //校验必填项及数据类型
        $this->load($body, '');
        Yii::$app->BaseHelper->validate($this);
        // 判断编码及名称是否为空
        $Bwarehouse = self::find()->where(['and',['or', ['WAREHOUSE_CODE' => $body['WAREHOUSE_CODE']], ['WAREHOUSE_NAME_CN' => $body['WAREHOUSE_NAME_CN']]]])->exists();
        if ($Bwarehouse) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "The encoding or Chinese name has been repeated. Please do not submit it again!"), [$body])];
        }
        return [$this::ACTION_NEXT, $body];
    }
    public  function after_AIndex($body, $class = null)
    {
        if(count($body) > 0){
            foreach($body as $indexWare=>$itemWare){

                $InstantInventory = SkInstantInventory::find()->where(["WAREHOUSE_ID"=>$itemWare['WAREHOUSE_ID']])->orWhere(["WAREHOUSE_ID"=>$itemWare['WAREHOUSE_ID']])->asArray()->all();
                $volume = 0;
                if(count($InstantInventory) > 0){
                    foreach($InstantInventory as $indexInv=>$itemInv){
                        if($itemInv['INSTANT_NUMBER']>0 ){
                            $ProductPacking = GProductSkuPacking::find()->where(["PSKU_ID"=>$itemInv['PSKU_ID']])->asArray()->one();
                            if($ProductPacking['PACKING_NUMBER'] &&$ProductPacking['PACKING_NUMBER']>0){
                                $skuPVolume = ($ProductPacking['PACKING_LONG'] * $ProductPacking['PACKING_WIDE']*$ProductPacking['PACKING_HIGH'])/1000000/$ProductPacking['PACKING_NUMBER'];
                                $skuVolume = $skuPVolume*$itemInv['INSTANT_NUMBER'];
                                $volume += $skuVolume;
                            }
                        }
                    }
                }
                $itemWare['THEORY_INVENTORY'] = $volume;
                $body[$indexWare] = $itemWare;
            }
        }

        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 组织架构信息修改的操作
     * before_AUpdate 修改前
     * after_AUpdate 修改后
     */
    public function before_AUpdate($body, $class = null)
    {
        $respone = new ResponeModel();
        if(isset($body['WAREHOUSE_ID']) && $body['WAREHOUSE_ID']){
            $this->load($body, '');
            Yii::$app->BaseHelper->validate($this);
            // 查询数据库表，判断编码及名称是否是唯一性
            $Organisation = self::find()->where(['<>', 'WAREHOUSE_ID', $body['WAREHOUSE_ID']])->andWhere(['or', ['WAREHOUSE_CODE' => $body['WAREHOUSE_CODE']], ['WAREHOUSE_NAME_CN' => $body['WAREHOUSE_NAME_CN']]])->exists();
            if ($Organisation) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "The encoding or Chinese name has been repeated. Please do not submit it again!"), [$body])];
            }
        }
        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 仓库删除的操作
     * before_ADelete 删除前
     * after_ADelete 删除后
     */
    public function before_ADelete($body, $class = null)
    {
        $respone = new ResponeModel();
        //映射表
        $exitData = (new Query())->from(GProductSkuFnsku::tableName())->where(['=', 'WAREHOUSE_ID', $this->WAREHOUSE_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This warehouse has been used by other documents and cannot be deleted!"), [$body])];
        }
        //发运单表
        $exitData = (new Query())->from(ShDispatchNote::tableName())->where(['or',['=','WAREHOUSE_ID',$this->WAREHOUSE_ID],['=','DELIVER_WARID',$this->WAREHOUSE_ID]])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This warehouse has been used by other documents and cannot be deleted!"), [$body])];
        }
        //发运跟踪表
        $exitData = (new Query())->from(ShTracking::tableName())->where(['=', 'WAREHOUSE_ID', $this->WAREHOUSE_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This warehouse has been used by other documents and cannot be deleted!"), [$body])];
        }
        //调拨跟踪表
        $exitData = (new Query())->from(ShAllocation::tableName())->where(['or',['=','OUT_WAREHOUSE_ID',$this->WAREHOUSE_ID],['=','IN_WAREHOUSE_ID',$this->WAREHOUSE_ID]])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This warehouse has been used by other documents and cannot be deleted!"), [$body])];
        }
        //入库表
        $exitData = (new Query())->from(SkStorage::tableName())->where(['=', 'WAREHOUSE_ID', $this->WAREHOUSE_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This warehouse has been used by other documents and cannot be deleted!"), [$body])];
        }
        //入库明细表
        $exitData = (new Query())->from(SkStorageDetail::tableName())->where(['=', 'SWAREHOUSE_ID', $this->WAREHOUSE_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This warehouse has been used by other documents and cannot be deleted!"), [$body])];
        }
        //出库表
        $exitData = (new Query())->from(SkPlacing::tableName())->where(['=', 'PWAREHOUSE_ID', $this->WAREHOUSE_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This warehouse has been used by other documents and cannot be deleted!"), [$body])];
        }
        //出库明细表
        $exitData = (new Query())->from(SkPlacingDetail::tableName())->where(['=', 'PDWAREHOUSE_ID', $this->WAREHOUSE_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This warehouse has been used by other documents and cannot be deleted!"), [$body])];
        }
        //库存调整单
        $exitData = (new Query())->from(SkAdjustment::tableName())->where(['=', 'AWAREHOUSE_ID',$this->WAREHOUSE_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This warehouse has been used by other documents and cannot be deleted!"), [$body])];
        }
        //库存调整单明细表
        $exitData = (new Query())->from(SkAdjustmentDetail::tableName())->where(['=', 'TDAREHOUSE_ID', $this->WAREHOUSE_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This warehouse has been used by other documents and cannot be deleted!"), [$body])];
        }
        //调拨单表
        $exitData = (new Query())->from(SkFiallocation::tableName())->where(['or',['=','ATWAREHOUSE_ID',$this->WAREHOUSE_ID],['=','ETWAREHOUSE_ID',$this->WAREHOUSE_ID]])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This warehouse has been used by other documents and cannot be deleted!"), [$body])];
        }
        //调拨单明细表
        $exitData = (new Query())->from(SkFiallocationDetail::tableName())->where(['or',['=','ATWAREHOUSE_ID',$this->WAREHOUSE_ID],['=','ETWAREHOUSE_ID',$this->WAREHOUSE_ID]])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This warehouse has been used by other documents and cannot be deleted!"), [$body])];
        }
        //待入库表
        $exitData = (new Query())->from(SkPendingStorage::tableName())->where(['or',['=','ATWAREHOUSE_ID',$this->WAREHOUSE_ID],['=','ETWAREHOUSE_ID',$this->WAREHOUSE_ID]])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This warehouse has been used by other documents and cannot be deleted!"), [$body])];
        }
        //待出库表
        $exitData = (new Query())->from(SkPendingDelivery::tableName())->where(['or',['=','ATWAREHOUSE_ID',$this->WAREHOUSE_ID],['=','ETWAREHOUSE_ID',$this->WAREHOUSE_ID]])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This warehouse has been used by other documents and cannot be deleted!"), [$body])];
        }
        //调拨计划单
        $exitData = (new Query())->from(SkAllocation::tableName())->where(['or',['=','ATWAREHOUSE_ID',$this->WAREHOUSE_ID],['=','ETWAREHOUSE_ID',$this->WAREHOUSE_ID]])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This warehouse has been used by other documents and cannot be deleted!"), [$body])];
        }
        return [$this::ACTION_NEXT, $body];
    }

}
