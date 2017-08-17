<?php
namespace yii\swoole\files;

use yii\swoole\Application;

class File extends \mikehaertl\tmp\File
{
    public function send($name = null, $contentType, $inline = false)
    {
        if (Application::$workerApp) {
            \Yii::$app->response->sendfile($this->_fileName, $name);
            \Yii::$app->response->send();
        } else {
            header('Pragma: public');
            header('Expires: 0');
            header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
            header('Content-Type: ' . $contentType);
            header('Content-Transfer-Encoding: binary');
            header('Content-Length: ' . filesize($this->_fileName));

            if ($name !== null || $inline) {
                $disposition = $inline ? 'inline' : 'attachment';
                header("Content-Disposition: $disposition; filename=\"$name\"");
            }

            readfile($this->_fileName);
        }

    }
}