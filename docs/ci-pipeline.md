# CI/CD Pipeline

This document describes every GitHub Actions workflow in the repository, the security hardening measures applied, and the end-to-end deployment gate.

## Overview

```
pull_request / push to main
         │
         ├─► CI Security Gate      (.github/workflows/ci-security-gate.yml)
         │      ├─ Quality Checks  (lint, type-check, unit tests, build)
         │      ├─ Production Dependency Audit
         │      └─ Dependency Review  (PR only)
         │
         ├─► E2E Tests             (.github/workflows/e2e.yml)
         │      ├─ Seeded E2E      (chromium · firefox · webkit)
         │      └─ Unauth E2E      (chromium · firefox · webkit)
         │
         └─► CodeQL Analysis       (.github/workflows/codeql-analysis.yml)

                    ↓ both CI Security Gate AND E2E Tests succeeded

         Deploy to Vercel          (.github/workflows/deploy-vercel.yml)
              ├─ Production        (push to main only)
              └─ Preview           (pull_request only)

nightly (05:00 UTC)
     └─► Nightly Security Scan    (.github/workflows/security-nightly.yml)
              ├─ Nightly Production Audit  (blocking)
              └─ Nightly Full Audit Report (informational)

on release
     └─► SBOM Release             (.github/workflows/sbom-release.yml)

weekly (dependabot)
     └─► Dependabot               (.github/dependabot.yml)
              ├─ npm dependencies
              └─ GitHub Actions versions
```

---

## Workflows

### CI Security Gate (`ci-security-gate.yml`)

**Triggers:** `pull_request` targeting `main`; `push` to `main`

**Concurrency:** `ci-security-${{ github.ref }}` — in-progress runs are cancelled when a new commit arrives.

#### Jobs

| Job                           | Purpose                                                                                                                      |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `Quality Checks`              | Full `npm ci` → lint (`--max-warnings=0`) → type-check → unit tests (`--ci --runInBand`) → production build                  |
| `Production Dependency Audit` | `npm ci --omit=dev` → single `npm audit --omit=dev --json` → Node enforcement script → artifact upload                       |
| `Dependency Review`           | PR only — uses `actions/dependency-review-action` to diff introduced vulnerabilities; fails on `high`; posts comment summary |

#### Audit design

The `Production Dependency Audit` job runs `npm audit` **once**, writes the full JSON unconditionally (`|| true`), then a Node one-liner reads that file to enforce the high/critical threshold. This ensures the JSON artifact is always uploaded regardless of gate outcome, and avoids a second audit invocation.

```
npm audit --omit=dev --json > npm-audit-ci.json || true
   │
   └─► Enforce production high threshold   (reads npm-audit-ci.json)
   └─► Upload artifact (npm-audit-ci, 7-day retention)
```

---

### E2E Tests (`e2e.yml`)

**Triggers:** `push` to `main` and `pull_request` — both filtered to relevant path changes (`.ts`, `.tsx`, `playwright.config.ts`, etc.)

**Matrix:** `chromium`, `firefox`, `webkit` across two job groups — `seeded` (authenticated, uses `ci_e2e_seeded` environment secrets) and `unauth` (unauthenticated flows). `fail-fast: false` so all browser results are collected.

The `seeded` job is attached to the `ci_e2e_seeded` GitHub Actions environment. If that environment has protection rules such as `Required reviewers` or a wait timer configured in repository settings, the job will pause with a `Waiting for approval` status before any test steps run. This is expected GitHub environment behavior, not a Playwright or branch protection issue.

To remove the pause for CI runs, update **Repository Settings → Environments → `ci_e2e_seeded`** and either remove `Required reviewers`, remove the wait timer, or move the required test secrets to repository-level secrets and drop the environment binding from the workflow.

Playwright reports are uploaded as artifacts on every run (`if: always()`).

---

### Deploy to Vercel (`deploy-vercel.yml`)

**Triggers:** `workflow_run` completion of `CI Security Gate` **or** `E2E Tests`.

> Vercel's native GitHub integration is disabled via `ignoreCommand: "exit 0"` in `vercel.json`. All deploys are CLI-driven from this workflow.

#### Gate job

Because `workflow_run` fires on completion of **either** upstream workflow (not both simultaneously), a `gate` job runs first on every trigger. It calls the GitHub API to retrieve the conclusion for both `CI Security Gate` and `E2E Tests` for the triggering commit SHA:

- Both `success` → `ready=true`
- Either failed → `ready=false`, deploy jobs are skipped
- E2E absent (path filters excluded it) → treated as pass; CI alone is sufficient

#### Deploy jobs

| Job                    | Condition                                   |
| ---------------------- | ------------------------------------------- |
| `Deploy to Production` | `ready=true` + `branch=main` + `event=push` |
| `Deploy Preview`       | `ready=true` + `event=pull_request`         |

Both jobs use `vercel build` (local build step) + `vercel deploy --prebuilt` (upload only), avoiding a redundant rebuild on Vercel's infrastructure.

#### Required secrets

| Secret              | Source                                                               |
| ------------------- | -------------------------------------------------------------------- |
| `VERCEL_TOKEN`      | vercel.com → Account Settings → Tokens                               |
| `VERCEL_ORG_ID`     | `.vercel/project.json` → `orgId` (run `npx vercel link` to generate) |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId`                                 |

---

### Nightly Security Scan (`security-nightly.yml`)

**Triggers:** Daily at 05:00 UTC; manual (`workflow_dispatch`)

| Job                         | Install scope     | Behaviour                                                                                                                                           |
| --------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | --- | ---------------------------------------------------------------------------------------------------------------- |
| `Nightly Production Audit`  | `--omit=dev`      | Single audit run → JSON → Node enforcement (high/critical gate) → artifact (14-day retention). **Blocking** — workflow fails if threshold breached. |
| `Nightly Full Audit Report` | Full (dev + prod) | Audit with `                                                                                                                                        |     | true` → Node summary printed → artifact (14-day retention). **Informational** — never causes a workflow failure. |

The two-job design intentionally separates what must be clean (the production dependency tree) from what is tracked but not enforced (the full dev tree, which contains known moderate advisories in test tooling).

---

### CodeQL Analysis (`codeql-analysis.yml`)

Static analysis for JavaScript/TypeScript. Runs on push to `main`, pull requests, and weekly on a schedule. Results surface in the **Security → Code scanning** tab.

---

### SBOM Release (`sbom-release.yml`)

**Triggers:** GitHub release published; manual (`workflow_dispatch`)

Generates a CycloneDX Software Bill of Materials for the **production dependency tree** (`npm ci --omit=dev`) and attaches it to the release. Provides an auditable inventory of shipped dependencies.

---

### Automerge (`automerge.yml`)

**Triggers:** `pull_request` labeled with `merge-when-ready`

Generates a short-lived GitHub App installation token, polls GitHub Actions for upstream workflow completion, then merges via the App (which is a branch protection bypass actor). Enables solo-maintainer self-merge without disabling branch protection.

Current merge gating behavior:

- `CI Security Gate` is required and must conclude with `success`
- `E2E Tests` is optional; if no run exists for the PR head SHA because path filters skipped it, automerge treats that as valid and continues
- If either tracked workflow concludes with `failure`, `cancelled`, `timed_out`, or `action_required`, automerge exits without merging
- The workflow polls every 15 seconds for up to 15 minutes before timing out

Requires:

- GitHub App installed on the repository with `Contents: write` and `Pull requests: write` permissions
- `APP_ID` and `APP_PRIVATE_KEY` secrets
- App added as bypass actor in branch protection settings

---

### Dependabot (`dependabot.yml`)

Weekly PRs for:

- `npm` — labelled `dependencies`, `security`
- `github-actions` — labelled `dependencies`, `ci`

---

## Security hardening summary

| Measure                      | Implementation                                                                                        |
| ---------------------------- | ----------------------------------------------------------------------------------------------------- |
| Production-only audit scope  | `--omit=dev` on all audit and SBOM jobs                                                               |
| Single audit invocation      | JSON written once with `\|\| true`; threshold enforced by parsing that file                           |
| Dependency diff on PRs       | `actions/dependency-review-action` with `fail-on-severity: high`                                      |
| Nightly prod gate            | Separate blocking job; dev-tree audit is informational only                                           |
| Static analysis              | CodeQL on every PR and weekly                                                                         |
| Supply chain visibility      | CycloneDX SBOM on every release                                                                       |
| Automated dependency updates | Dependabot (npm + Actions, weekly)                                                                    |
| Secret scanning              | GitHub Secret Scanning + Push Protection (enable in repo Settings → Security)                         |
| Disclosure policy            | `SECURITY.md` at repo root                                                                            |
| Ownership                    | `CODEOWNERS` assigns `@lonelydev` to all paths                                                        |
| Deployment gate              | Vercel auto-deploy disabled; deploy only after CI + E2E both pass                                     |
| Branch protection            | Required checks: `Quality Checks`, `Production Dependency Audit`, `Dependency Review`, `Analyze Code` |
