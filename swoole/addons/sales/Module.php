<?php

namespace addons\sales;

use Yii;

/**
 * @SWG\Tag(
 *   name="sales",
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
