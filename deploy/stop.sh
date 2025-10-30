#!/bin/bash
docker stack rm app || true
docker stack rm infra || true
docker stack rm management || true
