<?php
/**
 * Created by PhpStorm.
 * User: hm
 * Date: 2017/5/18
 * Time: 13:35
 */
namespace addons\tools\mws;
use DateTime;
use yii\httpclient\Exception;
abstract class RequestModel
{

    protected $_fields = array ();

    public function __construct($data = null)
    {
        if (!is_null($data)) {
            if ($this->_isAssociativeArray($data)) {
                $this->_fromAssociativeArray($data);
            } else {
                throw new Exception ("Unable to construct from provided data.");
            }
        }
    }

    public function __get($propertyName)
    {
        $getter = "get$propertyName";
        return $this->$getter();
    }

    public function __set($propertyName, $propertyValue)
    {
        $setter = "set$propertyName";
        $this->$setter($propertyValue);
        return $this;
    }

    private function _fromAssociativeArray(array $array)
    {
        foreach ($this->_fields as $fieldName => $field) {
            $fieldType = $field['FieldType'];
            if (is_array($fieldType)) {
                if (array_key_exists($fieldName, $array)) {
                    $elements = $array[$fieldName];
                    if (!$this->_isNumericArray($elements)) {
                        $elements =  array($elements);
                    }
                    if (count ($elements) >= 1) {
                        foreach ($elements as $element) {
                            $this->_fields[$fieldName]['FieldValue'][] = $element;
                        }
                    }
                }
            } else {
                if (array_key_exists($fieldName, $array)) {
                    $this->_fields[$fieldName]['FieldValue'] = $array[$fieldName];
                }
            }
        }
    }

    public function toQueryParameterArray()
    {
        return $this->_toQueryParameterArray("");
    }

    protected function _toQueryParameterArray($prefix)
    {
        $arr = array();
        foreach($this->_fields as $fieldName => $fieldAttr) {
            $fieldType = $fieldAttr['FieldType'];
            $fieldValue = $fieldAttr['FieldValue'];
            $newPrefix = $prefix . $fieldName . '.';
            $currentArr = $this->__toQueryParameterArray($newPrefix, $fieldType, $fieldValue, $fieldAttr);
            $arr = array_merge($arr, $currentArr);
        }
        return $arr;
    }

    private function __toQueryParameterArray($prefix, $fieldType, $fieldValue, $fieldAttr)
    {
        $arr = array();
        if(is_array($fieldType)) {
            if(isset($fieldAttr['ListMemberName'])) {
                $listMemberName = $fieldAttr['ListMemberName'];
                $itemPrefix = $prefix . $listMemberName . '.';
            } else {
                $itemPrefix = $prefix;
            }

            for($i = 1; $i <= count($fieldValue); $i++) {
                $indexedPrefix = $itemPrefix . $i . '.';
                $memberType = $fieldType[0];
                $arr = array_merge($arr,
                    $this->__toQueryParameterArray($indexedPrefix,
                        $memberType, $fieldValue[$i - 1], null));
            }

        } else {
            if ($fieldValue!==null && $fieldValue!=="") {
                if ($fieldType=='bool') {
                    $fieldValue = ($fieldValue)?'true':'false';
                }elseif ($fieldType=='DateTime') {
                    $fieldValue = $this->_getFormattedTimestamp($fieldValue);
                }
                $arr[rtrim($prefix, '.')] = $fieldValue;
            }
        }
        return $arr;
    }

    private function _isAssociativeArray($var)
    {
        return is_array($var) && array_keys($var) !== range(0, sizeof($var) - 1);
    }

    protected function _isNumericArray($var)
    {
        if (!is_array($var))
        {
            return false;
        }
        $sz = sizeof($var);
        return ($sz===0 || array_keys($var) === range(0, sizeof($var) - 1));
    }

    private function _getFormattedTimestamp($dateTime)
    {
        if (!is_object($dateTime)) {
            if (is_string($dateTime)) {
                $dateTime = new DateTime($dateTime);
            } else {
                throw new Exception ("Invalid date value.");
            }
        } else {
            if (!($dateTime instanceof DateTime)) {
                throw new Exception ("Invalid date value.");
            }
        }
        return $dateTime->format(DATE_ISO8601);
    }
}