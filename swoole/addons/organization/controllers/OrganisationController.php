<?php
/**
 * Created by PhpStorm.
 * controller: 组织架构详细表控制器
 * Date: 2017/4/13 0013
 * Time: 17:59
 */
namespace addons\organization\controllers;

use Yii;
use \yii\swoole\rest\ActiveController;
use yii\swoole\rest\ResponeModel;

class OrganisationController extends ActiveController
{

    public $modelClass = 'addons\organization\models\OOrganisation';

    /**
     * @SWG\Post(path="/get_organisationrm",
     *     tags={"organization"},
     *     summary="组织隶属关系-组织查询",
     *     description="返回json结果",
     *     produces={"application/json"},
     *
     * @SWG\Response(
     *         response = 200,
     *         description = " success"
     *     )
     * )
     *
     */
    public function actionGet_organisationrm()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        return Yii::$app->rpc->create('organization')->sendAndrecv([['\addons\organization\modellogic\organizLogic', 'GetORGANISATIONRM'], [$post]]);
    }

    /**
     * @SWG\Post(path="/organisationendinit",
     *     tags={"inventory"},
     *     summary="结束初始化",
     *     description="返回导出结果",
     *       produces = {"application/json"},
     *       consumes = {"application/json"},
     *     @SWG\Parameter(
     *        in = "body",
     *        name = "body",
     *        description = "json字符串结构",
     *        required = false,
     *        type = "string",
     *        schema = "{}"
     *     ),
     *
     *     @SWG\Response(
     *         response = 200,
     *         description = "success"
     *     )
     * )
     *
     */
    public function actionOrganisationendinit()
    {
        $post = Yii::$app->getRequest()->getBodyParams();
        $model = new $this->modelClass;
        $transaction = $model->getDb()->beginTransaction();
        try {
            $result = Yii::$app->rpc->create('organization')->sendAndrecv([['\addons\organization\modellogic\organizLogic', 'organistionEndInit'], [$post]]);
            if ($result instanceof ResponeModel) {
                $transaction->rollBack();
                return $result;
            }
            if ($transaction->getIsActive()) {
                $transaction->commit();
            }
            return $result;
        } catch (\Exception $ex) {
            $transaction->rollBack();
            throw $ex;
        }
    }
}
