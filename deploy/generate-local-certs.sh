#!/bin/bash
set -e

CERT_DIR="$(dirname "$0")/certs"
mkdir -p "$CERT_DIR"

echo "🔐 Генерация HTTPS сертификатов для локальной разработки..."

# Проверяем наличие mkcert
if command -v mkcert &> /dev/null; then
    echo "✅ mkcert найден, генерируем доверенные сертификаты..."
    
    # Устанавливаем локальный CA (если еще не установлен)
    mkcert -install
    
    # Генерируем сертификат для всех локальных доменов
    cd "$CERT_DIR"
    mkcert \
        "*.dogappa.local" \
        "dogappa.local" \
        "app.dogappa.local" \
        "api.dogappa.local" \
        "auth.dogappa.local" \
        "localhost" \
        "127.0.0.1" \
        "::1"
    
    # Переименовываем файлы для удобства
    # mkcert создает файлы с именами вида _wildcard.dogappa.local+N.pem
    # где N - количество доменов. Находим и переименовываем автоматически
    if [ ! -f cert.pem ]; then
        CERT_FILE=$(ls -1 _wildcard.dogappa.local*.pem 2>/dev/null | grep -v key | head -1)
        [ -f "$CERT_FILE" ] && mv "$CERT_FILE" cert.pem
    fi
    if [ ! -f key.pem ]; then
        KEY_FILE=$(ls -1 _wildcard.dogappa.local*-key.pem 2>/dev/null | head -1)
        [ -f "$KEY_FILE" ] && mv "$KEY_FILE" key.pem
    fi
    
    # Если все еще не найдены, ищем любые .pem файлы (fallback)
    if [ ! -f cert.pem ]; then
        CERT_FILE=$(ls -1 *.pem 2>/dev/null | grep -v key | head -1)
        [ -f "$CERT_FILE" ] && mv "$CERT_FILE" cert.pem
    fi
    if [ ! -f key.pem ]; then
        KEY_FILE=$(ls -1 *-key.pem 2>/dev/null | head -1)
        [ -f "$KEY_FILE" ] && mv "$KEY_FILE" key.pem
    fi
    
    echo "✅ Сертификаты созданы с mkcert"
    echo "   📄 Сертификат: $CERT_DIR/cert.pem"
    echo "   🔑 Ключ: $CERT_DIR/key.pem"
    echo ""
    echo "✅ Браузер будет доверять этим сертификатам!"
    
else
    echo "⚠️  mkcert не найден, генерируем самоподписанные сертификаты..."
    echo "   (Браузер будет показывать предупреждение)"
    echo ""
    echo "💡 Для установки mkcert:"
    echo "   macOS:   brew install mkcert"
    echo "   Linux:   https://github.com/FiloSottile/mkcert#installation"
    echo ""
    
    cd "$CERT_DIR"
    
    # Генерируем самоподписанный сертификат
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout key.pem \
        -out cert.pem \
        -subj "/C=RU/ST=Local/L=Local/O=DogApp Dev/CN=*.dogappa.local" \
        -addext "subjectAltName=DNS:*.dogappa.local,DNS:dogappa.local,DNS:app.dogappa.local,DNS:api.dogappa.local,DNS:auth.dogappa.local,DNS:localhost,IP:127.0.0.1,IP:::1"
    
    echo "✅ Самоподписанные сертификаты созданы"
    echo "   📄 Сертификат: $CERT_DIR/cert.pem"
    echo "   🔑 Ключ: $CERT_DIR/key.pem"
    echo ""
    echo "⚠️  Браузер покажет предупреждение - нажмите 'Продолжить' или 'Advanced > Proceed'"
fi

echo ""
echo "🎉 Готово! Теперь можно запускать сервисы с HTTPS"

