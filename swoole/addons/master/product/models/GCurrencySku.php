<?php

namespace addons\master\product\models;

use addons\tools\models\QaProductFqa;
use Yii;
use yii\db\Expression;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;
use yii\swoole\db\Query;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\helpers\ArrayHelper;

use addons\users\models\UUserInfo;
use addons\master\basics\models\BUnit;

/**
 * @SWG\Definition(
 *   definition="GCurrencySku",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="CSKU_ID", type="integer",description="通用SKU ID"),
 *           @SWG\Property(property="CSKU_CODE", type="string",description="通用SKU编码"),
 *           @SWG\Property(property="CSKU_NAME_CN", type="string",description="名称(中文)"),
 *           @SWG\Property(property="CSKU_NAME_EN", type="string",description="名称(英文)"),
 *           @SWG\Property(property="PRODUCT_TYPE_PATH",  type="string",description="产品分类路径"),
 *           @SWG\Property(property="CSKU_STATE", type="integer",format="int32",description="是否启用,1：Y 0：N"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="UNIT_ID", type="string",description="单位ID"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class GCurrencySku extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'g_currency_sku';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['CSKU_STATE', 'UPDATED_AT', 'CREATED_AT','UNIT_ID','CUSER_ID','UUSER_ID'], 'integer'],
            [['CSKU_CODE', 'PRODUCT_TYPE_PATH',], 'string', 'max' => 20],
            [['CSKU_NAME_CN'], 'string', 'max' => 128],
            [['CSKU_NAME_EN'], 'string', 'max' => 50],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'CSKU_ID' => Yii::t('product', '通用SKU ID'),
            'CSKU_CODE' => Yii::t('product', '通用SKU编码'),
            'CSKU_NAME_CN' => Yii::t('product', '名称(中文)'),
            'CSKU_NAME_EN' => Yii::t('product', '名称(英文)'),
            'PRODUCT_TYPE_PATH' => Yii::t('product', '产品分类路径'),
            'CSKU_STATE' => Yii::t('product', '是否启用,1：Y 0：N'),
            'UPDATED_AT' => Yii::t('product', '修改时间'),
            'CREATED_AT' => Yii::t('product', '创建时间'),
            'UNIT_ID' => Yii::t('product', '单位ID'),
            'CUSER_ID' => Yii::t('product', '创建人ID'),
            'UUSER_ID' => Yii::t('product', '更新人ID'),
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

    public $realation = ['g_product_sku' => ['CSKU_ID' => 'CSKU_ID']];

    public static function addQuery(&$query, $alias)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();

        if ($str) {
            #分类权限
            $category = Yii::$app->session->get('categoryd') ?: null;
            if ($category !== null) {
                $list = ['or'];
                foreach ($category as $i => $item) {
                    $list[] = new Expression("FIND_IN_SET(:{$i}, g_currency_sku.PRODUCT_TYPE_PATH)", [":{$i}" => $item]);
                }
                $query->andWhere($list);
            } else {
                $query->andWhere(['or', new Expression("FIND_IN_SET(:category, g_currency_sku.PRODUCT_TYPE_PATH)", [":category" => $category])]);
            }
        }


    }

    //创建人
    public function getU_userinfo()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'CUSER_ID'])->alias('u');
    }

    //更新人
    public function getU_userinfos()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'UUSER_ID'])->alias('us');
    }

    //单位
    public function getB_unit()
    {
        return $this->hasOne(BUnit::className(), ['UNIT_ID' => 'UNIT_ID']);
    }

    //产品SKU
    public function getG_product_sku()
    {
        return $this->hasMany(GProductSku::className(), ['CSKU_ID' => 'CSKU_ID']);
    }

    /**
     * 通用SKU查询的操作
     * before_AIndex 查询前
     * after_AIndex 查询后
     */
    public function before_AIndex($body, $class = null)
    {
        if ($goodsType = ArrayHelper::remove($body, 'goodsType')) {
            $val = GProductType::find()->select(['PRODUCT_TYPE_ID'])->andFilterWhere(['or', ['like', 'SYSTEM_NAME_CN', $goodsType], ['like', 'SYSTEM_NAMER_CN', $goodsType], ['like', 'SYSTEM_NAME_EN', $goodsType], ['like', 'SYSTEM_NAMER_EN', $goodsType]])->asArray()->all();
            //相关分类信息
            if (count($val)>0) {
                if(count($val)>1){
                    foreach ($val as $i => $item) {
                        $body['andFilterWhere'][] = new Expression("FIND_IN_SET(:{$i}, g_currency_sku.PRODUCT_TYPE_PATH)", [":{$i}" => $item['PRODUCT_TYPE_ID']]);
                    }
                }else{
                    $body['andFilterWhere'][] = new Expression("FIND_IN_SET(:category, g_currency_sku.PRODUCT_TYPE_PATH)", [":category" => $val[0]['PRODUCT_TYPE_ID']]);
                }

            }
        }
        return parent::before_AIndex($body); // TODO: Change the autogenerated stub
    }

    /**
     * 通用SKU查询的操作
     * before_AIndex 查询前
     * after_AIndex 查询后
     */
    public function after_AIndex($body, $class = null)
    {
        $conten = [];
        foreach ($body as $index => $item) {
            $conten[$index] = [];
            $Types = "";
            $Types1 = "";
            //拆分分类
            $array = explode(',', $item['PRODUCT_TYPE_PATH']);
            $area1 = (new Query())->from('g_product_type')->where(['PRODUCT_TYPE_ID' => $array[0]])->all();
            $area2 = (new Query())->from('g_product_type')->where(['PRODUCT_TYPE_ID' => $array[1]])->all();
            $conten[$index] = $item;
            if ($area1) {
                $Types = $area1[0];
            }
            if ($area2) {
                $Types1 = $area2[0];
            }
            $conten[$index]['bigType'] = $Types;
            $conten[$index]['smallType'] = $Types1;
        }
        return parent::after_AIndex($conten); // TODO: Change the autogenerated stub
    }


    /**
     * 通用SKU新增的操作
     * before_ACreate 新增前
     * after_ACreate 新增后
     */

    public function before_ACreate($body, $class = null)
    {
        $respone = new ResponeModel();

        // 判断SKU或者中文名称是否为空
        $this->load($body, '');
        Yii::$app->BaseHelper->validate($this);

        // 查询数据库表，判断SKU或者中文名称是否是唯一性
        $SKUDB = self::find()->where(['or', ['CSKU_CODE' => $body['CSKU_CODE']], ['CSKU_NAME_CN' => $body['CSKU_NAME_CN']]])->exists();
        if ($SKUDB) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "The currency SKU or Chinese name has been repeated. Please do not submit it again!"), [$body])];
        }

        if (isset($body['g_product_sku']) && count($body['g_product_sku']) > 0) {
            $varray = [];
            foreach ($body['g_product_sku'] as $index => $item) {

                $GProductSkuDB = (new Query())->from('g_product_sku')
                    ->leftJoin('g_currency_sku','g_currency_sku.CSKU_ID = g_product_sku.CSKU_ID')
                    ->where(['g_product_sku.PSKU_CODE' => $item['PSKU_CODE'], 'g_product_sku.ORGAN_ID_DEMAND' => $item['ORGAN_ID_DEMAND'], 'g_currency_sku.CSKU_CODE' => $body['CSKU_CODE']])
                    ->exists();
                if ($GProductSkuDB) {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "The SKU or Chinese name has been repeated. Please do not submit it again!"), [$body])];
                }
                //在同一个国家新建两个通用SKU一样的产品。
                $SKUDBT = (new Query())->from('g_product_sku')
                    ->leftJoin('g_currency_sku','g_currency_sku.CSKU_ID = g_product_sku.CSKU_ID')
                    ->where(['g_product_sku.ORGAN_ID_DEMAND' => $item['ORGAN_ID_DEMAND'], 'g_currency_sku.CSKU_CODE' => $body['CSKU_CODE']])
                    ->exists();
                if ($SKUDBT) {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "Each generic SKU can only have one product number in each country of need!"), [$body])];
                }
                $varray[$index] = $item;
                $varray[$index]['UNIT_ID'] = $body['UNIT_ID'];
                $varray[$index]['PRODUCT_TYPE_PATH'] = $body['PRODUCT_TYPE_PATH'];
            }
            unset($body['g_product_sku']);
            $body['g_product_sku'] = $varray;
        }
        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 通用SKU修改的操作
     * before_AUpdate 修改前
     * after_AUpdate 修改后
     */
    public function before_AUpdate($body, $class = null)
    {
        $respone = new ResponeModel();

        // 判断是否是编辑操作

        // 判断名称是否为空
        $this->load($body, '');
        Yii::$app->BaseHelper->validate($this);
        $body = ArrayHelper::merge($this->toArray(), $body);
        // 查询数据库表，判断名称是否是唯一性
        $GproductType = static::find()->Where(['<>', 'CSKU_ID', $body['CSKU_ID']])->andWhere(['or', ['CSKU_CODE' => $body['CSKU_CODE']], ['CSKU_NAME_CN' => $body['CSKU_NAME_CN']]])->asArray()->all();

        if (count($GproductType) > 0) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "The currency SKU or Chinese name has been repeated. Please do not submit it again!"), [$body])];
        }

        $Gproduct = static::find()->Where(['CSKU_ID' => $body['CSKU_ID']])->asArray()->one();

        if ($body['CSKU_CODE'] !== $Gproduct['CSKU_CODE']) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "The currency SKU encoding  prohibits modification!"), [$body])];
        }
        if (isset($body['g_product_sku']) && count($body['g_product_sku']) > 0) {
            $varray = [];
            foreach ($body['g_product_sku'] as $index => $item) {

                // 查询数据库表，判断是否是唯一性
                $GproductType = (new Query())->from('g_product_sku')
                    ->andFilterWhere(['<>', 'PSKU_ID', ArrayHelper::getValue($item, 'PSKU_ID')])->andWhere(['PSKU_CODE' => $item['PSKU_CODE'], 'ORGAN_ID_DEMAND' => $item['ORGAN_ID_DEMAND'], 'CSKU_ID' => $body['CSKU_ID']])
                    ->exists();

                if ($GproductType) {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "The SKU or Chinese name has been repeated. Please do not submit it again!"), [$item])];
                }
                $GproductTypes = (new Query())->from('g_product_sku')
                    ->andFilterWhere(['<>', 'PSKU_ID', ArrayHelper::getValue($item, 'PSKU_ID')])->andWhere(['ORGAN_ID_DEMAND' => $item['ORGAN_ID_DEMAND'], 'CSKU_ID' => $body['CSKU_ID']])
                    ->exists();

                if ($GproductTypes) {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "Each generic SKU can only have one product number in each country of need!"), [$item])];
                }

                $varray[$index] = $item;
                $varray[$index]['UNIT_ID'] = $body['UNIT_ID'];
                $varray[$index]['PRODUCT_TYPE_PATH'] = $body['PRODUCT_TYPE_PATH'];

            }
            unset($body['g_product_sku']);
            $body['g_product_sku'] = $varray;
        }
        //是否同意联同产品SKU状态一起修改
        if (isset($body['edit_type']) && $body['edit_type']) {
            GProductSku::updateAll(['PSKU_STATE' => $body['CSKU_STATE']], ['CSKU_ID' => $body['CSKU_ID']]);
        }

        return [$this::ACTION_NEXT, $body];
    }


    /**
     * 通用SKU删除的操作
     * before_ADelete 删除前
     * after_ADelete 删除后
     */
    public function before_ADelete($body, $class = null)
    {
        $respone = new ResponeModel();
        //产品SKU表
        $exitData = (new Query())->from(GProductSku::tableName())->where(['=', 'CSKU_ID', $this->CSKU_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This currency SKU has been used by other documents and cannot be deleted!"), [$body])];
        }
        //产品问答表
        $exitData = (new Query())->from(QaProductFqa::tableName())->where(['=', 'CSKU_ID', $this->CSKU_ID])->exists();
        if ($exitData) {
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This currency SKU has been used by other documents and cannot be deleted!"), [$body])];
        }
        return [$this::ACTION_NEXT, $body];
    }
}
