<?php
/**
 * User: Fable
 */
namespace addons\tools\models;

use Yii;
use yii\swoole\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;

/**
 * This is the model class for table "obo_saletotal".
 *
 * @property integer $SALETOTAL_ID
 * @property integer $AD_CLIENT_ID
 * @property string $ORGANISATION_CODE
 * @property string $CUSER_CODE
 * @property integer $CREATED_AT
 * @property string $UUSER_CODE
 * @property integer $UPDATE_AT
 * @property string $CHANNEL_CODE
 * @property string $PSKU_CODE
 * @property integer $DAY1
 * @property integer $DAY2
 * @property integer $DAY3
 * @property integer $DAY4
 * @property integer $DAY5
 * @property integer $DAY6
 * @property integer $DAY7
 * @property integer $DAY8
 * @property integer $DAY9
 * @property integer $DAY10
 * @property integer $DAY11
 * @property integer $DAY12
 * @property integer $DAY13
 * @property integer $DAY14
 * @property integer $DAY15
 * @property integer $DAY16
 * @property integer $DAY17
 * @property integer $DAY18
 * @property integer $DAY19
 * @property integer $DAY20
 * @property integer $DAY21
 * @property integer $DAY22
 * @property integer $DAY23
 * @property integer $DAY24
 * @property integer $DAY25
 * @property integer $DAY26
 * @property integer $DAY27
 * @property integer $DAY28
 * @property integer $DAY29
 * @property integer $DAY30
 * @property integer $MONTH1
 * @property integer $MONTH2
 * @property integer $MONTH3
 * @property integer $MONTH4
 * @property integer $MONTH5
 * @property integer $MONTH6
 * @property integer $MONTH7
 * @property integer $MONTH8
 * @property integer $MONTH9
 * @property integer $MONTH10
 * @property integer $MONTH11
 * @property integer $MONTH12
 * @property double $AVG3
 * @property double $AVG7
 * @property double $AVG15
 * @property double $AVG30
 * @property double $THREEDAYS
 * @property double $SEVENDAYS
 * @property double $FIFTEENDAYS
 * @property double $THIRTYDAYS
 * @property double $WEIGHTAVGSALE
 * @property string $SALESTATUS
 */
class OboSaletotal extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'obo_saletotal';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['PSKU_ID','AD_CLIENT_ID', 'CREATED_AT', 'UPDATED_AT', 'DAY1', 'DAY2', 'DAY3', 'DAY4', 'DAY5', 'DAY6', 'DAY7', 'DAY8', 'DAY9', 'DAY10', 'DAY11',
                'DAY12', 'DAY13', 'DAY14', 'DAY15', 'DAY16', 'DAY17', 'DAY18', 'DAY19', 'DAY20', 'DAY21', 'DAY22', 'DAY23', 'DAY24', 'DAY25', 'DAY26', 'DAY27',
                'DAY28', 'DAY29', 'DAY30', 'MONTH1', 'MONTH2', 'MONTH3', 'MONTH4', 'MONTH5', 'MONTH6', 'MONTH7', 'MONTH8', 'MONTH9', 'MONTH10', 'MONTH11',
                'MONTH12','ORGANISATION_ID','CHANNEL_ID','CUSER_ID','UUSER_ID'], 'integer'],
            [['AVG3', 'AVG7', 'AVG15', 'AVG30', 'THREEDAYS', 'SEVENDAYS', 'FIFTEENDAYS', 'THIRTYDAYS', 'WEIGHTAVGSALE'], 'number'],
            [['ORGANISATION_CODE', 'CUSER_CODE', 'UUSER_CODE', 'CHANNEL_CODE', 'PSKU_CODE'], 'string', 'max' => 20],
            [['SALESTATUS'], 'string', 'max' => 15],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'SALETOTAL_ID' => '记录id',
            'AD_CLIENT_ID' => '账套',
            'ORGANISATION_CODE' => '组织编码',
            'CUSER_CODE' => '创建人',
            'CREATED_AT' => '创建时间',
            'UUSER_CODE' => '更新人',
            'UPDATED_AT' => '更新时间',
            'CHANNEL_CODE' => '平台code',
            'PSKU_ID' => Yii::t('tools', 'SKU ID'),
            'PSKU_CODE' => 'SKU编码',
            'DAY1' => '距今前2天日期的销量',
            'DAY2' => '距今前3天日期的销量',
            'DAY3' => '距今前4天日期的销量',
            'DAY4' => '距今前5天日期的销量',
            'DAY5' => '距今前6天日期的销量',
            'DAY6' => '距今前7天日期的销量',
            'DAY7' => '距今前8天日期的销量',
            'DAY8' => '距今前9天日期的销量',
            'DAY9' => '距今前10天日期的销量',
            'DAY10' => '距今前11天日期的销量',
            'DAY11' => '距今前12天日期的销量',
            'DAY12' => '距今前13天日期的销量',
            'DAY13' => '距今前14天日期的销量',
            'DAY14' => '距今前15天日期的销量',
            'DAY15' => '距今前16天日期的销量',
            'DAY16' => '距今前17天日期的销量',
            'DAY17' => '距今前18天日期的销量',
            'DAY18' => '距今前19天日期的销量',
            'DAY19' => '距今前20天日期的销量',
            'DAY20' => '距今前21天日期的销量',
            'DAY21' => '距今前22天日期的销量',
            'DAY22' => '距今前23天日期的销量',
            'DAY23' => '距今前24天日期的销量',
            'DAY24' => '距今前25天日期的销量',
            'DAY25' => '距今前26天日期的销量',
            'DAY26' => '距今前27天日期的销量',
            'DAY27' => '距今前28天日期的销量',
            'DAY28' => '距今前29天日期的销量',
            'DAY29' => '距今前30天日期的销量',
            'DAY30' => '距今前31天日期的销量',
            'MONTH1' => '距当前月前1个月的销量',
            'MONTH2' => '距当前月前2个月的销量',
            'MONTH3' => '距当前月前3个月的销量',
            'MONTH4' => '距当前月前4个月的销量',
            'MONTH5' => '距当前月前5个月的销量',
            'MONTH6' => '距当前月前6个月的销量',
            'MONTH7' => '距当前月前7个月的销量',
            'MONTH8' => '距当前月前8个月的销量',
            'MONTH9' => '距当前月前9个月的销量',
            'MONTH10' => '距当前月前10个月的销量',
            'MONTH11' => '距当前月前11个月的销量',
            'MONTH12' => '距当前月前12个月的销量',
            'AVG3' => '3天平均销量',
            'AVG7' => '7天平均销量',
            'AVG15' => '15天平均销量',
            'AVG30' => '30天平均销量',
            'THREEDAYS' => '3天补货策略',
            'SEVENDAYS' => '7天补货策略',
            'FIFTEENDAYS' => '15天补货策略',
            'THIRTYDAYS' => '30天补货策略',
            'WEIGHTAVGSALE' => '平均销量',
            'SALESTATUS' => '销量趋势',
            'ORGANISATION_ID' => '组织ID',
            'CHANNEL_ID' => '平台ID',
            'CUSER_ID' => '创建人',
            'UUSER_ID' => '更新人',
        ];
    }

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
                    ActiveRecord::EVENT_BEFORE_INSERT => ['CUSER_CODE', 'UUSER_CODE'],
                    ActiveRecord::EVENT_BEFORE_UPDATE => ['UUSER_CODE'],
                ],
            ],
        ];
    }
}