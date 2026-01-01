#!/usr/bin/env bash
set -euo pipefail

# Unauthenticated E2E run: disables seeding and executes unauth projects
export ENABLE_TEST_SESSION_SEED=false

# Default to all unauth projects if none specified
PROJECTS=("--project=chromium (unauth)" "--project=firefox (unauth)" "--project=webkit (unauth)")

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
  # UI mode with default unauth projects (exclude --ui from arguments)
  npx playwright test --ui "${PROJECTS[@]}" "${filtered_args[@]}"
else
  # Standard run with default unauth projects
  npx playwright test "${PROJECTS[@]}" "$@"
fi
