<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/6/21 0021
 * Time: 14:46
 */

namespace addons\master\product\modellogic;

use Yii;
use addons\master\product\models\GProductType;
use yii\swoole\db\Query;

class productLogic
{
    /**
     * 查询所有小分类
     * $item 指定字段值,逗号隔开
     * ['PRODUCT_TYPE_ID','SYSTEM_NAME_CN']
     * */
    public static function getsmalltype($item = [])
    {
        if (count($item) <= 0) {
            $item = '*';
        }
        return GProductType::find()->select($item)->where(['<>', 'PRODUCTOT_TYPE_ID', '0'])->asArray()->all();
    }

    /**
     * getallsmalltype
     * 查询所有小分类
     * $post
     * */
    public static function getallsmalltype($post)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        $test = (new Query())->from('g_product_type')->where($post['where']);
        if ($str) {
            $test->andWhere(['.PRODUCT_TYPE_ID' => Yii::$app->session->get('categoryd') ?: null]);
        }
        return $test->all();
    }
}