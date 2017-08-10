<?php

namespace addons\inventory\models;

use Yii;

use yii\swoole\db\ActiveRecord;

use addons\inventory\models\SkPendingStorage;
use addons\inventory\models\SkFiallocation;
use addons\inventory\models\SkFiallocationDetail;
use addons\master\basics\models\BWarehouse;
use addons\organization\models\OOrganisation;

/**
 * This is the model class for table "sk_pending_stroage_relation".
 *
 * @property integer $STORAGE_RELATION_ID
 * @property integer $PENDING_STORAGE_ID
 * @property integer $FIALLOCATION_ID
 * @property integer $CREATE_AT
 */
class SkPendingStroageRelation  extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_pending_stroage_relation';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PENDING_STORAGE_ID', 'FIALLOCATION_ID', 'CREATE_AT'], 'integer'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'STORAGE_RELATION_ID' => '中间表id',
            'PENDING_STORAGE_ID' => '待入库id',
            'FIALLOCATION_ID' => '调拨单id',
            'CREATE_AT' => '创建时间',
        ];
    }

    //关联添加配置()
    public $realation = ['o_organisation' => ['ORGANISATION_ID' => 'ORGANISATION_ID'],'sk_fiallocation' => ['FIALLOCATION_ID' => 'FIALLOCATION_ID'],'sk_fiallocation_detail'=>['FIALLOCATION_ID'=>'FIALLOCATION_ID'],'a_warehouse' => ['WAREHOUSE_ID' => 'ATWAREHOUSE_ID'], 'e_warehouse' => ['WAREHOUSE_ID' => 'ETWAREHOUSE_ID'],
'sk_pending_storage'=>['PENDING_STORAGE_ID'=>'PENDING_STORAGE_ID']];

    //关联待入库单
    public function getSk_pending_storage()
    {
        return $this->hasOne(SkPendingStorage::className(), ['PENDING_STORAGE_ID' => 'PENDING_STORAGE_ID']);
    }

    //关联调拨单
    public function getSk_fiallocation()
    {
        return $this->hasOne(SkFiallocation::className(), ['FIALLOCATION_ID' => 'FIALLOCATION_ID']);
    }

    //关联调拨单详情
    public function getSk_fiallocation_detail(){
        return $this->hasOne(SkFiallocationDetail::className(), ['FIALLOCATION_ID' => 'FIALLOCATION_ID']);
    }

    //关联调出仓库
    public function getA_warehouse()
    {
        return $this->hasOne(BWarehouse::className(), ['WAREHOUSE_ID' => 'ATWAREHOUSE_ID'])->select(['WAREHOUSE_CODE', 'WAREHOUSE_NAME_CN']);
    }

    //关联调入仓库
    public function getE_warehouse()
    {
        return $this->hasOne(BWarehouse::className(), ['WAREHOUSE_ID' => 'ETWAREHOUSE_ID'])->select(['WAREHOUSE_CODE', 'WAREHOUSE_NAME_CN']);
    }

    //关联组织
    public function getO_organisation()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'ORGANISATION_ID'])->select(['ORGANISATION_CODE','ORGANISATION_NAME_CN','ORGANISATION_NAME_EN']);
    }
}
