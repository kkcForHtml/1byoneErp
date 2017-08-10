#!/bin/bash
# @author: laoyao
# @date: 2017-05-26
echo 'stoping websocket server...'
service swoole-websocket stop
echo 'stoped websocket server'

echo 'stoping tcp server...'
service swoole-tcp stop
echo 'stoped tcp server'

echo 'stoping pool server...'
service swoole-cppool stop
echo 'started pool server'
#end of the file
