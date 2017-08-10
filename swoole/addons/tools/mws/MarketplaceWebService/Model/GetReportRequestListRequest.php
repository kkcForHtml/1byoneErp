<?php
namespace addons\tools\mws\MarketplaceWebService\Model;
use addons\tools\mws\RequestModel;
class GetReportRequestListRequest extends RequestModel
{
    public function __construct($data = null)
    {
        $this->_fields = array (
        'Marketplace' => array('FieldValue' => null, 'FieldType' => 'string'),
        'Merchant' => array('FieldValue' => null, 'FieldType' => 'string'),
        'MWSAuthToken' => array('FieldValue' => null, 'FieldType' => 'string'),
        'ReportRequestIdList' => array('FieldValue' => array(), 'FieldType' => array('string'), 'ListMemberName' => 'Id'),
        'ReportTypeList' => array('FieldValue' => array(), 'FieldType' => array('string'), 'ListMemberName' => 'Type'),
        'ReportProcessingStatusList' => array('FieldValue' => array(), 'FieldType' => array('string'), 'ListMemberName' => 'Status'),
        'MaxCount' => array('FieldValue' => null, 'FieldType' => 'string'),
        'RequestedFromDate' => array('FieldValue' => null, 'FieldType' => 'DateTime'),
        'RequestedToDate' => array('FieldValue' => null, 'FieldType' => 'DateTime'),
        );
        parent::__construct($data);
    }

    /**
     * Gets the value of the Marketplace property.
     * 
     * @return string Marketplace
     */
    public function getMarketplace() 
    {
        return $this->_fields['Marketplace']['FieldValue'];
    }

    /**
     * Sets the value of the Marketplace property.
     * @param $value
     * @return $this
     */
    public function setMarketplace($value) 
    {
        $this->_fields['Marketplace']['FieldValue'] = $value;
        return $this;
    }

    /**
     * Sets the value of the Marketplace and returns this instance
     * @param $value
     * @return $this
     */
    public function withMarketplace($value)
    {
        $this->setMarketplace($value);
        return $this;
    }

    /**
     * Checks if Marketplace is set
     * 
     * @return bool true if Marketplace  is set
     */
    public function isSetMarketplace()
    {
        return !is_null($this->_fields['Marketplace']['FieldValue']);
    }

    /**
     * Gets the value of the Merchant property.
     * 
     * @return string Merchant
     */
    public function getMerchant() 
    {
        return $this->_fields['Merchant']['FieldValue'];
    }

    /**
     * Sets the value of the Merchant property.
     * @param $value
     * @return $this
     */
    public function setMerchant($value) 
    {
        $this->_fields['Merchant']['FieldValue'] = $value;
        return $this;
    }

    /**
     * Sets the value of the Merchant and returns this instance
     * @param $value
     * @return $this
     */
    public function withMerchant($value)
    {
        $this->setMerchant($value);
        return $this;
    }

    /**
     * Checks if Merchant is set
     * 
     * @return bool true if Merchant  is set
     */
    public function isSetMerchant()
    {
        return !is_null($this->_fields['Merchant']['FieldValue']);
    }

    /**
     * Gets the value of the MWSAuthToken property.
     *
     * @return string MWSAuthToken
     */
    public function getMWSAuthToken()
    {
        return $this->_fields['MWSAuthToken']['FieldValue'];
    }

    /**
     * Sets the value of the MWSAuthToken property.
     * @param $value
     * @return $this
     */
    public function setMWSAuthToken($value)
    {
        $this->_fields['MWSAuthToken']['FieldValue'] = $value;
        return $this;
    }

    /**
     * Sets the value of the MWSAuthToken and returns this instance
     * @param $value
     * @return $this
     */
    public function withMWSAuthToken($value)
    {
        $this->setMWSAuthToken($value);
        return $this;
    }

    /**
     * Checks if MWSAuthToken is set
     *
     * @return bool true if MWSAuthToken  is set
     */
    public function isSetMWSAuthToken()
    {
        return !is_null($this->_fields['MWSAuthToken']['FieldValue']);
    }

    /**
     * Gets the value of the ReportRequestIdList.
     * @return mixed
     */
    public function getReportRequestIdList() 
    {
        if ($this->_fields['ReportRequestIdList']['FieldValue'] == null)
        {
            $this->_fields['ReportRequestIdList']['FieldValue'] = array();
        }
        return $this->_fields['ReportRequestIdList']['FieldValue'];
    }

    /**
     * Sets the value of the ReportRequestIdList.
     * @param $value
     * @return $this
     */
    public function setReportRequestIdList($value) 
    {
        if (!$this->_isNumericArray($value)) {
            $value = array ($value);
        }
        $this->_fields['ReportRequestIdList']['FieldValue'] = $value;
        return $this;
    }

    /**
     * Sets the value of the ReportRequestIdList  and returns this instance
     * @param $value
     * @return $this
     */
    public function withReportRequestIdList($value)
    {
        foreach (func_get_args() as $ReportRequestIdList)
        {
            $this->_fields['ReportRequestIdList']['FieldValue'][] = $ReportRequestIdList;
        }
        return $this;
    }

    /**
     * Checks if ReportRequestIdList  is set
     * 
     * @return bool true if ReportRequestIdList property is set
     */
    public function isSetReportRequestIdList()
    {
        return !empty($this->_fields['ReportRequestIdList']['FieldValue']);

    }

    /**
     * Gets the value of the ReportTypeList.
     * @return mixed
     */
    public function getReportTypeList() 
    {
        if ($this->_fields['ReportTypeList']['FieldValue'] == null)
        {
            $this->_fields['ReportTypeList']['FieldValue'] = array();
        }
        return $this->_fields['ReportTypeList']['FieldValue'];
    }

    /**
     * Sets the value of the ReportTypeList.
     * @param $value
     * @return $this
     */
    public function setReportTypeList($value) 
    {
        if (!$this->_isNumericArray($value)) {
            $value = array ($value);
        }
        $this->_fields['ReportTypeList']['FieldValue'] = $value;
        return $this;
    }

    /**
     * Sets the value of the ReportTypeList  and returns this instance
     * @param $value
     * @return $this
     */
    public function withReportTypeList($value)
    {
        foreach (func_get_args() as $ReportTypeList)
        {
            $this->_fields['ReportTypeList']['FieldValue'][] = $ReportTypeList;
        }
        return $this;
    }

    /**
     * Checks if ReportTypeList  is set
     * 
     * @return bool true if ReportTypeList property is set
     */
    public function isSetReportTypeList()
    {
        return !empty($this->_fields['ReportTypeList']['FieldValue']);

    }

    /**
     * Gets the value of the ReportProcessingStatusList.
     * @return mixed
     */
    public function getReportProcessingStatusList() 
    {
        if ($this->_fields['ReportProcessingStatusList']['FieldValue'] == null)
        {
            $this->_fields['ReportProcessingStatusList']['FieldValue'] = array();
        }
        return $this->_fields['ReportProcessingStatusList']['FieldValue'];
    }

    /**
     * Sets the value of the ReportProcessingStatusList.
     * @param $value
     * @return $this
     */
    public function setReportProcessingStatusList($value) 
    {
        if (!$this->_isNumericArray($value)) {
            $value = array ($value);
        }
        $this->_fields['ReportProcessingStatusList']['FieldValue'] = $value;
        return $this;
    }

    /**
     * Sets the value of the ReportProcessingStatusList  and returns this instance
     * @param $value
     * @return $this
     */
    public function withReportProcessingStatusList($value)
    {
        foreach (func_get_args() as $ReportProcessingStatusList)
        {
            $this->_fields['ReportProcessingStatusList']['FieldValue'][] = $ReportProcessingStatusList;
        }
        return $this;
    }

    /**
     * Checks if ReportProcessingStatusList  is set
     * 
     * @return bool true if ReportProcessingStatusList property is set
     */
    public function isSetReportProcessingStatusList()
    {
        return !empty($this->_fields['ReportProcessingStatusList']['FieldValue']);
    }

    /**
     * Gets the value of the MaxCount property.
     * @return mixed
     */
    public function getMaxCount() 
    {
        return $this->_fields['MaxCount']['FieldValue'];
    }

    /**
     * Sets the value of the MaxCount property.
     * @param $value
     * @return $this
     */
    public function setMaxCount($value) 
    {
        $this->_fields['MaxCount']['FieldValue'] = $value;
        return $this;
    }

    /**
     * Sets the value of the MaxCount and returns this instance
     * @param $value
     * @return $this
     */
    public function withMaxCount($value)
    {
        $this->setMaxCount($value);
        return $this;
    }

    /**
     * Checks if MaxCount is set
     * 
     * @return bool true if MaxCount  is set
     */
    public function isSetMaxCount()
    {
        return !is_null($this->_fields['MaxCount']['FieldValue']);
    }

    /**
     * Gets the value of the RequestedFromDate property.
     * 
     * @return string RequestedFromDate
     */
    public function getRequestedFromDate() 
    {
        return $this->_fields['RequestedFromDate']['FieldValue'];
    }

    /**
     * Sets the value of the RequestedFromDate property.
     * @param $value
     * @return $this
     */
    public function setRequestedFromDate($value) 
    {
        $this->_fields['RequestedFromDate']['FieldValue'] = $value;
        return $this;
    }

    /**
     * Sets the value of the RequestedFromDate and returns this instance
     * @param $value
     * @return $this
     */
    public function withRequestedFromDate($value)
    {
        $this->setRequestedFromDate($value);
        return $this;
    }

    /**
     * Checks if RequestedFromDate is set
     * 
     * @return bool true if RequestedFromDate  is set
     */
    public function isSetRequestedFromDate()
    {
        return !is_null($this->_fields['RequestedFromDate']['FieldValue']);
    }

    /**
     * Gets the value of the RequestedToDate property.
     * 
     * @return string RequestedToDate
     */
    public function getRequestedToDate() 
    {
        return $this->_fields['RequestedToDate']['FieldValue'];
    }

    /**
     * Sets the value of the RequestedToDate property.
     * @param $value
     * @return $this
     */
    public function setRequestedToDate($value) 
    {
        $this->_fields['RequestedToDate']['FieldValue'] = $value;
        return $this;
    }

    /**
     * Sets the value of the RequestedToDate and returns this instance
     * @param $value
     * @return $this
     */
    public function withRequestedToDate($value)
    {
        $this->setRequestedToDate($value);
        return $this;
    }

    /**
     * Checks if RequestedToDate is set
     * 
     * @return bool true if RequestedToDate  is set
     */
    public function isSetRequestedToDate()
    {
        return !is_null($this->_fields['RequestedToDate']['FieldValue']);
    }
}