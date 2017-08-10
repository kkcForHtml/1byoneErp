<?php

namespace addons\inventory\models;

use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;
/**
 * This is the model class for table "sk_library_record".
 *
 * @property integer $LIBRARY_RECORD_ID
 * @property string $ORDER_CD
 * @property integer $ORDER_TYPE
 * @property string $PSKU_CODE
 * @property string $WAREHOUSE_CODE
 * @property string $ORGANISATION_CODE
 * @property integer $NUMBERS
 * @property string $UNITPRICE
 * @property string $CREATED_AT
 * @property string $ORDER_AT
 * @property string $UUSER_CODE
 */
class SkLibraryRecord extends \yii\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_library_record';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PSKU_ID','ORDER_TYPE', 'NUMBERS', 'CREATED_AT', 'ORDER_AT','WAREHOUSE_ID','ORGANISATION_ID','UUSER_ID'], 'integer'],
            [['UNITPRICE'], 'number'],
            [['ORDER_CD'], 'string', 'max' => 30],
            [['PSKU_CODE'], 'string', 'max' => 20],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'LIBRARY_RECORD_ID' => Yii::t('inventory', '出入库记录ID'),
            'ORDER_CD' => Yii::t('inventory', '单号'),
            'ORDER_TYPE' => Yii::t('inventory', '单据类型:1入库单，2出库单 3 库存调整单 4 调拨（调出） 5调拨（调入） 99初始化数据'),
            'PSKU_ID' => Yii::t('inventory', 'SKU ID'),
            'PSKU_CODE' => Yii::t('inventory', 'SKU编码'),
            'NUMBERS' => Yii::t('inventory', '数量'),
            'UNITPRICE' => Yii::t('inventory', '单价'),
            'CREATED_AT' => Yii::t('inventory', '操作日期'),
            'ORDER_AT' => Yii::t('inventory', '单据日期'),
            'WAREHOUSE_ID' => Yii::t('inventory', '仓库ID'),
            'ORGANISATION_ID' => Yii::t('inventory', '组织'),
            'UUSER_ID' => Yii::t('inventory', '操作人'),
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
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CREATED_AT'],
                ],
            ],
            [
                'class' => OperatorBehaviors::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['UUSER_ID'],
                ],
            ]
        ];
    }
}
