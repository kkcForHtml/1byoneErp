<?php
/**
 * Created by PhpStorm.
 * User: hm
 * Date: 2017/5/18
 * Time: 13:35
 */
namespace addons\tools\mws\MWSFinancesService;
use addons\tools\mws\MWSFinancesService\Model\ListFinancialEventsByNextTokenRequest;
use addons\tools\mws\MWSFinancesService\Model\ListFinancialEventsRequest;
class FinancesMws
{
    private static $_instance = null;

    private $_fields = ['SellerId',
                        'MWSAuthToken',
                        'AmazonOrderId',
                        'FinancialEventGroupId',
                        'PostedAfter',
                        'PostedBefore',
                        'MaxResultsPerPage',
                        'NextToken'];

    public static function getInit(){
        if(!is_object(self::$_instance)){
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    public function listFinancialEvents($con = array())
    {
        $request = $this->_getRequest(new ListFinancialEventsRequest(),$con);
        if (!($request instanceof ListFinancialEventsRequest)) {
            $request = new ListFinancialEventsRequest($request);
        }
        $parameters = $request->toQueryParameterArray();
        $parameters['Action'] = 'ListFinancialEvents';
        return $parameters;
    }

    public function listFinancialEventsByNextToken($con = array())
    {
        $request = $this->_getRequest(new ListFinancialEventsByNextTokenRequest(),$con);
        if (!($request instanceof ListFinancialEventsByNextTokenRequest)) {
            $request = new ListFinancialEventsByNextTokenRequest($request);
        }
        $parameters = $request->toQueryParameterArray();
        $parameters['Action'] = 'ListFinancialEventsByNextToken';
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