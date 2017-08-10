<?php
/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/13 0013
 * Time: 17:59
 */
namespace addons\users\controllers;

use Yii;

class PersonalrController extends \yii\swoole\rest\ActiveController
{

    public $modelClass = 'addons\users\models\UPersonalRole';

    /**
     * @SWG\Post(path="/getuserpermission",
     *     tags={"users"},
     *     summary="查询用户权限",
     *     description="返回用户权限信息",
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
    public function actionGetuserpermission(){
        $post = Yii::$app->getRequest()->getBodyParams();

        //判断传参用户编码或者名称
        if(!isset($post['USER_INFO_CODE']) && !isset($post['USERNAME'])){
            return  array();
        }

            $condition['USER_INFO_CODE'] = isset($post['USER_INFO_CODE'])?$post['USER_INFO_CODE']:"";
            $condition['page'] = isset($post["page"]) ? $post["page"] : 1;
            $condition['limit'] = isset($post["limit"]) ? $post["limit"] : 20;
            $condition['USERNAME'] = isset($post['USERNAME'])?$post['USERNAME']:"";
            $condition['STATE'] = isset($post['STATE'])?$post['STATE']:"";
            $condition['isAdmin'] = isset($post['isAdmin'])?$post['isAdmin']:"";
            $condition['needRolePer'] = isset($post['needRolePer'])?$post['needRolePer']:"";

        return Yii::$app->rpc->create('users')->sendAndrecv([['\addons\users\modellogic\userPermissionLogic','getUserPermission'],[$condition]]);
    }


}