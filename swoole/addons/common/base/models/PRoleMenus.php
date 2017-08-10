<?php

namespace addons\common\base\models;

use Yii;
use \yii\swoole\db\ActiveRecord;
/**
 * This is the model class for table "p_role_menus".
 *
 * @property integer $MENUS_ID
 * @property string $MENUS_NAME_CN
 * @property string $MENUS_NAME_EN
 * @property integer $MENUS_FID
 * @property string $MENUS_URL
 * @property string $TEMPLATEURL
 * @property string $CONTROLLERURL
 * @property integer $MENUS_INDEX
 * @property string $MENUS_ICON
 */
class PRoleMenus extends ActiveRecord
{
    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'p_role_menus';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['MENUS_FID', 'MENUS_INDEX'], 'integer'],
            [['MENUS_NAME_CN', 'MENUS_NAME_EN'], 'string', 'max' => 100],
            [['MENUS_URL', 'TEMPLATEURL', 'CONTROLLERURL'], 'string', 'max' => 255],
            [['MENUS_ICON'], 'string', 'max' => 64],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'MENUS_ID' => Yii::t('base', '菜单ID'),
            'MENUS_NAME_CN' => Yii::t('base', '菜单名(中文)'),
            'MENUS_NAME_EN' => Yii::t('base', '菜单名(英文)'),
            'MENUS_FID' => Yii::t('base', '菜单父id'),
            'MENUS_URL' => Yii::t('base', '菜单url'),
            'TEMPLATEURL' => Yii::t('base', '菜单tem'),
            'CONTROLLERURL' => Yii::t('base', '菜单con'),
            'MENUS_INDEX' => Yii::t('base', '排序'),
            'MENUS_ICON' => Yii::t('base', '图标'),
        ];
    }
}
