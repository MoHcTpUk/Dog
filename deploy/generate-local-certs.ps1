# PowerShell скрипт для генерации HTTPS сертификатов для локальной разработки

$ErrorActionPreference = "Stop"

$CERT_DIR = Join-Path $PSScriptRoot "certs"
if (-not (Test-Path $CERT_DIR)) {
    New-Item -ItemType Directory -Path $CERT_DIR | Out-Null
}

Write-Host "🔐 Генерация HTTPS сертификатов для локальной разработки..." -ForegroundColor Cyan

# Проверяем наличие mkcert
$mkcertPath = Get-Command mkcert -ErrorAction SilentlyContinue

if ($mkcertPath) {
    Write-Host "✅ mkcert найден, генерируем доверенные сертификаты..." -ForegroundColor Green
    
    # Устанавливаем локальный CA (если еще не установлен)
    Write-Host "📦 Установка локального CA в доверенные..." -ForegroundColor Yellow
    & mkcert -install
    
    # Генерируем сертификат для всех локальных доменов
    Push-Location $CERT_DIR
    
    Write-Host "🔑 Генерация сертификатов..." -ForegroundColor Yellow
    & mkcert `
        "*.dogappa.local" `
        "dogappa.local" `
        "app.dogappa.local" `
        "api.dogappa.local" `
        "auth.dogappa.local" `
        "localhost" `
        "127.0.0.1" `
        "::1"
    
    # Переименовываем файлы для удобства
    # mkcert создает файлы с именами вида _wildcard.dogappa.local+N.pem
    $certFiles = Get-ChildItem -Path $CERT_DIR -Filter "_wildcard.dogappa.local*.pem" | Where-Object { $_.Name -notlike "*-key.pem" }
    $keyFiles = Get-ChildItem -Path $CERT_DIR -Filter "_wildcard.dogappa.local*-key.pem"
    
    if ($certFiles.Count -gt 0 -and -not (Test-Path (Join-Path $CERT_DIR "cert.pem"))) {
        Move-Item -Path $certFiles[0].FullName -Destination (Join-Path $CERT_DIR "cert.pem") -Force
    }
    
    if ($keyFiles.Count -gt 0 -and -not (Test-Path (Join-Path $CERT_DIR "key.pem"))) {
        Move-Item -Path $keyFiles[0].FullName -Destination (Join-Path $CERT_DIR "key.pem") -Force
    }
    
    # Если все еще не найдены, ищем любые .pem файлы (fallback)
    if (-not (Test-Path (Join-Path $CERT_DIR "cert.pem"))) {
        $certFile = Get-ChildItem -Path $CERT_DIR -Filter "*.pem" | Where-Object { $_.Name -notlike "*-key.pem" } | Select-Object -First 1
        if ($certFile) {
            Move-Item -Path $certFile.FullName -Destination (Join-Path $CERT_DIR "cert.pem") -Force
        }
    }
    
    if (-not (Test-Path (Join-Path $CERT_DIR "key.pem"))) {
        $keyFile = Get-ChildItem -Path $CERT_DIR -Filter "*-key.pem" | Select-Object -First 1
        if ($keyFile) {
            Move-Item -Path $keyFile.FullName -Destination (Join-Path $CERT_DIR "key.pem") -Force
        }
    }
    
    Pop-Location
    
    Write-Host "✅ Сертификаты созданы с mkcert" -ForegroundColor Green
    Write-Host "   📄 Сертификат: $CERT_DIR\cert.pem" -ForegroundColor Gray
    Write-Host "   🔑 Ключ: $CERT_DIR\key.pem" -ForegroundColor Gray
    Write-Host ""
    Write-Host "✅ Браузер будет доверять этим сертификатам!" -ForegroundColor Green
    
} else {
    Write-Host "⚠️  mkcert не найден, генерируем самоподписанные сертификаты..." -ForegroundColor Yellow
    Write-Host "   (Браузер будет показывать предупреждение)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "💡 Для установки mkcert на Windows:" -ForegroundColor Cyan
    Write-Host "   1. Установите Chocolatey (если еще не установлен):" -ForegroundColor Gray
    Write-Host "      Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))" -ForegroundColor DarkGray
    Write-Host "   2. Установите mkcert:" -ForegroundColor Gray
    Write-Host "      choco install mkcert" -ForegroundColor DarkGray
    Write-Host "   3. Или скачайте с GitHub:" -ForegroundColor Gray
    Write-Host "      https://github.com/FiloSottile/mkcert/releases" -ForegroundColor DarkGray
    Write-Host ""
    
    Push-Location $CERT_DIR
    
    # Проверяем наличие openssl
    $opensslPath = Get-Command openssl -ErrorAction SilentlyContinue
    if (-not $opensslPath) {
        Write-Host "❌ openssl не найден. Установите OpenSSL или используйте mkcert." -ForegroundColor Red
        Write-Host "   Для установки OpenSSL через Chocolatey: choco install openssl" -ForegroundColor Gray
        Pop-Location
        exit 1
    }
    
    # Генерируем самоподписанный сертификат
    Write-Host "🔑 Генерация самоподписанных сертификатов..." -ForegroundColor Yellow
    & openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
        -keyout key.pem `
        -out cert.pem `
        -subj "/C=RU/ST=Local/L=Local/O=DogApp Dev/CN=*.dogappa.local" `
        -addext "subjectAltName=DNS:*.dogappa.local,DNS:dogappa.local,DNS:app.dogappa.local,DNS:api.dogappa.local,DNS:auth.dogappa.local,DNS:localhost,IP:127.0.0.1,IP:::1"
    
    Pop-Location
    
    Write-Host "✅ Самоподписанные сертификаты созданы" -ForegroundColor Green
    Write-Host "   📄 Сертификат: $CERT_DIR\cert.pem" -ForegroundColor Gray
    Write-Host "   🔑 Ключ: $CERT_DIR\key.pem" -ForegroundColor Gray
    Write-Host ""
    Write-Host "⚠️  Браузер покажет предупреждение - нажмите 'Продолжить' или 'Advanced > Proceed'" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Готово! Теперь можно запускать сервисы с HTTPS" -ForegroundColor Green
