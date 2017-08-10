<?php

namespace addons\master\basics\models;

use addons\users\models\UUserInfo;
use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
use \yii\swoole\db\ActiveRecord;
use \yii\swoole\rest\ResponeModel;

/**
 * @SWG\Definition(
 *   definition="BExchangeRate",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"EXCHANGE_RATE_ID"},
 *           @SWG\Property(property="EXCHANGE_RATE_ID", type="int",description="主键ID"),
 *           @SWG\Property(property="EXCHANGE_RATE_TYPE_ID", type="string",description="币种汇率类型ID"),
 *           @SWG\Property(property="EFFECTIVE_START_DATE", type="string",description="有效起始日"),
 *           @SWG\Property(property="EFFECTIVE_END_DATE", type="string",description="有效截止日"),
 *           @SWG\Property(property="EXCHANGE_RATE_ODDS", type="int",description="倍率"),
 *           @SWG\Property(property="EXCHANGE_RATE_STATE", type="int",description="是否启用,1：Y 0：N"),
 *           @SWG\Property(property="CREATED_AT", type="int",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT", type="int",description="更新时间"),
 *           @SWG\Property(property="EXCHANGE_RATE_REMARKS", type="string",description="备注"),
 *           @SWG\Property(property="MONEY_ID", type="string",description="币种ID"),
 *           @SWG\Property(property="TARGET_MONEY_ID", type="string",description="目标币种ID"),
 *           @SWG\Property(property="CUSER_ID", type="string",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="string",description="更新人ID")
 *       )
 *   }
 * )
 */
class BExchangeRate extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'b_exchange_rate';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['MONEY_ID'], 'required'],
            [['MONEY_ID', 'TARGET_MONEY_ID', 'CUSER_ID', 'UUSER_ID', 'EXCHANGE_RATE_TYPE_ID', 'EFFECTIVE_START_DATE', 'EFFECTIVE_END_DATE', 'EXCHANGE_RATE_STATE', 'CREATED_AT', 'UPDATED_AT'], 'integer'],
            [['EXCHANGE_RATE_ODDS'], 'number', 'max' => 99999999, 'min' => 0],
            [['EFFECTIVE_START_DATE'], 'number', 'max' => 9999999999, 'min' => 0],
            [['EFFECTIVE_END_DATE'], 'number', 'max' => 9999999999, 'min' => 0],
            [['EXCHANGE_RATE_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'EXCHANGE_RATE_ID' => Yii::t('basics', '汇率ID'),
            'EXCHANGE_RATE_TYPE_ID' => Yii::t('basics', '币种汇率类型ID'),
            'EFFECTIVE_START_DATE' => Yii::t('basics', '有效起始日'),
            'EFFECTIVE_END_DATE' => Yii::t('basics', '有效截止日'),
            'EXCHANGE_RATE_STATE' => Yii::t('basics', '是否启用,1：Y 0：N'),
            'EXCHANGE_RATE_ODDS' => Yii::t('basics', '倍率'),
            'CREATED_AT' => Yii::t('basics', '创建时间'),
            'UPDATED_AT' => Yii::t('basics', '修改时间'),
            'EXCHANGE_RATE_REMARKS' => Yii::t('basics', '备注'),
            'MONEY_ID' => Yii::t('basics', '币种ID'),
            'TARGET_MONEY_ID' => Yii::t('basics', '目标币种ID'),
            'CUSER_ID' => Yii::t('basics', '创建人ID'),
            'UUSER_ID' => Yii::t('basics', '更新人ID'),
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

    //币种
    public function getB_money()
    {
        return $this->hasOne(BMoney::className(), ['MONEY_ID' => 'MONEY_ID'])->alias('b_money');
    }

    //目标币种
    public function getB_target_money()
    {
        return $this->hasOne(BMoney::className(), ['MONEY_ID' => 'TARGET_MONEY_ID'])->alias('b_target_money');
    }

    public function after_ACreate($body, $class = null)
    {
        $respone = new ResponeModel();
        // 判断编码及名称是否为空
        $this->load($body, '');
        Yii::$app->BaseHelper->validate($this);
        //一个币种和一个目标币种有效的只存在一条记录
        if (isset($body['EXCHANGE_RATE_STATE']) && $body['EXCHANGE_RATE_STATE'] == 1) {
            BExchangeRate::updateAll(['EXCHANGE_RATE_STATE' => "0"], ['and', ['=', 'MONEY_ID', $body['MONEY_ID']], ['=', 'TARGET_MONEY_ID', $body['TARGET_MONEY_ID']], ['<>', 'EXCHANGE_RATE_ID', $this->EXCHANGE_RATE_ID]]);
        }
        return [$this::ACTION_NEXT, $body];
    }

    public function after_AUpdate($body, $class = null)
    {
        $respone = new ResponeModel();
        // 判断编码及名称是否为空
        $this->load($body, '');
        Yii::$app->BaseHelper->validate($this);
        //一个币种和一个目标币种有效的只存在一条记录
        if (isset($body['EXCHANGE_RATE_STATE']) && $body['EXCHANGE_RATE_STATE'] == 1) {
            BExchangeRate::updateAll(['EXCHANGE_RATE_STATE' => "0"], ['and', ['=', 'MONEY_ID', $body['MONEY_ID']], ['=', 'TARGET_MONEY_ID', $body['TARGET_MONEY_ID']], ['<>', 'EXCHANGE_RATE_ID', $this->EXCHANGE_RATE_ID]]);
        }
        return [$this::ACTION_NEXT, $body];
    }

}
