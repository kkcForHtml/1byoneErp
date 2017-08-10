<?php

namespace addons\tools\models;

use addons\master\basics\models\BArea;
use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
use \yii\swoole\db\ActiveRecord;
use \yii\swoole\rest\ResponeModel;

/**
 * @SWG\Definition(
 *   definition="ToFbaFeeRule",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"FBAFEERULE_ID"},
 *           @SWG\Property(property="FBAFEERULE_ID", type="int",description="主键ID"),
 *           @SWG\Property(property="CREATED", type="int",description="创建时间"),
 *           @SWG\Property(property="UPDATED", type="int",description="更新时间"),
 *           @SWG\Property(property="ISACTIVE", type="int",description="是否有效"),
 *           @SWG\Property(property="C_PROJECT_ID", type="int",description="平台"),
 *           @SWG\Property(property="LENGTHUNIT", type="string",format="int32",description="长度单位"),
 *           @SWG\Property(property="WEIGHTUNIT", type="string",description="重量单位"),
 *           @SWG\Property(property="VOLWEIGHTPROP", type="double",description="体积重比例"),
 *           @SWG\Property(property="AREA_ID", type="integer",description="地区ID"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class ToFbaFeeRule extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'to_fbafeerule';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['FBAFEERULE_ID'],'safe'],
            [['CREATED_AT', 'UPDATED_AT', 'C_PROJECT_ID','AREA_ID','CUSER_ID','UUSER_ID'], 'integer'],
            [['VOLWEIGHTPROP'], 'number'],
            [['ISACTIVE'], 'string', 'max' => 1],
            [['LENGTHUNIT', 'WEIGHTUNIT'], 'string', 'max' => 10],
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

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'FBAFEERULE_ID' => 'FBA费规则ID',
            'CREATED_AT' => '创建时间',
            'UPDATED_AT' => '更新时间',
            'ISACTIVE' => '是否有效',
            'C_PROJECT_ID' => '平台',
            'LENGTHUNIT' => '长度单位',
            'WEIGHTUNIT' => '重量单位',
            'VOLWEIGHTPROP' => '体积重比例',
            'AREA_ID' => '地区ID',
            'CUSER_ID' => '创建人ID',
            'UUSER_ID' => '更新人ID',
        ];
    }

    public $realation = ['to_fbafeedetail' => ['FBAFEERULE_ID' => 'FBAFEERULE_ID'],
        'to_mcffeedetail' => ['FBAFEERULE_ID' => 'FBAFEERULE_ID'],
        'to_mstoragefeedetail' => ['FBAFEERULE_ID' => 'FBAFEERULE_ID']
    ];

    /**
     * @inheritdoc
     */
    public function getTo_fbafeedetail()
    {
        return $this->hasMany(ToFbaFeeDetail::className(), ['FBAFEERULE_ID' => 'FBAFEERULE_ID']);
    }

    /**
     * @inheritdoc
     */
    public function getTo_mcffeedetail()
    {
        return $this->hasMany(ToMcfFeeDetail::className(), ['FBAFEERULE_ID' => 'FBAFEERULE_ID']);
    }

    /**
     * @inheritdoc
     */
    public function getTo_mstoragefeedetail()
    {
        return $this->hasMany(ToMstorageFeeDetail::className(), ['FBAFEERULE_ID' => 'FBAFEERULE_ID']);
    }

    /**
     * @inheritdoc
     */
    public function getBarea()
    {
        return $this->hasOne(BArea::className(), ['AREA_ID' => 'AREA_ID']);
    }

    /**
     * FBA规则删除的操作
     * before_ADelete 删除前
     * after_ADelete 删除后
     */
    public function before_ADelete($body, $class = null)
    {
        ToFbaFeeDetail::deleteAll(['FBAFEERULE_ID' => $this->FBAFEERULE_ID]);
        ToMcfFeeDetail::deleteAll(['FBAFEERULE_ID' => $this->FBAFEERULE_ID]);
        ToMstorageFeeDetail::deleteAll(['FBAFEERULE_ID' => $this->FBAFEERULE_ID]);
        return [$this::ACTION_NEXT, $body];
    }

}
