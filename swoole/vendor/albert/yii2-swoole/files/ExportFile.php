<?php
namespace yii\swoole\files;

use Yii;
use yii\base\Component;
use yii\base\ErrorException;

class ExportFile extends Component
{
    public $filePath = '@upload/print/advice/';
    public $suffix = '.xlsx';

    /**
     * createFiles
     * 模板处理
     * @param $data @内容
     * @param $title @标题
     * @param $dataRow @内容起始行数
     * @param $titleRow @标题起始行数
     * @param $filePath @路径
     * @param $PHPExcel @
     * @param $total @模板合计内容，一个数组一行合计
     * @param $total_col @模板合计从多少行开始
     * @throws
     * @return array
     * */
    private function createFiles($data, $title, $dataRow, $titleRow, $filePath, &$PHPExcel, $total = null, $total_col = null)
    {
        // Reader很关键，用来读excel文件
        $PHPReader = new \PHPExcel_Reader_Excel2007();
        // 这里是用Reader尝试去读文件，07不行用05，05不行就报错。注意，这里的return是Yii框架的方式。
        if (!$PHPReader->canRead($filePath)) {
            $PHPReader = new \PHPExcel_Reader_Excel5();
            if (!$PHPReader->canRead($filePath)) {
                throw new ErrorException(Yii::t('custom', 'can not read the file:' . $filePath));
            }
        }
        // Reader读出来后，加载给Excel实例
        $PHPExcel = $PHPReader->load($filePath);
        // 拿到第一个sheet（工作簿）
        $currentSheet = $PHPExcel->getActiveSheet();
        // 最高的列，比如AU. 列从A开始
        $allColumn = \PHPExcel_Cell::columnIndexFromString($currentSheet->getHighestColumn());
        $num_rows = $currentSheet->getHighestRow();
        $currentSheet->setCellValueByColumnAndRow('A1', $titleRow, $title);
        $tmptotal = [];
        for ($currentColumn = 0; $currentColumn < $allColumn; $currentColumn++) {
            $tmpData[] = $currentSheet->getCellByColumnAndRow($currentColumn, $dataRow)->getValue();
            if ($total && $total_col) {
                $tmptotal[] = $currentSheet->getCellByColumnAndRow($currentColumn, $total_col)->getValue();
            }
        }

        $currentSheet->insertNewRowBefore($num_rows, count($data));

        for ($currentRow = 0; $currentRow < count($data); $currentRow++) {
            foreach ($data[$currentRow] as $index => $value) {
                $currentSheet->setCellValueByColumnAndRow($index, $currentRow + $dataRow, $value === null ? $tmpData[$index] : $value);
            }
        }
        if (count($tmptotal) > 0) {
            $i = 0;
            for ($currentRows = 0; $currentRows < count($total); $currentRows++) {
                foreach ($data[$currentRows] as $indexs => $value) {
                    #符合条件
                    if (strpos($tmptotal[$indexs], '=') !== false) {
                        $currentSheet->setCellValueByColumnAndRow($indexs, $currentRows + ($dataRow + count($data) + 1), $total[$currentRows][$i]);
                        $i++;
                    } else {
                        $currentSheet->setCellValueByColumnAndRow($indexs, $currentRows + ($dataRow + count($data) + 1), $tmptotal[$indexs]);
                    }

                }
            }
        }

        return \Yii::createObject([
            'class' => 'yii\swoole\files\ExcelFile',
            'fileOptions' => ['suffix' => $this->suffix],
            'sheets' => [
                [
                    'data' => []
                ]
            ]
        ]);
    }


    /**
     * exportExcel
     * 根据模板导出excel
     * @param $data @内容数据
     * @param $title @顶部标题内容数据
     * @param $dataRow @内容从多少行开始
     * @param $titleRow @顶部标题从多少行开始
     * @param $filePath @模板excel地址
     * @param $fileName @下载的文件名
     * @param $total @合计内容，一个数组一行合计
     * @param $total_col @合计从多少行开始
     * */
    public function exportExcel($data, $title, $dataRow, $titleRow, $filePath, $fileName, $total = null, $total_col = null)
    {
        $PHPExcel = null;
        $file = $this->createFiles($data, $title, $dataRow, $titleRow, $filePath, $PHPExcel, $total, $total_col);
        $file->Workbook = $PHPExcel;
        $file->send($fileName . $this->suffix);
    }

    /**
     * exportExcelTwo
     * 根据模板导出excel
     * @param $data @内容数据
     * @param $title @顶部标题内容数据
     * @param $dataRow @内容从多少行开始
     * @param $titleRow @顶部标题从多少行开始
     * @param $filePath @模板excel地址
     * @param $timeFile @临时目录
     * @param $name @临时文件名
     * @param $total @合计内容，一个数组一行合计
     * @param $total_col @合计从多少行开始
     * */
    public function saveExcel($data, $title, $dataRow, $titleRow, $filePath, $timeFile, $name, $total = null, $total_col = null)
    {
        $PHPExcel = null;
        $file = $this->createFiles($data, $title, $dataRow, $titleRow, $filePath, $PHPExcel, $total, $total_col);
        $filePath = \Yii::getAlias($this->filePath . $timeFile);
        if (!file_exists($filePath)) {
            mkdir($filePath);
        }
        $filePath = \Yii::getAlias($this->filePath . $timeFile . '/' . $name . '.xlsx');
        $file->Workbook = $PHPExcel;
        $file->saveAs($filePath);
    }

    /**
     * exportExcelZip
     * 压缩文件夹
     * @param $fileName @文件夹名称
     * @param $filelist @文件名称
     * @param $printName @下载名称
     * @throws
     * */
    public function exportExcelZip($fileName, $filelist, $printName)
    {
        $file_prefix = 'excel_';
        $filetime = $file_prefix . time();
        $filename = Yii::getAlias($this->filePath . $filetime . ".zip");

        foreach (glob(Yii::getAlias($this->filePath . "*")) as $file) {
            if (!is_dir($file)) {
                @unlink($file);
            } else {
                @rmdir($file);
            }
        }
        // 生成文件
        $zip = new \ZipArchive (); // 使用本类，linux需开启zlib，windows需取消php_zip.dll前的注释
        if ($zip->open($filename, \ZIPARCHIVE::CREATE) !== TRUE) {
            throw new ErrorException(Yii::t('custom', 'can not read the file:' . $filename));
        }
        $flag = true;
        foreach ($filelist as $val) {
            $flag &= $zip->addFile(Yii::getAlias($this->filePath . $fileName . '/' . $val[1] . '.xlsx'), basename(\Yii::getAlias('@upload/print/advice/' . $fileName . '/' . $val[0] . '.xlsx')));
        }
        if (!$flag) {
            throw new ErrorException(Yii::t('custom', 'can not read the file:' . $filename));
        }
        $zip->close(); // 关闭

        #删除文件夹
        $this->deleteFile(\Yii::getAlias($this->filePath . $fileName));
        rmdir(\Yii::getAlias($this->filePath . $fileName));
        \Yii::$app->response->sendfile($filename, $printName . '.zip');
        \Yii::$app->response->send();

    }

    /**
     * deleteFile
     * 删除文件夹及文件
     * @param $path @地址
     * */
    public function deleteFile($path)
    {
        foreach (glob($path . "*") as $file) {
            if (!is_dir($file)) {
                @unlink($file);
            } else {
                $this->deleteFile($file . '/');
            }
        }
    }
}