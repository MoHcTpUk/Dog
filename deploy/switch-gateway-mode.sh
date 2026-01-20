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
    # Деактивировать файловую конфигурацию
    if [ -f "$CONFIG_ACTIVE" ]; then
        mv "$CONFIG_ACTIVE" "$CONFIG_DISABLED"
    fi
    
    # Проверить, запущен ли Docker сервис
    if ! docker service ls --format '{{.Name}}' | grep -q "^${GATEWAY_SERVICE}$"; then
        cd "$SCRIPT_DIR"
        docker stack deploy -c docker-compose.app.yml app
    fi
    
    echo "✅ Переключено на Docker режим"
}

switch_to_local() {
    # Активировать файловую конфигурацию
    if [ -f "$CONFIG_DISABLED" ]; then
        mv "$CONFIG_DISABLED" "$CONFIG_ACTIVE"
    elif [ ! -f "$CONFIG_ACTIVE" ]; then
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
          - url: "http://host.docker.internal:5115"
        passHostHeader: true
EOF
    fi
    
    # Остановить Docker сервис
    if docker service ls --format '{{.Name}}' | grep -q "^${GATEWAY_SERVICE}$"; then
        docker service rm "$GATEWAY_SERVICE" || true
    fi
    
    echo "✅ Переключено на локальный режим"
    echo "⚠️  Убедитесь, что локальный Gateway запущен:"
    echo "   cd src/backend/Dog/Gateways/Gateway.WebApi"
    echo "   dotnet run --urls=\"http://localhost:5115\""
}

show_status() {
    # Проверить Docker сервис
    if docker service ls --format '{{.Name}}' | grep -q "^${GATEWAY_SERVICE}$"; then
        echo "Docker сервис: ✅ Запущен"
    else
        echo "Docker сервис: ❌ Остановлен"
    fi
    
    # Проверить файловую конфигурацию
    if [ -f "$CONFIG_ACTIVE" ]; then
        echo "Локальная конфигурация: ✅ Активна"
    else
        echo "Локальная конфигурация: ❌ Неактивна"
    fi
    
    if [ -f "$CONFIG_ACTIVE" ] && docker service ls --format '{{.Name}}' | grep -q "^${GATEWAY_SERVICE}$"; then
        echo "⚠️  ВНИМАНИЕ: Оба режима активны одновременно!"
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
        show_usage
        ;;
    *)
        echo "❌ Неизвестный режим: $1"
        show_usage
        exit 1
        ;;
esac

