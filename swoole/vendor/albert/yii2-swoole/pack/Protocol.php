<?php

namespace yii\swoole\pack;
/**
 * 协议swoole
 * @author xmc
 */
class Protocol implements IPack
{
    /**
     * 编码
     * @param string $module
     * @param string $interface
     * @param float $cost_time
     * @param int $success
     * @param int $code
     * @param string $msg
     * @return string
     */
    public static function encode($buffer, $server = null)
    {
        $string = json_encode($buffer);
        $packData = pack('N', strlen($string)) . $string;
        return $packData;
    }

    /**
     * 解码
     */
    public static function decode($buffer, $server = null)
    {
        $length = unpack('N', $buffer)[1];
        $string = substr($buffer, -$length);
        $data = json_decode($string, true);
        return $data;
    }
}