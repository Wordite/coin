#!/bin/bash

# Скрипт для добавления CA сертификата в доверенные источники системы

CERT_DIR="../certs"
CA_CERT="$CERT_DIR/ca.crt"

if [ ! -f "$CA_CERT" ]; then
    echo "❌ CA certificate not found at $CA_CERT"
    echo "Please run the server first to generate certificates"
    exit 1
fi

echo "🔒 Adding CA certificate to system trust store..."

# Для Ubuntu/Debian систем
if command -v update-ca-certificates &> /dev/null; then
    echo "📋 Detected Ubuntu/Debian system"
    
    # Копируем CA сертификат в системную директорию
    sudo cp "$CA_CERT" /usr/local/share/ca-certificates/local-dev-ca.crt
    
    # Обновляем список доверенных сертификатов
    sudo update-ca-certificates
    
    echo "✅ CA certificate added to system trust store"
    echo "🔄 You may need to restart your browser"
else
    echo "⚠️  update-ca-certificates not found"
    echo "📋 Manual steps for Chrome:"
    echo "   1. Open Chrome and go to chrome://settings/certificates"
    echo "   2. Click 'Authorities' tab"
    echo "   3. Click 'Import' and select: $(realpath $CA_CERT)"
    echo "   4. Check 'Trust this certificate for identifying websites'"
    echo "   5. Restart Chrome"
fi

echo ""
echo "📋 Alternative method - Firefox:"
echo "   1. Open Firefox and go to about:preferences#privacy"
echo "   2. Scroll down to 'Certificates' and click 'View Certificates'"
echo "   3. Click 'Import' and select: $(realpath $CA_CERT)"
echo "   4. Check 'Trust this CA to identify websites'"
echo "   5. Restart Firefox"
