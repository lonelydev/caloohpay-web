#!/usr/bin/env bash
set -euo pipefail

# Unauthenticated E2E run: disables seeding and executes unauth projects
export ENABLE_TEST_SESSION_SEED=false

npm run test:e2e:unauth "$@"
