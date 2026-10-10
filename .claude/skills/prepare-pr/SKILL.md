---
name: prepare-pr
description: Get the current branch ready for a pull request — full verify gate, Conventional Commit check, stray-artifact check, and a PR description filled from the template. Use when the user says the work is done, or asks to prepare/open a PR. Stops before pushing unless told otherwise.
---

# Prepare PR

## Steps

1. **State**: `git status`, `git branch --show-current` (must not be `main`), `git log --oneline main..HEAD`.
2. **Gate**: `npm run verify` (lint with no warnings, type-check, tests, build). If it fails, show the failing output; don't paper over it. If a failure also happens on `main`, say so instead of "fixing" unrelated tests.
3. **Format**: `npm run format:check` on changed files (`lint-staged` normally handles this at commit).
4. **Commits**: each message follows Conventional Commits (`feat|fix|docs|test|refactor|chore(scope): …`, enforced by commitlint). Check with `git log --format=%s main..HEAD`; propose a rewording rather than rewriting history without being asked.
5. **Artifacts**: `git diff --stat main...HEAD` must not include `.next/`, `playwright-report/`, `test-results/`, `coverage/`, `*.tsbuildinfo`, or any `.env*` other than `.env.example`. `package-lock.json` changes only if `package.json` dependencies changed.
6. **Review the diff** against `AGENTS.md` invariants. Run `secret-leak-review` if auth, API routes, logging or env changed; `auth-change-review` for auth; `multi-schedule-overlap-check` for report/payment-grid changes.
7. **Docs**: if scripts, env vars, routes or invariants changed, run `docs-sync`.
8. **Describe**: fill `.github/PULL_REQUEST_TEMPLATE.md` from the diff — summary (why, not just what), changes, exact test commands, checklist boxes only for things actually done. End with the PR attribution line the session requires, if any.
9. **Stop** and show the title + body. Push and `gh pr create` only if the user asked. Never merge, never `--admin`, never force-push.
