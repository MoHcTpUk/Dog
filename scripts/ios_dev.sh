#!/bin/bash

# Скрипт для разработки iOS приложения с hot reload
# Использование: ./scripts/ios_dev.sh [sync|run|sync:run|build:sync:run]

set -e

cd "$(dirname "$0")/../src/frontend" || exit 1

export LANG=en_US.UTF-8

case "$1" in
  open)
    echo "📱 Открытие проекта в Xcode..."
    npx cap open ios
    ;;
  sync)
    echo "🔄 Синхронизация iOS платформы..."
    npx cap sync ios
    ;;
  run)
    echo "🚀 Запуск приложения на устройстве..."
    npx cap run ios --target="00008110-001C791C3489401E"
    ;;
  sync:run)
    echo "🔄 Синхронизация и запуск..."
    npx cap sync ios && npx cap run ios --target="00008110-001C791C3489401E"
    ;;
  build:sync:run)
    echo "🔨 Сборка, синхронизация и запуск..."
    npm run build
    npx cap sync ios
    npx cap run ios --target="00008110-001C791C3489401E"
    ;;
  *)
    echo "Использование: $0 [open|sync|run|sync:run|build:sync:run]"
    echo ""
    echo "Команды:"
    echo "  open          - Открыть проект в Xcode (для настройки подписи)"
    echo "  sync          - Синхронизация iOS платформы"
    echo "  run           - Запуск приложения на устройстве"
    echo "  sync:run      - Синхронизация и запуск"
    echo "  build:sync:run - Полная пересборка, синхронизация и запуск"
    exit 1
    ;;
esac

