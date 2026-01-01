#!/usr/bin/env bash
set -euo pipefail

# Unauthenticated E2E test runner - delegates to shared e2e-run.sh
# Passes: seed_mode=false, unauth project configurations
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
"$SCRIPT_DIR/e2e-run.sh" false \
  "--project=chromium (unauth)" \
  "--project=firefox (unauth)" \
  "--project=webkit (unauth)" \
  "$@"

