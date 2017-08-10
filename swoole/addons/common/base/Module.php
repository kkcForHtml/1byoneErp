<?php

namespace addons\common\base;

use Yii;

/**
 * @SWG\Tag(
 *   name="base",
 *   description="通用的表操作",
 *   @SWG\ExternalDocumentation(
 *     description="Find out more about our store",
 *     url="http://swagger.io"
 *   )
 * )
 */

class Module extends \yii\swoole\Module {

    public function init() {
        parent::init();
    }

}
