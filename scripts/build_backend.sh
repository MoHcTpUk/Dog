#!/bin/bash
cd "$(dirname "$0")"

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
  ../src/backend/Dog &

docker buildx build \
  --platform $PLATFORM \
  -f ../build/backend/Users.Dockerfile \
  -t ghcr.io/mohctpuk/dog-users:latest \
  --load \
  ../src/backend/Dog &

docker buildx build \
  --platform $PLATFORM \
  -f ../build/backend/Identity.Dockerfile \
  -t ghcr.io/mohctpuk/dog-identity:latest \
  --load \
  ../src/backend/Dog &

docker buildx build \
  --platform $PLATFORM \
  -f ../build/backend/Identity.WebApi.Dockerfile \
  -t ghcr.io/mohctpuk/dog-identity-webapi:latest \
  --load \
  ../src/backend/Dog &

docker buildx build \
  --platform $PLATFORM \
  -f ../build/backend/Dog.Dockerfile \
  -t ghcr.io/mohctpuk/dog-dog:latest \
  --push \
  ../src/backend/Dog &

docker buildx build \
  --platform $PLATFORM \
  -f ../build/backend/Owner.Dockerfile \
  -t ghcr.io/mohctpuk/dog-owner:latest \
  --push \
  ../src/backend/Dog &