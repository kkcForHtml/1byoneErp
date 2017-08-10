<?php

namespace addons\master\partint\models;

use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;
use yii\swoole\db\Query;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\helpers\ArrayHelper;

use addons\users\models\UUserInfo;

/**
 * @SWG\Definition(
 *   definition="PaPartnerClassify",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="CLASSIFY_ID", type="integer",,format="int32",description="伙伴分类ID"),
 *           @SWG\Property(property="CLASSIFY_CODE", type="string",description="分类编码"),
 *           @SWG\Property(property="CLASSIFY_NAME_CN", type="string",description="分类名称(中文)"),
 *           @SWG\Property(property="CLASSIFY_NAME_EN", type="string",description="分类名称(英文)"),
 *           @SWG\Property(property="CLASSIFY_REMARKS", type="string",description="备注"),
 *           @SWG\Property(property="CLASSIFY_STATE", type="integer",format="int32",description="是否启用,1：Y 0：N"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class PaPartnerClassify extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'pa_partner_classify';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['CLASSIFY_NAME_CN'], 'required'],
            [['CLASSIFY_STATE', 'CREATED_AT', 'UPDATED_AT','CUSER_ID','UUSER_ID'], 'integer'],
            [['CLASSIFY_CODE'], 'string', 'max' => 20],
            [['CLASSIFY_NAME_CN', 'CLASSIFY_NAME_EN','CLASSIFY_CODE'], 'string', 'max' => 100],
            [['CLASSIFY_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'CLASSIFY_ID' => Yii::t('partint', '伙伴分类ID'),
            'CLASSIFY_CODE' => Yii::t('partint', '分类编码'),
            'CLASSIFY_NAME_CN' => Yii::t('partint', '分类名称(中文)'),
            'CLASSIFY_NAME_EN' => Yii::t('partint', '分类名称(英文)'),
            'CLASSIFY_STATE' => Yii::t('partint', '是否启用,1：Y 0：N'),
            'CLASSIFY_REMARKS' => Yii::t('partint', '备注'),
            'CREATED_AT' => Yii::t('partint', '创建时间'),
            'UPDATED_AT' => Yii::t('partint', '修改时间'),
            'CUSER_ID' => Yii::t('partint', '更新人ID'),
            'UUSER_ID' => Yii::t('partint', '更新人ID'),
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

    /**
     * 伙伴分类新增的操作
     * before_ACreate 新增前
     * after_ACreate 新增后
     */

    public function before_ACreate($body, $class = null)
    {

        $respone = new ResponeModel();
        $this->load($body, '');
        Yii::$app->BaseHelper->validate($this);
        // 查询数据库表，判断分类名称是否是唯一性
        /*
        $SKUDB = self::find()->where(['or', ['CLASSIFY_CODE' => $body['CLASSIFY_CODE']], ['CLASSIFY_NAME_CN' => $body['CLASSIFY_NAME_CN']]])->exists();
        if ($SKUDB) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('partint', "The classified coding or Chinese name has been repeated. Please do not submit it again!"), [$body])];
        }
        */


        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 伙伴分类修改的操作
     * before_AUpdate 修改前
     * after_AUpdate 修改后
     */
    public function before_AUpdate($body, $class = null)
    {
        $respone = new ResponeModel();
        if (isset($body['batch']) && count($body['batch']) > 0) {
            foreach ($body['batch'] as $item) {
                $this->load($item, '');
                Yii::$app->BaseHelper->validate($this);
                $body = ArrayHelper::merge($this->toArray(), $body);
                // 查询数据库表，判断分类名称是否是唯一性
                $GproductType = self::find()->where(['<>', 'CLASSIFY_ID', $item['CLASSIFY_ID']])->andWhere(['or', ['CLASSIFY_CODE' => $item['CLASSIFY_CODE']], ['CLASSIFY_NAME_CN' => $item['CLASSIFY_NAME_CN']]])->exists();
                if ($GproductType) {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('partint', "The classified coding or Chinese name has been repeated. Please do not submit it again!"), [$body])];
                }
            }
        } else {
            // 判断是否是编辑操作
            if (isset($body['edit_type']) && $body['edit_type']) {
                $this->load($body, '');
                Yii::$app->BaseHelper->validate($this);
                $body = ArrayHelper::merge($this->toArray(), $body);

                // 查询数据库表，判断分类名称是否是唯一性
                $GproductType = self::find()->where(['<>', 'CLASSIFY_ID', $body['CLASSIFY_ID']])->andWhere(['or', ['CLASSIFY_CODE' => $body['CLASSIFY_CODE']], ['CLASSIFY_NAME_CN' => $body['CLASSIFY_NAME_CN']]])->exists();
                if ($GproductType) {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('partint', "The classified coding or Chinese name has been repeated. Please do not submit it again!"), [$body])];
                }

            }
        }
        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 伙伴分类删除的操作
     * before_ADelete 删除前
     * after_ADelete 删除后
     */
    public function before_ADelete($body, $class = null)
    {
        $respone = new ResponeModel();
        //伙伴信息表删除校验
        if(count($body) == count($body, 1)){
            $exitData = (new Query())->from(PaPartner::tableName())->where(['=', 'PARTNER_CLASSIFY_ID', $body['CLASSIFY_ID']])->exists();
            if ($exitData) {
                return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This partner classification has been used by other documents and cannot be deleted!"), [$body])];
            }
        }else{
            foreach($body as $value){
                $exitData = (new Query())->from(PaPartner::tableName())->where(['=', 'CLASSIFY_ID', $value['CLASSIFY_ID']])->exists();
                if ($exitData) {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This partner classification has been used by other documents and cannot be deleted!"), [$body])];
                }
            }
        }


        return [$this::ACTION_NEXT, $body];
    }
}
