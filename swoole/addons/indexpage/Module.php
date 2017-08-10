<?php

namespace addons\indexpage;

use Yii;

/**
 * @SWG\Tag(
 *   name="indexpage",
 *   description="首页",
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
