#!/bin/bash

docker stack rm app
docker stack rm infra
docker stack rm management
docker swarm leave --force
docker volume ls -q | xargs docker volume rm -f