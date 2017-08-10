<?php
/**
 * Created by PhpStorm.
 * controller: 组织隶属关系中间表控制器
 * Date: 2017/4/13 0013
 * Time: 17:59
 */
namespace addons\organization\controllers;

use Yii;

class OrganisationrmController extends \yii\swoole\rest\ActiveController
{
    public $modelClass = 'addons\organization\models\OOrganisationRelationMiddle';
}
