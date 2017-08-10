<?php

namespace addons\tools\models;

use Yii;
use   addons\users\models\UUserInfo;
use   addons\users\models\UStaffInfo;
use   addons\master\product\models\GCurrencySku;

/**
 * This is the model class for table "qa_product_fqa".
 *
 * @property integer $PRODUCT_FQA_ID
 * @property integer $CREATED
 * @property string $CUSER_CODE
 * @property integer $UPDATED
 * @property string $UUSER_CODE
 * @property integer $ISACTIVE
 * @property string $CLASSIFICATION
 * @property integer $PRODUCTC_ID
 * @property string $CSKU_CODE
 * @property string $PRODUCT_DE
 * @property string $TITILES
 * @property string $FAQ_CN
 * @property string $FAQ_EN
 */
class QaProductFqa extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'qa_product_fqa';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['CREATED', 'UPDATED', 'ISACTIVE', 'PRODUCTC_ID', 'CSKU_ID', 'CUSER_ID', 'UUSER_ID'], 'integer'],
            [['FAQ_CN', 'FAQ_EN'], 'string'],
            [['CUSER_CODE', 'UUSER_CODE'], 'string', 'max' => 30],
            [['CLASSIFICATION'], 'string', 'max' => 50],
            [['CSKU_CODE'], 'string', 'max' => 20],
            [['PRODUCT_DE', 'TITILES'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'PRODUCT_FQA_ID' => '问答ID',
            'CREATED' => '创建时间',
            'CUSER_CODE' => '创建人',
            'UPDATED' => '更新时间',
            'UUSER_CODE' => '更新人',
            'ISACTIVE' => '问题状态',
            'CLASSIFICATION' => '问题标签',
            'PRODUCTC_ID' => '分类ID',
            'CSKU_CODE' => '通用SKU编码',
            'PRODUCT_DE' => '产品说明',
            'TITILES' => 'FAQ标题',
            'FAQ_CN' => 'FAQ(中文)',
            'FAQ_EN' => 'FAQ(其他语言)',
            'CSKU_ID' => '通用SKUID',
            'CUSER_ID' => '创建人ID',
            'UUSER_ID' => '更新人ID',
        ];
    }

    public function after_AUpdate($body, $model = null)
    {
        if ($this->ISACTIVE == 1) {
            $title = "运营平台系统提示";
            $useranswer = UUserInfo::find()->select(["STAFF_CODE"])->where(["USER_INFO_CODE" => $this->CUSER_CODE])->one();   //获得员工编码   //创建人编码
            if ($this->CUSER_CODE != $this->UUSER_CODE) {   //更新人不等于创建人
                if ($useranswer->STAFF_CODE != null && $useranswer->STAFF_CODE != "") {
                    //查询员工的信息
                    $staffInfo = UStaffInfo::find()->select(["STAFF_EMAIL"])->where(["STAFF_CODE" => $useranswer->STAFF_CODE])->one();
                    if ($staffInfo->STAFF_EMAIL != null && $staffInfo != "") {
                        $csku = GCurrencySku::find()->select(["CSKU_CODE", "CSKU_NAME_CN"])->where(["CSKU_CODE" => $this->CSKU_CODE])->one();
                        if ($csku != "" && $csku->CSKU_NAME_CN != "" && $csku->CSKU_NAME_CN != null) {
                            $title = $title . "您提交的关于" . $csku->CSKU_CODE . ":" . $csku->CSKU_NAME_CN . "的问题,已经被解答";
                        } else {
                            $title = $title . "您提交的问题，已经被解答";
                        }
                        $mail = Yii::$app->mailer->compose();
                        $mail->setTo("challenge@1byone.com");
                        $mail->setSubject($title);   //主题
                        $mail->setHtmlBody("<br><strong  siz='5'>问题:</strong>" . $this->TITILES . "<br/><strong size='5'>答案:</strong>" . $this->FAQ_CN . "<br/><br/>系统登录地址:<a href='http://1byone.lr10000.com/1byone' >http://1byone.lr10000.com/1byone</a>");    //发布可以带html标签的文本
                        $mail->send();
                    }
                }
            }
        }
        return [$this::ACTION_NEXT, $body, $model];
    }

    public function afterSaves($insert, $changedAttributes)
    {
        if ($insert) {
            $title = "运营平台系统提示";
            $this->CUSER_CODE;
            $user = UUserInfo::find()->select(["STAFF_CODE"])->where(["USER_INFO_CODE" => $this->CUSER_CODE])->one();
            //查询员工信息表
            $staffInfos = UStaffInfo::find()->select(["STAFF_NAME_EN"])->where(["STAFF_CODE" => $user->STAFF_CODE])->one();
            $csku = GCurrencySku::find()->select(["CSKU_CODE", "CSKU_NAME_CN"])->where(["CSKU_CODE" => $this->CSKU_CODE])->one();
            if ($csku != null && $csku != "") {
                $title = $title . "用户" . $staffInfos->STAFF_NAME_EN . "提交了关于" . $csku->CSKU_CODE . ":" . $csku->CSKU_NAME_CN . "的问题，请及时回答!";
            } else {
                $title = $title . "用户" . $staffInfos->STAFF_NAME_EN . "提交了一个问题，请及时回答！";
            }
            $address = array('challenge@1byone.com', '1443865345@qq.com');
            $mail = Yii::$app->mailer->compose();
            if ($address != null) {
                $mail->setCc($address);
            }
            $mail->setSubject($title);   //主题
            $mail->setHtmlBody("<br>" . $this->TITILES . "<br/><br/>系统登录地址:<a href='http://1byone.lr10000.com/1byone' >http://1byone.lr10000.com/1byone</a>");    //发布可以带html标签的文本
            $mail->send();
        }
    }
}
