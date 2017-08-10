<?php

namespace addons\inventory\models;

use addons\master\basics\models\BChannel;
use addons\master\basics\models\BWarehouse;
use addons\organization\models\OOrganisation;
use addons\users\models\UUserInfo;
use Yii;
use yii\behaviors\AttributeBehavior;
use yii\behaviors\TimestampBehavior;
use yii\swoole\behaviors\OperatorBehaviors;
use yii\swoole\db\ActiveRecord;
use yii\swoole\rest\ResponeModel;
use yii\web\ServerErrorHttpException;

/**
 * @SWG\Definition(
 *   definition="SkStockInitialise",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="STOCK_INITIALISE_ID", type="integer",description="库存初始化单ID"),
 *           @SWG\Property(property="STOCK_INITIALISE_CD", type="string",description="库存初始化单单号"),
 *           @SWG\Property(property="ORGANISATION_ID", type="integer",description="组织ID"),
 *           @SWG\Property(property="CHANNEL_ID", type="integer",description="平台ID"),
 *           @SWG\Property(property="WAREHOUSE_ID", type="integer",description="目的仓ID"),
 *           @SWG\Property(property="ORDER_STATE", type="integer",description="单据状态:1.未审核、2.已审核"),
 *           @SWG\Property(property="DELETED_STATE", type="integer",description="是否删除:1：删除 0：未删除"),
 *           @SWG\Property(property="IMPORT_STATE", type="integer",description="数据来源:1.手工创建 99数据导入"),
 *           @SWG\Property(property="AUTITO_ID", type="integer",description="审核人ID"),
 *           @SWG\Property(property="AUTITO_AT", type="integer",description="审核时间"),
 *           @SWG\Property(property="CREATED_AT", type="integer",description="创建时间"),
 *           @SWG\Property(property="UPDATED_AT", type="integer",description="修改时间"),
 *           @SWG\Property(property="CUSER_ID", type="integer",description="创建人ID"),
 *           @SWG\Property(property="UUSER_ID", type="integer",description="更新人ID")
 *       )
 *   }
 * )
 */
class SkStockInitialise extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'sk_stock_initialise';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['ORGANISATION_ID','CHANNEL_ID', 'WAREHOUSE_ID'], 'required'],
            [['ORGANISATION_ID', 'CHANNEL_ID', 'WAREHOUSE_ID', 'ORDER_STATE', 'DELETED_STATE', 'IMPORT_STATE', 'AUTITO_ID', 'AUTITO_AT', 'CREATED_AT', 'UPDATED_AT', 'CUSER_ID', 'UUSER_ID', 'INIT_STATE'], 'integer'],
            [['STOCK_INITIALISE_CD'], 'string', 'max' => 30],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'STOCK_INITIALISE_ID' => Yii::t('inventory', '库存初始化单ID'),
            'STOCK_INITIALISE_CD' => Yii::t('inventory', '库存初始化单单号'),
            'ORGANISATION_ID' => Yii::t('inventory', '组织ID'),
            'CHANNEL_ID' => Yii::t('inventory', '平台ID'),
            'WAREHOUSE_ID' => Yii::t('inventory', '目的仓ID'),
            'ORDER_STATE' => Yii::t('inventory', '单据状态:1.未审核、2.已审核'),
            'DELETED_STATE' => Yii::t('inventory', '是否删除:1：删除 0：未删除'),
            'IMPORT_STATE' => Yii::t('inventory', '数据来源:1.手工创建 99数据导入'),
            'AUTITO_ID' => Yii::t('inventory', '审核人ID'),
            'AUTITO_AT' => Yii::t('inventory', '审核时间'),
            'CREATED_AT' => Yii::t('inventory', '创建时间'),
            'UPDATED_AT' => Yii::t('inventory', '修改时间'),
            'CUSER_ID' => Yii::t('inventory', '创建人ID'),
            'UUSER_ID' => Yii::t('inventory', '更新人ID'),
            'INIT_STATE' => Yii::t('inventory', '初始化状态,1:Y 0:N'),
        ];
    }

    /**
     * 新增修改前把指定字段值写入时间戳
     */
    public function behaviors()
    {
        return [
            [
                'class' => AttributeBehavior::className(),
                'attributes' => [
                    ActiveRecord::EVENT_BEFORE_INSERT => 'STOCK_INITIALISE_CD',
                ],
                'value' => function ($event) {
                    return Yii::$app->rpc->create('base')->sendAndrecv([['addons\common\base\modellogic\CreateNO', 'createOrderNo'],
                        [7, $this->ORGANISATION_ID, 'INIT']]);
                },
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
            ],
        ];
    }

    public static function addQuery(&$query, $alias)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if($str){
            $query->andWhere([$alias . '.ORGANISATION_ID' => Yii::$app->session->get('organization') ?: null]);
        }
    }

    public $realation = ['sk_stock_initialise_detail' => ['STOCK_INITIALISE_ID' => 'STOCK_INITIALISE_ID', 'STOCK_INITIALISE_CD' => 'STOCK_INITIALISE_CD']];

    //创建人、制单人
    public function getU_userinfo()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' =>'CUSER_ID' ])->select(['u_user_info.USER_INFO_ID', 'u_user_info.STAFF_ID'])->joinWith('u_staffinfo');
    }
    //审核人
    public function getAutito_user()
    {
        return $this->hasOne(UUserInfo::className(), ['USER_INFO_ID' =>'AUTITO_ID' ])->select(['autito_user.USER_INFO_ID', 'autito_user.STAFF_ID'])->alias('autito_user')->joinWith('u_staffinfo2');
    }
    //组织
    public function getO_organisation()
    {
        return $this->hasOne(OOrganisation::className(), ['ORGANISATION_ID' =>'ORGANISATION_ID' ])->select(['ORGANISATION_ID', 'ORGANISATION_NAME_CN']);
    }
    //平台
    public function getB_channel()
    {
        return $this->hasOne(BChannel::className(), ['CHANNEL_ID' => 'CHANNEL_ID'])->select(['CHANNEL_ID', 'CHANNEL_NAME_CN']);
    }
    //仓库
    public function getB_warehouse()
    {
        return $this->hasOne(BWarehouse::className(), ['WAREHOUSE_ID' => 'WAREHOUSE_ID'])->select(['WAREHOUSE_ID', 'WAREHOUSE_NAME_CN']);
    }
    //初始化明细，带出产品sku表
    public function getSk_stock_initialise_detail()
    {
        return $this->hasMany(SkStockInitialiseDetail::className(), ['STOCK_INITIALISE_ID' => 'STOCK_INITIALISE_ID'])->joinWith(['g_product_sku']);
    }


    /**
     * 新增前的操作
     */
    public function before_ACreate($body, $class = null)
    {
        $respone = new ResponeModel();
        if(!isset($body['sk_stock_initialise_detail']) || count($body['sk_stock_initialise_detail']) == 0){
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "Document details must have at least one!"), $body)];
        }
        $result = SkStockInitialise::find()->where(['DELETED_STATE'=>0, 'ORGANISATION_ID'=>$this->ORGANISATION_ID, 'CHANNEL_ID'=>$this->CHANNEL_ID, 'WAREHOUSE_ID'=>$this->WAREHOUSE_ID])->exists();
        if($result){
            return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "Only one document is allowed in the same organisation and same channel and same warehouse!"), $body)];
        }
        $this->DELETED_STATE = 0;
        $this->ORDER_STATE = 1;
        $this->INIT_STATE = 0;

        return [$this::ACTION_NEXT, $body];
    }

    /**
     * 更新前的操作
     */
    public function before_AUpdate($body, $class = null)
    {
        $respone = new ResponeModel();
        if(isset($body['STOCK_INITIALISE_ID'])){
            if(isset($body['edit_type'])){
                if($body['edit_type'] == 1){    //审核
                    $body['ORDER_STATE'] = 2;
                    $user = Yii::$app->getUser();
                    $autito_user = $user && !$user->isGuest ? $user->getIdentity()->USER_INFO_ID : '1';
                    $body['AUTITO_ID'] = $autito_user;
                    $body['AUTITO_AT'] = time();
                }elseif($body['edit_type'] == 2){   //反审核
                    $result = SkStockInitialise::find()->where(['INIT_STATE'=>1, 'STOCK_INITIALISE_ID'=>$body['STOCK_INITIALISE_ID']])->exists();
                    if($result){
                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "The current document has been initialized and cannot be reverse audited!"), $body)];
                    }
                    $body['ORDER_STATE'] = 1;
                    $body['AUTITO_ID'] = null;
                    $body['AUTITO_AT'] = null;
                }elseif($body['edit_type'] == 3) {   //删除
                    $result = SkStockInitialise::find()->where(['ORDER_STATE'=>2, 'STOCK_INITIALISE_ID'=>$body['STOCK_INITIALISE_ID']])->exists();
                    if($result){    //已审核，不能删除
                        return [static::ACTION_RETURN, $respone->setModel(500, 0, Yii::t('inventory', "The current document has been audited and cannot be operated on!"), $body)];
                    }
                    //逻辑删除主表，物理删除明细
                    SkStockInitialiseDetail::deleteAll(['STOCK_INITIALISE_ID'=>$body['STOCK_INITIALISE_ID']]);  //删除明细
                    $body['DELETED_STATE'] = 1; //逻辑删除主表，状态标为1
                    if(isset($body['sk_stock_initialise_detail'])){
                        unset($body['sk_stock_initialise_detail']);     //销掉$body中的明细数据，防止再生成
                    }
                }else{  //保存
                    $this->_modify_check($body);
                }
            }else{  //保存
                $this->_modify_check($body);
            }
        }

        return [$this::ACTION_NEXT, $body];
    }

    //保存前的校验
    public function _modify_check($body){
        if(!isset($body['sk_stock_initialise_detail']) || count($body['sk_stock_initialise_detail']) == 0){
            throw new ServerErrorHttpException(Yii::t('inventory', "Document details must have at least one!"));
        }
        $result = SkStockInitialise::find()->where(['ORDER_STATE'=>2, 'STOCK_INITIALISE_ID'=>$body['STOCK_INITIALISE_ID']])->exists();
        if($result){    //已审核，不能修改
            throw new ServerErrorHttpException(Yii::t('inventory', "The current document has been audited and cannot be operated on!"));
        }
    }

}
