<?php
namespace addons\tools\modellogic;

use addons\tools\models\ToFbaFeeRule;

/**
 * Created by PhpStorm.
 * User: Administrator
 * Date: 2017/4/18 0018
 * Time: 15:00
 */
class fbafeeLogic
{
    public static function fbaFee($post)
    {
        $feeList = array();
        //遍历 ToFbaFeeRule 表
        $mToFbaFeeRuleList = ToFbaFeeRule::find()->all();
        foreach ($mToFbaFeeRuleList as $key => $mToFbaFeeRule) {
            $mBarea = $mToFbaFeeRule->barea;
            if ($mBarea !== null) {
                $fbaFee = self::getAllFee($mBarea, $mToFbaFeeRule, $post);
                if (isset($fbaFee) && count($fbaFee) > 0) {
                    //$feeList = array_merge($feeList, [$mBarea->AREA_NAME_CN => $fbaFee]);
                    $feeList[] = $fbaFee;
                }
            }

        }
        return $feeList;
    }

    public static function getAllFee($mBarea, $mToFbaFeeRule, $post)
    {
        $feeArray = array();
        //长宽高单位转换
        $length = self::getUnitConversion($post['length'], 'cm', $mToFbaFeeRule->LENGTHUNIT);
        $width = self::getUnitConversion($post['width'], 'cm', $mToFbaFeeRule->LENGTHUNIT);
        $height = self::getUnitConversion($post['height'], 'cm', $mToFbaFeeRule->LENGTHUNIT);
        //重量单位转换
        $weight = self::getUnitConversion($post['weight'], 'g', $mToFbaFeeRule->WEIGHTUNIT);
        if ($mToFbaFeeRule->VOLWEIGHTPROP != 0) {
            //体积重
            $weightTemp = $length * $width * $height / $mToFbaFeeRule->VOLWEIGHTPROP;
            $weight = $weightTemp > $weight ? $weightTemp : $weight;
        }
        //对角线
        $diagonal = self::calculateCubeDiagonal($length, $width, $height);
        //长度+围度
        $lengthAddWMax = $length + ($width + $height) * 2;
        $feeArray = ['country' => $mBarea->AREA_NAME_CN];
        //FbaFee
        $fbaFeeArray = self::getFbaFee($mToFbaFeeRule, $length, $width, $height, $weight, $diagonal, $lengthAddWMax);
        if (isset($fbaFeeArray) && count($fbaFeeArray) > 0) {
            $feeArray = array_merge($feeArray, $fbaFeeArray);
        }
        //McfFee
        $mcfFeeArray = self::getMcfFee($mToFbaFeeRule, $length, $width, $height, $weight, $diagonal, $lengthAddWMax);
        if (isset($mcfFeeArray) && count($mcfFeeArray) > 0) {
            $feeArray = array_merge($feeArray, $mcfFeeArray);
        }
        //Monthly Inventory & Long-trim
        $mlFeeArray = self::getMlFee($mToFbaFeeRule, $length, $width, $height, $weight, $diagonal, $lengthAddWMax);
        if (isset($mlFeeArray) && count($mlFeeArray) > 0) {
            $feeArray = array_merge($feeArray, $mlFeeArray);
        }
        return $feeArray;
    }

    public static function getFbaFee($mToFbaFeeRule, $length, $width, $height, $weight, $diagonal, $lengthAddWMax)
    {
        $fbaFeeArray = array();
        $mToFbaFeeDetailList = $mToFbaFeeRule->to_fbafeedetail;
        foreach ($mToFbaFeeDetailList as $key => $mToFbaFeeDetail) {
            if (($mToFbaFeeDetail->LENGTHMAX == 0 || $length <= $mToFbaFeeDetail->LENGTHMAX)
                && ($mToFbaFeeDetail->WIDTHMAX == 0 || $width <= $mToFbaFeeDetail->WIDTHMAX)
                && ($mToFbaFeeDetail->HEIGHTMAX == 0 || $height <= $mToFbaFeeDetail->HEIGHTMAX)
                && ($mToFbaFeeDetail->LENGTHADDWMAX == 0 || $lengthAddWMax <= $mToFbaFeeDetail->LENGTHADDWMAX)
                && ($mToFbaFeeDetail->WEIGHTMAX == 0 || $weight <= $mToFbaFeeDetail->WEIGHTMAX - $mToFbaFeeDetail->PACKAGEWEIGHT)
                && ($mToFbaFeeDetail->DIAGONALMAX == 0 || $diagonal <= $mToFbaFeeDetail->DIAGONALMAX)
            ) {
                $overWeight = $weight + $mToFbaFeeDetail->PACKAGEWEIGHT - $mToFbaFeeDetail->YKG;
                $overWeight = $overWeight > 0 ? $overWeight : 0;
                $overWeight = ceil($overWeight / $mToFbaFeeDetail->OVERWEIGHTUNIT);
                $fee9 = round($mToFbaFeeDetail->YKGPRICE9 + $overWeight * $mToFbaFeeDetail->OVERWEIGHTPRICE9, 8);
                $fee10 = round($mToFbaFeeDetail->YKGPRICE10 + $overWeight * $mToFbaFeeDetail->OVERWEIGHTPRICE10, 8);
                $fbaFeeArray = array('FBA_PackageType' => $mToFbaFeeDetail->PACKAGETYPE, 'fee9' => $fee9, 'fee10' => $fee10);
                break;
            }
        }
        return $fbaFeeArray;
    }

    public static function getMcfFee($mToFbaFeeRule, $length, $width, $height, $weight, $diagonal, $lengthAddWMax)
    {
        $mcfFeeArray = array();
        $mToMcfFeeDetailList = $mToFbaFeeRule->to_mcffeedetail;
        foreach ($mToMcfFeeDetailList as $key => $mToMcfFeeDetail) {
            if (($mToMcfFeeDetail->LENGTHMAX == 0 || $length <= $mToMcfFeeDetail->LENGTHMAX)
                && ($mToMcfFeeDetail->WIDTHMAX == 0 || $width <= $mToMcfFeeDetail->WIDTHMAX)
                && ($mToMcfFeeDetail->HEIGHTMAX == 0 || $height <= $mToMcfFeeDetail->HEIGHTMAX)
                && ($mToMcfFeeDetail->LENGTHADDWMAX == 0 || $lengthAddWMax <= $mToMcfFeeDetail->LENGTHADDWMAX)
                && ($mToMcfFeeDetail->WEIGHTMAX == 0 || $weight <= $mToMcfFeeDetail->WEIGHTMAX - $mToMcfFeeDetail->PACKAGEWEIGHT)
                && ($mToMcfFeeDetail->DIAGONALMAX == 0 || $diagonal <= $mToMcfFeeDetail->DIAGONALMAX)
            ) {
                $overWeight = $weight + $mToMcfFeeDetail->PACKAGEWEIGHT - $mToMcfFeeDetail->YKG;
                $overWeight = $overWeight > 0 ? $overWeight : 0;
                $overWeight = ceil($overWeight / $mToMcfFeeDetail->OVERWEIGHTUNIT);
                $shipping = round($mToMcfFeeDetail->YKGPRICE_SHIP + $overWeight * $mToMcfFeeDetail->OVERWEIGHTPRICE_SHIP, 8);
                $expedited = round($mToMcfFeeDetail->YKGPRICE_EXP + $overWeight * $mToMcfFeeDetail->OVERWEIGHTPRICE_EXP, 8);
                $priority = round($mToMcfFeeDetail->YKGPRICE_PRI + $overWeight * $mToMcfFeeDetail->OVERWEIGHTPRICE_PRI, 8);
                $mcfFeeArray = array('MCF_PackageType' => $mToMcfFeeDetail->PACKAGETYPE, 'shipping' => $shipping, 'expedited' => $expedited, 'priority' => $priority);
                break;
            }
        }
        return $mcfFeeArray;
    }

    public static function getMlFee($mToFbaFeeRule, $length, $width, $height, $weight, $diagonal, $lengthAddWMax)
    {
        $mlFeeArray = array();
        $mToMstorageFeeDetailList = $mToFbaFeeRule->to_mstoragefeedetail;
        foreach ($mToMstorageFeeDetailList as $key => $mToMstorageFeeDetail) {
            if (($mToMstorageFeeDetail->LENGTHMAX == 0 || $length <= $mToMstorageFeeDetail->LENGTHMAX)
                && ($mToMstorageFeeDetail->WIDTHMAX == 0 || $width <= $mToMstorageFeeDetail->WIDTHMAX)
                && ($mToMstorageFeeDetail->HEIGHTMAX == 0 || $height <= $mToMstorageFeeDetail->HEIGHTMAX)
                && ($mToMstorageFeeDetail->LENGTHADDWMAX == 0 || $lengthAddWMax <= $mToMstorageFeeDetail->LENGTHADDWMAX)
                && ($mToMstorageFeeDetail->WEIGHTMAX == 0 || $weight <= $mToMstorageFeeDetail->WEIGHTMAX - $mToMstorageFeeDetail->PACKAGEWEIGHT)
                && ($mToMstorageFeeDetail->DIAGONALMAX == 0 || $diagonal <= $mToMstorageFeeDetail->DIAGONALMAX)
            ) {
                $volume = $length * $width * $height;
                //所有保留8位小数点
                $minventoryFee9 = round($mToMstorageFeeDetail->MINVENTORYFEE9 * $volume, 8);
                $minventoryFee10 = round($mToMstorageFeeDetail->MINVENTORYFEE10 * $volume, 8);
                $longtimeFee6 = round($mToMstorageFeeDetail->LONGTIMEFEE6 * $volume, 8);
                $longtimeFee12 = round($mToMstorageFeeDetail->LONGTIMEFEE12 * $volume, 8);
                $mlFeeArray = array('minventoryFee9' => $minventoryFee9, 'minventoryFee10' => $minventoryFee10,
                    'longtimeFee6' => $longtimeFee6, 'longtimeFee12' => $longtimeFee12);
                break;
            }
        }
        return $mlFeeArray;
    }

    //单位转换
    public static function getUnitConversion($num, $before, $after)
    {
        if ($num == 0) {
            return 0;
        } else if (strpos($before, 'cm') !== false && strpos($after, 'cm') !== false) {
            return $num;
        } else if (strpos($before, 'cm') !== false && strpos($after, 'in') !== false) {
            return $num / 2.54;
        } else if (strpos($before, 'lb') !== false && strpos($after, 'oz') !== false) {
            return $num * 453.59237 / 28.3495231;
        } else if (strpos($before, 'lb') !== false && strpos($after, 'lb') !== false) {
            return $num;
        } else if (strpos($before, 'g') !== false && strpos($after, 'lb') !== false) {
            return $num / 453.59237;
        } else if (strpos($before, 'g') !== false && strpos($after, 'g') !== false) {
            return $num;
        }
    }

    //计算对角线
    public static function calculateCubeDiagonal($length, $width, $height)
    {
        if ($length * $width * $height <= 0) {
            return 0.0;
        }
        return sqrt(pow($length, 2) + pow($width, 2) + pow($height, 2));
    }

}