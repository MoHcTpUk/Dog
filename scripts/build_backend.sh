#!/bin/bash
if [ -n "$1" ]; then
  PLATFORM="$1"
else
  ARCH=$(uname -m)
  if [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
    PLATFORM="linux/arm64"
  else
    PLATFORM="linux/amd64"
  fi
fi

docker buildx build \
  --platform $PLATFORM \
  -f ../build/backend/Gateway.Dockerfile \
  -t ghcr.io/mohctpuk/dog-gateway:latest \
  --load \
  ../src/backend/Dog

docker buildx build \
  --platform $PLATFORM \
  -f ../build/backend/Users.Dockerfile \
  -t ghcr.io/mohctpuk/dog-users:latest \
  --load \
  ../src/backend/Dog