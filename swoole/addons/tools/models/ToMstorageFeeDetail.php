<?php

namespace addons\tools\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
use \yii\swoole\db\ActiveRecord;
use \yii\swoole\rest\ResponeModel;

/**
 * This is the model class for table "to_mstoragefeedetail".
 *
 * @property integer $MSTORAGEFEEDETAIL_ID
 * @property integer $CREATED
 * @property integer $UPDATED
 * @property string $ISACTIVE
 * @property integer $FBAFEERULE_ID
 * @property integer $LINE
 * @property string $LENGTHMAX
 * @property string $WIDTHMAX
 * @property string $HEIGHTMAX
 * @property string $LENGTHADDWMAX
 * @property string $WEIGHTMAX
 * @property string $DIAGONALMAX
 * @property string $MINVENTORYFEE9
 * @property string $MINVENTORYFEE10
 * @property string $LONGTIMEFEE6
 * @property string $LONGTIMEFEE12
 * @property string $PACKAGEWEIGHT
 */
class ToMstorageFeeDetail extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'to_mstoragefeedetail';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['CREATED_AT', 'UPDATED_AT', 'FBAFEERULE_ID', 'LINE','AREA_ID','CUSER_ID','UUSER_ID'], 'integer'],
            [['FBAFEERULE_ID'], 'required'],
            [['LENGTHMAX', 'WIDTHMAX', 'HEIGHTMAX', 'LENGTHADDWMAX', 'WEIGHTMAX', 'DIAGONALMAX', 'MINVENTORYFEE9', 'MINVENTORYFEE10', 'LONGTIMEFEE6', 'LONGTIMEFEE12', 'PACKAGEWEIGHT'], 'number'],
            [['ISACTIVE'], 'string', 'max' => 1],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'MSTORAGEFEEDETAIL_ID' => '月存储费ID',
            'CREATED_AT' => '创建时间',
            'UPDATED_AT' => '更新时间',
            'ISACTIVE' => '是否有效',
            'FBAFEERULE_ID' => '主表ID',
            'LINE' => '优先级',
            'LENGTHMAX' => '长边上限',
            'WIDTHMAX' => '中边上限',
            'HEIGHTMAX' => '短边上限',
            'LENGTHADDWMAX' => '长边+围度上限',
            'WEIGHTMAX' => '重量上限',
            'DIAGONALMAX' => '对角线上限',
            'MINVENTORYFEE9' => '月存储费(1-9)',
            'MINVENTORYFEE10' => '月存储费(10-12)',
            'LONGTIMEFEE6' => 'LONG TIME费(6-12)',
            'LONGTIMEFEE12' => 'LONG TIME费(超过11)',
            'PACKAGEWEIGHT' => '包装重量',
            'AREA_ID' => '地区ID',
            'CUSER_ID' => '创建人ID',
            'UUSER_ID' => '更新人ID',
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
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CUSER_ID', 'UPUSER_ID'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UPUSER_ID'],
                ],
            ]
        ];
    }
}
