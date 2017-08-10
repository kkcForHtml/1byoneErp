<?php
namespace addons\tools\mws\MarketplaceWebServiceOrders\Model;
use addons\tools\mws\RequestModel;
class ListOrderItemsRequest extends RequestModel {

    public function __construct($data = null)
    {
        $this->_fields = array (
        'SellerId' => array('FieldValue' => null, 'FieldType' => 'string'),
        'MWSAuthToken' => array('FieldValue' => null, 'FieldType' => 'string'),
        'AmazonOrderId' => array('FieldValue' => null, 'FieldType' => 'string'),
        );
        parent::__construct($data);
    }

    /**
     * Get the value of the SellerId property.
     *
     * @return String SellerId.
     */
    public function getSellerId()
    {
        return $this->_fields['SellerId']['FieldValue'];
    }

    /**
     * Set the value of the SellerId property.
     * @param $value
     * @return $this
     */
    public function setSellerId($value)
    {
        $this->_fields['SellerId']['FieldValue'] = $value;
        return $this;
    }

    /**
     * Check to see if SellerId is set.
     *
     * @return true if SellerId is set.
     */
    public function isSetSellerId()
    {
        return !is_null($this->_fields['SellerId']['FieldValue']);
    }

    /**
     * Set the value of SellerId, return this.
     * @param $value
     * @return $this
     */
    public function withSellerId($value)
    {
        $this->setSellerId($value);
        return $this;
    }

    /**
     * Get the value of the MWSAuthToken property.
     *
     * @return String MWSAuthToken.
     */
    public function getMWSAuthToken()
    {
        return $this->_fields['MWSAuthToken']['FieldValue'];
    }

    /**
     * Set the value of the MWSAuthToken property.
     * @param $value
     * @return $this
     */
    public function setMWSAuthToken($value)
    {
        $this->_fields['MWSAuthToken']['FieldValue'] = $value;
        return $this;
    }

    /**
     * Check to see if MWSAuthToken is set.
     *
     * @return true if MWSAuthToken is set.
     */
    public function isSetMWSAuthToken()
    {
        return !is_null($this->_fields['MWSAuthToken']['FieldValue']);
    }

    /**
     * Set the value of MWSAuthToken, return this.
     * @param $value
     * @return $this
     */
    public function withMWSAuthToken($value)
    {
        $this->setMWSAuthToken($value);
        return $this;
    }

    /**
     * Get the value of the AmazonOrderId property.
     *
     * @return String AmazonOrderId.
     */
    public function getAmazonOrderId()
    {
        return $this->_fields['AmazonOrderId']['FieldValue'];
    }

    /**
     * Set the value of the AmazonOrderId property.
     * @param $value
     * @return $this
     */
    public function setAmazonOrderId($value)
    {
        $this->_fields['AmazonOrderId']['FieldValue'] = $value;
        return $this;
    }

    /**
     * Check to see if AmazonOrderId is set.
     *
     * @return true if AmazonOrderId is set.
     */
    public function isSetAmazonOrderId()
    {
        return !is_null($this->_fields['AmazonOrderId']['FieldValue']);
    }

    /**
     * Set the value of AmazonOrderId, return this.
     * @param $value
     * @return $this
     */
    public function withAmazonOrderId($value)
    {
        $this->setAmazonOrderId($value);
        return $this;
    }
}