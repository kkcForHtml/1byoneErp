<?php

namespace addons\organization\models;

use addons\organization\models\OOrganisationRelationMiddle;
use addons\organization\models\OOrganisation;
use addons\master\basics\models\BArea;
use addons\users\models\UUserInfo;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
use \yii\swoole\db\ActiveRecord;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\helpers\ArrayHelper;
use Yii;

/**
 * @SWG\Definition(
 *   definition="OOrganisationRelation",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="ORGANISATION_RELATION_ID", type="integer",description="组织架构ID"),
 *           @SWG\Property(property="FUNCTION_ID", type="integer",format="int32",description="职能类型ID"),
 *           @SWG\Property(property="EFFECTIVE_TIME",  type="integer",format="int32",description="生效日期"),
 *           @SWG\Property(property="END_TIME",type="integer",format="int32",description="截止日期"),
 *           @SWG\Property(property="ORGANISATION_FORM_ID",type="integer",format="int32",description="是否长期,1：长期 0：表示有截止日期"),
 *           @SWG\Property(property="RELATION_REMARKS", type="string",description="描述"),
 *           @SWG\Property(property="ORGANISATION_STATE", type="integer",format="int32",description="是否启用,1:Y 0:N"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="ORGANISATION_ID", type="integer",description="顶层组织ID"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class OOrganisationRelation extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'o_organisation_relation';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ORGANISATION_ID', 'FUNCTION_ID', 'EFFECTIVE_TIME', 'END_TIME'], 'required'],
            [['FUNCTION_ID', 'EFFECTIVE_TIME', 'END_TIME', 'ORGANISATION_FORM_ID', 'ORGANISATION_STATE', 'CREATED_AT', 'UPDATED_AT', 'ORGANISATION_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['RELATION_REMARKS'], 'string', 'max' => 255]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ORGANISATION_RELATION_ID' => Yii::t('organization', '隶属关系ID'),
            'FUNCTION_ID' => Yii::t('organization', '职能类型ID'),
            'EFFECTIVE_TIME' => Yii::t('organization', '生效日期'),
            'END_TIME' => Yii::t('organization', '截止日期'),
            'ORGANISATION_FORM_ID' => Yii::t('organization', '是否长期,1：长期 0：表示有截止日期'),
            'RELATION_REMARKS' => Yii::t('organization', '描述'),
            'ORGANISATION_STATE' => Yii::t('organization', '是否启用,1:Y 0:N'),
            'CREATED_AT' => Yii::t('organization', '创建时间'),
            'UPDATED_AT' => Yii::t('organization', '修改时间'),
            'ORGANISATION_ID' => Yii::t('organization', '顶层组织ID'),
            'CUSER_ID' => Yii::t('organization', '创建人ID'),
            'UUSER_ID' => Yii::t('organization', '更新人ID'),
        ];
    }

    public $realation = ['o_organisationrm' => ['FUNCTION_ID' => 'FUNCTION_ID']];

    //隶属中间表-职能id
    public function getO_organisationrm()
    {
        return $this->hasMany(OOrganisationRelationMiddle::className(), ['FUNCTION_ID' => 'FUNCTION_ID'])->joinWith('o_organisationt');
    }

    //创建人-编码
    public function getU_userinfo()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'CUSER_ID'])->alias('u');
    }

    //更新人-编码
    public function getU_userinfos()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'UUSER_ID']);
    }

    //顶层组织编码-编码
    public function getO_organisationd()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'ORGANISATION_ID'])->select(['ORGANISATION_ID', 'ORGANISATION_NAME_CN']);
    }

    //顶层组织编码-编码
    public function getO_organisationt()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'ORGANISATIONOT_ID']);
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
     * 组织隶属新增的操作
     * before_ACreate 新增前
     * after_ACreate 新增后
     */
    public function before_ACreate($body, $class = null)
    {
        $respone = new ResponeModel();

        // 判断是否是长期 开启时间及截止时间，并转换成时间戳
        // if ($body['ORGANISATION_FORM_ID'] == "0") {
        /*$END_TIME = strtotime($body['END_TIME']);
         $body['END_TIME'] = $END_TIME;*/
        $END_TIME = $body['END_TIME'];
        // }
        //$EFFECTIVE_TIME = $body['EFFECTIVE_TIME'];
        /*$EFFECTIVE_TIME = strtotime($body['EFFECTIVE_TIME']);
        $body['EFFECTIVE_TIME'] = $EFFECTIVE_TIME;*/

        // 判断职能类型是否为空
        $this->load($body, '');
        Yii::$app->BaseHelper->validate($this);

        // 查询数据库表，判断职能类型是否是唯一性
        $Organisation = self::find()->where(['FUNCTION_ID' => $body['FUNCTION_ID']])->andWhere(["<>", "ORGANISATION_STATE", 0])->exists();
        if ($Organisation) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', 'The function type or Chinese name has been repeated. Please do not submit it again!'), [$body])];
        }

        /*if (isset($body['o_organisationrm'])) {
            if (count($body['o_organisationrm']) == 1) {
                $val[0]['ENTITY_STATE'] = 1;
            } else {
                $bodys = self::SetEntity($body['o_organisationrm']);
                unset($body['o_organisationrm']);
                $body['o_organisationrm'] = $bodys;
            }

        }*/
        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 组织隶属修改的操作
     * before_AUpdate 修改前
     * after_AUpdate 修改后
     */
    public function before_AUpdate($body, $class = null)
    {
        $respone = new ResponeModel();
        // 判断是否是编辑操作
        if (isset($body['edit_type']) && $body['edit_type']) {

            /*// 判断是否是长期 开启时间及截止时间，并转换成时间戳
            if ($body['ORGANISATION_FORM_ID'] == 0) {
                $END_TIME = strtotime($body['END_TIME']);
                $body['END_TIME'] = $END_TIME;
            }
            $EFFECTIVE_TIME = strtotime($body['EFFECTIVE_TIME']);
            $body['EFFECTIVE_TIME'] = $EFFECTIVE_TIME;*/

            // 判断职能类型是否为空
            $this->load($body, '');
            Yii::$app->BaseHelper->validate($this);
            $body = ArrayHelper::merge($this->toArray(), $body);

            // 查询数据库表，判断职能类型是否是唯一
            $Organisation = self::find()->where(['<>', 'ORGANISATION_RELATION_ID', $body['ORGANISATION_RELATION_ID']])->andWhere(['FUNCTION_ID' => $body['FUNCTION_ID']])->andWhere(["<>", "ORGANISATION_STATE", 0])->exists();
            if ($Organisation) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('organization', 'The function type or Chinese name has been repeated. Please do not submit it again!'), [$body])];
            }

            if (isset($body['o_organisationrm'])) {
                // 按照职能类型把隶属关系表的数据全部删除
                OOrganisationRelationMiddle::deleteAll(['FUNCTION_ID' => $body['FUNCTION_ID']]);

                if (count($body['o_organisationrm']) == 1) {
                    $val[0]['ENTITY_STATE'] = 1;
                } else {
                    $bodys = self::SetEntity($body['o_organisationrm']);
                    unset($body['o_organisationrm']);
                    $body['o_organisationrm'] = $bodys;
                }
            }

        }

        return [$this::ACTION_NEXT, $body];
    }

    /**
     *循环增加实体虚体
     */
    public function SetEntity($val)
    {

        // 循环判断是否是虚体及实体
        foreach ($val as $index => $item) {

            foreach ($val as $items) {
                // 如果当前编码在其他数据中是父级编码，那么当前这条数据就是虚体
                if ($item['ORGANISATION_ID'] !== $items['ORGANISATION_ID']) {
                    if ($item['ORGANISATION_ID'] == $items['ORGANISATION_PID']) {
                        $val[$index]['ENTITY_STATE'] = 0;
                    } else {
                        // 实体
                        $val[$index]['ENTITY_STATE'] = 1;
                        if ($item['ORGANISATION_PID'] == null) {
                            $val[$index]['ENTITY_STATE'] = 0;
                        }
                    }
                }
            }
        }

        return $val;
    }
}
