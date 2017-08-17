<?php

namespace yii\swoole\sqlcache\models;

use Yii;

/**
 * This is the model class for table "sqlcache".
 *
 * @property string $name
 * @property integer $value
 */
class Sqlcache extends \yii\swoole\db\ActiveRecord {

    /**
     * @inheritdoc
     */
    public static function tableName() {
        return 'sqlcache';
    }

    /**
     * @inheritdoc
     */
    public function rules() {
        return [
            [['name', 'value'], 'required'],
            [['value', 'is_dep'], 'integer'],
            [['name'], 'string', 'max' => 255],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels() {
        return [
            'name' => 'Name',
            'value' => 'Value',
            'is_dep' => 'IsDep'
        ];
    }

    public function before_AUpdate($body) {
//        $this->deleteAll();
        return [$this::ACTION_NEXT, $body];
    }

    public function after_AUpdate($body, $model = null) {
        yii::$app->cache->delete(yii::$app->params['SqlCache']);
        return [$this::ACTION_NEXT, $body, $model];
    }

}
