#!/bin/bash
cd "$(dirname "$0")"

scp -P 2222 \
../deploy/docker-compose.app.stage.yml \
../deploy/docker-compose.infra.stage.yml \
../deploy/docker-compose.management.yml \
../deploy/docker-compose.infra.yml \
../deploy/docker-compose.app.yml \
user@dogappa.com:~/dogapp/deploy

ssh user@dogappa.com -p 2222 "
cd /home/user/dogapp/deploy &&
bash start_stage.sh"