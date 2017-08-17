<?php
namespace yii\swoole\files;

use Yii;
use yii\swoole\Application;

class Pdf extends \kartik\mpdf\Pdf
{
    public $title = 'pdf';

    public $mode = self::MODE_UTF8;

    public $options = [
        'autoLangToFont' => true,    //这几个配置加上可以显示中文
        'autoScriptToLang' => true,  //这几个配置加上可以显示中文
        'autoVietnamese' => true,    //这几个配置加上可以显示中文
        'autoArabic' => true,        //这几个配置加上可以显示中文
    ];

    /**
     * Initialize folder paths to allow [[mPDF]] to write temporary data.
     */
    public function initTempPaths()
    {
        if (empty($this->tempPath)) {
            $this->tempPath = Yii::$app->BaseHelper->getTempDir() . '/mpdf';
        }
        $prefix = $this->tempPath . DIRECTORY_SEPARATOR;
        static::definePath('_MPDF_TEMP_PATH', "{$prefix}tmp");
        static::definePath('_MPDF_TTFONTDATAPATH', "{$prefix}ttfontdata");
    }

    public function render()
    {
        $this->configure($this->options);
        if (!empty($this->methods)) {
            foreach ($this->methods as $method => $param) {
                $this->execute($method, $param);
            }
        }
        if (Application::$workerApp) {
            ob_start();
            $buffer = $this->output($this->content, $this->filename, $this->destination);
            $content = ob_get_clean();
            if (empty($buffer)) {
                $buffer = $content;
            }
            switch ($this->destination) {
                case self::DEST_BROWSER:
                    Yii::$app->response->sendContentAsFile($buffer, $this->filename, ['mimeType' => 'application/pdf', 'inline' => true])->send();
                    break;
                case self::DEST_DOWNLOAD:
                    Yii::$app->response->sendContentAsFile($buffer, $this->filename, ['mimeType' => 'application/pdf'])->send();
                    break;
            }
            return '';
        }
        return $this->output($this->content, $this->filename, $this->destination);
    }

    public function output($content = '', $file = '', $dest = self::DEST_BROWSER)
    {
        $api = $this->getApi();
        $css = $this->getCss();
        $pdfAttachments = $this->getPdfAttachments();
        if (!empty($css)) {
            $api->WriteHTML($css, 1);
            $api->WriteHTML($content, 2);
        } else {
            $api->WriteHTML($content);
        }

        if ($pdfAttachments) {
            $api->SetImportUse();
            $api->SetHeader(null);
            $api->SetFooter(null);
            foreach ($pdfAttachments as $attachment) {
                $this->writePdfAttachment($api, $attachment);
            }
        }
        $api->SetDisplayMode('fullpage');
        return $api->Output($file, $dest);
    }
}