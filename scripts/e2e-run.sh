#!/usr/bin/env bash
set -euo pipefail

# Shared E2E test runner - called by both seeded and unauth scripts
# Usage: e2e-run.sh <seed-mode> <project-args...> [additional-args...]
#   seed-mode: "true" for seeded tests, "false" for unauth tests
#   project-args: one or more --project flags (e.g., --project="chromium (seeded)")
#   additional-args: any other playwright arguments

SEED_MODE="$1"
shift

# Collect all --project arguments into PROJECTS array
PROJECTS=()
while [[ $# -gt 0 ]] && [[ "$1" == --project=* ]]; do
  PROJECTS+=("$1")
  shift
done

# Set environment variables
export ENABLE_TEST_SESSION_SEED="$SEED_MODE"
if [ "$SEED_MODE" = "true" ]; then
  # If NEXTAUTH_SECRET is not set, try to read from .env.local
  if [ -z "${NEXTAUTH_SECRET:-}" ] && [ -f ".env.local" ]; then
    # Extract NEXTAUTH_SECRET from .env.local (properly handle quotes and special chars)
    NEXTAUTH_SECRET=$(grep -E "^NEXTAUTH_SECRET=" .env.local | head -n 1 | cut -d'=' -f2- | sed 's/^["'\'']//' | sed 's/["'\'']$//')
    export NEXTAUTH_SECRET
  fi
  # Fallback to default if still not set
  if [ -z "${NEXTAUTH_SECRET:-}" ]; then
    export NEXTAUTH_SECRET="dev-e2e-secret"
  fi
fi

# Filter out --ui from arguments (portable across all shells)
filtered_args=()
for arg in "$@"; do
  if [ "$arg" != "--ui" ]; then
    filtered_args+=("$arg")
  fi
done

# Check if user specified custom projects or other flags
if [[ "$@" == *"--project"* ]]; then
  # User provided additional custom projects, use them as-is
  npx playwright test "$@"
elif [[ "$@" == *"--ui"* ]]; then
  # UI mode with collected projects (exclude --ui from arguments)
  npx playwright test --ui "${PROJECTS[@]}" "${filtered_args[@]}"
else
  # Standard run with collected projects
  npx playwright test "${PROJECTS[@]}" "$@"
fi
