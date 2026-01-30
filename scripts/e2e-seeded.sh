#!/usr/bin/env bash
set -euo pipefail

# Seeded E2E test runner - delegates to shared e2e-run.sh
# Accepts: browser type as first parameter (chromium, firefox, or webkit)
# Passes: seed_mode=true, seeded project configuration for specified browser
BROWSER=${1:-chromium}  # Default to chromium if not specified
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$SCRIPT_DIR/e2e-run.sh" true \
  "--project=$BROWSER (seeded)" \
  "$@"

