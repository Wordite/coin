#!/bin/bash
# Automatic Vault unseal script
# This script checks if Vault is sealed and unseals it if necessary
# Should be run via cron every 3 minutes

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Log file
LOG_FILE="${LOG_FILE:-/var/log/vault-auto-unseal.log}"
PROJECT_PATH="${PROJECT_PATH:-/home/coin}"

# Function to log messages
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Function to check if Vault container is running
check_vault_container() {
    if ! docker ps --format '{{.Names}}' | grep -q "^vault$"; then
        log "${RED}❌ Vault container is not running${NC}"
        return 1
    fi
    return 0
}

# Function to check Vault seal status
check_vault_seal_status() {
    local status_output
    status_output=$(docker exec vault vault status -address=http://127.0.0.1:8201 2>&1 || echo "ERROR")
    
    if echo "$status_output" | grep -q "Sealed.*true"; then
        return 1  # Vault is sealed
    elif echo "$status_output" | grep -q "Sealed.*false"; then
        return 0  # Vault is unsealed
    else
        log "${YELLOW}⚠️  Could not determine Vault seal status${NC}"
        return 2  # Unknown status
    fi
}

# Function to unseal Vault
unseal_vault() {
    log "${YELLOW}🔓 Attempting to unseal Vault...${NC}"
    
    # Load unseal keys from .env.prod file
    if [ ! -f "$PROJECT_PATH/.env.prod" ]; then
        log "${RED}❌ .env.prod file not found at $PROJECT_PATH/.env.prod${NC}"
        return 1
    fi
    
    # Source the .env.prod file to get unseal keys
    # We'll use a safe method to extract values
    VAULT_UNSEAL_KEY_1=$(grep "^VAULT_UNSEAL_KEY_1=" "$PROJECT_PATH/.env.prod" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
    VAULT_UNSEAL_KEY_2=$(grep "^VAULT_UNSEAL_KEY_2=" "$PROJECT_PATH/.env.prod" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
    VAULT_UNSEAL_KEY_3=$(grep "^VAULT_UNSEAL_KEY_3=" "$PROJECT_PATH/.env.prod" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
    
    if [ -z "$VAULT_UNSEAL_KEY_1" ] || [ -z "$VAULT_UNSEAL_KEY_2" ] || [ -z "$VAULT_UNSEAL_KEY_3" ]; then
        log "${RED}❌ Unseal keys not found in .env.prod file${NC}"
        return 1
    fi
    
    # Attempt to unseal with all three keys
    log "Unsealing with key 1..."
    docker exec vault vault operator unseal -address=http://127.0.0.1:8201 "$VAULT_UNSEAL_KEY_1" >/dev/null 2>&1 || true
    
    log "Unsealing with key 2..."
    docker exec vault vault operator unseal -address=http://127.0.0.1:8201 "$VAULT_UNSEAL_KEY_2" >/dev/null 2>&1 || true
    
    log "Unsealing with key 3..."
    docker exec vault vault operator unseal -address=http://127.0.0.1:8201 "$VAULT_UNSEAL_KEY_3" >/dev/null 2>&1 || true
    
    # Wait a moment for unseal to complete
    sleep 2
    
    # Verify unseal status
    if check_vault_seal_status; then
        log "${GREEN}✅ Vault successfully unsealed${NC}"
        
        # Setup secrets engines if needed
        VAULT_ROOT_TOKEN=$(grep "^VAULT_ROOT_TOKEN=" "$PROJECT_PATH/.env.prod" | cut -d'=' -f2- | tr -d '"' | tr -d "'")
        if [ -n "$VAULT_ROOT_TOKEN" ]; then
            log "Setting up Vault secrets engines..."
            docker exec vault vault login -address=http://127.0.0.1:8201 "$VAULT_ROOT_TOKEN" >/dev/null 2>&1 || true
            docker exec vault vault secrets enable -address=http://127.0.0.1:8201 -path=solana kv-v2 >/dev/null 2>&1 || log "Solana engine already exists or failed to enable"
        fi
        
        return 0
    else
        log "${RED}❌ Failed to unseal Vault${NC}"
        return 1
    fi
}

# Main execution
main() {
    log "🔍 Checking Vault status..."
    
    # Check if Vault container is running
    if ! check_vault_container; then
        log "${YELLOW}⚠️  Vault container is not running, skipping unseal check${NC}"
        exit 0
    fi
    
    # Check seal status
    if check_vault_seal_status; then
        log "${GREEN}✅ Vault is already unsealed${NC}"
        exit 0
    else
        log "${YELLOW}⚠️  Vault is sealed, attempting to unseal...${NC}"
        if unseal_vault; then
            exit 0
        else
            exit 1
        fi
    fi
}

# Run main function
main

