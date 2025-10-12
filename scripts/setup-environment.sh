#!/bin/bash

# Environment Detection and Setup Script
# ===========================================
# This script detects the environment and sets up the correct configuration

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')] ERROR:${NC} $1"
}

warning() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')] WARNING:${NC} $1"
}

info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] INFO:${NC} $1"
}

# Function to detect environment
detect_environment() {
    local current_path=$(pwd)
    
    if [[ "$current_path" == "/home/coin"* ]]; then
        echo "production"
    elif [[ "$current_path" == "/home/wordite/projects/coin_presale"* ]]; then
        echo "development"
    else
        # Try to detect by checking if we're on a VPS
        if [[ -d "/home/coin" ]] && [[ ! -d "/home/wordite" ]]; then
            echo "production"
        else
            echo "development"
        fi
    fi
}

# Function to setup environment
setup_environment() {
    local env_type="$1"
    local env_file=""
    
    case "$env_type" in
        "production")
            env_file=".env.production"
            log "Setting up PRODUCTION environment"
            ;;
        "development")
            env_file=".env"
            log "Setting up DEVELOPMENT environment"
            ;;
        *)
            error "Unknown environment type: $env_type"
            return 1
            ;;
    esac
    
    if [ ! -f "$env_file" ]; then
        error "Environment file '$env_file' not found!"
        return 1
    fi
    
    # Copy environment file to .env.current
    cp "$env_file" ".env.current"
    log "Environment file copied: $env_file -> .env.current"
    
    # Export variables from .env.current
    set -a
    source ".env.current"
    set +a
    
    log "Environment variables loaded"
    
    # Show current configuration
    info "Current configuration:"
    echo "  Environment: $ENVIRONMENT"
    echo "  Project Path: $PROJECT_PATH"
    echo "  Backup Path: $BACKUP_PATH"
    echo "  Database: $POSTGRES_DB"
    echo "  Vault URL: $VAULT_URL"
    
    return 0
}

# Function to show usage
usage() {
    echo "Environment Detection and Setup Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  detect                 Detect current environment"
    echo "  setup                  Setup environment based on detection"
    echo "  setup-dev              Force setup development environment"
    echo "  setup-prod             Force setup production environment"
    echo "  show                   Show current environment variables"
    echo "  clean                  Clean temporary files"
    echo ""
    echo "Examples:"
    echo "  $0 detect"
    echo "  $0 setup"
    echo "  $0 setup-prod"
}

# Function to show current environment variables
show_environment() {
    if [ -f ".env.current" ]; then
        log "Current environment variables:"
        cat ".env.current" | grep -v "^#" | grep -v "^$" | sort
    else
        warning "No current environment file found. Run 'setup' first."
    fi
}

# Function to clean temporary files
clean_files() {
    log "Cleaning temporary files..."
    rm -f ".env.current"
    log "Temporary files cleaned"
}

# Main script logic
main() {
    case "${1:-setup}" in
        "detect")
            local detected_env=$(detect_environment)
            log "Detected environment: $detected_env"
            echo "Current path: $(pwd)"
            ;;
        "setup")
            local detected_env=$(detect_environment)
            log "Detected environment: $detected_env"
            setup_environment "$detected_env"
            ;;
        "setup-dev")
            setup_environment "development"
            ;;
        "setup-prod")
            setup_environment "production"
            ;;
        "show")
            show_environment
            ;;
        "clean")
            clean_files
            ;;
        *)
            usage
            ;;
    esac
}

# Run main function with all arguments
main "$@"
