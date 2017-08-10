<?php
/**
 * Created by PhpStorm.
 * User: Fable
 * Date: 2017/5/24
 * Time: 17:00
 */
namespace addons\tools\modellogic;

use Yii;
use addons\tools\models\IInventory;

use addons\tools\mws\FBAInventoryServiceMWS\FBAInventoryServiceMWS_Client;
use addons\tools\mws\FBAInventoryServiceMWS\Model\ListInventorySupplyRequest;
use addons\tools\mws\FBAInventoryServiceMWS\Model\ListInventorySupplyByNextTokenRequest;
use addons\tools\mws\FBAInventoryServiceMWS\Model\GetServiceStatusRequest;
use addons\tools\models\CAmazoninventory;
use addons\inventory\models\SkPendingDelivery;

use yii\swoole\rest\UpdateExt;


class XAmazoninventorylogic
{

    private static $date = '';

    private static $_config = array(
        'ServiceURL' => 'https://mws.amazonservices.com/FulfillmentInventory/',
        'ProxyHost' => null,
        'ProxyPort' => -1,
        'ProxyUsername' => null,
        'ProxyPassword' => null,
        'MaxErrorRetry' => 3,
    );


    /**
     * 获取库存
     */
    public static function getinventory($accounts = array())
    {
        set_time_limit(900);
        ini_set('memory_limit', '1024M');

        if(!$accounts){
            $accounts = Yii::$app->rpc->create('master')->sendAndrecv([['\addons\master\basics\modellogic\accountLogic', 'getAccountAll'], []]);
        }

        foreach ($accounts as $value) {
            if (self::checkAccount($value['MwsAKey']) && self::checkAccount($value['MwsAKey'])) {

                self::$date = date('Y-m-d');
                self::$_config['ServiceURL'] = $value['MURL'].'/FulfillmentInventory/'.self::$date;

                try {
                    self::checkApiStatus($value);
                } catch (\Exception $ex) {
                    continue;
                }

                $oc = new FBAInventoryServiceMWS_Client(
                    $value['MwsAKey'],
                    $value['MwsSKey'],
                    self::$_config,
                    '1byone',
                    '1.0.1');

                $request = new ListInventorySupplyRequest();
                $request->setSellerId($value['MERCHANTID']);
                $request->setMarketplaceId($value['MwsMP']);
//                $request->setSellerId('A26IMHULYH7PHY');
//                $request->setMarketplaceId('ATVPDKIKX0DER');
                $request->setQueryStartDateTime('2017-08-09T00:00:00');
                $parameters = $request->toQueryParameterArray();
                $parameters['Action'] = 'ListInventorySupply';
                try{
                    $XMLdata = $oc->requestExe($parameters);
                }catch (\Exception $ex) {
                    self::recordLog("异常错误:".$ex);
                    continue;
                }
                $data = self::xmlToArray($XMLdata);
                $response = self::_extractResponse($data, 'ListInventorySupplyResult', $value);
            } else {
                self::recordLog("异常错误:账号key错误，跳过进行下一个,异常账号: ACCOUNT".$value['ACCOUNT']."  ACCOUNT_ID:".$value['ACCOUNT_ID']);
                continue;
            }
        }

        //self::_xDataUpToDB();  //加入队列
        self::recordLog("抓取正常，进行解析数据...");
        //解析数据
        Yii::$app->rpc->create('amazon')->sendAndrecv([['\addons\amazon\modellogic\amazoninventoryLogic', 'ParsingData'], []]);
        self::recordLog('解析数据完成');
        echo "success";
    }

    /**
     * @param $xml
     * @return mixed
     * XML转数组形式
     */
    public static function xmlToArray($xml)
    {

        //禁止引用外部xml实体
        libxml_disable_entity_loader(true);

        $xmlstring = simplexml_load_string($xml, 'SimpleXMLElement', LIBXML_NOCDATA);

        $val = json_decode(json_encode($xmlstring), true);

        return $val;
    }

    /**
     * @param $data
     * @return array
     * 特殊处理返回数据的方法  写这里
     */
    private static function _extractResponse($data, $type, $account_info)
    {
        $members = $data[$type]['InventorySupplyList']['member'];
        $response = array();
        foreach ($members as $member) {
            $_member = array();
            //TODO
            $_member = $member;
            $response[] = $_member;
            unset($_member);
            unset($member);
        }
        //批量添加进数据库
        self::addTodb($response, $account_info);

        $nextToken = isset($data[$type]['NextToken']) ? $data[$type]['NextToken'] : null;
        if ($nextToken) {
            self::getInventoryByToken($nextToken, $account_info);
        }
        return $response;
    }

    /**
     * 把抓取的数据直接插入数据库
     */
    public static function addTodb($data, $account_info)
    {

        $addData = array();
        //拼接插入数据库数组
        foreach ($data as $value) {
            $row['DATA'] = json_encode($value);
            $row['ORGANISATION_ID'] = $account_info['ORGANISATION_ID'];
            $row['CHANNEL_ID'] = $account_info['CHANNEL_ID'];
            $row['ACCOUNT_ID'] = $account_info['ACCOUNT_ID'];
            $row['ADD_DATETIME'] = time();
            $addData[] = $row;
        }

        try {
            $connection = \Yii::$app->db;
            //数据批量入库
            $connection->createCommand()->batchInsert(
                'i_inventory',
                ['DATA','ORGANISATION_ID','CHANNEL_ID','ACCOUNT_ID','ADD_DATETIME'],//字段
                $addData
            )->execute();
        } catch (\Exception $ex) {
            throw $ex;
        }
    }

    /**
     * 通过nextToken获取更多数据
     */
    public static function getInventoryByToken($NextToken, $account_info)
    {
        set_time_limit(300);

        $oc = new FBAInventoryServiceMWS_Client(
            $account_info['MwsAKey'],
            $account_info['MwsSKey'],
            self::$_config,
            '1byone',
            '1.0.1');

        $request = new ListInventorySupplyByNextTokenRequest();
        $request->setSellerId($account_info['MERCHANTID']);
        $request->setNextToken($NextToken);

        //$response = $oc->listInventorySupplyByNextToken($request);
        $parameters = $request->toQueryParameterArray();
        $parameters['Action'] = 'ListInventorySupplyByNextToken';
        $XMLdata = $oc->requestExe($parameters);
        $data = self::xmlToArray($XMLdata);
        $response = self::_extractResponse($data, 'ListInventorySupplyByNextTokenResult', $account_info);
    }

    /**
     * 检测亚马逊库存接口是否可以访问
     */
    public static function checkApiStatus($data)
    {
        try {
            $oc = new FBAInventoryServiceMWS_Client(
                $data['MwsAKey'],
                $data['MwsSKey'],
                self::$_config,
                '1byone',
                '1.0.1');

            $request = new GetServiceStatusRequest();
            $request->setSellerId($data['MERCHANTID']);

            $parameters = $request->toQueryParameterArray();
            $parameters['Action'] = 'GetServiceStatus';
            $XMLdata = $oc->requestExe($parameters);
            $data = self::xmlToArray($XMLdata);

            if ($data['GetServiceStatusResult']['Status'] == 'YELLOW') {
                self::recordLog("网络状态:YELLOW。服务的错误率已超出正常水平，或运行过程中性能已降低。请稍后再试。");
                throw new \Exception("服务的错误率已超出正常水平，或运行过程中性能已降低。请稍后再试。");
            } elseif ($data['GetServiceStatusResult']['Status'] == "RED") {
                self::recordLog("网络状态:RED。服务的错误率已超出正常水平，或运行过程中性能已降低。请稍后再试。");
                throw new \Exception("服务不可用，或错误率已远远超出正常水平。请稍后再试");
            } else{
                self::recordLog("网络状态:GREEN。可进行拉取");
            }
        } catch (\Exception $ex) {
            throw $ex;
        }
    }

    /**
     * 解析库存数据
     */
    public static function ParsingData()
    {
        $data = (new Query())->from('i_inventory')
                ->where(['IS_PARING'=>0])
                ->all();

        $add_data = array();

        $ids = array();

        foreach ($data as $value) {

            $json = json_decode($value['DATA'], true);

            if (!isset($json['SellerSKU']))
                continue;

            $row['SELLER_SKU'] = $json['SellerSKU'];
            $row['ASIN'] = $json['ASIN'];
            $row['FNSKU'] = $json['FNSKU'];
            $row['ORGANISATION_ID'] = $value['ORGANISATION_ID'];
            $row['CHANNEL_ID'] = $value['CHANNEL_ID'];

            $condition = $row;
            $condition['status'] = 1;

            $check = (new Query())->from('c_amazon_inventory')
                ->select('ID')
                ->where($row)
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
        }

        if ($add_data) {
            $connection = \Yii::$app->db;
            //数据批量入库
            $connection->createCommand()->batchInsert(
                'c_amazon_inventory',
                ['SELLER_SKU', 'ASIN', 'FNSKU','ORGANISATION_ID','IN_STOCK_SUPPLY_QUANTITY','IN_STOCK_SUPPLY_QUANTITY', 'TOTAL_SUPPLY_QUANTITY', 'CONDITION', 'SUPPLY_DETAIL', 'EARLIEST_AVAILABILITY', 'CREATE_AT'],//字段
                $add_data
            )->execute();
        }

        IInventory::updateAll(array('IS_PARSING' => 1), array('INVENTORY_ID' => $ids));
        self::recorTxtLog('解析数据完成');
    }

    /**
     * addStorage
     * 批量修改状态
     * @param $data
     *
     * */
    public static function updateParsingData($data)
    {

        foreach ($data as $dispatchModel) {
            $post = Yii::$app->getRequest()->getBodyParams();
            Yii::$app->getRequest()->setBodyParams($dispatchModel);
            $result = UpdateExt::actionDo(new IInventory(), $dispatchModel);
            Yii::$app->getRequest()->setBodyParams($post);
        }

    }

    /**
     * 消息队列处理数据
     * @param $amazonOrderId
     * @param $orderItems
     * @param $nextToken
     */
    private static function _xDataUpToDB()
    {
        Yii::$app->queue->pushOn(['addons\tools\modellogic\XAmazoninventorylogic', 'ParsingData'], [], "queue_xAItems");
    }


    /**
     * 检测亚马逊账号是否是正确的
     */
    public static function checkAccount($account)
    {

        if (preg_match("/^[a-z\d]*$/i", $account) && strlen($account) > 6) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * 记录日志
     * @message
     */
    public static function recordLog($message = "")
    {
        /**
         * 匹配不到sku 写入日志
         */
        $data['TYPE'] = 4;
        $data['TYPE_ID'] = '';
        $data['ERROR_TYPE'] = 0;
        $data['ERROR_MESSAGE'] = $message;
        $data['MARK_STATUS'] = 0;
        $data['CREATE_AT'] = time();

        Yii::$app->db->createCommand()->insert('c_amazon_parselogs', $data)->execute();
    }

    /*
     * 暂时记录日志
     */
    public static function recorTxtLog($message){
        $data = "\r\n ========================================= \r\n";
        $data .= "\r\n".date('Y-m-d H:i:s').'  亚马逊库存拉取接口';
        $data .= "\r\n".$message;
        $data .= "\r\n========================================== \r\n";

        //$rs = file_put_contents('/data/wwwroot/default/swoole/addons/tools/controllers/go_amazon_inventory_log.txt', $data, FILE_APPEND);
        $rs = file_put_contents('go_amazon_inventory_log.txt', $data, FILE_APPEND);
    }
}