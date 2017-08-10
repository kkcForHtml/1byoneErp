#!/bin/bash
# @author: laoyao
# @date: 2017-05-26

while getopts "u " opt
do
    case $opt in
        u)
            echo 'updating code...'
            cd /data/wwwroot/default/swoole
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
