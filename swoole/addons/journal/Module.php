<?php

namespace addons\journal;

use Yii;

/**
 * @SWG\Tag(
 *   name="journal",
 *   description="日志相关操作",
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
