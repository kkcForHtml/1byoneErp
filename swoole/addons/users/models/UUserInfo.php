<?php

namespace addons\users\models;


use addons\inventory\models\SkPendingDelivery;
use addons\inventory\models\SkPendingStorage;
use addons\master\product\models\GProductSku;
use addons\purchase\models\PuPurchase;
use addons\purchase\models\PuQctables;
use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;
use yii\swoole\db\Query;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\helpers\ArrayHelper;

use addons\organization\models\OOrganisation;
use addons\organization\models\OGrouping;

/**
 * @SWG\Definition(
 *   definition="users",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="USER_INFO_ID", type="integer",description="用户ID"),
 *           @SWG\Property(property="USER_INFO_CODE", type="integer",description="用户编码"),
 *           @SWG\Property(property="USERNAME", type="string",description="登陆账号"),
 *           @SWG\Property(property="PASSWORD", type="string",description="密码"),
 *           @SWG\Property(property="GROUPING_ID", type="integer",format="int32",description="所属分组ID"),
 *           @SWG\Property(property="USER_INFO_TYPE", type="integer",format="int32",description="用户类型ID"),
 *           @SWG\Property(property="USER_PHONE", type="string",description="移动电话"),
 *           @SWG\Property(property="USER_REMARKS", type="string",description="备注"),
 *           @SWG\Property(property="STAFF_STATE",type="integer",format="int32",description="是否启用,1:Y 0:N"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="ORGANISATION_ID", type="integer",description="组织ID"),
 *           @SWG\Property(property="STAFF_ID", type="integer",description="用户实名ID"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class UUserInfo extends ActiveRecord implements \yii\web\IdentityInterface
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'u_user_info';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['USERNAME',  'PASSWORD'], 'required'],
            [['USER_INFO_ID', 'GROUPING_ID', 'USER_INFO_TYPE', 'STAFF_STATE', 'CREATED_AT', 'UPDATED_AT', 'ORGANISATION_ID', 'STAFF_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [[ 'USER_PHONE','USER_INFO_CODE'], 'string', 'max' => 20],
            [['USERNAME'], 'string', 'max' => 30],
            [['PASSWORD'], 'string', 'max' => 32],
            [['USER_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'USER_INFO_ID' => Yii::t('users', '用户ID'),
            'USERNAME' => Yii::t('users', '登陆账号'),
            'PASSWORD' => Yii::t('users', '密码'),
            'GROUPING_ID' => Yii::t('users', '所属分组ID'),
            'USER_INFO_TYPE' => Yii::t('users', '用户类型ID'),
            'USER_PHONE' => Yii::t('users', '移动电话'),
            'USER_REMARKS' => Yii::t('users', '备注'),
            'STAFF_STATE' => Yii::t('users', '是否启用,1:Y 0:N'),
            'CREATED_AT' => Yii::t('users', '创建时间'),
            'UPDATED_AT' => Yii::t('users', '修改时间'),
            'ORGANISATION_ID' => Yii::t('users', '组织ID'),
            'STAFF_ID' => Yii::t('users', '用户实名ID'),
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


    /**
     * Finds user by username
     * 登陆使用
     * -------------------------------------------------- red ---------------------------------------------------------------------------------------------
     */

    public static function findByUsername($username)
    {
        return self::find()->where(['USERNAME' => $username, 'STAFF_STATE' => 1])->one();
    }

    public function validatePassword($password)
    {
        return $this->PASSWORD === $password;
    }

    public function getAuthKey()
    {
        return $this->PASSWORD;
        //throw new NotSupportedException('"findIdentityByAccessToken" is not implemented.');
    }

    public function getId()
    {
        return $this->getPrimaryKey();
    }

    public function getName()
    {
        return $this->STAFF_ID;
    }

    public function validateAuthKey($authKey)
    {
        //return $this->getAuthKey() === $authKey;
        return true;
    }

    public static function findIdentity($id)
    {
        return static::findOne(['USER_INFO_ID' => $id]);
    }

    public static function findIdentityByAccessToken($token, $type = null)
    {
        throw new NotSupportedException('"findIdentityByAccessToken" is not implemented.');
    }

    /**
     * ------------------------------------------------------------ end -----------------------------------------------------------------------------------
     */

    //行政组织
    public function getO_organisation()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'ORGANISATION_ID'])->select(['do.ORGANISATION_ID','do.ORGANISATION_CODE', 'do.ORGANISATION_NAME_CN'])->alias('do');
    }

    //真实姓名(员工信息)
    public function getU_staffinfo()
    {
        return $this->hasOne(UStaffInfo::className(), ['STAFF_ID' => 'STAFF_ID'])->select(['STAFF_ID', 'STAFF_NAME_CN'])->alias('sta');
    }

    //真实姓名(员工信息)
    public function getU_staffinfo2()
    {
        return $this->hasOne(UStaffInfo::className(), ['STAFF_ID' => 'STAFF_ID'])->select(['staff.STAFF_ID', 'staff.STAFF_NAME_CN'])->alias('staff');
    }


    //真实姓名(员工信息)
    public function getU_staff_info()
    {
        return $this->hasOne(UStaffInfo::className(), ['STAFF_ID' => 'STAFF_ID'])->select(['staff.STAFF_ID', 'staff.STAFF_NAME_CN'])->alias('staff');
    }

    //所属分组
    public function getO_grouping()
    {
        return $this->hasOne(OGrouping::className(), ['GROUPING_ID' => 'GROUPING_ID']);
    }

    //分配品类
    public function getU_category()
    {
        return $this->hasMany(UUserCategory::className(), ['USER_INFO_ID' => 'USER_INFO_ID'])->joinWith('p_category');
    }

    //分配品类
    public function getU_user_category()
    {
        return $this->hasMany(UUserCategory::className(), ['USER_INFO_ID' => 'USER_INFO_ID'])->joinWith('p_category');
    }

    //分配组织
    public function getU_user_organizations()
    {
        return $this->hasMany(UUserOrganization::className(), ['USER_INFO_ID' => 'USER_INFO_ID'])->alias('uo')->joinWith('o_organisation_area');
    }

    //分配组织
    public function getU_user_organization()
    {
        return $this->hasMany(UUserOrganization::className(), ['USER_INFO_ID' => 'USER_INFO_ID'])->alias('uo')->joinWith('o_organisation');
    }

    //分配仓库
    public function getU_user_warehouse()
    {
        return $this->hasMany(UUserWarehouse::className(), ['USER_INFO_ID' => 'USER_INFO_ID'])->joinWith('b_warehouse');
    }

    //分配角色
    public function getU_role_user()
    {
        return $this->hasMany(URoleUser::className(), ['USER_INFO_ID' => 'USER_INFO_ID'])->joinWith('u_roleInfo');
    }


    //创建人
    public function getU_userinfoc()
    {
        return $this->hasOne(static::className(), ['USER_INFO_ID' => 'CUSER_ID'])->joinWith('u_staffinfo2')->alias('c');
    }

    //更新人
    public function getU_userinfou()
    {
        return $this->hasOne(static::className(), ['USER_INFO_ID' => 'UUSER_ID'])->alias('u');
    }


    //关联添加配置(组织，角色，品类)
    public $realation = [
        'u_user_organization' => ['USER_INFO_ID' => 'USER_INFO_ID'],
        'u_role_user' => ['USER_INFO_ID' => 'USER_INFO_ID'],
        'u_user_category' => ['USER_INFO_ID' => 'USER_INFO_ID'],
        'u_user_warehouse' => ['USER_INFO_ID' => 'USER_INFO_ID']
    ];

    /**
     * 用户信息新增的操作
     * before_ACreate 新增前
     * after_ACreate 新增后
     */

    public function before_ACreate($body, $class = null)
    {
        $respone = new ResponeModel();

        // 判断编码及账号是否为空
        $this->load($body, '');
        Yii::$app->BaseHelper->validate($this);

        // 查询数据库表，判断编码及账号是否是唯一性
        $UuserInfo = self::find()->where(['or', ['USERNAME' => $body['USERNAME']], ['USER_INFO_CODE' => $body['USER_INFO_CODE']]])->exists();
        if ($UuserInfo) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('users', 'The encoding or Chinese name has been repeated. Please do not submit it again!'), [$body])];
        }
        return [$this::ACTION_NEXT, $body];
    }

    public function after_AView($body, $class = null)
    {
        if (isset($body['u_user_category']) && count($body['u_user_category']) > 0) {
            $bigClass = $body['u_user_category'];
            foreach ($bigClass as $index => $item) {
                if (isset($item['p_category']) && count($item['p_category']) > 0 && isset($item['p_category']['g_product_types_1']) && count($item['p_category']['g_product_types_1']) > 0) {
                    foreach ($item['p_category']['g_product_types_1'] as $index2 => $item2) {
                        if ($item2['PRODUCTOT_TYPE_ID'] && $item2['PRODUCT_TYPE_ID']) {
                            $arr1 = $item2['PRODUCTOT_TYPE_ID'].",".$item2['PRODUCT_TYPE_ID'];
                            $area1 = GProductSku::find()->select(["PSKU_ID", "PSKU_CODE", "PSKU_NAME_CN", "PRODUCT_TYPE_PATH"])->where(['=', 'PRODUCT_TYPE_PATH', $arr1])->asArray()->all();
                            if (count($area1) > 0) {
                                foreach ($area1 as $index3 => $item3) {
                                    $arr2 = explode(',', $item3['PRODUCT_TYPE_PATH']);
                                    $item3['PRODUCT_TYPE_ID'] = $arr2[1];
                                    $area1[$index3] = $item3;
                                }
                            }
                            $item2['product'] = $area1;
                            $item['p_category']['g_product_types_1'][$index2] = $item2;
                            $bigClass[$index] = $item;
                        }
                    }
                }
            }
            $body['u_user_category'] = $bigClass;
        }
        return [$this::ACTION_NEXT, $body]; // TODO: Change the autogenerated stub
    }


    /**
     * 用户修改的操作
     * before_AUpdate 修改前
     * after_AUpdate 修改后
     */
    public function before_AUpdate($body, $class = null)
    {
        $respone = new ResponeModel();

        // 判断是否是编辑操作
        if (isset($body['edit_type']) && $body['edit_type']) {

            // 判断编码及账号是否为空
            $this->load($body, '');
            Yii::$app->BaseHelper->validate($this);
            $body = ArrayHelper::merge($this->toArray(), $body);

            // 查询数据库表，判断编码及账号是否是唯一性
            $Organisation = self::find()->where(['<>', 'USER_INFO_ID', $body['USER_INFO_ID']])->andWhere(['or', ['USERNAME' => $body['USERNAME']], ['USER_INFO_ID' => $body['USER_INFO_ID']]])->exists();
            if ($Organisation) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('users', 'The encoding or Chinese name has been repeated. Please do not submit it again!'), [$body])];
            }

            if (isset($body['u_user_organization'])) {
                // 数据全部删除
                UUserOrganization::deleteAll(['USER_INFO_ID' => $body['USER_INFO_ID']]);
            }
            if (isset($body['u_role_user'])) {
                // 数据全部删除
                URoleUser::deleteAll(['USER_INFO_ID' => $body['USER_INFO_ID']]);
            }
            if (isset($body['u_user_category'])) {
                // 数据全部删除
                UUserCategory::deleteAll(['USER_INFO_ID' => $body['USER_INFO_ID']]);
            }
            if (isset($body['u_user_warehouse'])) {
                // 数据全部删除
                UUserWarehouse::deleteAll(['USER_INFO_ID' => $body['USER_INFO_ID']]);
            }
        }

        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 用户信息删除的操作
     * before_ADelete 删除前
     * after_ADelete 删除后
     */
    public function before_ADelete($body, $class = null)
    {
        $respone = new ResponeModel();
        //个人权限表
        $exitData = (new Query())->from(URoleUser::tableName())->where(['=', 'USER_INFO_ID', $this->USER_INFO_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('users', "This user info has been used by other documents and cannot be deleted!"), [$body])];
        }
        //采购订单表
        $exitData = (new Query())->from(PuPurchase::tableName())->where(['=', 'AUTITO_ID', $this->USER_INFO_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('users', "This user info has been used by other documents and cannot be deleted!"), [$body])];
        }
        //品检信息表
        $exitData = (new Query())->from(PuQctables::tableName())->where(['=', 'INSPECTION_ID', $this->USER_INFO_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('users', "This user info has been used by other documents and cannot be deleted!"), [$body])];
        }
        //待入库表
        $exitData = (new Query())->from(SkPendingStorage::tableName())->where(['=', 'HANDLER_ID', $this->USER_INFO_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('users', "This user info has been used by other documents and cannot be deleted!"), [$body])];
        }
        //待出库表
        $exitData = (new Query())->from(SkPendingDelivery::tableName())->where(['=', 'HANDLER_ID', $this->USER_INFO_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('users', "This user info has been used by other documents and cannot be deleted!"), [$body])];
        }
        return [$this::ACTION_NEXT, $body];
    }

}
