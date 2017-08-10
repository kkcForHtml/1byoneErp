<?php
namespace addons\tools\mws\MarketplaceWebService\Model;
use addons\tools\mws\RequestModel;
class RequestReportRequest extends RequestModel
{

    public function __construct($data = null)
    {
        $this->_fields = array (
        'Marketplace' => array('FieldValue' => null, 'FieldType' => 'string'),
        'Merchant' => array('FieldValue' => null, 'FieldType' => 'string'),
        'MWSAuthToken' => array('FieldValue' => null, 'FieldType' => 'string'),
        'MarketplaceIdList' => array('FieldValue' => array(), 'FieldType' => array('string'), 'ListMemberName' => 'Id'),
        'ReportType' => array('FieldValue' => null, 'FieldType' => 'string'),
        'StartDate' => array('FieldValue' => null, 'FieldType' => 'DateTime'),
        'EndDate' => array('FieldValue' => null, 'FieldType' => 'DateTime'),
        'ReportOptions' => array('FieldValue' => null, 'FieldType' => 'string'),
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
     * Gets the value of the MarketplaceIdList.
     * @return mixed
     */
    public function getMarketplaceIdList() 
    {
        if ($this->_fields['MarketplaceIdList']['FieldValue'] == null)
        {
            $this->_fields['MarketplaceIdList']['FieldValue'] = array();
        }
        return $this->fields['MarketplaceIdList']['FieldValue'];
    }

    /**
     * Sets the value of the MarketplaceIdList.
     * @param $value
     * @return $this
     */
    public function setMarketplaceIdList($value) 
    {
        if (!$this->_isNumericArray($value)) {
            $value = array ($value);
        }
        $this->_fields['MarketplaceIdList']['FieldValue'] = $value;
        return $this;
    }

    /**
     * Sets the value of the MarketplaceIdList  and returns this instance
     * @param $value
     * @return $this
     */
    public function withMarketplaceIdList($value)
    {
        foreach (func_get_args() as $MarketplaceIdList)
        {
            $this->_fields['MarketplaceIdList']['FieldValue'][] = $MarketplaceIdList;
        }
        return $this;
    }

    /**
     * Checks if MarketplaceIdList  is set
     * 
     * @return bool true if MarketplaceIdList property is set
     */
    public function isSetMarketplaceIdList()
    {
        return !empty($this->_fields['MarketplaceIdList']['FieldValue']);
    }

    /**
     * Gets the value of the ReportType property.
     * 
     * @return string ReportType
     */
    public function getReportType() 
    {
        return $this->_fields['ReportType']['FieldValue'];
    }

    /**
     * Sets the value of the ReportType property.
     * @param $value
     * @return $this
     */
    public function setReportType($value) 
    {
        $this->_fields['ReportType']['FieldValue'] = $value;
        return $this;
    }

    /**
     * Sets the value of the ReportType and returns this instance
     * @param $value
     * @return $this
     */
    public function withReportType($value)
    {
        $this->setReportType($value);
        return $this;
    }

    /**
     * Checks if ReportType is set
     * 
     * @return bool true if ReportType  is set
     */
    public function isSetReportType()
    {
        return !is_null($this->_fields['ReportType']['FieldValue']);
    }

    /**
     * Gets the value of the StartDate property.
     * 
     * @return string StartDate
     */
    public function getStartDate() 
    {
        return $this->_fields['StartDate']['FieldValue'];
    }

    /**
     * Sets the value of the StartDate property.
     * @param $value
     * @return $this
     */
    public function setStartDate($value) 
    {
        $this->_fields['StartDate']['FieldValue'] = $value;
        return $this;
    }

    /**
     * Sets the value of the StartDate and returns this instance
     * @param $value
     * @return $this
     */
    public function withStartDate($value)
    {
        $this->setStartDate($value);
        return $this;
    }

    /**
     * Checks if StartDate is set
     * 
     * @return bool true if StartDate  is set
     */
    public function isSetStartDate()
    {
        return !is_null($this->_fields['StartDate']['FieldValue']);
    }

    /**
     * Gets the value of the EndDate property.
     * 
     * @return string EndDate
     */
    public function getEndDate() 
    {
        return $this->_fields['EndDate']['FieldValue'];
    }

    /**
     * Sets the value of the EndDate property.
     * @param $value
     * @return $this
     */
    public function setEndDate($value) 
    {
        $this->_fields['EndDate']['FieldValue'] = $value;
        return $this;
    }

    /**
     * Sets the value of the EndDate and returns this instance
     * @param $value
     * @return $this
     */
    public function withEndDate($value)
    {
        $this->setEndDate($value);
        return $this;
    }

    /**
     * Checks if EndDate is set
     * 
     * @return bool true if EndDate  is set
     */
    public function isSetEndDate()
    {
        return !is_null($this->_fields['EndDate']['FieldValue']);
    }

    /**
     * Gets the value of the ReportOptions property.
     * 
     * @return string ReportOptions
     */
    public function getReportOptions() 
    {
        return $this->_fields['ReportOptions']['FieldValue'];
    }

    /**
     * Sets the value of the ReportOptions property.
     * @param $value
     * @return $this
     */
    public function setReportOptions($value) 
    {
        $this->_fields['ReportOptions']['FieldValue'] = $value;
        return $this;
    }

    /**
     * Sets the value of the ReportOptions and returns this instance
     * @param $value
     * @return $this
     */
    public function withReportOptions($value)
    {
        $this->setReportOptions($value);
        return $this;
    }

    /**
     * Checks if ReportOptions is set
     * 
     * @return bool true if ReportOptions  is set
     */
    public function isSetReportOptions()
    {
        return !is_null($this->_fields['ReportOptions']['FieldValue']);
    }
}