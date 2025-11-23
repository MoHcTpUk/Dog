#!/bin/bash
./build_backend.sh
./build_frontend.sh
./build_landing.sh

docker push ghcr.io/mohctpuk/dog-backend:latest
docker push ghcr.io/mohctpuk/dog-frontend:latest
docker push ghcr.io/mohctpuk/dog-landing:latest