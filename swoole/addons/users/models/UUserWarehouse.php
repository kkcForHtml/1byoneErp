<?php

namespace addons\users\models;

use addons\master\basics\models\BWarehouse;
use Yii;


/**
 * This is the model class for table "u_user_warehouse".
 */

/**
 * @SWG\Definition(
 *   definition="UUserWarehouse",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="USER_WAREHOUSE_ID", type="integer",description="用户仓库分配ID"),
 *           @SWG\Property(property="USER_INFO_CODE", type="string",description="用户编码"),
 *           @SWG\Property(property="WAREHOUSE_CODE", type="string",description="仓库编码"),
 *           @SWG\Property(property="USER_INFO_ID", type="integer",description="用户ID"),
 *           @SWG\Property(property="WAREHOUSE_ID", type="integer",description="仓库ID"),
 *           @SWG\Property(property="USER_WAREHOUSE_STATE", type="integer",description="是否有权,1：有权 0无权")
 *       )
 *   }
 * )
 */
class UUserWarehouse extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'u_user_warehouse';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['USER_INFO_ID', 'WAREHOUSE_ID', 'USER_WAREHOUSE_STATE'], 'integer'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'USER_WAREHOUSE_ID' => Yii::t('users', '用户仓库分配ID'),
            'USER_INFO_ID' => Yii::t('users', '用户ID'),
            'WAREHOUSE_ID' => Yii::t('users', '仓库ID'),
            'USER_WAREHOUSE_STATE' => Yii::t('users', '是否有权,1：有权 0无权'),
        ];
    }

    public function getB_warehouse()
    {
        return $this->hasOne(BWarehouse::className(), ['WAREHOUSE_ID' => 'WAREHOUSE_ID']);
    }

}
