#!/bin/bash

docker stack deploy --compose-file ./docker-compose.management.yml management &&
docker stack deploy --compose-file ./docker-compose.infra.yml infra

if [ "$1" = "stage" ]; then
  docker stack deploy --compose-file ./docker-compose.app.yml --compose-file ./docker-compose.app.stage.yml app
else
  docker stack deploy --compose-file ./docker-compose.app.yml app
fi