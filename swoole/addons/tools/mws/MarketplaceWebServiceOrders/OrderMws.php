<?php
/**
 * Created by PhpStorm.
 * User: hm
 * Date: 2017/5/18
 * Time: 13:35
 */
namespace addons\tools\mws\MarketplaceWebServiceOrders;
use addons\tools\mws\MarketplaceWebServiceOrders\Model\ListOrderItemsRequest;
use addons\tools\mws\MarketplaceWebServiceOrders\Model\ListOrderItemsByNextTokenRequest;
use addons\tools\mws\MarketplaceWebServiceOrders\Model\ListOrdersByNextTokenRequest;
use addons\tools\mws\MarketplaceWebServiceOrders\Model\ListOrdersRequest;
class OrderMws
{
    private static $_instance = null;

    private $_fields = ['SellerId',
                        'MWSAuthToken',
                        'CreatedAfter',
                        'CreatedBefore',
                        'LastUpdatedAfter',
                        'LastUpdatedBefore',
                        'OrderStatus',
                        'MarketplaceId',
                        'FulfillmentChannel',
                        'PaymentMethod',
                        'BuyerEmail',
                        'SellerOrderId',
                        'MaxResultsPerPage',
                        'TFMShipmentStatus',
                        'AmazonOrderId',
                        'NextToken'];

    public static function getInit(){
        if(!is_object(self::$_instance)){
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    public function listOrders($con = array())
    {
        $request = $this->_getRequest(new ListOrdersRequest(),$con);
        if (!($request instanceof ListOrdersRequest)) {
            $request = new ListOrdersRequest($request);
        }
        $parameters = $request->toQueryParameterArray();
        $parameters['Action'] = 'ListOrders';
        return $parameters;
    }

    public function listOrdersByNextToken($con = array())
    {
        $request = $this->_getRequest(new ListOrdersByNextTokenRequest(),$con);
        if (!($request instanceof ListOrdersByNextTokenRequest)) {
            $request = new ListOrdersByNextTokenRequest($request);
        }
        $parameters = $request->toQueryParameterArray();
        $parameters['Action'] = 'ListOrdersByNextToken';
        return $parameters;
    }

    public function listOrderItems($con = array())
    {
        $request = $this->_getRequest(new ListOrderItemsRequest(),$con);
        if (!($request instanceof ListOrderItemsRequest)) {
            $request = new ListOrderItemsRequest($request);
        }
        $parameters = $request->toQueryParameterArray();
        $parameters['Action'] = 'ListOrderItems';
        return $parameters;
    }

    public function listOrderItemsByNextToken($con = array())
    {
        $request = $this->_getRequest(new ListOrderItemsByNextTokenRequest(),$con);
        if (!($request instanceof ListOrderItemsByNextTokenRequest)) {
            $request = new ListOrderItemsByNextTokenRequest();
        }
        $parameters = $request->toQueryParameterArray();
        $parameters['Action'] = 'ListOrderItemsByNextToken';
        return $parameters;
    }

    private function _getRequest($request,$con = array()) {
        foreach($con as $k=>$v){
            if($k&&in_array($k,$this->_fields)){
                $setter = "set$k";
                $request->$setter($v);
            }
        }
        return $request;
    }
}