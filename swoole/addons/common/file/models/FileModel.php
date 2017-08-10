<?php

namespace addons\common\file\models;

use Yii;
use yii\swoole\Application;
use yii\web\UploadedFile;
use yii\helpers\FileHelper;

/**
 * This is the model class for table "uploaded_file".
 *
 * @property integer $id
 * @property string $name
 * @property string $filename
 * @property integer $size
 * @property string $type
 */
class FileModel extends \yii\swoole\db\ActiveRecord
{

    /**
     * @var UploadedFile
     */
    public $file;

    /**
     * @var string Upload path
     */
    public $uploadPath = '@upload/common';

    /**
     * @var integer the level of sub-directories to store uploaded files. Defaults to 1.
     * If the system has huge number of uploaded files (e.g. one million), you may use a bigger value
     * (usually no bigger than 3). Using sub-directories is mainly to ensure the file system
     * is not over burdened with a single directory having too many files.
     */
    public $directoryLevel = 1;

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return '{{%uploaded_file}}';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['file'], 'required'],
            [['file'], 'file', 'skipOnEmpty' => false],
            [['uploadPath'], 'required', 'when' => function ($obj) {
                return empty($obj->filename);
            }],
            [['name', 'size'], 'default', 'value' => function ($obj, $attribute) {
                return $obj->file->$attribute;
            }],
            [['type'], 'default', 'value' => function () {
                return FileHelper::getMimeType($this->file->tempName);
            }],
            [['filename'], 'default', 'value' => function () {
                $key = md5(microtime() . $this->file->name);
                $base = Yii::getAlias($this->uploadPath);
                $ext = $this->file->getExtension();
                if ($this->directoryLevel > 0) {
                    for ($i = 0; $i < $this->directoryLevel; ++$i) {
                        if (($prefix = substr($key, $i + $i, 2)) !== false) {
                            $base .= DIRECTORY_SEPARATOR . $prefix;
                        }
                    }
                }
                return $base . DIRECTORY_SEPARATOR . "{$key}.{$ext}";
            }],
            [['url'], 'default', 'value' => function () {
                $base = Yii::getAlias($this->uploadPath);
                return str_replace($base, '', $this->filename);
            }],
            [['size'], 'integer'],
            [['name'], 'string', 'max' => 256],
            [['type'], 'string', 'max' => 128],
            [['filename', 'url'], 'string', 'max' => 256]
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'name' => 'Basename',
            'filename' => 'Filename',
            'size' => 'Filesize',
            'type' => 'Content Type',
        ];
    }

    /**
     * @inherited
     */
    public function beforeSave($insert)
    {
        if ($this->file && $this->file instanceof UploadedFile && parent::beforeSave($insert)) {
            FileHelper::createDirectory(dirname($this->filename));
            return $this->file->saveAs($this->filename);
        }
        return false;
    }

    /**
     * @inherited
     */
    public function beforeDelete()
    {
        if (parent::beforeDelete()) {
            if (file_exists($this->filename)) {
                return unlink($this->filename);
            } else {
                return true;
            }
        }
        return false;
    }

    /**
     * Save file
     * @param UploadedFile $file
     * @param string $path
     * @return boolean|static
     */
    public static function saveAs($file, $path = '@runtime/upload', $directoryLevel = 1)
    {
        $model = new static([
            'file' => $file,
            'uploadPath' => $path,
            'directoryLevel' => $directoryLevel,
        ]);
        return $model->save() ? $model : false;
    }

    public function getContent()
    {
        if (Application::$workerApp) {
            return Yii::$app->response->content;
        }
        return file_get_contents($this->filename);
    }

}
