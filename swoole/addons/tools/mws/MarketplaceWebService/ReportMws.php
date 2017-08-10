<?php
/**
 * Created by PhpStorm.
 * User: hm
 * Date: 2017/5/18
 * Time: 13:35
 */
namespace addons\tools\mws\MarketplaceWebService;
use addons\tools\mws\ExceptionLogs;
use addons\tools\mws\MarketplaceWebService\Model\GetReportListByNextTokenRequest;
use addons\tools\mws\MarketplaceWebService\Model\GetReportListRequest;
use addons\tools\mws\MarketplaceWebService\Model\GetReportRequest;
use addons\tools\mws\MarketplaceWebService\Model\GetReportRequestListByNextTokenRequest;
use addons\tools\mws\MarketplaceWebService\Model\GetReportRequestListRequest;
use addons\tools\mws\MarketplaceWebService\Model\RequestReportRequest;
class ReportMws
{
    private static $_instance = null;

    private $_fields = ['Marketplace',
                        'Merchant',
                        'MWSAuthToken',
                        'MarketplaceIdList',
                        'ReportType',
                        'StartDate',
                        'EndDate',
                        'ReportOptions',
                        'ReportTypeList',
                        'ReportProcessingStatusList',
                        'MaxCount',
                        'RequestedFromDate',
                        'RequestedToDate',
                        'NextToken',
                        'ReportId',
                        'Report',
                        'Acknowledged',
                        'AvailableFromDate',
                        'AvailableToDate',
                        'ReportRequestIdList'];

    public static function getInit(){
        if(!is_object(self::$_instance)){
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    //1
    public function requestReport($con = array())
    {
        $request = $this->_getRequest(new RequestReportRequest(),$con);
        if (!($request instanceof RequestReportRequest)) {
            $request = new RequestReportRequest($request);
        }
        $parameters = $request->toQueryParameterArray();
        $parameters['Action'] = 'RequestReport';
        return $parameters;
    }

    //2
    public function getReportRequestList($con = array())
    {
        $request = $this->_getRequest(new GetReportRequestListRequest(),$con);
        if (!$request instanceof GetReportRequestListRequest) {
            $request = new GetReportRequestListRequest($request);
        }
        $parameters = $request->toQueryParameterArray();
        $parameters['Action'] = 'GetReportRequestList';
        return $parameters;
    }

    public function getReportRequestListByNextToken($con = array())
    {
        $request = $this->_getRequest(new GetReportRequestListByNextTokenRequest(),$con);
        if (!$request instanceof GetReportRequestListByNextTokenRequest) {
            $request = new GetReportRequestListByNextTokenRequest($request);
        }
        $parameters = $request->toQueryParameterArray();
        $parameters['Action'] = 'GetReportRequestListByNextToken';
        return $parameters;
    }

    //2bak
    public function getReportList($con = array())
    {
        $request = $this->_getRequest(new GetReportListRequest(),$con);
        if (!$request instanceof GetReportListRequest) {
            $request = new GetReportListRequest($request);
        }
        $parameters = $request->toQueryParameterArray();
        $parameters['Action'] = 'GetReportList';
        return $parameters;
    }

    public function getReportListByNextToken($con = array())
    {
        $request = $this->_getRequest(new GetReportListByNextTokenRequest(),$con);
        if (!$request instanceof GetReportListByNextTokenRequest) {
            $request = new GetReportListByNextTokenRequest($request);
        }
        $parameters = $request->toQueryParameterArray();
        $parameters['Action'] = 'GetReportListByNextToken';
        return $parameters;
    }

    //3
    public function getReport($con = array())
    {
        $request = $this->_getRequest(new GetReportRequest(),$con);
        if (!$request instanceof GetReportRequest) {
            $request = new GetReportRequest($request);
        }
        $parameters = $request->toQueryParameterArray();
        $parameters['Action'] = 'GetReport';
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
