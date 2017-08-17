<?php
/**
 * @link http://www.yiiframework.com/
 * @copyright Copyright (c) 2008 Yii Software LLC
 * @license http://www.yiiframework.com/license/
 */

namespace yii\swoole\debug\filedebug\controllers;

use Yii;
use yii\debug\models\search\Debug;
use yii\swoole\Application;
use yii\swoole\helpers\CoroHelper;
use yii\swoole\helpers\SerializeHelper;
use yii\web\NotFoundHttpException;

/**
 * Debugger controller
 *
 * @author Qiang Xue <qiang.xue@gmail.com>
 * @since 2.0
 */
class DefaultController extends \yii\debug\controllers\DefaultController
{

    private $_manifest;

    public function actionIndex()
    {
        if (!Application::$workerApp) {
            return parent::actionIndex();
        }
        $searchModel = new Debug();
        $dataProvider = $searchModel->search($_GET[CoroHelper::getId()], $this->getManifest());

        // load latest request
        $tags = array_keys($this->getManifest());
        $tag = reset($tags);
        $this->loadData($tag);

        return $this->render('index', [
            'panels' => $this->module->panels,
            'dataProvider' => $dataProvider,
            'searchModel' => $searchModel,
            'manifest' => $this->getManifest(),
        ]);
    }

    protected function getManifest($forceReload = false)
    {
        if (!Application::$workerApp) {
            if ($this->_manifest === null || $forceReload) {
                if ($forceReload) {
                    clearstatcache();
                }
                $indexFile = $this->module->dataPath . '/index.data';

                $content = '';
                $fp = @fopen($indexFile, 'r');
                if ($fp !== false) {
                    @flock($fp, LOCK_SH);
                    $content = fread($fp, filesize($indexFile));
                    @flock($fp, LOCK_UN);
                    fclose($fp);
                }

                if ($content !== '') {
                    $this->_manifest = array_reverse(SerializeHelper::unserialize($content), true);
                } else {
                    $this->_manifest = [];
                }
            }

            return $this->_manifest;
        }
        if ($this->_manifest === null || $forceReload) {
            if ($forceReload) {
                clearstatcache();
            }
            $indexFile = $this->module->dataPath . '/index.data';
            if (\Swoole\Async::readFile($indexFile, function ($filename, $content) {
                    if ($content !== '') {
                        $this->_manifest = array_reverse(SerializeHelper::unserialize($content), true);
                    } else {
                        $this->_manifest = [];
                    }
                }) === false
            ) {
                throw new InvalidConfigException("Unable to open debug data index file: $indexFile");
            }
        }
        while (!is_array($this->_manifest)) {
            \Swoole\Coroutine::sleep(0.001);
        }
        return $this->_manifest;
    }

    private $data;

    public function loadData($tag, $maxRetry = 0)
    {
        // retry loading debug data because the debug data is logged in shutdown function
        // which may be delayed in some environment if xdebug is enabled.
        // See: https://github.com/yiisoft/yii2/issues/1504
        if (!Application::$workerApp) {
            for ($retry = 0; $retry <= $maxRetry; ++$retry) {
                $manifest = $this->getManifest($retry > 0);
                if (isset($manifest[$tag])) {
                    $dataFile = $this->module->dataPath . "/$tag.data";
                    $data = SerializeHelper::unserialize(file_get_contents($dataFile));
                    foreach ($this->module->panels as $id => $panel) {
                        if (isset($data[$id])) {
                            $panel->tag = $tag;
                            $panel->load($data[$id]);
                        }
                    }
                    $this->summary = $data['summary'];

                    return;
                }
                sleep(1);
            }

            throw new NotFoundHttpException("Unable to find debug data tagged with '$tag'.");
        }
        for ($retry = 0; $retry <= $maxRetry; ++$retry) {
            $manifest = $this->getManifest($retry > 0);
            if (isset($manifest[$tag])) {
                $dataFile = $this->module->dataPath . "/$tag.data";
                $this->data = null;
                if (\Swoole\Async::readFile($dataFile, function ($filename, $content) {
                        $this->data = SerializeHelper::unserialize($content);
                    }) === false
                ) {
                    throw new InvalidConfigException("Unable to open debug data index file: $indexFile");
                }
                while ($this->data === null) {
                    \Swoole\Coroutine::sleep(0.001);
                }
                foreach ($this->module->panels as $id => $panel) {
                    if (isset($this->data[$id])) {
                        $panel->tag = $tag;
                        $panel->load($this->data[$id]);
                    }
                }
                $this->summary = $this->data['summary'];

                return;
            }
            \Swoole\Coroutine::sleep(0.001);
        }

        throw new NotFoundHttpException("Unable to find debug data tagged with '$tag'.");
    }
}
