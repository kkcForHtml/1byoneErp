<?php

namespace addons\users\models;

use Yii;
use \yii\swoole\db\ActiveRecord;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\swoole\db\Query;
use yii\swoole\helpers\ArrayHelper;
use \yii\swoole\rest\ResponeModel;

use addons\organization\models\OOrganisation;

/**
 * @SWG\Definition(
 *   definition="UStaffInfo",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="STAFF_ID", type="integer",description="员工ID"),
 *           @SWG\Property(property="STAFF_CODE", type="string",description="员工编号"),
 *           @SWG\Property(property="STAFF_NAME_CN", type="string",description="员工姓名(中文)"),
 *           @SWG\Property(property="STAFF_NAME_EN", type="string",description="员工姓名(英文)"),
 *           @SWG\Property(property="STAFF_PHONE", type="string",description="移动电话"),
 *           @SWG\Property(property="STAFF_EMAIL", type="string",description="E-mail"),
 *           @SWG\Property(property="STAFF_TEL", type="string",description="固定电话"),
 *           @SWG\Property(property="STAFF_ADDRESS", type="string",description="联系地址"),
 *           @SWG\Property(property="ADDRESS", type="string",description="详细地址"),
 *           @SWG\Property(property="STAFF_REMARKS", type="string",description="备注"),
 *           @SWG\Property(property="CUSER_ID", type="string",description="创建人"),
 *           @SWG\Property(property="UUSER_ID", type="string",description="更新人"),
 *           @SWG\Property(property="STAFF_STATE",type="integer",format="int32",description="是否启用,1:Y 0:N"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="ORGANISATION_ID", type="integer",description="所属组织ID"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class UStaffInfo extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'u_staff_info';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['STAFF_CODE', 'STAFF_NAME_CN'], 'required'],
            [['STAFF_STATE', 'CREATED_AT', 'UPDATED_AT', 'ORGANISATION_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['STAFF_CODE', 'STAFF_PHONE'], 'string', 'max' => 20],
            [['STAFF_NAME_CN', 'STAFF_NAME_EN'], 'string', 'max' => 100],
            [['STAFF_EMAIL'], 'string', 'max' => 30],
            [['STAFF_TEL'], 'string', 'max' => 16],
            [['STAFF_ADDRESS', 'STAFF_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'STAFF_ID' => Yii::t('users', '员工ID'),
            'STAFF_CODE' => Yii::t('users', '员工编号'),
            'STAFF_NAME_CN' => Yii::t('users', '员工姓名(中文)'),
            'STAFF_NAME_EN' => Yii::t('users', '员工姓名(英文)'),
            'STAFF_PHONE' => Yii::t('users', '移动电话'),
            'STAFF_EMAIL' => Yii::t('users', 'E-mail'),
            'STAFF_TEL' => Yii::t('users', '固定电话'),
            'STAFF_ADDRESS' => Yii::t('users', '联系地址'),
            'STAFF_REMARKS' => Yii::t('users', '备注'),
            'STAFF_STATE' => Yii::t('users', '是否启用,1:Y 0:N'),
            'CREATED_AT' => Yii::t('users', '创建时间'),
            'UPDATED_AT' => Yii::t('users', '修改时间'),
            'ORGANISATION_ID' => Yii::t('users', '组织ID'),
            'CUSER_ID' => Yii::t('users', '创建人ID'),
            'UUSER_ID' => Yii::t('users', '更新人ID'),
        ];
    }

    //组织分类
    public function getO_organisation()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'ORGANISATION_ID'])->select(['ORGANISATION_ID', 'ORGANISATION_NAME_CN']);
    }

    //创建人
    public function getU_userinfoc()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'CUSER_ID'])->joinWith('u_staffinfo')->alias('c');
    }

    //更新人
    public function getU_userinfou()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'UUSER_ID'])->alias('u');
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
     * 员工信息新增的操作
     * before_ACreate 新增前
     * after_ACreate 新增后
     */
    public function before_ACreate($body, $class = null)
    {
        $respone = new ResponeModel();

        // 判断编码及名称是否为空
        $this->load($body, '');
        Yii::$app->BaseHelper->validate($this);

        // 查询数据库表，判断编码及名称是否是唯一性
        $UstaffInfo = self::find()->where(['or', ['STAFF_CODE' => $body['STAFF_CODE']], ['STAFF_NAME_CN' => $body['STAFF_NAME_CN']]])->exists();
        if ($UstaffInfo) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('users', 'The encoding or Chinese name has been repeated. Please do not submit it again!'), [$body])];
        }
        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 员工修改的操作
     * before_AUpdate 修改前
     * after_AUpdate 修改后
     */
    public function before_AUpdate($body, $class = null)
    {
        $respone = new ResponeModel();

        // 判断是否是编辑操作
        if (isset($body['edit_type']) && $body['edit_type']) {

            // 判断编码及名称是否为空
            $this->load($body, '');
            Yii::$app->BaseHelper->validate($this);
            $body = ArrayHelper::merge($this->toArray(), $body);

            // 查询数据库表，判断编码及名称是否是唯一性
            $Organisation = self::find()->where(['<>', 'STAFF_ID', $body['STAFF_ID']])->andWhere(['or', ['STAFF_CODE' => $body['STAFF_CODE']], ['STAFF_NAME_CN' => $body['STAFF_NAME_CN']]])->exists();
            if ($Organisation) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('users', 'The encoding or Chinese name has been repeated. Please do not submit it again!'), [$body])];
            }

        }

        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 员工信息删除的操作
     * before_ADelete 删除前
     * after_ADelete 删除后
     */
    public function before_ADelete($body, $class = null)
    {
        $respone = new ResponeModel();
        //用户信息表
        $exitData = (new Query())->from(UUserInfo::tableName())->where(['=', 'STAFF_ID', $this->STAFF_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('users', "This staff info has been used by other documents and cannot be deleted!"), [$body])];
        }
        return [$this::ACTION_NEXT, $body];
    }
}
