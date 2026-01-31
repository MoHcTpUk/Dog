#!/bin/bash

cd "$(dirname "$0")" || exit 1

if ! docker node ls &> /dev/null; then
    docker swarm init
fi

docker pull ghcr.io/mohctpuk/dog-telegram-bot:latest &
docker pull ghcr.io/mohctpuk/dog-landing:latest &
docker pull ghcr.io/mohctpuk/dog-frontend:latest &
docker pull ghcr.io/mohctpuk/dog-gateway:latest &
docker pull ghcr.io/mohctpuk/dog-users:latest &
docker pull ghcr.io/mohctpuk/dog-identity-webapi:latest &
docker pull ghcr.io/mohctpuk/dog-identity:latest &
wait

docker stack deploy --detach=false --resolve-image always --with-registry-auth --compose-file docker-compose.management.yml management
wait
docker stack deploy --detach=false --resolve-image always --with-registry-auth --compose-file docker-compose.infra.yml --compose-file docker-compose.infra.stage.yml infra
wait
docker stack deploy --detach=false --resolve-image always --with-registry-auth --compose-file docker-compose.app.yml --compose-file docker-compose.app.stage.yml app
wait