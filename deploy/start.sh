#!/bin/bash

docker stack deploy --compose-file ./docker-compose.management.yml management

if [ "$1" = "stage" ]; then
  docker stack deploy --compose-file ./docker-compose.infra.yml --compose-file ./docker-compose.infra.stage.yml infra
  docker stack deploy --compose-file ./docker-compose.app.yml --compose-file ./docker-compose.app.stage.yml app
else
  docker stack deploy --compose-file ./docker-compose.infra.yml --compose-file ./docker-compose.infra.local.yml infra
  docker stack deploy --compose-file ./docker-compose.app.yml app
fi