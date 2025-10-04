#!/bin/bash

# Скрипт для управления Docker контейнерами проекта

set -e

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода сообщений
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Функция для проверки существования файла
check_file() {
    if [ ! -f "$1" ]; then
        error "Файл $1 не найден!"
        exit 1
    fi
}

# Функция для запуска в режиме разработки
dev() {
    log "Запуск в режиме разработки..."
    check_file "docker-compose.yml"
    docker compose up --build
}

# Функция для запуска в production режиме
prod() {
    log "Запуск в production режиме..."
    check_file "docker compose.prod.yml"
    docker compose -f docker compose.prod.yml up --build -d
}

# Функция для остановки контейнеров
stop() {
    log "Остановка контейнеров..."
    docker compose down
    if [ -f "docker compose.prod.yml" ]; then
        docker compose -f docker compose.prod.yml down
    fi
}

# Функция для очистки
clean() {
    log "Очистка Docker ресурсов..."
    docker compose down --volumes --remove-orphans
    if [ -f "docker compose.prod.yml" ]; then
        docker compose -f docker compose.prod.yml down --volumes --remove-orphans
    fi
    docker system prune -f
}

# Функция для просмотра логов
logs() {
    if [ -z "$1" ]; then
        log "Просмотр логов всех сервисов..."
        docker compose logs -f
    else
        log "Просмотр логов сервиса: $1"
        docker compose logs -f "$1"
    fi
}

# Функция для выполнения команд в контейнере
exec() {
    if [ -z "$1" ]; then
        error "Укажите сервис для выполнения команды"
        echo "Использование: $0 exec <service> <command>"
        exit 1
    fi
    
    SERVICE="$1"
    shift
    COMMAND="$@"
    
    if [ -z "$COMMAND" ]; then
        COMMAND="sh"
    fi
    
    log "Выполнение команды '$COMMAND' в сервисе '$SERVICE'..."
    docker compose exec "$SERVICE" $COMMAND
}

# Функция для импорта данных
import_data() {
    if [ ! -f "database_export.sql" ]; then
        error "Файл database_export.sql не найден!"
        exit 1
    fi
    
    log "Импорт данных в PostgreSQL..."
    docker compose exec postgres psql -U postgres -d mydb -f /tmp/database_export.sql
}

# Функция для экспорта данных
export_data() {
    log "Экспорт данных из PostgreSQL..."
    docker compose exec postgres pg_dump -U postgres -d mydb --data-only --inserts > database_export_$(date +%Y%m%d_%H%M%S).sql
    success "Данные экспортированы в database_export_$(date +%Y%m%d_%H%M%S).sql"
}

# Функция для показа статуса
status() {
    log "Статус контейнеров:"
    docker compose ps
}

# Функция для показа справки
help() {
    echo "Использование: $0 <команда>"
    echo ""
    echo "Команды:"
    echo "  dev          - Запуск в режиме разработки"
    echo "  prod         - Запуск в production режиме"
    echo "  stop         - Остановка всех контейнеров"
    echo "  clean        - Очистка Docker ресурсов"
    echo "  logs [service] - Просмотр логов (опционально указать сервис)"
    echo "  exec <service> [command] - Выполнение команды в контейнере"
    echo "  import-data  - Импорт данных из database_export.sql"
    echo "  export-data  - Экспорт данных в SQL файл"
    echo "  status       - Показать статус контейнеров"
    echo "  help         - Показать эту справку"
    echo ""
    echo "Примеры:"
    echo "  $0 dev                    # Запуск в режиме разработки"
    echo "  $0 logs backend           # Просмотр логов backend"
    echo "  $0 exec backend npm run seed  # Выполнение команды в backend"
}

# Основная логика
case "${1:-help}" in
    dev)
        dev
        ;;
    prod)
        prod
        ;;
    stop)
        stop
        ;;
    clean)
        clean
        ;;
    logs)
        logs "$2"
        ;;
    exec)
        exec "$2" "${@:3}"
        ;;
    import-data)
        import_data
        ;;
    export-data)
        export_data
        ;;
    status)
        status
        ;;
    help|--help|-h)
        help
        ;;
    *)
        error "Неизвестная команда: $1"
        help
        exit 1
        ;;
esac
