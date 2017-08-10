<?php
namespace addons\tools\mws\MarketplaceWebService\Model;
use addons\tools\mws\RequestModel;
class GetReportRequest extends RequestModel
{

    public function __construct($data = null)
    {
        $this->_fields = array (
        'Marketplace' => array('FieldValue' => null, 'FieldType' => 'string'),
        'Merchant' => array('FieldValue' => null, 'FieldType' => 'string'),
        'MWSAuthToken' => array('FieldValue' => null, 'FieldType' => 'string'),
        'ReportId' => array('FieldValue' => null, 'FieldType' => 'string'),
        'Report' => array('FieldValue' => null, 'FieldType' => 'string'),
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
     * Gets the value of the ReportId property.
     * 
     * @return string ReportId
     */
    public function getReportId() 
    {
        return $this->_fields['ReportId']['FieldValue'];
    }

    /**
     * Sets the value of the ReportId property.
     * @param $value
     * @return $this
     */
    public function setReportId($value) 
    {
        $this->_fields['ReportId']['FieldValue'] = $value;
        return $this;
    }

    /**
     * Sets the value of the ReportId and returns this instance
     * @param $value
     * @return $this
     */
    public function withReportId($value)
    {
        $this->setReportId($value);
        return $this;
    }

    /**
     * Checks if ReportId is set
     * 
     * @return bool true if ReportId  is set
     */
    public function isSetReportId()
    {
        return !is_null($this->_fields['ReportId']['FieldValue']);
    }

    /**
     * Gets the value of the Report property.
     * 
     * @return string Report
     */
    public function getReport() 
    {
        return $this->_fields['Report']['FieldValue'];
    }

    /**
     * Sets the value of the Report property.
     * @param $value
     * @return $this
     */
    public function setReport($value) 
    {
        $this->_fields['Report']['FieldValue'] = $value;
        return $this;
    }

    /**
     * Sets the value of the Report and returns this instance
     * @param $value
     * @return $this
     */
    public function withReport($value)
    {
        $this->setReport($value);
        return $this;
    }

    /**
     * Checks if Report is set
     * 
     * @return bool true if Report  is set
     */
    public function isSetReport()
    {
        return !is_null($this->_fields['Report']['FieldValue']);
    }
}