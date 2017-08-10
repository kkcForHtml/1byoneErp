<?php

namespace addons\shipment;

use Yii;

/**
 * @SWG\Tag(
 *   name="shipment",
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
