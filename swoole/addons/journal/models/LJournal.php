<?php

namespace addons\journal\models;
use addons\users\models\UUserInfo;
use Yii;

/**
 * This is the model class for table "l_journal".
 *
 * @property integer $JOURNAL_ID
 * @property integer $JOURNAL_TIME
 * @property string $USER_ID
 * @property string $JOURNAL_REMARKS
 * @property string $JOURNAL_TYPE
 * @property string $VISIT_API
 */
class LJournal extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'l_journal';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['JOURNAL_TIME','USER_ID','JOURNAL_TYPE'], 'integer'],
            [['JOURNAL_REMARKS'], 'string', 'max' => 255],
            [['VISIT_API'], 'string', 'max' => 50],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'JOURNAL_ID' => Yii::t('journal', '日志表ID'),
            'JOURNAL_TIME' => Yii::t('journal', '操作时间'),
            'USER_ID' => Yii::t('journal', '操作人ID'),
            'JOURNAL_REMARKS' => Yii::t('journal', '操作内容'),
            'JOURNAL_TYPE' => Yii::t('journal', '日志类型'),
            'VISIT_API' => Yii::t('journal', '访问的接口'),
        ];
    }

    public function getU_user_info()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'USER_ID'])->select(['user.USER_INFO_ID','user.STAFF_ID'])->joinWith(['u_staff_info'])->alias('user');
    }
}
