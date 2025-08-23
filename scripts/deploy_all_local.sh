#!/bin/bash

docker swarm init

docker stack deploy --compose-file ../deploy/docker-compose.management.yml management
docker stack deploy --compose-file ../deploy/docker-compose.infra.yml infra
docker stack deploy --compose-file ../deploy/docker-compose.app.yml app