<?php

namespace addons\common\base\models;

use Yii;
use addons\common\file\models\FileModel;
/**
 * @SWG\Definition(
 *   definition="base",
 *   type="object",
 *   allOf={
 *       @SWG\Schema(
 *           required={"tag"},
 *           @SWG\Property(property="FILES_MIDDLE_ID", type="integer",description="ID"),
 *           @SWG\Property(property="file_id", type="string",description="附件ID"),
 *           @SWG\Property(property="PRODUCT_ID", type="string",description="主表外键ID"),
 *           @SWG\Property(property="FILE_TYPE_ID", type="string",description="附件类型")
 *       )
 *   }
 * )
 */
class PFilesMiddle extends \yii\swoole\db\ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'p_files_middle';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['file_id', 'FILE_TYPE_ID','PRODUCT_ID'], 'integer'],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'FILES_MIDDLE_ID' => Yii::t('base', 'id'),
            'file_id' => Yii::t('base', '附件ID'),
            'PRODUCT_ID' => Yii::t('base', '主表外键ID'),
            'FILE_TYPE_ID' => Yii::t('base', '附件类型 1.培训资料，2.图片信息，3.包材信息，4.品检信息'),
        ];
    }

    public function behaviors() {
        return [
            [
                'class' => 'addons\common\file\behavior\UploadBehavior',
                'attribute' => 'file', // required, use to receive input file
                'savedAttribute' => 'file_id', // optional, use to link model with saved file.
                'uploadPath' => '@upload/budget', // saved directory. default to '@runtime/upload'
                'autoSave' => true,
                'autoDelete' => true,
            ],
        ];
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getPhotos() {
        return $this->hasOne(FileModel::className(), ['id' => 'file_id']);
    }
}
