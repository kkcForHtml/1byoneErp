<?php

namespace addons\tools\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
use \yii\swoole\db\ActiveRecord;
use \yii\swoole\rest\ResponeModel;

/**
 * This is the model class for table "to_mcffeedetail".
 *
 * @property integer $MCFFEEDETAIL_ID
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
 * @property string $PACKAGETYPE
 * @property string $PACKAGEWEIGHT
 * @property string $YKG
 * @property string $YKGPRICE_SHIP
 * @property string $YKGPRICE_EXP
 * @property string $YKGPRICE_PRI
 * @property string $OVERWEIGHTUNIT
 * @property string $OVERWEIGHTPRICE_SHIP
 * @property string $OVERWEIGHTPRICE_EXP
 * @property string $OVERWEIGHTPRICE_PRI
 */
class ToMcfFeeDetail extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'to_mcffeedetail';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['CREATED_AT', 'UPDATED_AT', 'FBAFEERULE_ID', 'LINE','AREA_ID','CUSER_ID','UUSER_ID'], 'integer'],
            [['FBAFEERULE_ID'], 'required'],
            [['LENGTHMAX', 'WIDTHMAX', 'HEIGHTMAX', 'LENGTHADDWMAX', 'WEIGHTMAX', 'DIAGONALMAX', 'PACKAGEWEIGHT', 'YKG', 'YKGPRICE_SHIP', 'YKGPRICE_EXP', 'YKGPRICE_PRI', 'OVERWEIGHTUNIT', 'OVERWEIGHTPRICE_SHIP', 'OVERWEIGHTPRICE_EXP', 'OVERWEIGHTPRICE_PRI'], 'number'],
            [['ISACTIVE'], 'string', 'max' => 1],
            [['PACKAGETYPE'], 'string', 'max' => 45],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'MCFFEEDETAIL_ID' => 'MCF费ID',
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
            'PACKAGETYPE' => '包装类型',
            'PACKAGEWEIGHT' => '包装重量',
            'YKG' => '首重',
            'YKGPRICE_SHIP' => '首重价格(STANDARD SHIPPING)',
            'YKGPRICE_EXP' => '首重价格(EXPEDITED)',
            'YKGPRICE_PRI' => '首重价格(PRIORITY)',
            'OVERWEIGHTUNIT' => '超重单位重',
            'OVERWEIGHTPRICE_SHIP' => '超重单价(STANDARD SHIPPING)',
            'OVERWEIGHTPRICE_EXP' => '超重单价(EXPEDITED)',
            'OVERWEIGHTPRICE_PRI' => '超重单价(PRIORITY)',
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
                'class'=>OperatorBehaviors::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CUSER_ID','UUSER_ID'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UUSER_ID'],
                ],
            ]
        ];
    }
}
