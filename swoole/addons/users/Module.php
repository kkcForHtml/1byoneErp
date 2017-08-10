<?php

namespace addons\users;

use Yii;

/**
 * @SWG\Tag(
 *   name="users",
 *   description="用户中心相关操作",
 *   @SWG\ExternalDocumentation(
 *     description="Find out more about our store",
 *     url="http://swagger.io"
 *   )
 * )
 */
class Module extends \yii\swoole\Module
{

    public function init()
    {
        parent::init();
    }

}
