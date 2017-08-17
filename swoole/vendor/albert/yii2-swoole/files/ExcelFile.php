<?php
namespace yii\swoole\files;


class ExcelFile extends \codemix\excelexport\ExcelFile
{
    public function setWorkbook($workBook)
    {
        $this->_workbook = $workBook;
    }

    public function getTmpFile()
    {
        if ($this->_tmpFile === null) {
            $suffix = isset($this->fileOptions['suffix']) ? $this->fileOptions['suffix'] : null;
            $prefix = isset($this->fileOptions['prefix']) ? $this->fileOptions['prefix'] : null;
            $directory = isset($this->fileOptions['directory']) ? $this->fileOptions['directory'] : null;
            $this->_tmpFile = new File('', $suffix, $prefix, $directory);
        }
        return $this->_tmpFile;
    }

    public function send($filename = null, $inline = false, $contentType = 'application/vnd.ms-excel')
    {
        $this->createFile();
        $this->getTmpFile()->send($filename, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', $inline);
    }
}