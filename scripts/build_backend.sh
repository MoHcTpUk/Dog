#!/bin/bash
docker build -f ../build/backend/Gateway.Dockerfile -t ghcr.io/mohctpuk/dog-gateway:latest ../src/backend/Dog
docker build -f ../build/backend/Users.Dockerfile -t ghcr.io/mohctpuk/dog-users:latest ../src/backend/Dog