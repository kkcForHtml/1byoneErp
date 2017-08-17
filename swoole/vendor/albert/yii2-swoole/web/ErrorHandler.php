<?php

namespace yii\swoole\web;

use Yii;
use yii\base\UserException;
use yii\swoole\Application;
use yii\swoole\helpers\CoroHelper;
use yii\web\HttpException;

/**
 * @property swoole_http_response swooleResponse
 */
class ErrorHandler extends \yii\web\ErrorHandler
{

    /**
     * @inheritdoc
     */
    protected function renderException($exception)
    {
        if (Yii::$app->has('response')) {
            $response = Yii::$app->getResponse();
            // reset parameters of response to avoid interference with partially created response data
            // in case the error occurred while sending the response.
            $response->isSent = false;
            $response->stream = null;
            $response->data = null;
            $response->content = null;

        } else {
            if (!Application::$workerApp) {
                $response = new \yii\web\Response();
            } else {
                $response = new Response();
            }

        }

        $useErrorView = $response->format === Response::FORMAT_HTML && (!YII_DEBUG || $exception instanceof UserException);
        if (isset(Yii::$app->params['ErrorFormat'])) {
            $response->format = Yii::$app->params['ErrorFormat'];
        }
        if ($useErrorView && $this->errorAction !== null) {
            $result = Yii::$app->runAction($this->errorAction);
            if ($result instanceof Response) {
                $response = $result;
            } else {
                $response->data = $result;
            }
        } elseif ($response->format === Response::FORMAT_HTML) {
            if (YII_ENV_TEST || isset($_SERVER['HTTP_X_REQUESTED_WITH']) && $_SERVER['HTTP_X_REQUESTED_WITH'] === 'XMLHttpRequest') {
                // AJAX request
                $response->data = '<pre>' . $this->htmlEncode(static::convertExceptionToString($exception)) . '</pre>';
            } else {
                // if there is an error during error rendering it's useful to
                // display PHP error in debug mode instead of a blank screen
                if (YII_DEBUG) {
                    ini_set('display_errors', 1);
                }
                $file = $useErrorView ? $this->errorView : $this->exceptionView;
                $response->data = $this->renderFile($file, [
                    'exception' => $exception,
                ]);
            }
        } elseif ($response->format === Response::FORMAT_RAW) {
            $response->data = static::convertExceptionToString($exception);
        } else {
            $response->data = $this->convertExceptionToArray($exception);
        }

        if ($exception instanceof HttpException) {
            $response->setStatusCode($exception->statusCode);
        } else {
            $response->setStatusCode(500);
        }

        $response->send();

        $this->exception = null;
    }

    /**
     * @inheritdoc
     */
    public function handleException($exception)
    {
        if (!Application::$workerApp) {
            parent::handleException($exception);
            return;
        }

        $this->exception = $exception;
        $id = CoroHelper::getId();
        if (isset(Yii::$app->getSwooleServer()->currentSwooleResponse[$id])) {
            Yii::$app->getSwooleServer()->currentSwooleResponse[$id]->status(500);
            try {
                $this->logException($exception);
                if ($this->discardExistingOutput) {
                    $this->clearOutput();
                }
                $this->renderException($exception);
            } catch (\Exception $e) {
                // an other exception could be thrown while displaying the exception
                $msg = "An Error occurred while handling another error:\n";
                $msg .= (string)$e;
                $msg .= "\nPrevious exception:\n";
                $msg .= (string)$exception;
                if (YII_DEBUG) {
                    $html = '<pre>' . htmlspecialchars($msg, ENT_QUOTES, Yii::$app->charset) . '</pre>';
                } else {
                    $html = 'An internal server error occurred.';
                }

                Yii::$app->getSwooleServer()->currentSwooleResponse[$id]->header('Content-Type', 'text/html; charset=utf-8');
                Yii::$app->getSwooleServer()->currentSwooleResponse[$id]->end($html);
            }
        } else {
            print_r($this->convertExceptionToArray($exception));
        }

        $this->exception = null;
    }

}
