#!/bin/bash

cd "$(dirname "$0")" || exit 1

if ! docker node ls &> /dev/null; then
    docker swarm init
fi

docker stack deploy --detach=false --compose-file docker-compose.management.yml management
docker stack deploy --detach=false --compose-file docker-compose.infra.yml --compose-file docker-compose.infra.local.yml infra
docker stack deploy --detach=false --compose-file docker-compose.app.yml app