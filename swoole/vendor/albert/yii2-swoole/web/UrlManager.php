<?php
/**
 * Created by PhpStorm.
 * User: albert
 * Date: 17-7-28
 * Time: 下午4:11
 */

namespace yii\swoole\web;

use Yii;
use yii\base\InvalidConfigException;
use yii\caching\Cache;

class UrlManager extends \yii\web\UrlManager
{
    public function init()
    {
        if ($this->normalizer !== false) {
            $this->normalizer = Yii::createObject($this->normalizer);
            if (!$this->normalizer instanceof UrlNormalizer) {
                throw new InvalidConfigException('`' . get_class($this) . '::normalizer` should be an instance of `' . UrlNormalizer::className() . '` or its DI compatible configuration.');
            }
        }

        if (!$this->enablePrettyUrl || empty($this->rules)) {
            return;
        }
    }

    public function checkRules()
    {
        if (is_string($this->cache)) {
            $this->cache = Yii::$app->get($this->cache, false);
        }
        if ($this->cache instanceof Cache) {
            $cacheKey = $this->cacheKey;
            $hash = md5(json_encode($this->rules));
            if (($data = $this->cache->get($cacheKey)) !== false && isset($data[1]) && $data[1] === $hash) {
                $this->rules = $data[0];
            } else {
                $this->rules = $this->buildRules($this->rules);
                $this->cache->set($cacheKey, [$this->rules, $hash]);
            }
        } else {
            $this->rules = $this->buildRules($this->rules);
        }
    }
}