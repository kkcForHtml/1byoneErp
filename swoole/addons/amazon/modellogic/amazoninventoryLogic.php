<?php
/**
 * Created by PhpStorm.
 * User: Fable
 * Date: 2017/6/20
 * Time: 14:37
 * 解析亚马逊库存
 */

namespace addons\amazon\modellogic;

use addons\amazon\models\CAmazonOrder;
use addons\amazon\models\CAmazonOrderDetail;
use addons\amazon\models\CAmazonParseLogs;
use addons\amazon\models\FbaFulfillmentInventory;
use addons\tools\models\CAmazoninventory;
use addons\tools\models\IInventory;
use yii\swoole\db\Query;
use Yii;
use yii\swoole\rest\ResponeModel;
use yii\web\ServerErrorHttpException;

class amazoninventoryLogic
{

    /**
     * 解析库存数据
     */
    public static function ParsingData()
    {
        $data = (new Query())->from('i_inventory')
            ->where(['IS_PARSING'=>0])
            ->all();

        $add_data = array();

        $ids = array();

        $connection = \Yii::$app->db;

        foreach ($data as $value) {

           try{
               $row = array();
               $json = json_decode($value['DATA'], true);

               if (!isset($json['SellerSKU']))
                   continue;

               $row['ACCOUNT_ID'] = $value['ACCOUNT_ID'];
               $row['SELLER_SKU'] = $json['SellerSKU'];
               $row['ASIN'] = $json['ASIN'];
               $row['FNSKU'] = $json['FNSKU'];
               $row['ORGANISATION_ID'] = $value['ORGANISATION_ID'];
               $row['CHANNEL_ID'] = $value['CHANNEL_ID'];

               $condition = $row;
               $condition['STATUS'] = 1;

               $check = (new Query())->from('c_amazon_inventory')
                   ->select('ID')
                   ->where($condition)
                   ->all();

               //把相同的旧数据变成无效记录
               if($check){
                   $update_condition['ID'] = array_column($check,'ID');
                   CAmazoninventory::updateAll(array('STATUS'=>0),$update_condition);
               }

               $row['IN_STOCK_SUPPLY_QUANTITY'] = $json['InStockSupplyQuantity'];
               $row['TOTAL_SUPPLY_QUANTITY'] = $json['TotalSupplyQuantity'];
               $row['CONDITION'] = $json['Condition'];
               $row['SUPPLY_DETAIL'] = isset($json['SupplyDetail']) ? json_encode($json['SupplyDetail']) : '';
               $row['EARLIEST_AVAILABILITY'] = isset($json['EarliestAvailability']) ? json_encode($json['EarliestAvailability']) : '';

               $row['CREATE_AT'] = time();
               $add_data[] = $row;
               $ids[] = $value['INVENTORY_ID'];

               $sku_info = Yii::$app->rpc->create('product')->sendAndrecv([['\addons\master\product\modellogic\ProductskuLogic','getSkuInfoByPlatformSku'],[$json['SellerSKU'],$value['ACCOUNT_ID'],$value['ORGANISATION_ID']]]);

               if($sku_info){
                   $row['PSKU_ID'] = $sku_info['PSKU_ID'];
               }else{
                   $row['PSKU_ID'] = null;
               }

               //数据入库
               $id = $connection->createCommand()->Insert(
                   'c_amazon_inventory',
                   $row
               )->execute();

               //匹配不到skuid 写入日志表
               if(!$sku_info){
                   $id = Yii::$app->db->getLastInsertId();
                   $message = $value['ACCOUNT_ID'].'|'.$value['ORGANISATION_ID'].'|'.$json['SellerSKU'];
                   self::AddInventoryLog($id,$message);
               }
           } catch(\Exception $ex) {
               self::AddInventoryLog(null,$ex);
               continue;
            }
        }

        IInventory::updateAll(array('IS_PARSING' => 1), array('INVENTORY_ID' => $ids));
    }

    /**
     * 再解析
     */
    public static function ParsingDataAgain(){

        $connection  = Yii::$app->db;

        $sql = "select cai.*,cpl.ID as LOG_ID from c_amazon_inventory cai INNER JOIN c_amazon_parselogs cpl on cai.ID = cpl.TYPE_ID  where cpl.TYPE=1  and cpl.ERROR_TYPE=1 and MARK_STATUS = 1  order by cai.CREATE_AT desc";

        $command = $connection->createCommand($sql);
        $data = $command->queryAll();

        $log_update_ids = array();

        foreach($data as $value){
            $sku_info = Yii::$app->rpc->create('product')->sendAndrecv([['\addons\master\product\modellogic\ProductskuLogic','getSkuInfoByPlatformSku'],[$value['SELLER_SKU'],$value['CHANNEL_ID'],$value['ORGANISATION_ID']]]);

            if($sku_info){
                $inventory_update_data['PSKU_ID'] = $sku_info['PSKU_ID'];
                $inventory_update_data['UPDATE_AT'] = time();
                //更新库存skuid
                CAmazoninventory::updateAll($inventory_update_data,array('ID'=>$value['ID']));
                $log_update_ids[] = $value['LOG_ID'];
            }else{
                continue;
            }
        }

        if($log_update_ids){
            $log_data['MARK_STATUS'] = 2;
            CAmazonParseLogs::updateAll($log_data,array('ID'=>$log_update_ids));
        }

        return true;
    }

    /**
     * 匹配不到sku 写入日志
     */
    public static function AddInventoryLog($id,$message){
        $data['TYPE'] = 1;
        $data['ERROR_TYPE'] = 1;
        $data['TYPE_ID'] = $id;
        $data['ERROR_TYPE'] =1;
        $data['ERROR_MESSAGE'] = $message;
        $data['MARK_STATUS'] = 1;
        $data['CREATE_AT'] = time();

        Yii::$app->db->createCommand()->insert('c_amazon_parselogs', $data)->execute();
    }


    /**
     * 再次解析
     */
    public static function synchronous(){
        try{
            self::ParsingDataAgain();
            self::_matchSellerSku();
        }catch (\Exception $ex) {
            throw $ex;
        }
        $response = new ResponeModel();
        return $response->setModel(200, 0, Yii::t('inventory', 'Successful operation!'),array());
    }

    /**
     * 匹配订单/Fba收发货的SKU
     */
    private static function _matchSellerSku(){
        $data = self::_getNeedMatchData();
        $parseLogIds = [];
        foreach($data as $item){
            if(!$errorMsg = explode('|',$item['ERROR_MESSAGE']?$item['ERROR_MESSAGE']:'')){
                continue;
            }
            $skuInfo = self::_getPSkuBySellerSku($errorMsg[2],$errorMsg[0],$errorMsg[1]);
            if(!$skuInfo||empty($skuInfo['PSKU_ID'])){
                continue;
            }else{
                switch($item['TYPE']){
                    case 2:
                        $id = self::_matchOrderSellerSku($skuInfo,$item,$errorMsg[2]);
                        break;
                    case 5:
                        $id = self::_matchFulfillmentSellerSku($skuInfo,$item);
                        break;
                    default:
                        $id = 0;
                        break;
                }
                $id&&array_push($parseLogIds,$id);
            }
        }
        !empty($parseLogIds) && CAmazonParseLogs::updateAll(['MARK_STATUS'=>2],['ID'=>$parseLogIds]);
    }

    /**
     * 取需要解析的数据
     * @return array
     */
    private static function _getNeedMatchData(){
        return (new Query())->from('c_amazon_parselogs')
            ->select('ID,TYPE,TYPE_ID,ERROR_MESSAGE')
            ->where(['IN','TYPE',[2,5]])
            ->andWhere(['ERROR_TYPE'=>1,'MARK_STATUS'=>1])
            ->all();
    }

    /**
     * 匹配订单SKU
     * @param $skuInfo
     * @param $item
     * @param $sellerSku
     * @return int
     */
    private static function _matchOrderSellerSku($skuInfo,$item,$sellerSku){
        $flag = CAmazonOrder::updateAll(['PARSE_STATUS'=>1],['AMAZON_ORDER_ID'=>$item['TYPE_ID']]);
        $re = $flag&&CAmazonOrderDetail::updateAll(['PSKU_ID'=>$skuInfo['PSKU_ID']],['AMAZON_ORDER_ID'=>$item['TYPE_ID'],'SELLER_SKU'=>$sellerSku]);
        return $re?$item['ID']:0;
    }

    /**
     * 匹配Fba收发货SKU
     * @param $skuInfo
     * @param $item
     * @return int
     */
    private static function _matchFulfillmentSellerSku($skuInfo,$item){
        $re = FbaFulfillmentInventory::updateAll(['PSKU_ID'=>$skuInfo['PSKU_ID'],'STATUS'=>1],['ID'=>$item['TYPE_ID']]);
        return $re?$item['ID']:0;
    }

    /**
     * 匹配SKU
     * @param $sellerSku
     * @param $accountId
     * @param $orgId
     * @return mixed
     */
    private static function _getPSkuBySellerSku($sellerSku,$accountId,$orgId){
        return Yii::$app->rpc->create('product')->sendAndrecv([['\addons\master\product\modellogic\ProductskuLogic','getSkuInfoByPlatformSku'],[$sellerSku,$accountId,$orgId]]);
    }
}