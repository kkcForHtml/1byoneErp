<?php
namespace addons\finance\modellogic;

/**
 * Created by PhpStorm.
 * User: erp
 * Date: 2017/6/29
 * Time: 15:28
 */

use addons\finance\models\AcAccountingPeriod;
use Yii;
use yii\swoole\modellogic\BaseLogic;
use yii\db\Expression;
use yii\swoole\db\Query;
use yii\swoole\rest\ResponeModel;

class libraryageLogic extends BaseLogic
{
    public static $modelClass = 'addons\finance\models\SkLibraryRecord';

    //默认库龄区间
    public static $ageArea = [90, 180, 270, 365, 730, 999999];

    //获取库龄及对应的单据数据（关账需要调用）
    public static function getHisInvAgeList($organization, $endTime){
        $param = ['organization' => $organization, 'timeTo' => $endTime];
        $sumResult = self::getLibraryAgeSum($param, 0);   //查询结余
        if($sumResult['totalCount'] == 0){  //无数据，直接返回空
            return array();
        }
        $list1 = self::getLibraryAgeDB($param);   //盘盈 A
        $list2 = self::getLibraryAgeDB2($param); //盘盈 B
        $list = array_merge($list1, $list2);     //盘盈合并
        $list = self::sortByTimeDesc($list);    //日期倒序排序
        $data = self::pickData($sumResult['data'], $list, $endTime);    //分配
        return $data;
    }

    /**
     * 计算库龄步骤
     * 1、结余：从总表通过sum获取
     * 2、盘盈单据：a）总表中除了入库单和调拨单外的正数库存记录（入库单的从入库表取相应数据，调拨单的忽略掉）
     *              b）入库单表中取数据： ①采购入库/其他入库-->本单数量、日期
     *                                    ②内部采购-->本单数量
     *                                                 发运单==(最终)==》采购入库单日期
     * 3、分配：盘盈单据按日期倒序排序，将结余分配到单据
     * 4、计算库龄：库龄=截止日期-单据日期（相差的天数）；而数量则是单据分配到的数量
     * =====================================================================================
     */

    /**
     * 库龄报告（查询）
     * @param $post
     * @return array
     */
    public static function getLibraryAge($post){
        $result = self::getLibraryAgeList($post, 1);    //获取计算库龄后的列表（做分页）

        $res = new ResponeModel();
        return $res->setModel('200', 0, Yii::t('finance', 'Successful operation!'), $result['data'], ['totalCount' => $result['totalCount']]);
//        return $res->setModel('200', 0, Yii::t('finance', '操作成功!'), $result['data'], ['totalCount' => $result['totalCount']]);
    }

    /**
     * 库龄报告（导出）
     * @param $post
     * @return string
     */
    public static function excelLibraryAge($post, $flag = 0){
        $result = self::getLibraryAgeList($post);    //获取计算库龄后的列表（不做分页）

        $ageArea = isset($post['ageArea']) && $post['ageArea'] ? $post['ageArea'] : static::$ageArea;
        $titles = self::getTitles($ageArea, $flag);
        $fileName = $flag == 0 ? '库龄报告' : '历史库龄报表';
        return self::export_excel($result['data'], $titles, $fileName);
    }

    /**
     * 历史库龄（查询）
     * @param $post
     * @return array
     */
    public static function getHistoryLibAge($post){
        $post['timeTo'] = self::getTimeTo($post['year'], $post['period']);
        return self::getLibraryAge($post);
    }

    /**
     * 历史库龄（导出）
     * @param $post
     * @return string
     */
    public static function excelHistoryLibAge($post){
        $post['timeTo'] = self::getTimeTo($post['year'], $post['period']);
        return self::excelLibraryAge($post, 1);
    }



    /**
     * 通过年份和期间 获取截止时间
     * @param $year
     * @param $period
     * @return string
     */
    public static function getTimeTo($year, $period){
        $accPeriodDB = AcAccountingPeriod::find()->where(['and', ['=','YEARS',$year], ['=','ACCOUNTING_PERIOD',$period], ['<>','DELETED_STATE',1]])->select('END_AT')->asArray()->one();
        if($accPeriodDB && $accPeriodDB['END_AT']){
            return date('Y-m-d', $accPeriodDB['END_AT']);
        }
        return date('Y-m-d', mktime(0, 0, 0, $period + 1, 1, $year) -1);
    }

    /**
     * 获取查询并计算库龄后的列表
     * @param $post
     * @return array
     */
    public static function getLibraryAgeList($post, $flag = 0){
        //若无截止时间值，默认今天
        $timeTo = isset($post['timeTo']) && $post['timeTo'] ? $post['timeTo'] : date('Y-m-d', time());
        $post['timeTo'] = strtotime("$timeTo 23:59:59");
        //库龄区间的最大值
        $ageArea = isset($post['ageArea']) && $post['ageArea'] ? $post['ageArea'] : static::$ageArea;

        $sumResult = self::getLibraryAgeSum($post, $flag);   //查询结余
        if($sumResult['totalCount'] == 0){  //无数据，直接返回空
            return ['data'=>[], 'totalCount'=>0];
        }
        self::limitBySum($post, $sumResult['data']); //限制sku,组织，由于做分页，so，不一定需要查所有的
        $period = isset($post['year']) && isset($post['period']) ? sprintf("%s年%s期", $post['year'], $post['period']) : '';//期间

        $list1 = self::getLibraryAgeDB($post);   //盘盈 A
        $list2 = self::getLibraryAgeDB2($post); //盘盈 B
        $list = array_merge($list1, $list2);     //盘盈合并
        $list = self::sortByTimeDesc($list);    //日期倒序排序
        $data = self::pickData($sumResult['data'], $list, $post['timeTo']);    //分配
        $data = self::getAge($data, $ageArea, $period);    //计算库龄
        return ['data'=>$data, 'totalCount'=>$sumResult['totalCount']];
    }

    /**
     * 获取结余(即出入库的数量sum)，group by sku
     * @param $post
     * @return array
     */
    public static function getLibraryAgeSum($post, $flag){
        $model = (new Query())->from('sk_library_record slr')
            ->select("slr.PSKU_ID, slr.ORGANISATION_ID, SUM(slr.NUMBERS) AS sum")
            ->leftJoin('g_product_sku gps', 'gps.PSKU_ID = slr.PSKU_ID')
            ->leftJoin('g_product_type gpt', "SUBSTRING_INDEX(gps.PRODUCT_TYPE_PATH, ',' , -1) = gpt.PRODUCT_TYPE_ID")
            ->leftJoin('b_warehouse bw', 'bw.WAREHOUSE_ID = slr.WAREHOUSE_ID')
            ->having("SUM(slr.NUMBERS) > 0")     //结余大于0的（等于0的过滤掉不要）
            ->groupBy('slr.ORGANISATION_ID, slr.PSKU_ID')
            ->orderBy('slr.ORGANISATION_ID, slr.PSKU_ID');

        $model = self::getLibraryAgeWhere($model, $post);   //查询条件

        $count = $model->count('1');    //统计
        //分页
        if($flag){
            $limit = isset($post['limit']) && $post['limit'] ? $post['limit'] : 20;
            $page = isset($post['page']) && $post['page'] >= 1 ? $post['page'] : 1;
            $offset = ($page - 1) * $limit;
            $model->offset($offset);
            $model->limit($limit);
        }
        return ['data' => $model->all(), 'totalCount'=> $count];
    }

    /**
     * 盘盈A
     * 获取出入库记录中，除了类型为入库单和调拨单，且数量为正数 的数据
     * @param $post
     * @return array
     */
    public static function getLibraryAgeDB($post)
    {
        $model = (new Query())->from('sk_library_record slr')
            ->select("slr.NUMBERS,
                slr.ORDER_CD,
                slr.ORDER_AT,
                slr.ORGANISATION_ID,
                oo.ORGANISATION_NAME_CN,
                gcs.CSKU_CODE,
                gps.PSKU_ID,
                gps.PSKU_CODE,
                gpt.SYSTEM_NAME_CN")
            ->leftJoin('o_organisation oo', 'oo.ORGANISATION_ID = slr.ORGANISATION_ID')
            ->leftJoin('g_product_sku gps', 'gps.PSKU_ID = slr.PSKU_ID')
            ->leftJoin('g_currency_sku gcs', 'gcs.CSKU_ID = gps.CSKU_ID')
            ->leftJoin('g_product_type gpt', "SUBSTRING_INDEX(gps.PRODUCT_TYPE_PATH, ',' , -1) = gpt.PRODUCT_TYPE_ID")
            ->leftJoin('b_warehouse bw', 'bw.WAREHOUSE_ID = slr.WAREHOUSE_ID')
//            ->leftJoin('b_channel bc', 'bc.CHANNEL_ID = bw.CHANNEL_ID')
            ->orderby("slr.ORDER_AT DESC");

        //where条件
        $model->andWhere(['<>', 'slr.ORDER_TYPE', 1]);  //排除类型为入库单的
        $model->andWhere(['<>', 'slr.ORDER_TYPE', 5]);   //忽略调拨单
        $model->andWhere(['>', 'slr.NUMBERS', 0]);  //数量为正数
        $model = self::getLibraryAgeWhere($model, $post);   //查询条件

        return $model->all();
    }

    /**
     * 查询条件拼装where
     * @param $model
     * @param $post
     * @return $model
     */
    public static function getLibraryAgeWhere($model, $post){
        //组织权限，sku限制
        $model = self::addLimitWhere($model, 'slr', 'gps');
        //截止时间
        $model->andWhere(['<=', 'slr.ORDER_AT', $post['timeTo']]);
        //组织
        if (isset($post['organization']) && $post['organization'] != '') {
            $model->andWhere(new Expression("FIND_IN_SET(slr.ORGANISATION_ID,'" . $post['organization'] . "')"));
        }
        //平台
        if (isset($post['channel']) && $post['channel'] != '') {
            $model->andWhere(new Expression("FIND_IN_SET(bw.CHANNEL_ID,'" . $post['channel'] . "')"));
        }
        //小分类
        if (isset($post['smallType']) && $post['smallType'] != '') {
            $model->andWhere(new Expression("FIND_IN_SET(gpt.PRODUCT_TYPE_ID,'" . $post['smallType'] . "')"));
        }
        //sku
        if (isset($post['sku']) && $post['sku'] != '') {
            $model->andWhere(new Expression("FIND_IN_SET(gps.PSKU_ID,'" . $post['sku'] . "')"));
        }
        return $model;
    }

    /**
     * 盘盈B
     * 获取出入库记录中，类型为入库单，且数量为正数 的数据
     * @param $post
     * @return array
     */
    public static function getLibraryAgeDB2($post)
    {
        $StorageDB = self::getStorageDB($post);
        $StorageDB2 = self::getStorageDB2($post);
        $list = array_merge($StorageDB, $StorageDB2);
        return $list;
    }

    /**
     * 入库单A
     * 获取出入库单中，类型为采购入库和其他入库，且数量为正数 的数据
     * @param $post
     * @return array
     */
    public static function getStorageDB($post){
        $model = self::getStorageDetailModel();
        $model->addSelect('ss.STORAGE_AT as ORDER_AT');    //入库日期作为单据日期
        $model->addSelect('ss.STORAGE_CD as ORDER_CD');    //入库单为单号
        $model->orderBy('ss.STORAGE_AT DESC');
        //where条件
        $model = self::getStorageDetailWhere($model, $post, 'ss.STORAGE_AT');
        $model->andWhere(['<>', 'ss.ORDER_TYPE', 2]);   //不是“内部采购入库”的类型

        return $model->all();
    }

    /**
     * 入库单B
     * 获取出入库单中，类型为内部采购入库，且数量为正数 的数据
     * @param $post
     * @return array
     */
    public static function getStorageDB2($post){
        $model = self::getStorageDetailModel();
        $model->leftJoin('sh_dispatch_note sdn', 'sdn.INTERNAL_PURCHASINGST_ID = ssd.STORAGE_DETAIL_ID'); //内部采购入库明细id（类型为内部采购的入库明细id）去关联发运单，得采购入库明细id
        $model->leftJoin('sk_storage_detail ssd2', 'ssd2.STORAGE_DETAIL_ID = sdn.PURCHASING_WAREHOUSING_ID'); //发运单里采购入库明细id 去关联入库单明细，取其入库日期
        $model->leftJoin('sk_storage ss2', 'ss2.STORAGE_ID = ssd2.STORAGE_ID');

        $model->addSelect('ss2.STORAGE_AT as ORDER_AT');    //第二个入库日期作为单据日期
        $model->addSelect('ss2.STORAGE_CD as ORDER_CD');    //第二个入库单为单号
        $model->orderBy('ss2.STORAGE_AT DESC');
        //where条件
        $model = self::getStorageDetailWhere($model, $post, 'ss2.STORAGE_AT');
        $model->andWhere(['=', 'ss.ORDER_TYPE', 2]);   //“内部采购入库”的类型
        $model->andWhere(['>', 'ss2.STORAGE_AT', 0]);    //必须要关联到ssd2的数据

        return $model->all();
    }
    /**
     * @return model
     */
    public static function getStorageDetailModel(){
        return (new Query())->from('sk_storage_detail ssd')
            ->select("ssd.STORAGE_DNUMBER as NUMBERS,
                oo.ORGANISATION_ID,
                oo.ORGANISATION_NAME_CN,
                gcs.CSKU_CODE,
                gpt.SYSTEM_NAME_CN,
                gps.PSKU_ID,
                gps.PSKU_CODE")
            ->leftJoin('sk_storage ss', 'ss.STORAGE_ID = ssd.STORAGE_ID')
            ->leftJoin('o_organisation oo', 'oo.ORGANISATION_ID = ss.ORGANISATION_ID')
            ->leftJoin('g_product_sku gps', 'gps.PSKU_ID = ssd.PSKU_ID')
            ->leftJoin('g_currency_sku gcs', 'gcs.CSKU_ID = gps.CSKU_ID')
            ->leftJoin('g_product_type gpt', "SUBSTRING_INDEX(gps.PRODUCT_TYPE_PATH, ',' , -1) = gpt.PRODUCT_TYPE_ID")
            ->leftJoin('b_warehouse bw', 'bw.WAREHOUSE_ID = ss.WAREHOUSE_ID');
    }
    /**
     * 查询条件拼装where
     * @param $model
     * @param $post
     * @param $orderTimeName
     * @return $model
     */
    public static function getStorageDetailWhere($model, $post, $orderTimeName){
        //组织权限，sku限制
        $model = self::addLimitWhere($model, 'ss', 'gps');
        //截止时间
        $model->andWhere(['<=', $orderTimeName, $post['timeTo']]);
        //组织
        if (isset($post['organization']) && $post['organization'] != '') {
            $model->andWhere(new Expression("FIND_IN_SET(ss.ORGANISATION_ID,'" . $post['organization'] . "')"));
        }
        //平台
        if (isset($post['channel']) && $post['channel'] != '') {
            $model->andWhere(new Expression("FIND_IN_SET(bw.CHANNEL_ID,'" . $post['channel'] . "')"));
        }
        //小分类
        if (isset($post['smallType']) && $post['smallType'] != '') {
            $model->andWhere(new Expression("FIND_IN_SET(gpt.PRODUCT_TYPE_ID,'" . $post['smallType'] . "')"));
        }
        //sku
        if (isset($post['sku']) && $post['sku'] != '') {
            $model->andWhere(new Expression("FIND_IN_SET(gps.PSKU_ID,'" . $post['sku'] . "')"));
        }
        //必要限制条件
        $model->andWhere(['=', 'ss.ORDER_STATE', 2]);  //已审核
        $model->andWhere(['<>', 'ss.DELETED_STATE', 1]);   //未删除
        $model->andWhere(['>', 'ssd.STORAGE_DNUMBER', 0]);  //数量为正数
        return $model;
    }

    /**
     * 将结余数量分配到列表
     * @param $sumDB
     * @param $list
     * @return array
     */
    public static function pickData($sumDB, $list, $endTime){
        $data = array();    //分配后的单据记录(psku => list)
        $sum = array();     //结余（psku => sum）
        foreach($sumDB as $v){
            $index = "{$v['ORGANISATION_ID']}@{$v['PSKU_ID']}";
            $sum[$index] = $v['sum'];
            $data[$index] = array();    //使data顺序是按sum的顺序来排序
        }
        //分配
        foreach($list as $item){
            $index = "{$item['ORGANISATION_ID']}@{$item['PSKU_ID']}";
            $num = $item['NUMBERS'];
            if(isset($sum[$index])){
                $tmp = $item;
                $tmp['AGE'] = intval(($endTime - $item['ORDER_AT']) / 86400); //库龄（天）
                if($num < $sum[$index]){  //结余分配不完
                    $tmp['NUMBERS'] = $num; //分配单据原本数量
                    $sum[$index] -= $num;     //结余数量 - 已分配掉的数量
                }else{  //分配完
                    $tmp['NUMBERS'] = $sum[$index]; //分配剩余的结余数量
                    unset($sum[$index]);  //分配完成，消掉
                }
                $data[$index][] = $tmp;
            }
            if(count($sum) == 0){
                //所有sku的结余都分配完成，直接返回
                return $data;
            }
        }
        return $data;   //有结余未分配完成（理论上不会出现）
    }

    /**
     * 计算库龄
     * @param $arr
     * @param $endTime
     * @return array
     */
    public static function getAge($arr, $ageArea, $period = ''){
        $data = array();
        foreach($arr as $list){
            if(is_array($list) && !empty($list)){
                if($period){
                    $tmp['PERIOD'] = $period;
                }
                $tmp['ORGANISATION_NAME_CN'] = $list[0]['ORGANISATION_NAME_CN'];  //组织
                $tmp['CSKU_CODE'] = $list[0]['CSKU_CODE'];    //通用sku
                $tmp['SYSTEM_NAME_CN'] = $list[0]['SYSTEM_NAME_CN'];  //小分类
                $tmp['PSKU_CODE'] = $list[0]['PSKU_CODE'];    //sku
                foreach($ageArea as $index){
                    $tmp[$index] = 0; //以库龄区间的最大值作为key,存该区间的数量，初始0
                }
                foreach($list as $v){
                    $index = self::getAgeArea($v['AGE'], $ageArea); //计算库龄所在区间,返回区间的最大值
                    $tmp[$index] += $v['NUMBERS'];  //对应区间的数量增加
                }
                $data[] = $tmp;
            }
        }
        return $data;
    }

    /**
     * 计算库龄所在区间
     * @param $age
     * @param $ageArea
     * @return integer
     */
    public static function getAgeArea($age, $ageArea){
        foreach($ageArea as $v){
            if($age <= $v){
                return $v;
            }
        }
    }

    /**
     * 二维数组排，根据ORDER_AT倒序排序
     * @param $arr
     * @return array
     */
    public static function sortByTimeDesc($arr){
        usort($arr, function($a, $b) {
            return $a['ORDER_AT'] < $b['ORDER_AT'];
        });
        return $arr;
    }

    /**
     * 限制组织和sku,使得接下来的查询只查sum结果里的组织和sku
     * @param $post
     * @param $data
     */
    public static function limitBySum(&$post, $data){
        $sku_arr = array_column($data, 'PSKU_ID');
        $post['sku'] = implode(",", $sku_arr);
        $org_arr = array_column($data, 'ORGANISATION_ID');
        $post['organization'] = implode(",", $org_arr);
    }

    /**
     * 导出Excel
     * @param $list
     * @param $fileName
     */
    public static function export_excel($list, $titles, $fileName){
        $maxLetter = self::getLetter(count($titles));
        $filePrefix = "$fileName-" . date("Y-m-d");
        $fileSuffix = '.xlsx';
        $file = \Yii::createObject([
            'class' => 'yii\swoole\files\ExcelFile',
            'fileOptions' => ['suffix' => $fileSuffix],
            'sheets' => [
                'Active Users' => [
                    'data' => $list,
                    'titles' => $titles,
                ],
            ],
        ]);
        $phpExcel = $file->getWorkbook();
        $phpExcel->getSheet()->getRowDimension(1)->setRowHeight(20);
        //所有垂直居中
        $phpExcel->getSheet()->getStyle("A1:$maxLetter" . (count($list) + 1))->getAlignment()->setVertical(\PHPExcel_Style_Alignment::VERTICAL_CENTER);
        //设置单元格边框
        $phpExcel->getSheet()->getStyle("A1:$maxLetter"  . (count($list) + 1))->getBorders()->getAllBorders()->setBorderStyle(\PHPExcel_Style_Border::BORDER_THIN);
        //设置第一列的字体大小
        $phpExcel->getSheet()->getStyle("A1:$maxLetter" . "1")->getFont()->setSize(12);
        //第一行字体加粗
        $phpExcel->getSheet()->getStyle("A1:$maxLetter" . "1")->getFont()->setBold(true);
        //设置单元格宽度
        $phpExcel->getSheet()->getDefaultColumnDimension()->setWidth(15);

        return $file->send($filePrefix . $fileSuffix);
    }

    //根据列数获取列的字符（例：28列AB）
    public static function getLetter($max){
        $str = '';
        while($max > 0){
            if($max <= 26){
                $yu = $max;
                $max = 0;
            }else{
                $yu = $max % 26;
                $max = intval($max / 26);
                if($yu == 0){
                    $yu = 26;
                    $max--;
                }
            }
            $str = chr($yu + 64) . $str;
        }
        return $str;
    }

    /**
     * 标题栏
     * @param $ageArea
     * @param int $flag
     * @return array
     */
    public static function getTitles($ageArea, $flag = 0){
        $titles = $flag ? ['期间', '组织', '通用SKU','小分类', 'SKU'] : ['组织', '通用SKU','小分类', 'SKU'];

        foreach($ageArea as $k => $v){
            if($k == 0){
                $titles[] = "0-$v" . "天";
            }elseif($k == (count($ageArea) - 1)){
                $titles[] = ($ageArea[$k-1] + 1)  . "天以上";
            }else{
                $titles[] = ($ageArea[$k-1] + 1) . "-$v" . "天";
            }
        }
        return $titles;
    }

    //组织权限限制,sku限制
    public static function addLimitWhere($model, $alias_org, $alias_sku)
    {
        $str = Yii::$app->rpc->create('base')->send([['\addons\common\base\modellogic\filterLogic', 'get_api'], []])->recv();
        if ($str) {
            $model->andWhere([$alias_org . '.ORGANISATION_ID' => Yii::$app->session->get('organization') ?: null]);
            $model->andWhere([$alias_sku . '.PSKU_ID' => Yii::$app->session->get('product_id')]);
        }
        return $model;
    }

}