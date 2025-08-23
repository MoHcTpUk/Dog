#!/bin/bash
./build_backend.sh
./build_frontend.sh

docker push ghcr.io/mohctpuk/dog-backend:latest
docker push ghcr.io/mohctpuk/dog-frontend:latest