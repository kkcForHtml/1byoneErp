#!/bin/bash
# @author: laoyao
# @date: 2017-05-26



cd /data/wwwroot/default/swoole

echo ------------------------
echo 'stoping server...'
./stop.sh
echo 'stoped server'
echo ------------------------


while getopts "u " opt
do
    case $opt in
        u)
            echo 'updating code...'
            git checkout .
            git pull
            chmod 755 start.sh
            chmod 755 stop.sh
            chmod 755 update.sh
            cd vendor
            git checkout .
            git pull
            cd ../../frontends
            git checkout test
            git checkout .
            git pull
            echo 'updated code'
            echo ------------------------
            ;;
    esac
done

echo 'copying systemd files...'
cp -f /data/wwwroot/default/swoole/vendor/albert/yii2-swoole/systemd/* /etc/systemd/system/
systemctl --system daemon-reload
echo 'end copy'
echo ------------------------

#echo 'starting pool server...'
#service swoole-cppool start
#echo 'started pool server'
#echo ------------------------

echo 'starting websocket server...'
service swoole-websocket start
echo 'started websocket server'
echo ------------------------

cd /root

#echo 'starting tcp server...'
#service swoole-tcp start
#echo 'started tcp server'
#end of the file
