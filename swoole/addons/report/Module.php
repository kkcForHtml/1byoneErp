<?php

namespace addons\report;

use Yii;

/**
 * @SWG\Tag(
 *   name="sales",
 *   description="报表查询相关操作",
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
