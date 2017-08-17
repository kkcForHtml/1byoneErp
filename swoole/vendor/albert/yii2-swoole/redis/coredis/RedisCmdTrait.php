<?php

namespace yii\swoole\redis\coredis;

trait RedisCmdTrait
{
    public function BLPOP()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function BRPOP()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function BRPOPLPUSH()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function DBSIZE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function DECR()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function DECRBY()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function DEL()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function DISCARD()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function DUMP()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function ECHO ()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function EVAL()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function EVALSHA()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function EXEC()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function EXISTS()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function EXPIRE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function EXPIREAT()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function FLUSHALL()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function FLUSHDB()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function GET()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function GETBIT()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function GETRANGE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function GETSET()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function HDEL()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function HEXISTS()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function HGET()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function HGETALL()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function HINCRBY()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function HINCRBYFLOAT()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function HKEYS()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function HLEN()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function HMGET()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function HMSET()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function HSET()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function HSETNX()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function HVALS()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function INCR()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function INCRBY()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function INCRBYFLOAT()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function INFO()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function KEYS()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function LASTSAVE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function LINDEX()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function LINSERT()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function LLEN()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function LPOP()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function LPUSH()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function LPUSHX()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function LRANGE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function LREM()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function LSET()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function LTRIM()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function MGET()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function MIGRATE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function MONITOR()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function MOVE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function MSET()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function MSETNX()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function MULTI()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function OBJECT()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function PERSIST()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function PEXPIRE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function PEXPIREAT()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function PING()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function PSETEX()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function PSUBSCRIBE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function PTTL()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function PUBLISH()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function PUNSUBSCRIBE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function QUIT()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function RANDOMKEY()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function RENAME()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function RENAMENX()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function RESTORE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function RPOP()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function RPOPLPUSH()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function RPUSH()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function RPUSHX()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SADD()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SAVE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SCARD()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SDIFF()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SDIFFSTORE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SELECT()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SET()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SETBIT()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SETEX()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SETNX()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SETRANGE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SHUTDOWN()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SINTER()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SINTERSTORE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SISMEMBER()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SLAVEOF()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SLOWLOG()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SMEMBERS()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SMOVE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SORT()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SPOP()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SRANDMEMBER()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SREM()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function STRLEN()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SUBSCRIBE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SUNION()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SUNIONSTORE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SYNC()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function TIME()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function TTL()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function TYPE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function UNSUBSCRIBE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function UNWATCH()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function WATCH()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function ZADD()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function ZCARD()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function ZCOUNT()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function ZINCRBY()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function ZINTERSTORE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function ZRANGE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function ZRANGEBYSCORE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function ZRANK()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function ZREM()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function ZREMRANGEBYRANK()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function ZREMRANGEBYSCORE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function ZREVRANGE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function ZREVRANGEBYSCORE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function ZREVRANK()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function ZSCORE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function ZUNIONSTORE()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function GEOADD()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function GEODIST()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function GEOHASH()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function GEOPOS()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function GEORADIUS()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function GEORADIUSBYMEMBER()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function GETOPTION()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }

    public function SETOPTION()
    {
        $params = func_get_args();
        return $this->executeCommand(__FUNCTION__, $params);
    }
}