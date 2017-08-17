<?php

namespace yii\swoole\web;

use Yii;
use yii\base\InvalidConfigException;
use yii\base\InvalidParamException;
use yii\helpers\Inflector;
use yii\helpers\StringHelper;
use yii\helpers\Url;
use yii\swoole\helpers\CoroHelper;
use yii\swoole\web\formatter\JsonResponseFormatter;
use yii\web\CookieCollection;
use yii\web\HeaderCollection;
use yii\web\RangeNotSatisfiableHttpException;
use yii\web\ResponseFormatterInterface;

class Response extends \yii\base\Response
{

    const EVENT_BEFORE_SEND = 'beforeSend';

    const EVENT_AFTER_SEND = 'afterSend';

    const EVENT_AFTER_PREPARE = 'afterPrepare';

    const FORMAT_RAW = 'raw';
    const FORMAT_HTML = 'html';
    const FORMAT_JSON = 'json';
    const FORMAT_JSONP = 'jsonp';
    const FORMAT_XML = 'xml';

    private $format = [];

    private $acceptMimeType;

    private $acceptParams = [];

    public $formatters = [];

    public static $httpStatuses = [
        100 => 'Continue',
        101 => 'Switching Protocols',
        102 => 'Processing',
        118 => 'Connection timed out',
        200 => 'OK',
        201 => 'Created',
        202 => 'Accepted',
        203 => 'Non-Authoritative',
        204 => 'No Content',
        205 => 'Reset Content',
        206 => 'Partial Content',
        207 => 'Multi-Status',
        208 => 'Already Reported',
        210 => 'Content Different',
        226 => 'IM Used',
        300 => 'Multiple Choices',
        301 => 'Moved Permanently',
        302 => 'Found',
        303 => 'See Other',
        304 => 'Not Modified',
        305 => 'Use Proxy',
        306 => 'Reserved',
        307 => 'Temporary Redirect',
        308 => 'Permanent Redirect',
        310 => 'Too many Redirect',
        400 => 'Bad Request',
        401 => 'Unauthorized',
        402 => 'Payment Required',
        403 => 'Forbidden',
        404 => 'Not Found',
        405 => 'Method Not Allowed',
        406 => 'Not Acceptable',
        407 => 'Proxy Authentication Required',
        408 => 'Request Time-out',
        409 => 'Conflict',
        410 => 'Gone',
        411 => 'Length Required',
        412 => 'Precondition Failed',
        413 => 'Request Entity Too Large',
        414 => 'Request-URI Too Long',
        415 => 'Unsupported Media Type',
        416 => 'Requested range unsatisfiable',
        417 => 'Expectation failed',
        418 => 'I\'m a teapot',
        421 => 'Misdirected Request',
        422 => 'Unprocessable entity',
        423 => 'Locked',
        424 => 'Method failure',
        425 => 'Unordered Collection',
        426 => 'Upgrade Required',
        428 => 'Precondition Required',
        429 => 'Too Many Requests',
        431 => 'Request Header Fields Too Large',
        449 => 'Retry With',
        450 => 'Blocked by Windows Parental Controls',
        451 => 'Unavailable For Legal Reasons',
        500 => 'Internal Server Error',
        501 => 'Not Implemented',
        502 => 'Bad Gateway or Proxy Error',
        503 => 'Service Unavailable',
        504 => 'Gateway Time-out',
        505 => 'HTTP Version not supported',
        507 => 'Insufficient storage',
        508 => 'Loop Detected',
        509 => 'Bandwidth Limit Exceeded',
        510 => 'Not Extended',
        511 => 'Network Authentication Required',
    ];

    private $_statusCode = [];

    private $_headers;

    private $_cookies;

    private $statusText = [];

    private $data = [];

    private $content = [];

    private $stream = [];

    private $isSent = [];

    public $charset;

    public $version;

    public function getFormat()
    {
        $id = CoroHelper::getId();
        return isset($this->format[$id]) ? $this->format[$id] : self::FORMAT_HTML;
    }

    public function setFormat($value)
    {
        $id = CoroHelper::getId();
        $this->format[$id] = $value;
    }

    public function getAcceptMimeType()
    {
        $id = CoroHelper::getId();
        return isset($this->acceptMimeType[$id]) ? $this->acceptMimeType[$id] : null;
    }

    public function setAcceptMimeType($value)
    {
        $id = CoroHelper::getId();
        $this->acceptMimeType[$id] = $value;
    }

    public function getAcceptParams()
    {
        $id = CoroHelper::getId();
        return isset($this->acceptParams[$id]) ? $this->acceptParams[$id] : null;
    }

    public function setAcceptParams($value)
    {
        $id = CoroHelper::getId();
        $this->acceptParams[$id] = $value;
    }

    public function getData()
    {
        $id = CoroHelper::getId();
        return isset($this->data[$id]) ? $this->data[$id] : null;
    }

    public function setData($value)
    {
        $id = CoroHelper::getId();
        $this->data[$id] = $value;
    }

    public function getContent()
    {
        $id = CoroHelper::getId();
        return isset($this->content[$id]) ? $this->content[$id] : null;
    }

    public function setContent($value)
    {
        $id = CoroHelper::getId();
        $this->content[$id] = $value;
    }

    public function getStream()
    {
        $id = CoroHelper::getId();
        return isset($this->stream[$id]) ? $this->stream[$id] : null;
    }

    public function setStream($value)
    {
        $id = CoroHelper::getId();
        $this->stream[$id] = $value;
    }

    public function getIsSent()
    {
        $id = CoroHelper::getId();
        return isset($this->isSent[$id]) ? $this->isSent[$id] : false;
    }

    public function setIsSent($value)
    {
        $id = CoroHelper::getId();
        $this->isSent[$id] = $value;
    }

    public function getstatusText()
    {
        $id = CoroHelper::getId();
        return isset($this->statusText[$id]) ? $this->statusText[$id] : 'OK';
    }

    public function setstatusText($value)
    {
        $id = CoroHelper::getId();
        $this->statusText[$id] = $value;
    }

    public function init()
    {
        if ($this->version === null) {
            if (isset($_SERVER['SERVER_PROTOCOL']) && $_SERVER['SERVER_PROTOCOL'] === 'HTTP/1.0') {
                $this->version = '1.0';
            } else {
                $this->version = '1.1';
            }
        }
        if ($this->charset === null) {
            $this->charset = \Yii::$app->charset;
        }
        $this->formatters = array_merge($this->defaultFormatters(), $this->formatters);
    }

    public function getStatusCode()
    {
        return $this->_statusCode[CoroHelper::getId()];
    }

    protected function defaultFormatters()
    {
        return [
            self::FORMAT_HTML => 'yii\web\HtmlResponseFormatter',
            self::FORMAT_XML => 'yii\web\XmlResponseFormatter',
            self::FORMAT_JSON => 'yii\web\JsonResponseFormatter',
            self::FORMAT_JSONP => [
                'class' => 'yii\web\JsonResponseFormatter',
                'useJsonp' => true,
            ],
        ];
    }

    public function setStatusCode($value, $text = null)
    {
        $id = CoroHelper::getId();
        if ($value === null) {
            $value = 200;
        }

        $this->_statusCode[$id] = (int)$value;
        if ($this->getIsInvalid()) {
            throw new InvalidParamException("The HTTP status code is invalid: $value");
        }
        if ($text === null) {
            $this->statusText[$id] = isset(static::$httpStatuses[$this->_statusCode[$id]]) ? static::$httpStatuses[$this->_statusCode[$id]] : '';
        } else {
            $this->statusText[$id] = $text;
        }
        return $this;
    }

    public function setStatusCodeByException($e)
    {
        if ($e instanceof Httpex) {
            $this->setStatusCode($e->statusCode);
        } else {
            $this->setStatusCode(500);
        }
        return $this;
    }

    public function clear()
    {
        $id = CoroHelper::getId();
        unset($this->_headers[$id]);
        unset($this->_cookies[$id]);
        unset($this->_statusCode[$id]);
        unset($this->statusText[$id]);
        unset($this->data[$id]);
        unset($this->stream[$id]);
        unset($this->content[$id]);
        unset($this->isSent[$id]);
    }

    public function getHeaders()
    {
        $id = CoroHelper::getId();
        if (!isset($this->_headers[$id])) {
            $this->_headers[$id] = new HeaderCollection;
        }
        return $this->_headers[$id];
    }

    public function send()
    {
        $id = CoroHelper::getId();
        if (isset($this->isSent[$id]) && $this->isSent[$id]) {
            return;
        }
        $this->trigger(self::EVENT_BEFORE_SEND);
        $this->prepare();
        $this->trigger(self::EVENT_AFTER_PREPARE);
        $this->sendHeaders();
        $this->sendContent();
        $this->trigger(self::EVENT_AFTER_SEND);
        $this->isSent[$id] = true;
    }

    protected function prepare()
    {
        $id = CoroHelper::getId();
        if (isset($this->stream[$id]) && $this->stream[$id] !== null) {
            return;
        }
        if (isset($this->formatters[$this->getFormat()])) {
            $formatter = $this->formatters[$this->getFormat()];
            if (!is_object($formatter)) {
                $this->formatters[$this->getFormat()] = $formatter = \Yii::createObject($formatter);
            }
            if ($formatter instanceof ResponseFormatterInterface) {
                $formatter->format($this);
            } else {
                throw new InvalidConfigException("The '" . $this->getFormat() . "' response formatter is invalid. It must implement the ResponseFormatterInterface.");
            }
        } elseif ($this->getFormat() === self::FORMAT_RAW) {
            if (isset($this->data[$id]) && $this->data[$id] !== null) {
                $this->content[$id] = $this->data[$id];
            }
        } else {
            throw new InvalidConfigException("Unsupported response format: " . $this->getFormat());
        }
        if (is_array($this->content[$id])) {
            throw new InvalidParamException("Response content must not be an array.");
        } elseif (is_object($this->content[$id])) {
            if (method_exists($this->content[$id], '__toString')) {
                $this->content[$id] = $this->content[$id]->__toString();
            } else {
                throw new InvalidParamException("Response content must be a string or an object implementing __toString().");
            }
        }
    }

    public function setDownloadHeaders($attachmentName, $mimeType = null, $inline = false, $contentLength = null)
    {
        $headers = $this->getHeaders();

        $disposition = $inline ? 'inline' : 'attachment';
        $headers->setDefault('Pragma', 'public')
            ->setDefault('Accept-Ranges', 'bytes')
            ->setDefault('Expires', '0')
            ->setDefault('Cache-Control', 'must-revalidate, post-check=0, pre-check=0')
            ->setDefault('Content-Disposition', $this->getDispositionHeaderValue($disposition, $attachmentName));

        if ($mimeType !== null) {
            $headers->setDefault('Content-Type', $mimeType);
        }

        if ($contentLength !== null) {
            $headers->setDefault('Content-Length', $contentLength);
        }

        return $this;
    }

    protected function getHttpRange($fileSize)
    {
        $id = CoroHelper::getId();
        if (!isset($_SERVER[$id]['HTTP_RANGE']) || $_SERVER[$id]['HTTP_RANGE'] === '-') {
            return [0, $fileSize - 1];
        }
        if (!preg_match('/^bytes=(\d*)-(\d*)$/', $_SERVER[$id]['HTTP_RANGE'], $matches)) {
            return false;
        }
        if ($matches[1] === '') {
            $start = $fileSize - $matches[2];
            $end = $fileSize - 1;
        } elseif ($matches[2] !== '') {
            $start = $matches[1];
            $end = $matches[2];
            if ($end >= $fileSize) {
                $end = $fileSize - 1;
            }
        } else {
            $start = $matches[1];
            $end = $fileSize - 1;
        }
        if ($start < 0 || $start > $end) {
            return false;
        } else {
            return [$start, $end];
        }
    }

    protected function sendHeaders()
    {
        $id = CoroHelper::getId();
        if (isset($this->isSent[$id]) && $this->isSent[$id]) {
            return;
        }
        $statusCode = $this->getStatusCode();
        Yii::$app->getSwooleServer()->currentSwooleResponse[$id]->status($statusCode);
        if ($this->_headers) {
            $headers = $this->getHeaders();
            foreach ($headers as $name => $values) {
                $name = str_replace(' ', '-', ucwords(str_replace('-', ' ', $name)));
                // set replace for first occurrence of header but false afterwards to allow multiple
                foreach ($values as $value) {
                    Yii::$app->getSwooleServer()->currentSwooleResponse[$id]->header($name, $value);
                }
            }
        }
        $this->sendCookies();
    }

    public function getCookies()
    {
        $id = CoroHelper::getId();
        if (!isset($this->_cookies[$id])) {
            $this->_cookies[$id] = new CookieCollection;
        }
        return $this->_cookies[$id];
    }

    protected function sendCookies()
    {
        $id = CoroHelper::getId();
        if (!isset($this->isSent[$id]) || $this->isSent[$id]) {
            return;
        }
        if (!isset($this->_cookies[$id])) {
            return;
        }
        $request = Yii::$app->getRequest();
        if ($request->enableCookieValidation) {
            if ($request->cookieValidationKey == '') {
                throw new InvalidConfigException(get_class($request) . '::cookieValidationKey must be configured with a secret key.');
            }
            $validationKey = $request->cookieValidationKey;
        }
        foreach ($this->getCookies() as $cookie) {
            $value = $cookie->value;
            if ($cookie->expire != 1 && isset($validationKey)) {
                $value = Yii::$app->getSecurity()->hashData(serialize([$cookie->name, $value]), $validationKey);
            }
            Yii::$app->getSwooleServer()->currentSwooleResponse[$id]->cookie($cookie->name, $value, $cookie->expire, $cookie->path, $cookie->domain, $cookie->secure, $cookie->httpOnly);
        }
    }

    protected function sendContent()
    {
        $id = CoroHelper::getId();
        if ($this->getStream() === null) {
            Yii::$app->getSwooleServer()->currentSwooleResponse[$id]->end($this->content[$id]);
            unset(Yii::$app->getSwooleServer()->currentSwooleResponse[$id]);
            return;
        }

        set_time_limit(0); // Reset time limit for big files
        $chunkSize = 2 * 1024 * 1024; // 2MB per chunk
        if (is_array($this->getStream())) {
            list ($handle, $begin, $end) = $this->getStream();
            fseek($handle, $begin);
            while (!feof($handle) && ($pos = ftell($handle)) <= $end) {
                if ($pos + $chunkSize > $end) {
                    $chunkSize = $end - $pos + 1;
                }
                Yii::$app->getSwooleServer()->currentSwooleResponse[$id]->write(fread($handle, $chunkSize));
            }
            fclose($handle);
            Yii::$app->getSwooleServer()->currentSwooleResponse[$id]->end();
        } else {
            while (!feof($this->getStream())) {
                Yii::$app->getSwooleServer()->currentSwooleResponse[$id]->write(fread($this->getStream(), $chunkSize));
            }
            fclose($this->getStream());
            Yii::$app->getSwooleServer()->currentSwooleResponse[$id]->end();
        }
    }

    public function sendFile($filePath, $attachmentName = null, $options = [])
    {
        $id = CoroHelper::getId();
        if (!isset($options['mimeType'])) {
            $options['mimeType'] = yii\helpers\FileHelper::getMimeTypeByExtension($filePath);
        }
        if ($attachmentName === null) {
            $attachmentName = basename($filePath);
        }
        Yii::$app->getSwooleServer()->currentSwooleResponse[$id]->header('Content-disposition', 'attachment; filename="' . urlencode($attachmentName) . '.xlsx"');
        Yii::$app->getSwooleServer()->currentSwooleResponse[$id]->header('Content-Type', $options['mimeType']);
        Yii::$app->getSwooleServer()->currentSwooleResponse[$id]->header('Content-Transfer-Encoding', 'binary');
        Yii::$app->getSwooleServer()->currentSwooleResponse[$id]->header('Cache-Control', 'must-revalidate');
        Yii::$app->getSwooleServer()->currentSwooleResponse[$id]->header('Pragma', 'public');
        Yii::$app->getSwooleServer()->currentSwooleResponse[$id]->sendfile($filePath);
    }

    public function xSendFile($filePath, $attachmentName = null, $options = [])
    {
        $this->sendFile($filePath, $attachmentName, $options);
    }

    protected function getDispositionHeaderValue($disposition, $attachmentName)
    {
        $fallbackName = str_replace('"', '\\"', str_replace(['%', '/', '\\'], '_', Inflector::transliterate($attachmentName, Inflector::TRANSLITERATE_LOOSE)));
        $utfName = rawurlencode(str_replace(['%', '/', '\\'], '', $attachmentName));

        $dispositionHeader = "{$disposition}; filename=\"{$fallbackName}\"";
        if ($utfName !== $fallbackName) {
            $dispositionHeader .= "; filename*=utf-8''{$utfName}";
        }
        return $dispositionHeader;
    }

    public function sendStreamAsFile($handle, $attachmentName, $options = [])
    {
        $id = CoroHelper::getId();
        $headers = $this->getHeaders();
        if (isset($options['fileSize'])) {
            $fileSize = $options['fileSize'];
        } else {
            fseek($handle, 0, SEEK_END);
            $fileSize = ftell($handle);
        }

        $range = $this->getHttpRange($fileSize);
        if ($range === false) {
            $headers->set('Content-Range', "bytes */$fileSize");
            throw new RangeNotSatisfiableHttpException();
        }

        list($begin, $end) = $range;
        if ($begin != 0 || $end != $fileSize - 1) {
            $this->setStatusCode(206);
            $headers->set('Content-Range', "bytes $begin-$end/$fileSize");
        } else {
            $this->setStatusCode(200);
        }

        $mimeType = isset($options['mimeType']) ? $options['mimeType'] : 'application/octet-stream';
        $this->setDownloadHeaders($attachmentName, $mimeType, !empty($options['inline']), $end - $begin + 1);

        $this->setFormat(self::FORMAT_RAW);
        $this->setStream([$handle, $begin, $end]);

        return $this;
    }

    public function sendContentAsFile($content, $attachmentName, $options = [])
    {
        $id = CoroHelper::getId();
        $headers = $this->getHeaders();

        $contentLength = StringHelper::byteLength($content);
        $range = $this->getHttpRange($contentLength);

        if ($range === false) {
            $headers->set('Content-Range', "bytes */$contentLength");
            throw new RangeNotSatisfiableHttpException();
        }

        list($begin, $end) = $range;
        if ($begin != 0 || $end != $contentLength - 1) {
            $this->setStatusCode(206);
            $headers->set('Content-Range', "bytes $begin-$end/$contentLength");
            $this->content[$id] = StringHelper::byteSubstr($content, $begin, $end - $begin + 1);
        } else {
            $this->setStatusCode(200);
            $this->content[$id] = $content;
        }

        $mimeType = isset($options['mimeType']) ? $options['mimeType'] : 'application/octet-stream';
        $this->setDownloadHeaders($attachmentName, $mimeType, !empty($options['inline']), $end - $begin + 1);

        $this->setFormat(self::FORMAT_RAW);

        return $this;
    }

    public function redirect($url, $statusCode = 302, $checkAjax = true)
    {
        if (is_array($url) && isset($url[0])) {
            // ensure the route is absolute
            $url[0] = '/' . ltrim($url[0], '/');
        }
        $url = Url::to($url);
        if (strpos($url, '/') === 0 && strpos($url, '//') !== 0) {
            $url = Yii::$app->getRequest()->getHostInfo() . $url;
        }

        if ($checkAjax) {
            if (Yii::$app->getRequest()->getIsAjax()) {
                if (Yii::$app->getRequest()->getHeaders()->get('X-Ie-Redirect-Compatibility') !== null && $statusCode === 302) {
                    // Ajax 302 redirect in IE does not work. Change status code to 200. See https://github.com/yiisoft/yii2/issues/9670
                    $statusCode = 200;
                }
                if (Yii::$app->getRequest()->getIsPjax()) {
                    $this->getHeaders()->set('X-Pjax-Url', $url);
                } else {
                    $this->getHeaders()->set('X-Redirect', $url);
                }
            } else {
                $this->getHeaders()->set('Location', $url);
            }
        } else {
            $this->getHeaders()->set('Location', $url);
        }

        $this->setStatusCode($statusCode);

        return $this;
    }

    public function refresh($anchor = '')
    {
        return $this->redirect(Yii::$app->getRequest()->getUrl() . $anchor);
    }

    /**
     * @return bool whether this response has a valid [[statusCode]].
     */
    public function getIsInvalid()
    {
        return $this->getStatusCode() < 100 || $this->getStatusCode() >= 600;
    }

    /**
     * @return bool whether this response is informational
     */
    public function getIsInformational()
    {
        return $this->getStatusCode() >= 100 && $this->getStatusCode() < 200;
    }

    /**
     * @return bool whether this response is successful
     */
    public function getIsSuccessful()
    {
        return $this->getStatusCode() >= 200 && $this->getStatusCode() < 300;
    }

    /**
     * @return bool whether this response is a redirection
     */
    public function getIsRedirection()
    {
        return $this->getStatusCode() >= 300 && $this->getStatusCode() < 400;
    }

    /**
     * @return bool whether this response indicates a client error
     */
    public function getIsClientError()
    {
        return $this->getStatusCode() >= 400 && $this->getStatusCode() < 500;
    }

    /**
     * @return bool whether this response indicates a server error
     */
    public function getIsServerError()
    {
        return $this->getStatusCode() >= 500 && $this->getStatusCode() < 600;
    }

    /**
     * @return bool whether this response is OK
     */
    public function getIsOk()
    {
        return $this->getStatusCode() == 200;
    }

    /**
     * @return bool whether this response indicates the current request is forbidden
     */
    public function getIsForbidden()
    {
        return $this->getStatusCode() == 403;
    }

    /**
     * @return bool whether this response indicates the currently requested resource is not found
     */
    public function getIsNotFound()
    {
        return $this->getStatusCode() == 404;
    }

    /**
     * @return bool whether this response is empty
     */
    public function getIsEmpty()
    {
        return in_array($this->getStatusCode(), [201, 204, 304]);
    }
}
