<?php
/**
 * User: Fable
 */
namespace addons\tools\models;

use Yii;
use yii\swoole\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\swoole\rest\ResponeModel;

/**
 * This is the model class for table "obo_weighted".
 *
 * @property integer $WEIGHTED_ID
 * @property string $WEIGHTED_CODE
 * @property string $WEIGHTED_NAME
 * @property string $WEIGHTED_DAY3
 * @property string $WEIGHTED_DAY7
 * @property string $WEIGHTED_DAY15
 * @property string $WEIGHTED_DAY30
 * @property string $CUSER_CODE
 * @property integer $CREATE_AT
 * @property string $UUSER_CODE
 * @property integer $UPDATE_AT
UPDATE_AT
 */
class OboWeighted extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'obo_weighted';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['WEIGHTED_DAY3', 'WEIGHTED_DAY7', 'WEIGHTED_DAY15', 'WEIGHTED_DAY30'], 'number'],
            [['CREATED_AT', 'UPDATED_AT','UUSER_ID','CUSER_ID'], 'integer'],
            [['WEIGHTED_CODE', 'WEIGHTED_NAME'], 'string', 'max' => 20],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'WEIGHTED_ID' => '加权策略id',
            'WEIGHTED_CODE' => '加权策略Code',
            'WEIGHTED_NAME' => '加权策略名称',
            'WEIGHTED_DAY3' => '3天加权策略',
            'WEIGHTED_DAY7' => '7天加权策略',
            'WEIGHTED_DAY15' => '15天加权策略',
            'WEIGHTED_DAY30' => '30天加权策略',
            'CREATED_AT' => '创建时间',
            'UPDATED_AT' => '更新时间',
            'UUSER_ID' => '创建人',
            'CUSER_ID' => '更新人',
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

    /**
     * 创建前检测
     */
    public function before_ACreate($body, $class = null)
    {
        $response = new  ResponeModel();

        $res = OboWeighted::find()->where(['and',['=','WEIGHTED_CODE',$body['WEIGHTED_CODE']]])->asArray()->one();

        if($res){
            return [static::ACTION_RETURN,$response->setModel(500, 0, Yii::t('tools', 'The replenishment strategy already exists'), [$body])];
        }

        return parent::before_ACreate($body, $class);
    }

    /**
     * 更新前的检测
     */
    public function before_AUpdate($body, $class = null)
    {
        $response = new  ResponeModel();

        $res = OboWeighted::find()->where(['and',
                            ['=','WEIGHTED_CODE',$body['WEIGHTED_CODE']],
                            ['!=','WEIGHTED_ID',$body['WEIGHTED_ID']]
                        ])->asArray()->one();

        if($res){
            return [static::ACTION_RETURN,$response->setModel(500, 0, Yii::t('tools', 'The replenishment strategy already exists'), [$body])];
        }

        return parent::before_AUpdate($body, $class);
    }
}