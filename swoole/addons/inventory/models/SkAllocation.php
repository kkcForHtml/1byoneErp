<?php
namespace addons\inventory\models;

use Yii;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\behaviors\TimestampBehavior;
use yii\behaviors\AttributeBehavior;
use \yii\swoole\db\ActiveRecord;
use addons\organization\models\OOrganisation;
use addons\master\basics\models\BWarehouse;
use addons\users\models\UUserInfo;
use yii\swoole\rest\ResponeModel;

/**
 * @SWG\Definition(
 *   definition="SkAllocation",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="ALLOCATION_ID", type="integer",description="调拨计划单ID"),
 *           @SWG\Property(property="ARGANISATION_CODE",type="string",description="调入组织"),
 *           @SWG\Property(property="ERGANISATION_CODE",type="string",description="调出组织"),
 *           @SWG\Property(property="ALLOCATION_CD", type="string",description="调拨计划单号"),
 *           @SWG\Property(property="ESTIMATEDA_AT", type="integer",format="int32",description="预计调入日期"),
 *           @SWG\Property(property="ESTIMATED_AT", type="integer",format="int32",description="预计调出日期"),
 *           @SWG\Property(property="ATWAREHOUSE_CODE", type="string",description="调入仓库"),
 *           @SWG\Property(property="ETWAREHOUSE_CODE",type="string",description="调出仓库"),
 *           @SWG\Property(property="ALLOCATION_STATE", type="integer",format="int32",description="审核状态,0：未审核 1：已审核"),
 *           @SWG\Property(property="DELETED_STATE", type="integer",format="int32",description="是否删除1：删除 0：未删除"),
 *           @SWG\Property(property="ALLOCATION_REMARKS",type="string",description="备注"),
 *           @SWG\Property(property="AUTITO_CODE",type="string",description="审核人"),
 *           @SWG\Property(property="AUTITO_AT",type="integer",format="int32",description="审核时间"),
 *           @SWG\Property(property="CREATED_AT",type="integer",format="int32",description="制单日期"),
 *           @SWG\Property(property="CUSER_CODE",type="integer",format="int32",description="制单人"),
 *           @SWG\Property(property="UUSER_CODE",type="integer",format="int32",description="更新人"),
 *           @SWG\Property(property="UPDATED_AT",type="integer",format="int32",description="更新时间"),
 *           @SWG\Property(property="ARGANISATION_ID",type="integer",format="int32",description="调入组织"),
 *           @SWG\Property(property="ERGANISATION_ID",type="integer",description="调出组织"),
 *           @SWG\Property(property="ATWAREHOUSE_ID",  type="integer",description="调入仓库"),
 *           @SWG\Property(property="ETWAREHOUSE_ID",  type="integer",description="调出仓库"),
 *           @SWG\Property(property="AUTITO_ID",  type="integer",description="审核人ID"),
 *           @SWG\Property(property="UUSER_ID",  type="integer",description="更新人ID"),
 *           @SWG\Property(property="CUSER_ID",  type="integer",description="创建人ID")
 *       )
 *   }
 * )
 */
class SkAllocation extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_allocation';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ESTIMATEDA_AT', 'ESTIMATED_AT', 'ALLOCATION_STATE', 'DELETED_STATE', 'CREATED_AT', 'UPDATED_AT', 'AUTITO_AT','ARGANISATION_ID', 'ERGANISATION_ID', 'ATWAREHOUSE_ID', 'ETWAREHOUSE_ID', 'AUTITO_ID', 'UUSER_ID', 'CUSER_ID'], 'integer'],
            [['ALLOCATION_CD'], 'string', 'max' => 30],
            [['ALLOCATION_REMARKS'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'ALLOCATION_ID' => Yii::t('inventory', '调拨计划单ID'),
            'ALLOCATION_CD' => Yii::t('inventory', '调拨计划单号'),
            'ESTIMATEDA_AT' => Yii::t('inventory', '预计调入日期'),
            'ESTIMATED_AT' => Yii::t('inventory', '预计调出日期'),
            'ALLOCATION_STATE' => Yii::t('inventory', '审核状态,1：未审核 2：已审核'),
            'DELETED_STATE' => Yii::t('inventory', '是否删除,1：删除 0：未删除'),
            'ALLOCATION_REMARKS' => Yii::t('inventory', '备注'),
            'CREATED_AT' => Yii::t('inventory', '创建时间'),
            'UPDATED_AT' => Yii::t('inventory', '修改时间'),
            'AUTITO_AT' => Yii::t('inventory', '审核时间'),
            'ARGANISATION_ID' => Yii::t('inventory', '调入组织'),
            'ERGANISATION_ID' => Yii::t('inventory', '调出组织'),
            'ATWAREHOUSE_ID' => Yii::t('inventory', '调入仓库'),
            'ETWAREHOUSE_ID' => Yii::t('inventory', '调出仓库'),
            'AUTITO_ID' => Yii::t('inventory', '审核人ID'),
            'UUSER_ID' => Yii::t('inventory', '更新人ID'),
            'CUSER_ID' => Yii::t('inventory', '创建人ID'),
        ];
    }

    /**
     * 新增修改前把指定字段值写入时间戳
     */
    public function behaviors()
    {
        $post = Yii::$app->getRequest()->getBodyParams();//获取post参数
        return [
            [
                'class' => AttributeBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => ['ALLOCATION_CD'],
                ],
                'value' => function ($event) use ($post) {
                    return Yii::$app->rpc->create('base')->sendAndrecv(
                        [
                            ['addons\common\base\modellogic\CreateNO', 'createTO'], [6, $post['ERGANISATION_ID'], $post['ARGANISATION_ID'], "MP", $post['ESTIMATED_AT']]
                        ]
                    );
                }
            ],
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

    //关联添加配置()
    public $realation = ['sk_allocation_detail' => ['ALLOCATION_ID' => 'ALLOCATION_ID']];

    //调拨单单详细
    public function getSk_allocation_detail()
    {
        return $this->hasMany(SkAllocationDetail::className(), ['ALLOCATION_ID' => 'ALLOCATION_ID'])
            ->joinWith(['b_unit', 'g_product_sku']);
    }

    //调入组织
    public function getO_organisation_a()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'ARGANISATION_ID'])->alias('orga')->select(['ORGANISATION_ID', 'ORGANISATION_NAME_CN']);
    }

    //调出组织
    public function getO_organisation_e()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' => 'ERGANISATION_ID'])->alias('orge')->select(['ORGANISATION_ID', 'ORGANISATION_NAME_CN']);
    }

    //调入仓库
    public function getB_warehouse_a()
    {
        return $this->hasOne(BWarehouse::className(), ['WAREHOUSE_ID' => 'ATWAREHOUSE_ID'])->alias('wara')->select(['WAREHOUSE_ID', 'WAREHOUSE_NAME_CN']);
    }

    //调出仓库
    public function getB_warehouse_e()
    {
        return $this->hasOne(BWarehouse::className(), ['WAREHOUSE_ID' => 'ETWAREHOUSE_ID'])->alias('ware')->select(['WAREHOUSE_ID', 'WAREHOUSE_NAME_CN']);
    }

    //创建人
    public function getU_userinfoc()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'CUSER_ID'])->alias('c')->joinWith(['u_staff_info']);
    }

    //更新人
    public function getU_userinfou()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'UUSER_ID'])->alias('u');
    }

    //审核人
    public function getU_userinfo_a()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' => 'AUTITO_ID'])->alias('a')->select(['a.USER_INFO_ID', 'a.STAFF_ID']);
    }

    /**
     * 新增之前的操作
     * @param      $body
     * @param null $class
     * @return array
     */
    public function before_ACreate($body, $class = null)
    {
        $response = new ResponeModel();
        if (!isset($body['ERGANISATION_ID']) || !isset($body['ARGANISATION_ID']) || !isset($body['ESTIMATED_AT'])) {
            return [static::ACTION_RETURN,$response->setModel(500, 0, Yii::t('inventory', 'New parameters are incomplete, new additions are not allowed!'), [$body])];
        }
        $body['DELETED_STATE'] = 0;
        $body['ALLOCATION_STATE'] = 1;
        $this->load($body, '');
        Yii::$app->BaseHelper->validate($this);
        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 批量更新前的操作
     * @param      $body
     * @param null $class
     * @return array
     */
    public function before_BUpdate($body, $class = NULL)
    {
        $response = new ResponeModel();
        if (isset($body['batchMTC']) && count($body['batchMTC']) > 0) {
            foreach ($body['batchMTC'] as $item) {
                if (isset($item['DELETED_STATE']) && $item['DELETED_STATE'] == 1) {
                    $skAllocation = SkAllocation::findOne($item['ALLOCATION_ID']);
                    if ($skAllocation->ALLOCATION_STATE == 2) {
                        return [static::ACTION_RETURN,$response->setModel(500, 0, Yii::t('inventory', "The current document has been audited and cannot be operated on!"), [])];
                    }
                }
            }
        }
        return [$this::ACTION_NEXT,$body];
    }

    /**
     * 更新前的操作
     * @param      $body
     * @param null $class
     * @return array
     */
    public function before_AUpdate($body, $class = null)
    {
        $response = new ResponeModel();
        if (!isset($body['ALLOCATION_ID']) || !$body['ALLOCATION_ID']) {
            return [static::ACTION_RETURN, $response->setModel(500, 0, Yii::t('inventory', "Parameter check failed"), [])];
        }
        if (isset($body['DETAIL_CODE']) && $body['DETAIL_CODE']) {
            SkAllocationDetail::deleteAll(["ALLOCATION_ID" => $body['ALLOCATION_ID']]);
        }
        return [$this::ACTION_NEXT, $body];
    }
}