<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/5/24 0024
 * Time: 15:02
 */
namespace addons\inventory\modellogic;

use Yii;
use addons\inventory\models\SkFiallocation;
use addons\inventory\models\SkFiallocationDetail;

use yii\swoole\helpers\ArrayHelper;
use yii\swoole\rest\CreateExt;
use yii\swoole\rest\DeleteExt;
use yii\swoole\rest\ResponeModel;
use yii\swoole\rest\UpdateExt;
use yii\web\ServerErrorHttpException;

class fiallocationLogic
{

    /**
     * getFiallocation
     * 调整单主表查询
     * @param $select array
     * @param $where array
     * @return array
     *
     */
    public static function getFiallocation($select = null, $where)
    {
        if (count($select) == 0) {
            return SkFiallocation::find()->where($where)->asArray()->all();
        } else {
            return SkFiallocation::find()->select($select)->where($where)->asArray()->all();
        }
    }

    /**
     * getFiallocationDetail
     * 调整单子表查询
     * @param $select array
     * @param $where array
     * @return array
     *
     */
    public static function getFiallocationDetail($select = null, $where)
    {
        if (count($select) == 0) {
            return SkFiallocationDetail::find()->where($where)->asArray()->all();
        } else {
            return SkFiallocationDetail::find()->select($select)->where($where)->asArray()->all();
        }
    }

    /**
     * addFiallocation
     * 新增调整单
     * @param $data
     *
     * */
    public static function addFiallocation($data)
    {

        foreach ($data as $dispatchModel) {
            $post = Yii::$app->getRequest()->getBodyParams();
            Yii::$app->getRequest()->setBodyParams($dispatchModel);
            $result = CreateExt::actionDo(new SkFiallocation(), $dispatchModel);
            Yii::$app->getRequest()->setBodyParams($post);
            if ($result instanceof ResponeModel) {
                return $result;
            }
        }
    }

    /**
     * addFiallocation
     * 新增调拨单 返回
     * @param $data
     *
     * */
    public static function addFiallocationReturn($data)
    {
        foreach ($data as $dispatchModel) {
            $post = Yii::$app->getRequest()->getBodyParams();
            Yii::$app->getRequest()->setBodyParams($dispatchModel);
            $result = CreateExt::actionDo(new SkFiallocation(), $dispatchModel);
            Yii::$app->getRequest()->setBodyParams($post);
        }
        return $result;
    }

    /**
     * Fiallocation
     * 审核调整单
     * @param $data
     * @return bool
     * */
    public static function Fiallocation($data)
    {
        $dispatchModel = array("batchMTC" => $data);
        $post = Yii::$app->getRequest()->getBodyParams();
        Yii::$app->getRequest()->setBodyParams($dispatchModel);
        $result = UpdateExt::actionDo(new SkFiallocation(), $dispatchModel);
        Yii::$app->getRequest()->setBodyParams($post);
        if ($result instanceof ResponeModel) {
            return $result;
        }
    }

    /**
     * DelFiallocation
     * 调整单删除接口
     * @param $data
     * @return bool
     * */
    public static function DelFiallocation($data)
    {
        $dispatchModel = array("batch" => $data);
        $post = Yii::$app->getRequest()->getBodyParams();
        Yii::$app->getRequest()->setBodyParams($dispatchModel);
        $result = DeleteExt::actionDo(new SkFiallocation(), $dispatchModel);
        Yii::$app->getRequest()->setBodyParams($post);
        if ($result instanceof ResponeModel) {
            return $result;
        }
    }

    /**
     * 物理删除调拨单 和 调拨单详情
     */
    public static function delFiallcationReal($where)
    {
        $res = SkFiallocation::updateAll(array('DELETED_STATE'=>1),$where);

        $skdetial_ids =SkFiallocationDetail::find()->where($where)->select('FIALLOCATION_DETAIL_ID')->asArray()->all();

        $detail_res = SkFiallocationDetail::deleteAll(array('FIALLOCATION_DETAIL_ID'=>$skdetial_ids));

        return $res && $detail_res;
    }
}