<?php

namespace addons\organization\models;

use addons\inventory\models\SkAdjustment;
use addons\inventory\models\SkAllocation;
use addons\inventory\models\SkFiallocation;
use addons\inventory\models\SkInstantInventory;
use addons\inventory\models\SkPendingDelivery;
use addons\inventory\models\SkPendingStorage;
use addons\inventory\models\SkPlacing;
use addons\inventory\models\SkStorage;
use addons\master\basics\models\BAccount;
use addons\master\basics\models\BWarehouse;
use addons\master\partint\models\PaPartner;
use addons\purchase\models\PuPurchase;
use addons\sales\models\CrSalesOrder;
use addons\users\models\UStaffInfo;
use addons\users\models\UUserOrganization;
use Yii;
use yii\behaviors\TimestampBehavior;
use addons\master\basics\models\BArea;
use addons\users\models\UUserInfo;
use yii\swoole\db\Query;
use yii\swoole\helpers\ArrayHelper;
use \yii\swoole\db\ActiveRecord;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\behaviors\OperatorBehaviors;
use addons\master\basics\models\BChannel;

/**
 * @SWG\Definition(
 *   definition="OOrganisation",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="ORGANISATION_ID", type="integer",description="组织架构ID"),
 *           @SWG\Property(property="ORGANISATION_CODE", type="string",description="组织编码"),
 *           @SWG\Property(property="CONTACT", type="string",description="联系人"),
 *           @SWG\Property(property="ORGANISATION_NAME_CN", type="string",description="组织名称(中文)"),
 *           @SWG\Property(property="ORGANISATION_NAME_EN", type="string",description="报表用名"),
 *           @SWG\Property(property="FAX", type="string",description="传真"),
 *           @SWG\Property(property="HEADER_STATE",type="integer",format="int32",description="是否在页面展示 1打钩 0未打钩"),
 *           @SWG\Property(property="PHONE", type="string",description="联系电话"),
 *           @SWG\Property(property="ORGANISATION_FORM_ID", type="integer",format="int32",description="组织形态ID"),
 *           @SWG\Property(property="ADDRESS", type="string",description="详细地址"),
 *           @SWG\Property(property="ORGANISATION_REMARKS", type="string",description="描述"),
 *           @SWG\Property(property="TARIFF", type="integer",description="税率"),
 *           @SWG\Property(property="ORGANISATION_STATE",type="integer",format="int32",description="是否启用,1:Y 0:N"),
 *           @SWG\Property(property="STARTUP_TIME",type="integer",format="int32",description="启动日期"),
 *           @SWG\Property(property="INIT_STATE",type="integer",format="int32",description="初始化状态,1:Y 0:N"),
 *           @SWG\Property(property="ORGANISATION_BUSINESS",type="string",description="业务组织,逗号隔开"),
 *           @SWG\Property(property="ORGANISATION_ACCOUNTING",type="string",description="核算组织,逗号隔开"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="AREA_ID", type="integer",description="地区ID"),
 *           @SWG\Property(property="COUNTRY_ID", type="integer",description="国家ID"),
 *           @SWG\Property(property="ORGANISATIONOT_ID", type="integer",description="所属法人ID"),
 *           @SWG\Property(property="PARTNER_ID", type="integer",description="伙伴ID"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class OOrganisation extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'o_organisation';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ORGANISATION_CODE'], 'required'],
            [['ORGANISATION_FORM_ID', 'ORGANISATION_STATE','INIT_STATE','STARTUP_TIME', 'CREATED_AT', 'UPDATED_AT', 'HEADER_STATE','AREA_ID','COUNTRY_ID','ORGANISATIONOT_ID','PARTNER_ID','CUSER_ID','UUSER_ID'], 'integer'],
            [['TARIFF'], 'number', 'min' => 0, 'max' => 99999999],
            [['ORGANISATION_CODE', 'PHONE', 'FAX'], 'string', 'max' => 20],
            [['CONTACT', 'ORGANISATION_BUSINESS', 'ORGANISATION_ACCOUNTING'], 'string', 'max' => 30],
            [['ORGANISATION_NAME_CN', 'ORGANISATION_NAME_EN'], 'string', 'max' => 100],
            [['ADDRESS', 'ORGANISATION_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ORGANISATION_ID' => Yii::t('organization', '组织架构ID'),
            'ORGANISATION_CODE' => Yii::t('organization', '组织编码'),
            'CONTACT' => Yii::t('organization', '联系人'),
            'ORGANISATION_NAME_CN' => Yii::t('organization', '组织名称(中文)'),
            'ORGANISATION_NAME_EN' => Yii::t('organization', '报表用名'),
            'PHONE' => Yii::t('organization', '联系电话'),
            'ORGANISATION_FORM_ID' => Yii::t('organization', '组织形态ID'),
            'HEADER_STATE' => Yii::t('organization', '是否在页面展示 1打钩 0未打钩'),
            'FAX' => Yii::t('organization', '传真'),
            'ADDRESS' => Yii::t('organization', '详细地址'),
            'ORGANISATION_REMARKS' => Yii::t('organization', '描述'),
            'TARIFF' => Yii::t('organization', '税率'),
            'ORGANISATION_STATE' => Yii::t('organization', '是否启用,1:Y 0:N'),
            'STARTUP_TIME' => Yii::t('organization', '启动日期'),
            'INIT_STATE' => Yii::t('organization', '初始化状态,1:Y 0:N'),
            'ORGANISATION_BUSINESS' => Yii::t('organization', '业务组织,逗号隔开'),
            'ORGANISATION_ACCOUNTING' => Yii::t('organization', '核算组织,逗号隔开'),
            'CREATED_AT' => Yii::t('organization', '创建时间'),
            'UPDATED_AT' => Yii::t('organization', '修改时间'),
            'AREA_ID' => Yii::t('organization', '地区ID'),
            'COUNTRY_ID' => Yii::t('organization', '国家ID'),
            'ORGANISATIONOT_ID' => Yii::t('organization', '所属法人ID'),
            'PARTNER_ID' => Yii::t('organization', '伙伴ID'),
            'CUSER_ID' => Yii::t('organization', '创建人ID'),
            'UUSER_ID' => Yii::t('organization', '更新人ID'),
        ];
    }

    public static function addQuery(&$query, $alias)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            $query->andWhere([$alias . '.ORGANISATION_ID' => Yii::$app->session->get('organization') ?: null]);
        }

    }

    public $realation = ['o_grouping' => ['ORGANISATION_ID' => 'ORGANISATION_ID']];

    //组织分类
    public function getO_grouping()
    {
        return $this->hasMany(OGrouping::className(), ['ORGANISATION_ID' => 'ORGANISATION_ID']);
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

    //所属法人编码
    public function getO_organisationt()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'ORGANISATIONOT_ID']);
    }

    //地区编码
    public function getBa_area()
    {
        return $this->hasOne(BArea::className(), ['AREA_ID' => 'AREA_ID'])->alias('a');
    }

    //国家
    public function getBa_areas()
    {
        return $this->hasOne(BArea::className(), ['AREA_ID' => 'COUNTRY_ID',])->alias('bac');
    }

    //平台
    public function getB_channel()
    {
        return $this->hasMany(BChannel::className(), ['ORGANISATION_ID' => 'ORGANISATION_ID'])->alias('bc');
    }

    //供应商
    public function getPa_partner()
    {
        return $this->hasOne(PaPartner::className(), ['PARTNER_ID' => 'PARTNER_ID'])->alias('pa');
    }

    //仓库
    public function getUser_warehouse()
    {
        return $this->hasMany(BWarehouse::className(), ['ORGANISATION_ID' => 'ORGANISATION_ID'])->alias('wo');
    }

    //法人实体
    public function getO_organisation_relation_middle()
    {
        return $this->hasMany(OOrganisationRelationMiddle::className(), ['ORGANISATION_ID' => 'ORGANISATION_ID'])->alias('oorm');
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
     * 组织架构信息新增的操作
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
        $Organisation = self::find()->where(['or', ['ORGANISATION_CODE' => $body['ORGANISATION_CODE']], ['ORGANISATION_NAME_CN' => $body['ORGANISATION_NAME_CN']]])->exists();
        if ($Organisation) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', 'The encoding or Chinese name has been repeated. Please do not submit it again!'), [$body])];
        }
        return [$this::ACTION_NEXT, $body];
    }
    public function after_ACreate($body, $class = null)
    {
        if(strlen($this->ORGANISATION_ACCOUNTING)>0&&$this->ORGANISATION_ACCOUNTING=="1"){
            $this->ORGANISATIONOT_ID = $this->ORGANISATION_ID;
            $this->save();
        }
        return [$this::ACTION_NEXT, $this];
    }

    /**
     * 组织架构信息修改的操作
     * before_AUpdate 修改前
     * after_AUpdate 修改后
     */
    public function before_AUpdate($body, $class = null)
    {
        $respone = new ResponeModel();

        // 判断是否是编辑操作
        if (isset($body['ORGANISATION_ID']) && $body['ORGANISATION_ID']) {

            // 判断编码及名称是否为空
            $this->load($body, '');
            Yii::$app->BaseHelper->validate($this);
            $body = ArrayHelper::merge($this->toArray(), $body);

            // 查询数据库表，判断编码及名称是否是唯一性
            $Organisation = self::find()->where(['<>', 'ORGANISATION_ID', $body['ORGANISATION_ID']])->andWhere(['or', ['ORGANISATION_CODE' => $body['ORGANISATION_CODE']], ['ORGANISATION_NAME_CN' => $body['ORGANISATION_NAME_CN']]])->exists();
            if ($Organisation) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', 'The encoding or Chinese name has been repeated. Please do not submit it again!'), [$body])];
            }

            if (isset($body['o_grouping'])) {
                // 数据全部删除
                OGrouping::deleteAll(['ORGANISATION_ID' => $body['ORGANISATION_ID']]);
            }

            //禁用的时候，校验隶属关系中间表表
            if ($body['ORGANISATION_STATE'] == "0") {
                //获取所有关系
                $GproductType = OOrganisationRelationMiddle::find()->asArray()->all();
                //递归拿编码
                $array = self::subtree($GproductType, $body['ORGANISATION_ID'], 1);
                //排序去重
                $ORGANISATION_CODES = self::getTypeID($array);
                if (count($ORGANISATION_CODES) > 0) {
                    //修改字段
                    static::updateAll(array('ORGANISATION_STATE' => '0'), array('ORGANISATION_ID' => $ORGANISATION_CODES));
                }

            }
        }

        return [$this::ACTION_NEXT, $body];
    }
    public function after_AUpdate($body, $class = null)
    {
        if(strlen($this->ORGANISATION_ACCOUNTING)>0&&$this->ORGANISATION_ACCOUNTING=="1"){
            $this->ORGANISATIONOT_ID = $this->ORGANISATION_ID;
            $this->save();
        }
        return [$this::ACTION_NEXT, $body];
    }

    /**
     *递归，查找子孙树
     */
    public function subtree($arr, $id = 0, $lev = 1)
    {
        $subs = array(); // 子孙数组
        foreach ($arr as $v) {
            if ($v['ORGANISATION_PID'] == $id) {
                $v['lev'] = $lev;
                $subs[] = $v;
                $subs = array_merge($subs, self::subtree($arr, $v['ORGANISATION_ID'], $lev + 1));
            }
        }
        return $subs;
    }

    /**
     * 循环获取ID
     */
    public function getTypeID($array)
    {
        $id = [];
        foreach ($array as $val) {
            array_push($id, $val['ORGANISATION_ID']);
        }
        $array = array_flip($id);
        $array = array_flip($array);
        return array_merge($array);

    }


    /**
     * 组织架构删除的操作
     * before_ADelete 删除前
     * after_ADelete 删除后
     */
    public function before_ADelete($body, $class = null)
    {
        $respone = new ResponeModel();
        //平台表
        $exitData = (new Query())->from(BChannel::tableName())->where(['=', 'ORGANISATION_ID', $this->ORGANISATION_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', "This organisation has been used by other documents and cannot be deleted!"), [$body])];
        }
        //仓库表
        $exitData = (new Query())->from(BWarehouse::tableName())->where(['=', 'ORGANISATION_ID', $this->ORGANISATION_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', "This organisation has been used by other documents and cannot be deleted!"), [$body])];
        }
        //账号表
        $exitData = (new Query())->from(BAccount::tableName())->where(['=', 'ORGANISATION_ID', $this->ORGANISATION_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', "This organisation has been used by other documents and cannot be deleted!"), [$body])];
        }
        //组织隶属关系表
        $exitData = (new Query())->from(OOrganisationRelation::tableName())->where(['=', 'ORGANISATION_ID', $this->ORGANISATION_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', "This organisation has been used by other documents and cannot be deleted!"), [$body])];
        }
        //组织隶属关系中间表
        $exitData = (new Query())->from(OOrganisationRelationMiddle::tableName())->where(['or', ['=', 'ORGANISATION_PID', $this->ORGANISATION_ID], ['=', 'ORGANISATION_ID', $this->ORGANISATION_ID]])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', "This organisation has been used by other documents and cannot be deleted!"), [$body])];
        }
        //用户信息表
        $exitData = (new Query())->from(UUserInfo::tableName())->where(['=', 'ORGANISATION_ID', $this->ORGANISATION_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', "This organisation has been used by other documents and cannot be deleted!"), [$body])];
        }
        //员工信息表
        $exitData = (new Query())->from(UStaffInfo::tableName())->where(['=', 'ORGANISATION_ID', $this->ORGANISATION_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', "This organisation has been used by other documents and cannot be deleted!"), [$body])];
        }
        //用户组织关系表
        $exitData = (new Query())->from(UUserOrganization::tableName())->where(['=', 'ORGANISATION_ID', $this->ORGANISATION_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', "This organisation has been used by other documents and cannot be deleted!"), [$body])];
        }
        //采购订单表
        $exitData = (new Query())->from(PuPurchase::tableName())->where(['=', 'ORGANISATION_ID', $this->ORGANISATION_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', "This organisation has been used by other documents and cannot be deleted!"), [$body])];
        }
        //入库表
        $exitData = (new Query())->from(SkStorage::tableName())->where(['=', 'ORGANISATION_ID', $this->ORGANISATION_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', "This organisation has been used by other documents and cannot be deleted!"), [$body])];
        }
        //出库表
        $exitData = (new Query())->from(SkPlacing::tableName())->where(['=', 'PRGANISATION_ID', $this->ORGANISATION_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', "This organisation has been used by other documents and cannot be deleted!"), [$body])];
        }
        //库存调整单表
        $exitData = (new Query())->from(SkAdjustment::tableName())->where(['=', 'PRGANISATION_ID', $this->ORGANISATION_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', "This organisation has been used by other documents and cannot be deleted!"), [$body])];
        }
        //调拨单表
        $exitData = (new Query())->from(SkFiallocation::tableName())->where(['=', 'ORGANISATION_ID', $this->ORGANISATION_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', "This organisation has been used by other documents and cannot be deleted!"), [$body])];
        }
        //销售订单表
        $exitData = (new Query())->from(CrSalesOrder::tableName())->where(['=', 'CRGANISATION_ID', $this->ORGANISATION_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', "This organisation has been used by other documents and cannot be deleted!"), [$body])];
        }
        //待入库表
        $exitData = (new Query())->from(SkPendingStorage::tableName())->where(['=', 'PRGANISATION_ID', $this->ORGANISATION_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', "This organisation has been used by other documents and cannot be deleted!"), [$body])];
        }
        //待出库表
        $exitData = (new Query())->from(SkPendingDelivery::tableName())->where(['=', 'PRGANISATION_ID', $this->ORGANISATION_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', "This organisation has been used by other documents and cannot be deleted!"), [$body])];
        }
        //调拨计划单
        $exitData = (new Query())->from(SkAllocation::tableName())->where(['or', ['=', 'ARGANISATION_ID', $this->ORGANISATION_ID], ['=', 'ERGANISATION_ID', $this->ORGANISATION_ID]])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This organisation has been used by other documents and cannot be deleted!"), [$body])];
        }
        return [$this::ACTION_NEXT, $body];
    }

}
