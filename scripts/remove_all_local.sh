#!/bin/bash

docker stack rm app
docker stack rm infra
docker stack rm management
docker swarm leave --force