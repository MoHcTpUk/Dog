#!/bin/bash

docker stack deploy --compose-file ./docker-compose.management.yml --resolve-image always --with-registry-auth management

if [ "$1" = "stage" ]; then
  docker stack deploy --compose-file ./docker-compose.infra.yml --compose-file ./docker-compose.infra.stage.yml --resolve-image always --with-registry-auth infra
  docker stack deploy --compose-file ./docker-compose.app.yml --compose-file ./docker-compose.app.stage.yml --resolve-image always --with-registry-auth app
else
  docker stack deploy --compose-file ./docker-compose.infra.yml --compose-file ./docker-compose.infra.local.yml --resolve-image always --with-registry-auth infra
  docker stack deploy --compose-file ./docker-compose.app.yml --resolve-image always --with-registry-auth app
fi