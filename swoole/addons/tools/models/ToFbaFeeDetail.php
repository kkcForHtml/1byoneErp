<?php

namespace addons\tools\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
use \yii\swoole\db\ActiveRecord;
use \yii\swoole\rest\ResponeModel;

/**
 * @SWG\Definition(
 *   definition="ToFbaFeeDetail",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"FBAFEEDETAIL_ID"},
 *           @SWG\Property(property="FBAFEEDETAIL_ID", type="int",description="FBA费ID"),
 *           @SWG\Property(property="CREATED", type="int",description="创建时间"),
 *           @SWG\Property(property="UPDATED", type="int",description="更新时间"),
 *           @SWG\Property(property="ISACTIVE", type="int",description="是否有效"),
 *           @SWG\Property(property="C_PROJECT_ID", type="int",description="平台"),
 *           @SWG\Property(property="FBAFEERULE_ID", type="int",description="fba费规则ID"),
 *           @SWG\Property(property="LINE", type="int",description="优先级"),
 *           @SWG\Property(property="PACKAGETYPE", type="string",description="包装类型"),
 *           @SWG\Property(property="PACKAGEWEIGHT", type="DECIMAL",description="包装重量"),
 *           @SWG\Property(property="LENGTHMAX", type="DECIMAL",description="长度上限"),
 *           @SWG\Property(property="WIDTHMAX", type="DECIMAL",description="宽度上限"),
 *           @SWG\Property(property="HEIGHTMAX", type="DECIMAL",description="高度上限"),
 *           @SWG\Property(property="LENGTHADDWMAX", type="DECIMAL",description="长度+围度上限"),
 *           @SWG\Property(property="WEIGHTMAX", type="DECIMAL",description="重量上限"),
 *           @SWG\Property(property="DIAGONALMAX", type="DECIMAL",description="对角线上限"),
 *           @SWG\Property(property="YKG", type="DECIMAL",description="首重"),
 *           @SWG\Property(property="YKGPRICE9", type="DECIMAL",description="首重价格(1-9)"),
 *           @SWG\Property(property="YKGPRICE10", type="DECIMAL",description="首重价格(10-12)"),
 *           @SWG\Property(property="OVERWEIGHTUNIT", type="DECIMAL",description="超重单位重"),
 *           @SWG\Property(property="OVERWEIGHTPRICE9", type="DECIMAL",description="超重单价(1-9)"),
 *           @SWG\Property(property="OVERWEIGHTPRICE10", type="DECIMAL",description="超重单价(10-12)"),
 *           @SWG\Property(property="AREA_ID", type="integer",description="地区ID"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class ToFbaFeeDetail extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'to_fbafeedetail';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['CREATED_AT', 'UPDATED_AT', 'C_PROJECT_ID', 'FBAFEERULE_ID', 'LINE','AREA_ID','CUSER_ID','UUSER_ID'], 'integer'],
            [['FBAFEERULE_ID'], 'required'],
            [['PACKAGEWEIGHT', 'LENGTHMAX', 'WIDTHMAX', 'HEIGHTMAX', 'LENGTHADDWMAX', 'WEIGHTMAX', 'DIAGONALMAX', 'YKG', 'YKGPRICE9', 'YKGPRICE10', 'OVERWEIGHTUNIT', 'OVERWEIGHTPRICE9', 'OVERWEIGHTPRICE10'], 'number'],
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
            'FBAFEEDETAIL_ID' => 'FBA费ID',
            'CREATED_AT' => '创建时间',
            'UPDATED_AT' => '更新时间',
            'ISACTIVE' => '是否有效',
            'C_PROJECT_ID' => '平台ID',
            'FBAFEERULE_ID' => 'fba费规则ID',
            'LINE' => '优先级',
            'PACKAGETYPE' => '包装类型',
            'PACKAGEWEIGHT' => '包装重量',
            'LENGTHMAX' => '长度上限',
            'WIDTHMAX' => '宽度上限',
            'HEIGHTMAX' => '高度上限',
            'LENGTHADDWMAX' => '长度+围度上限',
            'WEIGHTMAX' => '重量上限',
            'DIAGONALMAX' => '对角线上限',
            'YKG' => '首重',
            'YKGPRICE9' => '首重价格(1-9)',
            'YKGPRICE10' => '首重价格(10-12)',
            'OVERWEIGHTUNIT' => '超重单位重',
            'OVERWEIGHTPRICE9' => '超重单价(1-9)',
            'OVERWEIGHTPRICE10' => '超重单价(10-12)',
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
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CUSER_ID', 'UUSER_ID'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UUSER_ID'],
                ],
            ]
        ];
    }
}
