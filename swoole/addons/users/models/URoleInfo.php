<?php

namespace addons\users\models;

use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;
use yii\swoole\db\Query;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\helpers\ArrayHelper;


/**
 * This is the model class for table "u_role_info".
 */

/**
 * @SWG\Definition(
 *   definition="URoleInfo",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="ROLE_INFO_ID", type="integer",description="角色ID"),
 *           @SWG\Property(property="ROLE_INFO_CODE", type="string",description="角色编码"),
 *           @SWG\Property(property="ROLE_INFO_NAME_CN", type="string",description="角色名称(中文)"),
 *           @SWG\Property(property="ROLE_INFO_NAME_EN", type="string",description="角色名称(英文)"),
 *           @SWG\Property(property="ROLE_TYPE_ID",type="integer",format="int32",description="角色类型ID"),
 *           @SWG\Property(property="USER_INFO_REMARKS", type="string",description="描述"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class URoleInfo extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'u_role_info';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ROLE_INFO_CODE', 'ROLE_INFO_NAME_CN', 'ROLE_TYPE_ID'], 'required'],
            [['ROLE_TYPE_ID', 'CREATED_AT', 'UPDATED_AT', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['ROLE_INFO_ID'], 'string', 'max' => 20],
            [['ROLE_INFO_NAME_CN', 'ROLE_INFO_NAME_EN'], 'string', 'max' => 100],
            [['USER_INFO_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ROLE_INFO_ID' => Yii::t('users', '角色ID'),
            'ROLE_INFO_CODE' => Yii::t('users', '角色编码'),
            'ROLE_INFO_NAME_CN' => Yii::t('users', '角色名称(中文)'),
            'ROLE_INFO_NAME_EN' => Yii::t('users', '角色名称(英文)'),
            'ROLE_TYPE_ID' => Yii::t('users', '角色类型ID'),
            'USER_INFO_REMARKS' => Yii::t('users', '描述'),
            'CREATED_AT' => Yii::t('users', '创建时间'),
            'UPDATED_AT' => Yii::t('users', '修改时间'),
            'CUSER_ID' => Yii::t('users', '创建人ID'),
            'UUSER_ID' => Yii::t('users', '更新人ID'),
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

    // 分配用户
    public function getU_role_user()
    {
        return $this->hasMany(URoleUser::className(), ['ROLE_INFO_ID' => 'ROLE_INFO_ID'])->joinWith("u_userInfo");
    }

    //创建人
    public function getU_userinfo()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'CUSER_ID'])->joinWith('u_staffinfo2')->alias('u');
    }

    //更新人
    public function getU_userinfos()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'UUSER_ID']);
    }

    //关联添加配置(用户角色表)
    public $realation = [
        'u_role_user' => ['ROLE_INFO_ID' => 'ROLE_INFO_ID'],
        'u_authorisation' => ['ROLE_INFO_ID' => 'ROLE_INFO_ID']
    ];

    //角色权限中间表
    public function getU_authorisation()
    {
        return $this->hasMany(UAuthorisation::className(), ['ROLE_INFO_ID' => 'ROLE_INFO_ID']);
    }

    public function getU_permission_groups()
    {
        return $this->hasMany(UPermissionGroups::className(), ['PERMISSION_GROUPS_ID' => 'PERMISSION_GROUPS_ID'])
            ->viaTable('u_permission_groups');
    }


    /**
     * 角色信息新增的操作
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
        $UuserInfo = self::find()->andwhere(['or', ['ROLE_INFO_CODE' => $body['ROLE_INFO_CODE']], ['ROLE_INFO_NAME_CN' => $body['ROLE_INFO_NAME_CN']]])->exists();
        if ($UuserInfo) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('users', 'The encoding or Chinese name has been repeated. Please do not submit it again!'), [$body])];
        }
        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 角色修改的操作
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
            $Organisation = self::find()->where(['<>', 'ROLE_INFO_ID', $body['ROLE_INFO_ID']])->andWhere(['or', ['ROLE_INFO_ID' => $body['ROLE_INFO_ID']], ['ROLE_INFO_NAME_CN' => $body['ROLE_INFO_NAME_CN']]])->exists();
            if ($Organisation) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('users', 'The encoding or Chinese name has been repeated. Please do not submit it again!'), [$body])];
            }


            if (isset($body['u_role_user'])) {
                // 数据全部删除
                URoleUser::deleteAll(['ROLE_INFO_ID' => $body['ROLE_INFO_ID']]);
            }

        }

        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 角色信息删除的操作
     * before_ADelete 删除前
     * after_ADelete 删除后
     */
    public function before_ADelete($body, $class = null)
    {
        $respone = new ResponeModel();
        //用户角色关系表
        $exitData = (new Query())->from(URoleUser::tableName())->where(['=', 'ROLE_INFO_ID', $this->ROLE_INFO_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('users', "This role info has been used by other documents and cannot be deleted!"), [$body])];
        }
        /*//角色权限表
        $exitData = (new Query())->from(UAuthorisation::tableName())->where(['=', 'ROLE_INFO_ID', $this->ROLE_INFO_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('users', "This role info has been used by other documents and cannot be deleted!"), [$body])];
        }*/
        //删除角色权限表
        UAuthorisation::deleteAll(["ROLE_INFO_ID" => $this->ROLE_INFO_ID]);
        return [$this::ACTION_NEXT, $body];
    }
}
