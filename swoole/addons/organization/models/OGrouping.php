<?php

namespace addons\organization\models;

use Yii;
use yii\behaviors\TimestampBehavior;
use yii\swoole\db\ActiveRecord;
use yii\swoole\behaviors\OperatorBehaviors;

/**
 * @SWG\Definition(
 *   definition="OGrouping",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="GROUPING_ID", type="integer",description="组织分组ID"),
 *           @SWG\Property(property="GROUPING_NAME_CN", type="string",description="分组名称(中文)"),
 *           @SWG\Property(property="GROUPING_NAME_EN", type="string",description="分组名称(英文)"),
 *           @SWG\Property(property="GROUPING_REMARKS", type="string",description="备注说明"),
 *           @SWG\Property(property="CREATED_AT", type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT", type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="CUSER_ID", type="string",description="创建人"),
 *           @SWG\Property(property="UUSER_ID", type="string",description="更新人"),
 *           @SWG\Property(property="ORGANISATION_ID", type="integer",description="组织ID"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class OGrouping extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'o_grouping';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['CREATED_AT', 'UPDATED_AT', 'ORGANISATION_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['GROUPING_NAME_CN', 'GROUPING_NAME_EN'], 'string', 'max' => 100],
            [['GROUPING_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'GROUPING_ID' => Yii::t('organization', '组织分组ID'),
            'GROUPING_NAME_CN' => Yii::t('organization', '分组名称(中文)'),
            'GROUPING_NAME_EN' => Yii::t('organization', '分组名称(英文)'),
            'GROUPING_REMARKS' => Yii::t('organization', '备注说明'),
            'CREATED_AT' => Yii::t('organization', '创建时间'),
            'UPDATED_AT' => Yii::t('organization', '修改时间'),
            'ORGANISATION_ID' => Yii::t('organization', '组织ID'),
            'CUSER_ID' => Yii::t('organization', '创建人ID'),
            'UUSER_ID' => Yii::t('organization', '更新人ID'),
        ];
    }

//    public static function addQuery(&$query, $alias)
//    {
//        $query->andWhere([$alias . '.ORGANISATION_CODE' => Yii::$app->session->get('organization') ?: null]);
//    }

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
