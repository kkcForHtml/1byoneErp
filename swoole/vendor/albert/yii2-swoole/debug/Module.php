<?php
namespace yii\swoole\debug;

use Yii;
use yii\base\Application;
use yii\swoole\debug\filedebug\LogTarget;
use yii\web\Response;
use yii\web\View;

class Module extends \yii\swoole\debug\filedebug\Module
{

    public $controllerNamespace = 'yii\swoole\debug\filedebug\controllers';

    /**
     * @inheritdoc
     */
    public function bootstrap($app)
    {
        $this->logTarget = Yii::$app->getLog()->targets['debug'] = new LogTarget($this);

        // delay attaching event handler to the view component after it is fully configured
        $app->on(Application::EVENT_BEFORE_REQUEST, function () use ($app) {
            $app->getView()->on(View::EVENT_END_BODY, [$this, 'renderToolbar']);
            $app->getResponse()->on(Response::EVENT_AFTER_PREPARE, [$this, 'setDebugHeaders']);
        });

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

    protected function corePanels()
    {
        $panels = parent::corePanels();

        $components = Yii::$app->getComponents();
        if (isset($components['user']['identityClass'])) {
            $panels['user'] = ['class' => 'yii\debug\panels\UserPanel'];
        }

        return $panels;
    }
}