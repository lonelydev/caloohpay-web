#!/usr/bin/env bash
set -euo pipefail

# Seeded E2E run: sets env vars and executes Playwright seeded projects
export ENABLE_TEST_SESSION_SEED=true
export NEXTAUTH_SECRET=${NEXTAUTH_SECRET:-dev-e2e-secret}

npm run test:e2e:seeded "$@"
