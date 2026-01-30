#!/usr/bin/env bash
set -euo pipefail

# Shared E2E test runner - called by both seeded and unauth scripts
# Usage: e2e-run.sh <seed-mode> <project1> <project2> <project3> [additional-args...]
#   seed-mode: "true" for seeded tests, "false" for unauth tests
#   projects: three default project flags to use

SEED_MODE="$1"
shift

PROJECT1="$1"
PROJECT2="$2"
PROJECT3="$3"
shift 3

PROJECTS=("$PROJECT1" "$PROJECT2" "$PROJECT3")

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
  # User provided custom projects, use them as-is
  npx playwright test "$@"
elif [[ "$@" == *"--ui"* ]]; then
  # UI mode with default projects (exclude --ui from arguments)
  npx playwright test --ui "${PROJECTS[@]}" "${filtered_args[@]}"
else
  # Standard run with default projects
  npx playwright test "${PROJECTS[@]}" "$@"
fi
