<?php
/**
 * Created by PhpStorm.
 * User: hm
 * Date: 2017/5/18
 * Time: 13:35
 */
namespace addons\tools\mws;
use Yii;
use yii\base\ErrorException;
use yii\httpclient\Exception;
use yii\httpclient\Client;
class RequestClient
{
    const APP_NAME = '1ByOne';
    const APP_VERSION = '1.0.1';

    private $_curlClient;

    private $_headerContents;

    private $_responseBodyContents;

    private $_awsAccessKeyId = null;

    private $_awsSecretAccessKey = null;
    
    private $_config = array ('UserAgent' => null,
                              'SignatureVersion' => 2,
                              'SignatureMethod' => 'HmacSHA256');

    public function __construct($awsAccessKeyId, $awsSecretAccessKey, $config = null)
    {
        $this->_awsAccessKeyId = $awsAccessKeyId;
        $this->_awsSecretAccessKey = $awsSecretAccessKey;
        if (!is_null($config)) $this->_config = array_merge($this->_config, $config);
        $this->constructUserAgentHeader();
    }

    /**
     * 设置请求标头User-Agent
     * @return bool
     */
    private function constructUserAgentHeader() {
        if (empty($this->_config['MWSClientVersion'])) {
            return false;
        }
        $userAgent =
            $this->quoteApplicationName(self::APP_NAME)
            . '/'
            . $this->quoteApplicationVersion(self::APP_VERSION);

        $userAgent .= ' (';
        $userAgent .= 'Language=PHP/' . phpversion();
        $userAgent .= '; ';
        $userAgent .= 'Platform=' . php_uname('s') . '/' . php_uname('m') . '/' . php_uname('r');
        $userAgent .= '; ';
        $userAgent .= 'MWSClientVersion=' . $this->_config['MWSClientVersion'];
        $userAgent .= ')';
        $this->_config['UserAgent'] = $userAgent;
    }

    /**
     * Collapse multiple whitespace characters into a single ' ' character.
     * @param $s
     * @return string
     */
    private function collapseWhitespace($s) {
        return preg_replace('/ {2,}|\s/', ' ', $s);
    }

    /**
     * Collapse multiple whitespace characters into a single ' ' and backslash escape '\',
     * and '/' characters from a string.
     * @param $s
     * @return string
     */
    private function quoteApplicationName($s) {
        $quotedString = $this->collapseWhitespace($s);
        $quotedString = preg_replace('/\\\\/', '\\\\\\\\', $quotedString);
        $quotedString = preg_replace('/\//', '\\/', $quotedString);

        return $quotedString;
    }

    /**
     * Collapse multiple whitespace characters into a single ' ' and backslash escape '\',
     * and '(' characters from a string.
     *
     * @param $s
     * @return string
     */
    private function quoteApplicationVersion($s) {
        $quotedString = $this->collapseWhitespace($s);
        $quotedString = preg_replace('/\\\\/', '\\\\\\\\', $quotedString);
        $quotedString = preg_replace('/\\(/', '\\(', $quotedString);

        return $quotedString;
    }

    /**
     * execute request
     * @param array $param
     * @param null  $fileName
     * @return mixed
     * @throws Exception
     */
    public function requestExe(array $param, $fileName= null)
    {
        try{
            $response = $this->_invoke($param,$fileName);
            if (isset($response['Status'])&&$response['Status'] == 200) {
                return $response['Body'];
            }else{
                throw new Exception(json_encode($response));
            }
        }catch(ErrorException $e){
            throw new Exception($e->getMessage());
        }catch(Exception $e){
            throw $e;
        }
    }

    // Private API ------------------------------------------------------------//

    /**
     * Invoke request and return response
     * @param array $parameters
     * @param null  $fileName
     * @return array|bool|mixed
     */
    private function _invoke(array $parameters,$fileName= null)
    {
        if (empty($this->_config['ServiceURL'])) {
            return false;
        }
        if (empty($this->_config['ServiceVersion'])) {
            return false;
        }
        $parameters = $this->_addRequiredParameters($parameters);
        return $fileName?$this->_curlPost($parameters,$fileName):$this->_httpPost($parameters);
    }

    /**
     * Add authentication related and version parameters
     * @param array $parameters
     * @return array|bool
     */
    private function _addRequiredParameters(array $parameters)
    {
        $parameters['AWSAccessKeyId'] = $this->_awsAccessKeyId;
        $parameters['Timestamp'] = $this->_getFormattedTimestamp();
        $parameters['Version'] = $this->_config['ServiceVersion'];
        $parameters['SignatureVersion'] = $this->_config['SignatureVersion'];
        if ($parameters['SignatureVersion'] > 1) {
            $parameters['SignatureMethod'] = $this->_config['SignatureMethod'];
        }
        $parameters['Signature'] = $this->_signParameters($parameters, $this->_awsSecretAccessKey);
        return $parameters;
    }

    private function _getFormattedTimestamp()
    {
        return gmdate("Y-m-d\TH:i:s.\\0\\0\\0\\Z", time());
    }

    private function _signParameters(array $parameters, $key) {
        $signatureVersion = $parameters['SignatureVersion'];
        $algorithm = "HmacSHA1";
        $stringToSign = null;
        if (2 == $signatureVersion) {
            $algorithm = $this->_config['SignatureMethod'];
            $parameters['SignatureMethod'] = $algorithm;
            $stringToSign = $this->_calculateStringToSignV2($parameters);
        } else {
            throw new Exception('Invalid Signature Version specified');
        }
        return $this->_sign($stringToSign, $key, $algorithm);
    }

    private function _sign($data, $key, $algorithm)
    {
        if ($algorithm === 'HmacSHA1') {
            $hash = 'sha1';
        } else if ($algorithm === 'HmacSHA256') {
            $hash = 'sha256';
        } else {
            throw new Exception ("Non-supported signing method specified");
        }
        return base64_encode(hash_hmac($hash, $data, $key, true));
    }

    private function _calculateStringToSignV2(array $parameters) {
        $parsedUrl = parse_url($this->_config['ServiceURL']);
        $data = 'POST';
        $data .= "\n";
        $data .= $parsedUrl['host'];
        $data .= "\n";
        $uri = array_key_exists('path', $parsedUrl) ? $parsedUrl['path'] : "/";
        $uriEncoded = implode("/", array_map(array($this, "_urlEncode"), explode("/", $uri)));
        $data .= $uriEncoded;
        $data .= "\n";
        uksort($parameters, 'strcmp');
        $data .= $this->_getParametersAsString($parameters);
        return $data;
    }

    /**
     * Convert parameters to Url encoded query string
     * @param array $parameters
     * @return string
     */
    private function _getParametersAsString(array $parameters)
    {
        $queryParameters = array();
        foreach ($parameters as $key => $value) {
            $queryParameters[] = $key . '=' . $this->_urlEncode($value);
        }
        return implode('&', $queryParameters);
    }

    private function _urlEncode($value) {
        return str_replace('%7E', '~', rawurlencode($value));
    }

    /**
     * HTTP post
     * @param array $parameters
     * @return array
     * @throws Exception
     */
    private function _httpPost(array $parameters)
    {
        $config = $this->_config;
        $allHeaders = array();
        $allHeaders['Content-Type'] = "application/x-www-form-urlencoded; charset=utf-8";
        $allHeaders['User-Agent'] = $config['UserAgent'];
        $allHeaders['Expect'] = null;
        try{
            $response = Yii::$app->httpclient
                ->post($config['ServiceURL'],$parameters, $allHeaders)
                ->setFormat(Client::FORMAT_URLENCODED)
                ->send();
            $status = $response->getStatusCode();
            $data = $response->getData();
            return ['Status'=>$status,'Body'=>$data];
        }catch(ErrorException $e){
            throw new Exception($e->getMessage());
        }catch(Exception $e){
            throw $e;
        }
    }

    private function _curlPost(array $parameters,$fileName)
    {
        //curlOpt
        $options = [CURLOPT_POST => true,
                    CURLOPT_USERAGENT => $this->_config['UserAgent'],
                    CURLOPT_VERBOSE => true,
                    CURLOPT_HEADERFUNCTION => array ($this, 'headerCallback'),
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_SSL_VERIFYPEER => false,
                    CURLOPT_FOLLOWLOCATION => true];
        //proxy
        if (!is_null($this->_config['ProxyHost'])) {
            $proxy = $this->_config['ProxyHost'];
            $proxy .= ':' . ($this->_config['ProxyPort'] == -1 ? '80' : $this->_config['ProxyPort']);
            $options[CURLOPT_PROXY] = $proxy;
        }
        $options[CURLOPT_URL] = $this->_config['ServiceURL'];
        $options[CURLOPT_POSTFIELDS] = $this->_getParametersAsString($parameters);
        $this->_responseBodyContents = @fopen($this->_getReportFilePath($fileName), 'w+');
        $options[CURLOPT_WRITEFUNCTION] = array ($this, 'responseCallback');

        $this->_curlClient = curl_init();
        curl_setopt_array($this->_curlClient, $options);
        $this->_headerContents = @fopen('php://memory', 'rw+');

        curl_exec($this->_curlClient);

        //header
        rewind($this->_headerContents);
        $header = stream_get_contents($this->_headerContents);
        $parsedHeader = $this->_parseHttpHeader($header);

        $code = (int) curl_getinfo($this->_curlClient, CURLINFO_HTTP_CODE);

        $flag = false;
        //verify data
        if ($code == 200) {
            $flag = $this->_verifyContentMd5($this->_getParsedHeader($parsedHeader,'Content-MD5'),$this->_responseBodyContents);
            if(!$flag){
                throw new Exception('ContentMD5 Does Not Match.');
            }
        }
        @fclose($this->_responseBodyContents);
        @fclose($this->_headerContents);
        curl_close($this->_curlClient);
        return ['Status'=>$code,'Body'=>$flag];
    }

    private function headerCallback($ch, $string) {
        return fwrite($this->_headerContents, $string);
    }

    private function responseCallback($ch, $string) {
        return fwrite($this->_responseBodyContents, $string);
    }

    /**
     * Md5 verify data transfer complete
     * @param $receivedMd5Hash
     * @param $streamHandle
     * @return bool
     */
    private function _verifyContentMd5($receivedMd5Hash, $streamHandle) {
        rewind($streamHandle);
        $expectedMd5Hash = $this->_getContentMd5($streamHandle);
        rewind($streamHandle);
        if (!($receivedMd5Hash === $expectedMd5Hash)) {
            return false;
        }
        return true;
    }

    /**
     * get Md5
     * @param $data
     * @return string
     */
    private function _getContentMd5($data) {
        $md5Hash = null;
        if (is_string($data)) {
            $md5Hash = md5($data, true);
        } else if (is_resource($data)) {
            $streamMetadata = stream_get_meta_data($data);
            if ($streamMetadata['stream_type'] === 'MEMORY' || $streamMetadata['stream_type'] === 'TEMP') {
                $md5Hash = md5(stream_get_contents($data), true);
            } else {
                $md5Hash = md5_file($streamMetadata['uri'], true);
            }
        }
        return base64_encode($md5Hash);
    }

    /**
     * Parse HTTP header information
     * @param $header
     * @return array
     */
    private function _parseHttpHeader($header) {
        $parsedHeader = array ();
        foreach (explode("\n", $header) as $line) {
            $splitLine = preg_split('/:\s/', $line, 2, PREG_SPLIT_NO_EMPTY);

            if (sizeof($splitLine) == 2) {
                $k = strtolower(trim($splitLine[0]));
                $v = trim($splitLine[1]);
                if (array_key_exists($k, $parsedHeader)) {
                    $parsedHeader[$k] = $parsedHeader[$k] . "," . $v;
                } else {
                    $parsedHeader[$k] = $v;
                }
            }
        }
        return $parsedHeader;
    }

    /**
     * get heard by key eg:Content-MD5
     * @param $parsedHeader
     * @param $key
     * @return mixed
     */
    private function _getParsedHeader($parsedHeader, $key) {
        return array_key_exists(strtolower($key),$parsedHeader)?$parsedHeader[strtolower($key)]:null;
    }

    /**
     * file path
     * @param $path
     * @return string
     */
    private function _getReportFilePath($path){
        $absolutePath =  dirname(__DIR__).DIRECTORY_SEPARATOR.'mws/MarketplaceWebService/Response'.DIRECTORY_SEPARATOR.$path;
        $fileName = basename($absolutePath);
        $pathDir = dirname($absolutePath);
        if(!is_dir($pathDir)){
            mkdir($pathDir,0777,true);
        }
        return $pathDir.DIRECTORY_SEPARATOR.$fileName;
    }
}