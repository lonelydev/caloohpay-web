#!/usr/bin/env bash
set -euo pipefail

# Unauthenticated E2E test runner - delegates to shared e2e-run.sh
# Accepts: browser type as first parameter (chromium, firefox, or webkit)
#          If "all" or no parameter provided, runs all three browsers
# Passes: seed_mode=false, unauth project configuration(s)
BROWSER=${1:-all}  # Default to all browsers if not specified
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

if [ "$BROWSER" = "all" ]; then
  # Run all three browsers (legacy behavior for local/non-matrix runs)
  "$SCRIPT_DIR/e2e-run.sh" false \
    "--project=chromium (unauth)" \
    "--project=firefox (unauth)" \
    "--project=webkit (unauth)" \
    "${@:2}"
else
  # Run single browser (matrix mode)
  "$SCRIPT_DIR/e2e-run.sh" false \
    "--project=$BROWSER (unauth)" \
    "${@:2}"
fi

