<?php
/**
 * Created by PhpStorm.
 * User: erp
 * Date: 2017/7/19
 * Time: 14:22
 */

namespace addons\inventory\modellogic;

use addons\inventory\models\SkStockInitialise;
use Yii;
use yii\swoole\rest\ResponeModel;
use yii\web\ServerErrorHttpException;
use yii\swoole\rest\CreateExt;

class stockinitialiseLogic
{

    /**
     * 导出模板
     * @param $post
     */
    public static function exportTemplate($post){
        $ORGANISATION_ID = self::getOrganisation($post['ORGANISATION_NAME_CN']);
        $skuList = self::getSkuByOrg($ORGANISATION_ID);
        $data = array();
        foreach($skuList as $k=>$v){
            $data[$k][] = $post['ORGANISATION_NAME_CN'];   //组织
            $data[$k][] = $post['CHANNEL_NAME_CN'];   //平台
            $data[$k][] = $post['WAREHOUSE_NAME_CN'];   //仓库
            $data[$k][] = $v['PSKU_CODE'];   //SKU
        }
        $titles = ['组织', '平台', '仓库', 'SKU', '数量', '单位成本'];
        $fileName = "初始化单-{$post['ORGANISATION_NAME_CN']}-{$post['CHANNEL_NAME_CN']}-{$post['WAREHOUSE_NAME_CN']}";
        return Yii::$app->rpc->create('finance')->send([['\addons\finance\modellogic\libraryageLogic', 'export_excel'], [$data, $titles, $fileName]])->recv();
    }

    /**
     * 导入数据
     * @param $post
     * @return string
     * @throws ServerErrorHttpException
     */
    public static function importData($post){
        $tmp_name = $_FILES["file"]["tmp_name"];
        $PHPReader = new \PHPExcel_Reader_Excel2007();
        if (!$PHPReader->canRead($tmp_name)) {
            $PHPReader = new \PHPExcel_Reader_Excel5(); //再次尝试利用低版本读取
            if(!$PHPReader->canRead($tmp_name)){
                throw new ServerErrorHttpException(Yii::t('inventory', 'The file cannot be read!'));
            }
        }

        $phpexcel = $PHPReader->load($tmp_name)->getSheet(0);   //读取数据
        $phpexcel = $phpexcel->toArray();
        array_shift($phpexcel);     //去掉title
        $data = self::filterData($phpexcel);    //格式化数据
        if(empty($data)){
            throw new ServerErrorHttpException(Yii::t('inventory', 'No data!'));
        }
        //批量新增
        $result = CreateExt::actionDo(new SkStockInitialise(), ["batchMTC" => $data]);
        if($result instanceof ResponeModel){
            return $result;
        }
        return Yii::t('inventory', "Successful operation!");
    }

    //过滤数据，组成需要的格式
    public static function filterData($data){
        $skuAll = array();
        $arr = array();
        foreach($data as $item){
            if(count($item) == 6 && $item[0] && $item[1] && $item[2] && $item[3] && $item[4]){
                $index = "{$item[0]}-{$item[1]}-{$item[2]}";    //组织-平台-仓库
                if(!isset($arr[$index])){
                    $arr[$index]['ORGANISATION_ID'] = $ORGANISATION_ID = self::getOrganisation($item[0]);
                    $arr[$index]['CHANNEL_ID'] = self::getChannel($item[1]);
                    $arr[$index]['WAREHOUSE_ID'] = self::getWarehouse($item[2]);
                    $arr[$index]['IMPORT_STATE'] = 99;
                    $skuAll[$index] = self::getSkuByOrg($ORGANISATION_ID);
                }
                $arr[$index]['sk_stock_initialise_detail'][] = array(
                    'PSKU_ID' => self::getSkuID($item[3], $skuAll[$index]),
                    'PSKU_CODE' => $item[3],
                    'PURCHASE' => $item[4],
                    'COPST_PRICE' => $item[5],
                );
            }
        }
        return $arr;
    }

    //根据组织获取产品sku(采购组织或者需求组织其一符合即可)
    public static function getSkuByOrg($ORGANISATION_ID){
        $where = ['or', ['ORGAN_ID_DEMAND' => $ORGANISATION_ID], ['ORGAN_ID_PURCHASE' => $ORGANISATION_ID]];
        return Yii::$app->rpc->create('product')->send([['\addons\master\product\modellogic\ProductskuLogic', 'getGProductSku'], [[], $where]])->recv();
    }

    //根据组织名称获取组织
    public static function getOrganisation($ORGANISATION_NAME_CN){
        $where = ['ORGANISATION_NAME_CN' => $ORGANISATION_NAME_CN];
        $result = Yii::$app->rpc->create('organization')->send([['\addons\organization\modellogic\organizLogic', 'GetORGANISATIONIEN'], [[], $where]])->recv();
        if(count($result) == 0){
            throw new ServerErrorHttpException(Yii::t('inventory', 'Can not find the organization by name!'));
        }
        if(count($result) > 1){
            throw new ServerErrorHttpException(Yii::t('inventory', 'Find multiple organizations by name!'));
        }
        return $result[0]['ORGANISATION_ID'];
    }

    //根据平台名称获取平台
    public static function getChannel($CHANNEL_NAME_CN){
        $where = ['CHANNEL_NAME_CN' => $CHANNEL_NAME_CN];
        $result = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\basicsLogic', 'getChannelA'], [[], $where]])->recv();
        if(count($result) == 0){
            throw new ServerErrorHttpException(Yii::t('inventory', 'Can not find the channel by name!'));
        }
        if(count($result) > 1){
            throw new ServerErrorHttpException(Yii::t('inventory', 'Find multiple channel by name!'));
        }
        return $result[0]['CHANNEL_ID'];
    }

    //根据仓库名称获取仓库
    public static function getWarehouse($WAREHOUSE_NAME_CN){
        $where = ['WAREHOUSE_NAME_CN' => $WAREHOUSE_NAME_CN];
        $result = Yii::$app->rpc->create('basics')->send([['\addons\master\basics\modellogic\basicsLogic', 'getWarehouse'], [[], $where]])->recv();
        if(count($result) == 0){
            throw new ServerErrorHttpException(Yii::t('inventory', 'Can not find the warehouse by name!'));
        }
        if(count($result) > 1){
            throw new ServerErrorHttpException(Yii::t('inventory', 'Find multiple warehouse by name!'));
        }
        return $result[0]['WAREHOUSE_ID'];
    }

    //从sku列表中通过编码获取ID
    public static function getSkuID($PSKU_CODE, $skuList){
        foreach($skuList as $sku){
            if($sku['PSKU_CODE'] == $PSKU_CODE){
                return $sku['PSKU_ID'];
            }
        }
        throw new ServerErrorHttpException(Yii::t('inventory', 'Can not find SKU in the organization!'));
    }

}