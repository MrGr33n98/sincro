#!/bin/bash

# ═══════════════════════════════════════════════════════════════════
# Sincronia — Database Backup Script
# Backup PostgreSQL para S3/DigitalOcean Spaces
# ═══════════════════════════════════════════════════════════════════

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/tmp/sincronia_backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
S3_BUCKET="${SPACES_BUCKET:-sincronia-backups}"
S3_REGION="${SPACES_REGION:-nyc3}"
S3_ENDPOINT="${SPACES_ENDPOINT:-https://nyc3.digitaloceanspaces.com}"
DATE_STAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="sincronia_backup_${DATE_STAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Database configuration
POSTGRES_HOST="${POSTGRES_HOST:-localhost}"
POSTGRES_DB="${POSTGRES_DB:-sincronia_production}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"

# Create backup directory
mkdir -p "${BACKUP_DIR}"

log_info "Starting database backup..."
log_info "Database: ${POSTGRES_DB}"
log_info "Backup file: ${BACKUP_PATH}"

# Perform backup
log_info "Dumping database..."
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump \
    -h "${POSTGRES_HOST}" \
    -U "${POSTGRES_USER}" \
    -d "${POSTGRES_DB}" \
    --format=plain \
    --no-owner \
    --no-privileges \
    | gzip > "${BACKUP_PATH}"

# Verify backup
if [ -f "${BACKUP_PATH}" ]; then
    BACKUP_SIZE=$(du -h "${BACKUP_PATH}" | cut -f1)
    log_success "Backup created successfully (${BACKUP_SIZE})"
else
    log_error "Backup failed!"
    exit 1
fi

# Upload to S3 (if credentials configured)
if [ -n "${SPACES_ACCESS_KEY_ID}" ] && [ -n "${SPACES_SECRET_ACCESS_KEY}" ]; then
    log_info "Uploading backup to S3..."
    
    aws configure set aws_access_key_id "${SPACES_ACCESS_KEY_ID}"
    aws configure set aws_secret_access_key "${SPACES_SECRET_ACCESS_KEY}"
    aws configure set default.region "${S3_REGION}"
    aws configure set default.endpoint_url "${S3_ENDPOINT}"
    
    aws s3 cp "${BACKUP_PATH}" "s3://${S3_BUCKET}/backups/${BACKUP_FILE}" \
        --endpoint-url="${S3_ENDPOINT}"
    
    if [ $? -eq 0 ]; then
        log_success "Backup uploaded to S3: s3://${S3_BUCKET}/backups/${BACKUP_FILE}"
    else
        log_warning "Failed to upload to S3. Backup saved locally only."
    fi
else
    log_warning "S3 credentials not configured. Backup saved locally only."
fi

# Cleanup old local backups
log_info "Cleaning up backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "sincronia_backup_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
log_success "Cleanup completed"

# Cleanup old S3 backups (if S3 configured)
if [ -n "${SPACES_ACCESS_KEY_ID}" ] && [ -n "${SPACES_SECRET_ACCESS_KEY}" ]; then
    log_info "Cleaning up S3 backups older than ${RETENTION_DAYS} days..."
    aws s3 rm "s3://${S3_BUCKET}/backups/" \
        --recursive \
        --exclude "*" \
        --include "sincronia_backup_*.sql.gz" \
        --endpoint-url="${S3_ENDPOINT}" || true
    log_success "S3 cleanup completed"
fi

log_success "Backup process completed!"
echo ""
echo "═══════════════════════════════════════════════════════════"
log_info "Backup Summary:"
echo "  File: ${BACKUP_FILE}"
echo "  Size: ${BACKUP_SIZE}"
echo "  Location: ${BACKUP_PATH}"
echo "  Retention: ${RETENTION_DAYS} days"
echo "═══════════════════════════════════════════════════════════"
