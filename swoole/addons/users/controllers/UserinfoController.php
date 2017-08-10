<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/13 0013
 * Time: 17:59
 */

namespace addons\users\controllers;

use Yii;
use addons\users\models\UUserInfo;
use \yii\swoole\rest\ActiveController;
use yii\base\UserException;

class UserinfoController extends ActiveController
{

    public $modelClass = 'addons\users\models\UUserInfo';

    /**
     * @SWG\Post(path="/login",
     *     tags={""},
     *     summary="登陆操作",
     *     description="返回登陆结果",
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
    public function actionLogin()
    {
        $post = Yii::$app->getRequest()->post();

        $model = new \addons\users\models\Login();

        if ($model->load([$model->formName() => $post]) && $model->login()) {
            Yii::$app->rpc->create('users')->sendAndrecv([['\addons\users\modellogic\usersLogic', 'getUserCheck'], []]);
            return $model->getUser();
        } else {
            $errors = $model->firstErrors;
            throw new UserException(reset($errors));
        }
    }


    /**
     * 验证原密码是否正确
     * author Fox
     */
    public function actionCheckpwd()
    {
        $post = Yii::$app->getRequest()->post();
        return Yii::$app->rpc->create('tools')->sendAndrecv([['\addons\users\modellogic\usersLogic', 'check_pwd'], [$post]]);
    }

    /**
     * Logout
     * @return string
     */
    public function actionLogout()
    {
        Yii::$app->getUser()->logout();
    }


    /**
     * Finds the User model based on its primary key value.
     * If the model is not found, a 404 HTTP exception will be thrown.
     * @param integer $id
     * @return User the loaded model
     * @throws NotFoundHttpException if the model cannot be found
     */
    protected function findModel($id)
    {
        if (($model = UUserInfo::findOne($id)) !== null) {
            return $model;
        } else {
            return null;
        }
    }

}