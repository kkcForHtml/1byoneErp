<?php

namespace addons\common\base\models;

use Yii;

/**
 * @SWG\Definition(
 *   definition="Approvalre",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="RESUME_TIME", type="integer",format="int32",description="操作时间"),
 *           @SWG\Property(property="ACTIONS", type="integer",format="int32",description="操作人编码"),
 *           @SWG\Property(property="RESUME_TYPE", type="integer",format="int32",description="操作动作,1同意 0不同意"),
 *           @SWG\Property(property="USER_CODE", type="string",description="操作业务类型"),
 *           @SWG\Property(property="FIRM_CODE", type="string",description="业务编码")
 *       )
 *   }
 * )
 */
class PApprovalResume extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'p_approval_resume';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['RESUME_TIME', 'ACTIONS', 'RESUME_TYPE'], 'integer'],
            [['USER_CODE', 'FIRM_CODE'], 'string', 'max' => 20],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'APPROVAL_RESUME_ID' => Yii::t('base', 'ID'),
            'RESUME_TIME' => Yii::t('base', '操作时间'),
            'USER_CODE' => Yii::t('base', '操作人编码'),
            'ACTIONS' => Yii::t('base', '操作动作,1同意 0不同意'),
            'RESUME_TYPE' => Yii::t('base', '操作业务类型'),
            'FIRM_CODE' => Yii::t('base', '业务编码'),
        ];
    }
}
