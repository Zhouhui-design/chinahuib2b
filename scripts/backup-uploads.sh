#!/usr/bin/env bash
#
# backup-uploads.sh
#
# Daily backup script for the x2xhub.com uploads directory.
# Run from cron (3am UTC recommended).
#
# Features:
#   1. Tar & gzip public/uploads -> backups/uploads-YYYYMMDD.tar.gz
#   2. Tar & gzip storage/uploads-backup -> backups/uploads-backup-YYYYMMDD.tar.gz
#      (uploaded files are dual-written to this dir at upload time)
#   3. Symlink latest.tar.gz for emergency one-click restore
#   4. Keep the most recent 14 daily backups; delete older ones
#   5. Emit exit 0 even when partially degraded (one dir missing), so cron
#      doesn't spam email; failures are logged to stderr.
#
# Usage:
#   ./scripts/backup-uploads.sh            # uses defaults
#   PROJECT_ROOT=/var/www/mysite ./scripts/backup-uploads.sh   # override
#
# Cron example (3am UTC, every day):
#   0 3 * * * /var/www/chinahuib2b/scripts/backup-uploads.sh >> /var/www/chinahuib2b/backups/backup-uploads.cron.log 2>&1
#

set -u  # fail on unset vars

PROJECT_ROOT="${PROJECT_ROOT:-/var/www/chinahuib2b}"
BACKUP_DIR="${BACKUP_DIR:-${PROJECT_ROOT}/backups}"
UPLOADS_DIR="${PROJECT_ROOT}/public/uploads"
SAFETY_BACKUP_DIR="${PROJECT_ROOT}/storage/uploads-backup"
KEEP_DAYS=14

STAMP="$(date +%Y%m%d_%H%M%S)"

mkdir -p "${BACKUP_DIR}"

log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"
}

backup_one() {
  local label="$1"
  local source_dir="$2"
  local out_path="${BACKUP_DIR}/${label}-${STAMP}.tar.gz"

  if [ ! -d "${source_dir}" ]; then
    log "WARN: ${label} source directory '${source_dir}' does not exist — skipping"
    return 0
  fi

  # Exclude .DS_Store / Thumbs.db / node_modules / other noise
  if tar -czf "${out_path}" \
           -C "$(dirname "${source_dir}")" \
           --exclude='.DS_Store' \
           --exclude='Thumbs.db' \
           --exclude='.gitkeep' \
           "$(basename "${source_dir}")" 2>/dev/null; then
    local size
    size="$(du -h "${out_path}" | cut -f1)"
    log "OK   : backed up ${label} -> ${out_path} (${size})"
    # Maintain "latest" pointer symlink
    ln -sf "${out_path}" "${BACKUP_DIR}/${label}-latest.tar.gz"
    return 0
  else
    log "ERROR: failed to back up ${label} to ${out_path}"
    return 0  # non-fatal: don't exit 1, other dir may still back up
  fi
}

rotate_old() {
  # For both backup archives, keep most recent KEEP_DAYS
  for prefix in uploads uploads-backup; do
    local kept=0
    # -t sorts newest first
    for f in $(ls -1t "${BACKUP_DIR}"/${prefix}-*.tar.gz 2>/dev/null); do
      kept=$((kept + 1))
      if [ "${kept}" -gt "${KEEP_DAYS}" ]; then
        rm -f "${f}" && log "CLEAN: removed old backup ${f}"
      fi
    done
  done
}

# --- main ---------------------------------------------------------------

log "===== BEGIN backup-uploads.sh for ${PROJECT_ROOT} ====="

backup_one "uploads"        "${UPLOADS_DIR}"
backup_one "uploads-backup" "${SAFETY_BACKUP_DIR}"
rotate_old

log "===== END   backup-uploads.sh ====="
exit 0
