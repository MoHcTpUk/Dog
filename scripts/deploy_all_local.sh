#!/bin/bash

if ! docker node ls &> /dev/null; then
    docker swarm init
fi

docker stack deploy --detach=false --compose-file ../deploy/docker-compose.management.yml management
docker stack deploy --detach=false --compose-file ../deploy/docker-compose.infra.yml infra
docker stack deploy --detach=false --compose-file ../deploy/docker-compose.app.yml app