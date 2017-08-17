<?php

namespace yii\swoole\debug\filedebug;

use Yii;
use yii\swoole\Application;
use yii\swoole\Refreshable;
use yii\swoole\web\View;

/**
 * Class Module
 *
 * @package yii\swoole\debug\filedebug
 */
class Module extends \yii\debug\Module implements Refreshable
{
    public $controllerNamespace = 'yii\swoole\debug\filedebug\controllers';

    public $controllerMap = ['default' => 'yii\swoole\debug\filedebug\controllers\DefaultController'];

    /**
     * @var LogTarget
     */
    public static $logTargetInstance = null;

    /**
     * @inheritdoc
     */
    public function init()
    {
        //echo __METHOD__ . " init.\n";
        parent::init();
        $this->setViewPath('@yii/debug/views');
    }

    /**
     * 继承原有逻辑, 增加一个异步写日志的LogTarget
     *
     * @inheritdoc
     */
    public function bootstrap($app)
    {
        if (!self::$logTargetInstance) {
            self::$logTargetInstance = new LogTarget($this);
            self::$logTargetInstance->module = null; // 不要引用$this
        }
        $logTarget = clone self::$logTargetInstance;
        $logTarget->module = $this;
        $logTarget->tag = uniqid(); // 在高并发情况下可能会重复
        $this->logTarget = Yii::$app->getLog()->targets['debug'] = $logTarget;

        $app->on(Application::EVENT_BEFORE_REQUEST, function () use ($app) {
            $app->getView()->on(View::EVENT_END_BODY, [$this, 'renderToolbar']);
        });

        //var_dump(count($app->getUrlManager()->rules));
        // TODO urlManager组件优化
        $app->getUrlManager()->addRules([
            [
                'class' => 'yii\web\UrlRule',
                'route' => $this->id,
                'pattern' => $this->id,
            ],
            [
                'class' => 'yii\web\UrlRule',
                'route' => $this->id . '/<controller>/<action>',
                'pattern' => $this->id . '/<controller:[\w\-]+>/<action:[\w\-]+>',
            ]
        ], false);
    }

    /**
     * @inheritdoc
     */
    public function refresh($app = null)
    {
        $this->bootstrap(Yii::$app);
    }

    protected function corePanels()
    {
        $panels = parent::corePanels();
        unset($panels['user']);
        return $panels;
    }
}
