<?php

namespace yii\queue\jobs;

use yii\queue\helpers\ArrayHelper;
use yii\queue\Job;
use yii\swoole\helpers\SerializeHelper;

/**
 * redis 列队任务处理类
 * User: tmy
 * Date: 2017-1-18
 * Time: 17:14
 */
class RedisJob extends Job
{

    public function getAttempts()
    {
        return ArrayHelper::get(SerializeHelper::unserialize($this->job), 'attempts');
    }

    public function getPayload()
    {
        return $this->job;
    }

    /**
     * Get the job identifier.
     *
     * @return string
     */
    public function getJobId()
    {
        return ArrayHelper::get(SerializeHelper::unserialize($this->job), 'id');
    }

    /**
     * Delete the job from the queue.
     *
     * @return void
     */
    public function delete()
    {
        parent::delete();
        $this->queueInstance->deleteReserved($this->queue, $this->job);
    }

    /**
     * 释放工作回到队列中
     *
     * @param  int $delay
     * @return void
     */
    public function release($delay = 0)
    {
        parent::release($delay);
        $this->delete();
        $this->queueInstance->retry($this->queue, $this->job, $delay, $this->getAttempts() + 1);
    }

}
