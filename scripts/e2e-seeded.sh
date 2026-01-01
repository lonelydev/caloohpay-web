#!/usr/bin/env bash
set -euo pipefail

# Seeded E2E run: sets env vars and executes Playwright seeded projects
export ENABLE_TEST_SESSION_SEED=true
export NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-dev-e2e-secret}

# Default to all seeded projects if none specified
PROJECTS=("--project=chromium (seeded)" "--project=firefox (seeded)" "--project=webkit (seeded)")

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
  # UI mode with default seeded projects (exclude --ui from arguments)
  npx playwright test --ui "${PROJECTS[@]}" "${filtered_args[@]}"
else
  # Standard run with default seeded projects
  npx playwright test "${PROJECTS[@]}" "$@"
fi
