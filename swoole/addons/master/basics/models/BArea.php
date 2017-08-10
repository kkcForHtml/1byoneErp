<?php

namespace addons\master\basics\models;

use addons\master\partint\models\PaPartner;
use addons\organization\models\OOrganisation;
use addons\tools\models\ToFbaFeeDetail;
use addons\tools\models\ToFbaFeeRule;
use addons\tools\models\ToMcfFeeDetail;
use Yii;
use addons\users\models\UUserInfo;
use yii\behaviors\TimestampBehavior;
use yii\db\Query;
use \yii\swoole\db\ActiveRecord;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\swoole\helpers\ArrayHelper;

/**
 * @SWG\Definition(
 *   definition="BArea",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"AREA_ID"},
 *           @SWG\Property(property="AREA_ID", type="int",description="地区ID"),
 *           @SWG\Property(property="AREA_CODE", type="string",description="地区编码"),
 *           @SWG\Property(property="AREA_NAME_CN", type="string",description="地区名称(中文)"),
 *           @SWG\Property(property="AREA_NAME_EN", type="string",description="地区名称(英文)"),
 *           @SWG\Property(property="AREA_PID", type="int",description="父节点,地区：0，国家：地区编码"),
 *           @SWG\Property(property="AREA_STATE", type="int",description="是否启用,1：Y 0：N"),
 *           @SWG\Property(property="AREA_REMARKS", type="string",description="备注"),
 *           @SWG\Property(property="CREATED_AT", type="int",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT", type="int",description="修改时间"),
 *           @SWG\Property(property="AREA_FID", type="int",description="父节点ID"),
 *           @SWG\Property(property="CUSER_ID", type="int",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="int",description="更新人ID")
 *       )
 *   }
 * )
 */
class BArea extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'b_area';
    }

    /**
     * @inheritdoc
     *
     */
    public function rules()
    {
        return [
            [['AREA_ID'], 'safe'],
            [['AREA_CODE', 'AREA_NAME_CN'], 'required'],
            [['CREATED_AT', 'UPDATED_AT', 'AREA_STATE', 'AREA_FID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['AREA_CODE', 'AREA_FID'], 'string', 'max' => 20],
            [['AREA_NAME_CN', 'AREA_NAME_EN'], 'string', 'max' => 100],
            [['AREA_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'AREA_ID' => Yii::t('basics', '地区ID'),
            'AREA_CODE' => Yii::t('basics', '地区编码'),
            'AREA_NAME_CN' => Yii::t('basics', '地区名称(中文)'),
            'AREA_NAME_EN' => Yii::t('basics', '地区名称(英文)'),
            'AREA_FID' => Yii::t('basics', '父节点,地区：0，国家：地区编码'),
            'AREA_STATE' => Yii::t('basics', '是否启用1:Y0:N'),
            'AREA_REMARKS' => Yii::t('basics', '备注'),
            'CREATED_AT' => Yii::t('basics', '创建时间'),
            'UPDATED_AT' => Yii::t('basics', '修改时间'),
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

    // 通过国家关联地区
    public function getB_area()
    {
        return $this->hasOne(BArea::className(), ['AREA_ID' => 'AREA_FID'])->alias('b');
    }

    // 通过地区管理国家
    public function getB_areas()
    {
        return $this->hasMany(BArea::className(), ['AREA_FID' => 'AREA_ID'])->alias('b')->andWhere(["=", "b.AREA_STATE", "1"]);
    }

    //需求组织
    public function getO_organisation()
    {
        return $this->hasMany(OOrganisation::className(), ['COUNTRY_ID' => 'AREA_ID'])->alias('o')->andWhere(["like", "o.ORGANISATION_BUSINESS", "4"]);
    }

    public function before_ACreate($body, $class = null)
    {
        //如果是批量新增
        $respone = new ResponeModel();

        if (isset($body["AREA_CODE"]) || isset($body["AREA_NAME_CN"])) {
            $onlyCn = false;
            $onlyCode = false;
            if (isset($body["AREA_FID"]) && $body["AREA_FID"] == "0") {
                if (isset($body["AREA_NAME_CN"])) {
                    $onlyCn = BArea::find()->where(["AREA_FID" => $body["AREA_FID"], "AREA_NAME_CN" => $body["AREA_NAME_CN"]])->exists();
                }
                if (isset($body["AREA_CODE"])) {
                    $onlyCode = BArea::find()->where(["AREA_FID" => $body["AREA_FID"], "AREA_CODE" => $body["AREA_CODE"]])->exists();
                }
                /* if ($onlyCode || $onlyCn) {
                     return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', '编码和中文名称已重复，请勿重复提价'), [$body])];
                 }*/
                if ($onlyCode) {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', 'The encoding already exists. Please do not submit again!'), [$body])];
                }
                if ($onlyCn) {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', 'The name already exists. Please do not submit again!'), [$body])];
                }
            } else {
                if (isset($item["AREA_NAME_CN"])) {
                    $onlyCn = BArea::find()->where(["and", ["<>", "AREA_FID", "0"], ["=", "AREA_NAME_CN", $item["AREA_NAME_CN"]]])->exists();
                }
                if (isset($item["AREA_CODE"])) {
                    $onlyCode = BArea::find()->where(["and", ["<>", "AREA_FID", "0"], ["=", "AREA_CODE", $item["AREA_CODE"]]])->exists();
                }
                if ($onlyCode || $onlyCn) {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', 'The encoding or Chinese name already exists. Please do not submit it again!'), [$body])];
                }
            }
        }
        return [$this::ACTION_NEXT, $body]; // TODO: Change the autogenerated stub
    }

    public function before_AUpdate($body, $class = null)
    {
        if (isset($body['batchMTC']) && count($body['batchMTC']) > 0) {
            $isboolean = true;
            foreach ($body['batchMTC'] as $item) {
                $respone = new ResponeModel();
                $this->load($item, '');
                Yii::$app->BaseHelper->validate($this);
                $body = ArrayHelper::merge($this->toArray(), $body);
                if ((isset($item["AREA_CODE"]) || isset($item["AREA_NAME_CN"])) && isset($item["AREA_ID"])) {
                    $onlyCn = false;
                    $onlyCode = false;
                    //判断是国家还是 还是地区
                    $query = BArea::find()->select(["AREA_FID", "AREA_CODE"])->where(["AREA_ID" => $item["AREA_ID"]])->one();
                    if ($query->AREA_FID == "0") {    //地区的唯一性
                        if (isset($item["AREA_NAME_CN"])) {
                            $onlyCn = BArea::find()->where(["AREA_FID" => "0", "AREA_NAME_CN" => $item["AREA_NAME_CN"]])->andWhere(["<>", "AREA_ID", $item["AREA_ID"]])->exists();
                        }
                        if (isset($item["AREA_CODE"])) {
                            $onlyCode = BArea::find()->where(["AREA_FID" => "0", "AREA_CODE" => $item["AREA_CODE"]])->andWhere(["<>", "AREA_ID", $item["AREA_ID"]])->exists();
                        }
                    } else {    //国家的唯一性
                        if (isset($item["AREA_NAME_CN"])) {
                            $onlyCn = BArea::find()->where(["and", ["<>", "AREA_FID", "0"],
                                ["=", "AREA_NAME_CN", $item["AREA_NAME_CN"]]])->andWhere(["<>", "AREA_ID", $item["AREA_ID"]])->exists();
                        }
                        if (isset($item["AREA_CODE"])) {
                            $onlyCode = BArea::find()->where(["and", ["<>", "AREA_FID", "0"], ["=", "AREA_CODE", $item["AREA_CODE"]]])->andWhere(["<>", "AREA_ID", $item["AREA_ID"]])->exists();
                        }
                    }
                    if ($onlyCode || $onlyCn) {
                        $isboolean = false;
                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', 'The encoding or Chinese name already exists. Please do not submit it again!'), [$body])];
                    } else {
                        if (isset($item["AREA_ID"]) && isset($item["AREA_CODE"])) {
                            $query = BArea::find()->select(["AREA_FID", "AREA_CODE"])->where(["AREA_ID" => $item["AREA_ID"]])->one();
                            if ($query->AREA_FID == "0") {
                                BArea::updateAll(['AREA_FID' => $item["AREA_CODE"]], ['AREA_FID' => $query->AREA_CODE]);
                            }
                        }
                    }
                }
            }
            if ($isboolean) {   //修改子编码
                foreach ($body['batchMTC'] as $item) {
                    $this->load($item, '');
                    Yii::$app->BaseHelper->validate($this);
                    if (isset($item["AREA_ID"]) && isset($item["AREA_CODE"])) {
                        $query = BArea::find()->select(["AREA_FID", "AREA_CODE"])->where(["AREA_ID" => $item["AREA_ID"]])->one();
                        if ($query->AREA_FID == "0") {
                            BArea::updateAll(['AREA_FID' => $item["AREA_CODE"]], ['AREA_FID' => $query->AREA_CODE]);
                        }
                    }
                }
            }

        }
        return [$this::ACTION_NEXT, $body];
        //return parent::before_AUpdate($body, $class = null);
    }

    public function after_AUpdate($body, $model = null)
    {
        if (isset($body['condition']['where']['AREA_ID'])) {    //删除条件
            $area_id = $body['condition']['where']['AREA_ID'];
            if ($area_id != null) {
                $breas = BArea::find()->select(["AREA_CODE", "AREA_FID"])->where(["AREA_ID" => $area_id])->asArray()->all();
                $areacodes = array();
                $isCountry = 0;
                for ($i = 0; $i < count($breas); $i++) {
                    $areacodes[] = $breas[$i]["AREA_CODE"];
                    if ($breas[$i]["AREA_FID"] != "0") {   //为国家的删除条件
                        $isCountry = 1;
                    }
                }
                if ($isCountry != 1) {
                    $result = BArea::updateAll(['AREA_FID' => $areacodes]);
                }
            }
        }
        return parent::after_AUpdate($body, $model); // TODO: Change the autogenerated stub
    }


    /**
     * 区域删除的操作
     * before_ADelete 删除前
     * after_ADelete 删除后
     */
    public function before_ADelete($body, $class = null)
    {
        $respone = new ResponeModel();
        if ($this->AREA_FID == 0) {
            //国家
            $exitData = (new Query())->from(BArea::tableName())->where(['=', 'AREA_FID', $this->AREA_ID])->exists();
            if ($exitData) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This area has been used by other documents and cannot be deleted!"), [$body])];
            }
            //仓库表
            $exitData = (new Query())->from(BWarehouse::tableName())->where(['=', 'WAREHOUSE_AREA_ID', $this->AREA_ID])->exists();
            if ($exitData) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This area has been used by other documents and cannot be deleted!"), [$body])];
            }
            //帐号表
            $exitData = (new Query())->from(BAccount::tableName())->where(['=', 'AREA_ID', $this->AREA_ID])->exists();
            if ($exitData) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This area has been used by other documents and cannot be deleted!"), [$body])];
            }
            //伙伴信息表
            $exitData = (new Query())->from(PaPartner::tableName())->where(['=', 'AREA_ID', $this->AREA_ID])->exists();
            if ($exitData) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This area has been used by other documents and cannot be deleted!"), [$body])];
            }
            //组织架构详情表
            $exitData = (new Query())->from(OOrganisation::tableName())->where(['=', 'AREA_ID', $this->AREA_ID])->exists();
            if ($exitData) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This area has been used by other documents and cannot be deleted!"), [$body])];
            }
            //FBA费规则表
            $exitData = (new Query())->from(ToFbaFeeRule::tableName())->where(['=', 'AREA_ID', $this->AREA_ID])->exists();
            if ($exitData) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This area has been used by other documents and cannot be deleted!"), [$body])];
            }
            //FBA费表
            $exitData = (new Query())->from(ToFbaFeeDetail::tableName())->where(['=', 'AREA_ID', $this->AREA_ID])->exists();
            if ($exitData) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This area has been used by other documents and cannot be deleted!"), [$body])];
            }
            //MCF费表
            $exitData = (new Query())->from(ToMcfFeeDetail::tableName())->where(['=', 'AREA_ID', $this->AREA_ID])->exists();
            if ($exitData) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This area has been used by other documents and cannot be deleted!"), [$body])];
            }
            //月存储 && longTime费表
            $exitData = (new Query())->from(ToMcfFeeDetail::tableName())->where(['=', 'AREA_ID', $this->AREA_ID])->exists();
            if ($exitData) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This area has been used by other documents and cannot be deleted!"), [$body])];
            }
        } else {
            //帐号表
            $exitData = (new Query())->from(BAccount::tableName())->where(['=', 'COUNTRY_ID', $this->AREA_ID])->exists();
            if ($exitData) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This area has been used by other documents and cannot be deleted!"), [$body])];
            }
            //组织架构详情表
            $exitData = (new Query())->from(OOrganisation::tableName())->where(['=', 'COUNTRY_ID', $this->AREA_ID])->exists();
            if ($exitData) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('basics', "This area has been used by other documents and cannot be deleted!"), [$body])];
            }
        }
        return [$this::ACTION_NEXT, $body];
    }

}
