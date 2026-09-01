#!/usr/bin/env bash
# Imports the checked-in bacpac into the stack's SQL Server, then exits.
#
# Compose blocks the api services on this container succeeding
# (depends_on: service_completed_successfully), so "already imported" must exit 0 -- otherwise
# a second `docker compose up` would deadlock the stack.
#
# Readiness is handled by the sql service's healthcheck, not here, so this runs the import
# exactly once rather than retrying and half-creating the database.
set -euo pipefail

SQL_HOST="${SQL_HOST:-sql}"
SQL_PORT="${SQL_PORT:-1433}"
SQL_USER="${SQL_USER:-sa}"
DB_NAME="${DB_NAME:-SheshaFunctionalTests}"
BACPAC_DIR="${BACPAC_DIR:-/bacpac}"
: "${SQL_PASSWORD:?SQL_PASSWORD must be set}"

BACPAC="$(find "$BACPAC_DIR" -maxdepth 1 -name '*.bacpac' | head -n 1 || true)"
if [[ -z "$BACPAC" ]]; then
  echo "ERROR: no .bacpac found in $BACPAC_DIR" >&2
  exit 1
fi

CONN="Server=${SQL_HOST},${SQL_PORT};Initial Catalog=${DB_NAME};User Id=${SQL_USER};Password=${SQL_PASSWORD};TrustServerCertificate=True;Encrypt=False;"

echo "importing $(basename "$BACPAC") -> ${DB_NAME} on ${SQL_HOST}:${SQL_PORT} ..."

# sqlpackage prints a line per index and per constraint -- hundreds of lines that bury any real
# error. Capture it and only replay it if something goes wrong.
set +e
sqlpackage /a:Import \
  /SourceFile:"$BACPAC" \
  /TargetConnectionString:"$CONN" \
  /p:DatabaseLockTimeout=120 \
  >/tmp/import.log 2>&1
status=$?
set -e

if [[ $status -eq 0 ]]; then
  echo "import complete: ${DB_NAME}"
  exit 0
fi

# SQL71659 means the target already has user objects, i.e. a previous run already imported it.
# That is success for our purposes: the stack has simply been started before.
if grep -qiE "SQL71659|already exists" /tmp/import.log; then
  echo "database '${DB_NAME}' already imported -- nothing to do"
  exit 0
fi

echo "ERROR: bacpac import failed (exit ${status})" >&2
tail -n 40 /tmp/import.log >&2
exit "$status"
