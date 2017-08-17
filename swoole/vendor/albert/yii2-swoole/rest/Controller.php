<?php

/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace yii\swoole\rest;

use Yii;
use yii\filters\ContentNegotiator;
use yii\filters\Cors;
use yii\filters\VerbFilter;
use yii\swoole\controllers\CreateActionTrait;
use yii\web\Response;

/**
 * Controller is the base class for RESTful API controller classes.
 *
 * Controller implements the following steps in a RESTful API request handling cycle:
 *
 * 1. Resolving response format (see [[ContentNegotiator]]);
 * 2. Validating request method (see [[verbs()]]).
 * 3. Authenticating user (see [[\yii\filters\auth\AuthInterface]]);
 * 4. Rate limiting (see [[RateLimiter]]);
 * 5. Formatting response data (see [[serializeData()]]).
 *
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class Controller extends \yii\web\Controller
{

    use CreateActionTrait;

    /**
     * @var string|array the configuration for creating the serializer that formats the response data.
     */
    public $serializer = 'yii\swoole\rest\Serializer';

    /**
     * @inheritdoc
     */
    public $enableCsrfValidation = false;

    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        return [
            'contentNegotiator' => [
                'class' => ContentNegotiator::className(),
                'formats' => [
                    'application/json' => Response::FORMAT_JSON,
                    'application/xml' => Response::FORMAT_XML,
                ],
            ],
            'verbFilter' => [
                'class' => VerbFilter::className(),
                'actions' => $this->verbs(),
            ],
            [
                'class' => Cors::className()
            ],
//            'access' => [
//                'class' => AccessControl::className(),
//                'only' => ['login', 'logout', 'signup'],
//                'rules' => [
//                    [
//                        'allow' => true,
//                        'actions' => ['login', 'signup'],
//                        'roles' => ['?'],
//                    ],
//                    [
//                        'allow' => true,
//                        'actions' => ['logout'],
//                        'roles' => ['@'],
//                    ],
//                ],
//            ],
//            'authenticator' => [
//                'class' => CompositeAuth::className(),
//            ],
//            'rateLimiter' => [
//                'class' => RateLimiter::className(),
//            ],
        ];
    }

    /**
     * @inheritdoc
     */
    public function actions()
    {
        if (Yii::$app->params['enable_apidoc']) {
            $path = Yii::$app->BaseHelper->getPath($this->module);
            $api = [
                'api' => [
                    'class' => 'yii\swoole\swagger\SwaggerApiAction',
                    'scanDir' => [
                        Yii::getAlias('@vendor/albert/yii2-swoole/swagger/public'),
                        Yii::getAlias('@addons' . $path)
                    ]
                ]
            ];
            if ($this->module->use_default_doc) {
                $api['api']['scanDir'][] = Yii::getAlias('@vendor/albert/yii2-swoole/swagger/defaultapi');
            }
            return $api;
        }
        return [];
    }

    public function beforeAction($action)
    {
        $result = parent::beforeAction($action);
        return $result;
    }

    /**
     * @inheritdoc
     */
    public function afterAction($action, $result)
    {
        $result = parent::afterAction($action, $result);
        if ($action->id === 'api') {
            return $result;
        }
        return $this->serializeData($result);
    }

    /**
     * Declares the allowed HTTP verbs.
     * Please refer to [[VerbFilter::actions]] on how to declare the allowed verbs.
     * @return array the allowed HTTP verbs.
     */
    protected function verbs()
    {
        return [];
    }

    /**
     * Serializes the specified data.
     * The default implementation will create a serializer based on the configuration given by [[serializer]].
     * It then uses the serializer to serialize the given data.
     * @param mixed $data the data to be serialized
     * @return mixed the serialized data.
     */
    protected function serializeData($data)
    {
        return Yii::createObject($this->serializer)->serialize($data);
    }
}
