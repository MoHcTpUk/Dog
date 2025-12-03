#!/bin/bash
if [ -n "$1" ]; then
  PLATFORMS="$1"
else
  PLATFORMS="linux/amd64,linux/arm64"
fi

docker buildx build \
  --platform $PLATFORMS \
  -f ../build/backend/Gateway.Dockerfile \
  -t ghcr.io/mohctpuk/dog-gateway:latest \
  --push \
  ../src/backend/Dog &

docker buildx build \
  --platform $PLATFORMS \
  -f ../build/backend/Users.Dockerfile \
  -t ghcr.io/mohctpuk/dog-users:latest \
  --push \
  ../src/backend/Dog &

docker buildx build \
  --platform $PLATFORMS \
  -f ../build/frontend/DogFrontend.Dockerfile \
  -t ghcr.io/mohctpuk/dog-frontend:latest \
  --push \
  ../src/frontend &

docker buildx build \
  --platform $PLATFORMS \
  -f ../build/landing/DogLanding.Dockerfile \
  -t ghcr.io/mohctpuk/dog-landing:latest \
  --push \
  ../src/landing &

  docker buildx build \
  --platform $PLATFORM \
  -f ../build/telegrambot/TelegramBot.Dockerfile \
  -t ghcr.io/mohctpuk/dog-telegram-bot:latest \
  --push \
  ../src/telegrambot &

wait
echo "All builds completed!"
