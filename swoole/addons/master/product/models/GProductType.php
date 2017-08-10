<?php

namespace addons\master\product\models;

use addons\master\basics\models\BSalesProductType;
use addons\users\models\UUserCategory;
use Yii;
use yii\db\Expression;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use \yii\swoole\db\ActiveRecord;
use yii\swoole\db\Query;
use \yii\swoole\rest\ResponeModel;
use yii\swoole\helpers\ArrayHelper;

use addons\users\models\UUserInfo;
use addons\master\product\models\GProductSku;

/**
 * This is the model class for table "g_product_type".
 */

/**
 * @SWG\Definition(
 *   definition="GProductType",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="PRODUCT_TYPE_ID", type="integer",description="产品分类ID"),
 *           @SWG\Property(property="SYSTEM_NAME_CN", type="string",description="产品分类名称(中文)"),
 *           @SWG\Property(property="SYSTEM_NAME_EN", type="string",description="产品分类名称(英文)"),
 *           @SWG\Property(property="SYSTEM_NAMER_CN", type="string",description="产品分类全称(中文)"),
 *           @SWG\Property(property="SYSTEM_NAMER_EN", type="string",description="产品分类全称(英文)"),
 *           @SWG\Property(property="SYSTEM_CLASS_FATHER", type="string",description="层级,只有两层"),
 *           @SWG\Property(property="PRODUCTOT_TYPE_ID", type="integer",format="int32",description="父级分类ID,0表示最高层"),
 *           @SWG\Property(property="HIERARCHICAL_PATH", type="string",description="层级路径,'-'隔开:ID-ID"),
 *           @SWG\Property(property="PRODUCT_TYPE_STATE",type="integer",format="int32",description="是否启用,1:Y 0:N"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="修改时间"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class GProductType extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'g_product_type';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['SYSTEM_CLASS_FATHER', 'PRODUCTOT_TYPE_ID', 'CREATED_AT', 'UPDATED_AT', 'PRODUCT_TYPE_STATE', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['SYSTEM_NAME_EN', 'SYSTEM_NAME_CN'], 'string', 'max' => 50],
            [['SYSTEM_NAMER_CN', 'SYSTEM_NAMER_EN'], 'string', 'max' => 255],
            [['HIERARCHICAL_PATH'], 'string', 'max' => 30],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'PRODUCT_TYPE_ID' => Yii::t('product', '产品分类ID'),
            'SYSTEM_NAME_CN' => Yii::t('product', '产品分类名称(中文)'),
            'SYSTEM_NAME_EN' => Yii::t('product', '产品分类名称(英文)'),
            'SYSTEM_NAMER_CN' => Yii::t('product', '产品分类全称(中文)'),
            'SYSTEM_NAMER_EN' => Yii::t('product', '产品分类全称(英文)'),
            'SYSTEM_CLASS_FATHER' => Yii::t('product', '层级,只有两层'),
            'PRODUCTOT_TYPE_ID' => Yii::t('product', '父级分类ID,0表示最高层'),
            'HIERARCHICAL_PATH' => Yii::t('product', '层级路径,\'-\'隔开:ID-ID'),
            'CREATED_AT' => Yii::t('product', '创建时间'),
            'UPDATED_AT' => Yii::t('product', '修改时间'),
            'PRODUCT_TYPE_STATE' => Yii::t('product', '是否启用,1:Y 0:N'),
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

    public $realation = ['g_product_types' => ['PRODUCTOT_TYPE_ID' => 'PRODUCT_TYPE_ID']];


    public static function addQuery(&$query, $alias)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();

        if ($str) {
            $query->andWhere([$alias . '.PRODUCT_TYPE_ID' => Yii::$app->session->get('categoryd') ?: null]);
        }

    }

    // 子级-删除的
    public function getG_product_types()
    {
        return $this->hasMany(GProductType::className(), ['PRODUCTOT_TYPE_ID' => 'PRODUCT_TYPE_ID'])->alias('g')->onCondition(['<>', 'g.PRODUCTOT_TYPE_ID', 0]);
    }

    public function getG_product_types_2()
    {
        return $this->hasMany(GProductType::className(), ['PRODUCTOT_TYPE_ID' => 'PRODUCT_TYPE_ID'])->alias('g')->onCondition(['and', ['<>', 'g.PRODUCTOT_TYPE_ID', 0], ['=', 'g.PRODUCT_TYPE_STATE', 1]]);
    }

    //子级-不删除
    public function getG_product_types_1()
    {
        return $this->hasMany(GProductType::className(), ['PRODUCTOT_TYPE_ID' => 'PRODUCT_TYPE_ID'])->select(["g1.PRODUCTOT_TYPE_ID", "g1.PRODUCT_TYPE_ID", "g1.SYSTEM_NAME_CN", "g1.HIERARCHICAL_PATH"])->alias('g1');
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
     * 产品分类信息新增的操作
     * before_ACreate 新增前
     * after_ACreate 新增后
     */

    public function after_ACreate($body, $class = null)
    {
        $HIERARCHICAL_PATH = $body['PRODUCTOT_TYPE_ID'] . '-' . $this->PRODUCT_TYPE_ID;
        $body['HIERARCHICAL_PATH'] = $HIERARCHICAL_PATH;
        $customer = static::findOne($this->PRODUCT_TYPE_ID);
        $customer->HIERARCHICAL_PATH = $HIERARCHICAL_PATH;
        $customer->update();
        return [$this::ACTION_NEXT, $body];
    }

    /**
     *递归，查找子孙树
     */
    function subtree($arr, $id = 0, $lev = 1)
    {
        $subs = array(); // 子孙数组
        foreach ($arr as $v) {
            if ($v['PRODUCTOT_TYPE_ID'] == $id) {
                $v['lev'] = $lev;
                $subs[] = $v;
                $subs = array_merge($subs, self::subtree($arr, $v['PRODUCT_TYPE_ID'], $lev + 1));
            }
        }
        return $subs;
    }

    /**
     * 循环获取ID
     */
    function getTypeID($array)
    {
        $id = [];
        foreach ($array as $val) {
            array_push($id, $val['PRODUCT_TYPE_ID']);
        }
        return $id;
    }

    /**
     * 产品分类删除的操作
     * before_ADelete 删除前
     * after_ADelete 删除后
     */
    public function before_ADelete($body, $class = null)
    {
        $respone = new ResponeModel();
        if (count($body) > 0) {
            foreach ($body as $i) {
                //是否存在小分类
                if ($i['PRODUCTOT_TYPE_ID'] == 0) {
                    $GproductType = static::find()->asArray()->all();
                    $array = self::subtree($GproductType, $i['PRODUCT_TYPE_ID'], 1);
                    if (count($array) > 0) {
                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This product classification has been used by other documents and cannot be deleted!"), [$body])];
                    }
                }
                //销售产品中间表
                $exitData = (new Query())->from(BSalesProductType::tableName())->where(['=', 'PRODUCT_TYPE_ID', $i['PRODUCT_TYPE_ID']])->exists();
                if ($exitData) {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This product classification has been used by other documents and cannot be deleted!"), [$body])];
                }
                //通用SKU表
                $exitData = (new Query())->from(GCurrencySku::tableName())->where(new Expression("FIND_IN_SET('" . $i['PRODUCT_TYPE_ID'] . "',PRODUCT_TYPE_PATH)"))->exists();
                if ($exitData) {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This product classification has been used by other documents and cannot be deleted!"), [$body])];
                }
                //产品SKU表
                $exitData = (new Query())->from(GProductSku::tableName())->where(new Expression("FIND_IN_SET('" . $i['PRODUCT_TYPE_ID'] . "',PRODUCT_TYPE_PATH)"))->exists();
                if ($exitData) {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This product classification has been used by other documents and cannot be deleted!"), [$body])];
                }
                //用户品类关系表
                $exitData = (new Query())->from(UUserCategory::tableName())->where(['=', 'PRODUCT_TYPE_ID', $i['PRODUCT_TYPE_ID']])->exists();
                if ($exitData) {
                    return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('product', "This product classification has been used by other documents and cannot be deleted!"), [$body])];
                }
            }
        }


        return [$this::ACTION_NEXT, $body];
    }

}
