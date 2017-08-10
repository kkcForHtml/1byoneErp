<?php

namespace addons\inventory;

use Yii;

/**
 * @SWG\Tag(
 *   name="inventory",
 *   description="库存中心相关操作",
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
