<?php

namespace yii\swoole\debug\filedebug;

use yii\base\InvalidConfigException;
use yii\swoole\Application;
use yii\swoole\async\Task;
use yii\swoole\helpers\FileHelper;
use yii\swoole\helpers\SerializeHelper;

/**
 * 调试模块的日志记录器
 *
 * @package yii\swoole\debug\filedebug
 */
class LogTarget extends \yii\debug\LogTarget
{

    /**
     * @inheritdoc
     */
    public function export()
    {
        FileHelper::createDirectory($this->module->dataPath, $this->module->dirMode);

        $summary = $this->collectSummary();
        $data = [];
        // 收集面板的调试信息
        foreach ($this->module->panels as $id => $panel) {
            $data[$id] = $panel->save();
        }
        $data['summary'] = $summary;

        if (!Application::$workerApp) {
            self::saveDebugData($this->tag, $this->module->dataPath, $data, $this->module->fileMode, $this->module->historySize, $summary);
            return;
        }
        $this->saveData($data, $summary);
//        Task::addTask('\yii\swoole\debug\filedebug\LogTarget::saveDebugData', [$this->tag, $this->module->dataPath, $data, $this->module->fileMode, $this->module->historySize, $summary]);
    }

    public function saveData($data, $summary)
    {
        $dataFile = "{$this->module->dataPath}/{$this->tag}.data";
        \Swoole\Async::writeFile($dataFile, SerializeHelper::serialize($data), function ($filename) {
            if ($this->module->fileMode !== null) {
                @chmod($filename, $this->module->fileMode);
            }

        });

        $indexFile = "{$this->module->dataPath}/index.data";
        touch($indexFile);
        if (@filesize($indexFile) > 0) {
            if (\Swoole\Async::readFile($indexFile, function ($filename, $content) use ($summary) {
                    $this->write($filename, $content, $summary);
                }) === false
            ) {
                throw new InvalidConfigException("Unable to open debug data index file: $indexFile");
            }
        } else {
            $this->write($indexFile, '', $summary);
        }

    }

    private function write($filename, $manifest, $summary)
    {
        if (empty($manifest)) {
            $manifest = [];
        } else {
            $manifest = SerializeHelper::unserialize($manifest);
        }
        $manifest[$this->tag] = $summary;
        if (count($manifest) > $this->module->historySize + 10) {
            $n = count($manifest) - $historySize;
            foreach (array_keys($manifest) as $tag) {
                $file = $this->module->dataPath . "/$tag.data";
                @unlink($file);
                unset($manifest[$tag]);
                if (--$n <= 0) {
                    break;
                }
            }
        }
        \Swoole\Async::writeFile($filename, SerializeHelper::serialize($manifest), function ($filename) {
            if ($this->module->fileMode !== null) {
                @chmod($filename, $this->module->fileMode);
            }

        });
    }

    /**
     * 将原有的export部分逻辑/ updateIndexFile / gc 合并在一起
     * 这个方法默认只应该由task去执行
     *
     * @param $tag
     * @param $dataPath
     * @param $data
     * @param $fileMode
     * @param $historySize
     * @param $summary
     * @throws \yii\base\InvalidConfigException
     */
    public
    static function saveDebugData($tag, $dataPath, $data, $fileMode, $historySize, $summary)
    {
        $dataFile = "$dataPath/{$tag}.data";
        file_put_contents($dataFile, SerializeHelper::serialize($data));
        if ($fileMode !== null) {
            @chmod($dataFile, $fileMode);
        }

        $indexFile = "$dataPath/index.data";
        touch($indexFile);
        if (($fp = @fopen($indexFile, 'r+')) === false) {
            throw new InvalidConfigException("Unable to open debug data index file: $indexFile");
        }
        @flock($fp, LOCK_EX);
        $manifest = '';
        while (($buffer = fgets($fp)) !== false) {
            $manifest .= $buffer;
        }
        if (!feof($fp) || empty($manifest)) {
            // error while reading index data, ignore and create new
            $manifest = [];
        } else {
            $manifest = SerializeHelper::unserialize($manifest);
        }

        $manifest[$tag] = $summary;
        if (count($manifest) > $historySize + 10) {
            $n = count($manifest) - $historySize;
            foreach (array_keys($manifest) as $tag) {
                $file = $dataPath . "/$tag.data";
                @unlink($file);
                unset($manifest[$tag]);
                if (--$n <= 0) {
                    break;
                }
            }
        }

        ftruncate($fp, 0);
        rewind($fp);
        fwrite($fp, SerializeHelper::serialize($manifest));

        @flock($fp, LOCK_UN);
        @fclose($fp);

        if ($fileMode !== null) {
            @chmod($indexFile, $fileMode);
        }
    }
}
