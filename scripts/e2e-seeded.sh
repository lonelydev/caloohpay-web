#!/usr/bin/env bash
set -euo pipefail

# Seeded E2E test runner - delegates to shared e2e-run.sh
# Passes: seed_mode=true, seeded project configurations
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$SCRIPT_DIR/e2e-run.sh" true \
  "--project=chromium (seeded)" \
  "--project=firefox (seeded)" \
  "--project=webkit (seeded)" \
  "$@"

