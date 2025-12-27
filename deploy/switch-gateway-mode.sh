#!/bin/bash

# Скрипт для переключения между Docker и локальным режимом Gateway

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CERTS_DIR="$SCRIPT_DIR/certs"
CONFIG_FILE="$CERTS_DIR/gateway-local.yml"
CONFIG_DISABLED="$CERTS_DIR/gateway-local.yml.disabled"
CONFIG_ACTIVE="$CERTS_DIR/gateway-local.yml"

GATEWAY_SERVICE="app_gateway"

show_usage() {
    echo "Использование: $0 [docker|local]"
    echo ""
    echo "Режимы:"
    echo "  docker  - Gateway работает в Docker контейнере (по умолчанию)"
    echo "  local   - Gateway работает локально на host.docker.internal:5000"
    echo ""
    echo "Примеры:"
    echo "  $0 docker    # Переключить на Docker режим"
    echo "  $0 local     # Переключить на локальный режим"
}

switch_to_docker() {
    echo "🔄 Переключение на Docker режим..."
    
    # Деактивировать файловую конфигурацию
    if [ -f "$CONFIG_ACTIVE" ]; then
        echo "  → Деактивация локальной конфигурации Traefik..."
        mv "$CONFIG_ACTIVE" "$CONFIG_DISABLED"
    fi
    
    # Проверить, запущен ли Docker сервис
    if docker service ls --format '{{.Name}}' | grep -q "^${GATEWAY_SERVICE}$"; then
        echo "  ✓ Docker сервис gateway уже запущен"
    else
        echo "  → Запуск Docker сервиса gateway..."
        cd "$SCRIPT_DIR"
        docker stack deploy -c docker-compose.app.yml app
        echo "  ✓ Docker сервис gateway запущен"
    fi
    
    echo ""
    echo "✅ Переключено на Docker режим"
    echo "   Gateway работает в Docker контейнере"
    echo "   Traefik автоматически обнаруживает его через Docker provider"
}

switch_to_local() {
    echo "🔄 Переключение на локальный режим..."
    
    # Активировать файловую конфигурацию
    if [ -f "$CONFIG_DISABLED" ]; then
        echo "  → Активация локальной конфигурации Traefik..."
        mv "$CONFIG_DISABLED" "$CONFIG_ACTIVE"
    elif [ ! -f "$CONFIG_ACTIVE" ]; then
        echo "  ⚠️  Файл конфигурации не найден. Создаю из шаблона..."
        cat > "$CONFIG_ACTIVE" << 'EOF'
http:
  routers:
    gateway-local:
      rule: "Host(`api.dogappa.local`)"
      entryPoints:
        - web
      middlewares:
        - gateway-redirect
      service: gateway-local-service
    gateway-local-secure:
      rule: "Host(`api.dogappa.local`)"
      entryPoints:
        - websecure
      tls: {}
      service: gateway-local-service
  middlewares:
    gateway-redirect:
      redirectScheme:
        scheme: https
        permanent: true
  services:
    gateway-local-service:
      loadBalancer:
        servers:
          - url: "http://host.docker.internal:5000"
        passHostHeader: true
EOF
        echo "  ✓ Файл конфигурации создан"
    else
        echo "  ✓ Локальная конфигурация уже активна"
    fi
    
    # Остановить Docker сервис
    if docker service ls --format '{{.Name}}' | grep -q "^${GATEWAY_SERVICE}$"; then
        echo "  → Остановка Docker сервиса gateway..."
        docker service rm "$GATEWAY_SERVICE" || true
        echo "  ✓ Docker сервис gateway остановлен"
    else
        echo "  ✓ Docker сервис gateway уже остановлен"
    fi
    
    echo ""
    echo "✅ Переключено на локальный режим"
    echo "   Gateway должен работать локально на порту 5000"
    echo "   Traefik проксирует запросы на host.docker.internal:5000"
    echo ""
    echo "⚠️  Убедитесь, что локальный Gateway запущен:"
    echo "   cd src/backend/Dog/Gateways/Gateway.WebApi"
    echo "   dotnet run --urls=\"http://localhost:5000\""
}

show_status() {
    echo "Текущий статус:"
    echo ""
    
    # Проверить Docker сервис
    if docker service ls --format '{{.Name}}' | grep -q "^${GATEWAY_SERVICE}$"; then
        echo "  Docker сервис:  ✅ Запущен"
    else
        echo "  Docker сервис:  ❌ Остановлен"
    fi
    
    # Проверить файловую конфигурацию
    if [ -f "$CONFIG_ACTIVE" ]; then
        echo "  Локальная конфигурация: ✅ Активна"
        PORT=$(grep -oP 'url: "http://host.docker.internal:\K[0-9]+' "$CONFIG_ACTIVE" || echo "5000")
        echo "  Порт локального Gateway: $PORT"
    else
        echo "  Локальная конфигурация: ❌ Неактивна"
    fi
    
    echo ""
    
    if [ -f "$CONFIG_ACTIVE" ] && docker service ls --format '{{.Name}}' | grep -q "^${GATEWAY_SERVICE}$"; then
        echo "⚠️  ВНИМАНИЕ: Оба режима активны одновременно! Это может вызвать конфликт."
        echo "   Используйте скрипт для переключения на один режим."
    fi
}

# Основная логика
case "${1:-}" in
    docker)
        switch_to_docker
        ;;
    local)
        switch_to_local
        ;;
    status)
        show_status
        ;;
    "")
        show_status
        echo ""
        show_usage
        ;;
    *)
        echo "❌ Неизвестный режим: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac

