---
name: handle-dependabot
description: Triage open Dependabot PRs for this repo, verify each eligible dev-dependency bump against the full gate, and label safe ones for the merge-when-ready automerge workflow. Diagnoses failing bumps (peer-family splits, ERESOLVE) and supersedes them with a combined PR. Use to clear a backlog of Dependabot PRs. Pass "dry-run" to report only.
---

# Handle Dependabot PRs

Dependabot runs weekly (Mon, UTC) for npm and GitHub Actions (`.github/dependabot.yml`). Merging is done by `.github/workflows/automerge.yml`: applying the **`merge-when-ready`** label makes it wait for the `CI Security Gate` (required) and `E2E Tests` (optional) workflows and then merge. Applying that label is therefore the merge decision — only do it when this skill's criteria pass, and never when the argument is `dry-run`.

To merge PRs directly instead of labelling (including Actions and production bumps that pass every gate), use the `merge-open-prs` skill; this skill's diagnosis section still applies.

## Title format and groups

`dependabot.yml` pins titles and groups peer families, so classify by title:

| Title                                                 | Meaning                                            |
| ----------------------------------------------------- | -------------------------------------------------- |
| `build(deps-dev): bump X from A to B`                 | single dev dependency                              |
| `build(deps-dev): bump the dev-minor-patch group …`   | all dev minor/patch bumps, incl. dev families      |
| `build(deps): bump X …` touching only `package*.json` | production dependency                              |
| `build(deps): bump the <family> group …`              | peer family (`mui`, `ag-grid`, `react`, `next`, …) |
| `build(deps): …` touching only `.github/workflows/*`  | GitHub Actions (`github-actions` group)            |

The prefix does **not** distinguish Actions from npm production bumps: check `files`. Grouped titles may say `… across 1 directory with N updates`.

How grouping really behaves (`docs/ci-pipeline.md` has the detail):

- Dev families (jest, testing-library, tailwind, commitlint) may open as separate PRs on the first scan, but a rebase or recreate can fold their minor/patch bumps into `dev-minor-patch`. Dependabot then closes the family PRs as "Superseded by #N". That's expected: work on #N.
- PRs opened before the groups existed may ignore `@dependabot close`. If one is redundant (main already has the version), close it with `gh pr close N --comment "Superseded by #M …"`.
- Dependabot only reads a command placed **alone** in a comment. Text before it means it's ignored.

## Rules

- Never `--admin`, never force-push, never edit a Dependabot branch, never change rulesets or workflows. Change `dependabot.yml` only when the user asks.
- **Needs a human, never labelled by this skill**: production dependencies (`build(deps):` on `package*.json`), any major bump, GitHub Actions bumps, anything touching `next`, `next-auth`, `react`, `react-dom`, `@mui/*`, `caloohpay` or `typescript`, and PRs whose changed files are not just `package.json` / `package-lock.json`.
- Don't use `gh run rerun` (stale merge commit). Comment `@dependabot rebase` instead.
- You may **not** merge or label a PR you authored yourself; hand it to the user (auto mode blocks it as "merge without review").

## Steps

1. `gh auth status`; list oldest first:

   ```bash
   gh pr list --author "app/dependabot" --state open --json number,title,createdAt,labels,mergeStateStatus \
     --jq 'sort_by(.createdAt) | .[] | [.number,.createdAt[:10],.mergeStateStatus,.title]|@tsv'
   ```

2. **Classify** each with `gh pr view N --json title,files,labels` using the table above. Eligible: dev-dependency bump (`build(deps-dev)`), same major version, only `package.json` + `package-lock.json` changed, not in the human-only list. Record the rest as "needs human: reason". For failing ones, also run **Diagnose** below so the report says _why_.
3. **Verify the eligible PR locally** in a throwaway worktree so your branch is untouched: `git worktree add ../dep-N origin/main && cd ../dep-N && gh pr checkout N`, then `npm ci && npm run verify`. A bump that passes CI but fails here is not eligible. Remove the worktree afterwards (`git worktree remove ../dep-N`).
   - A jest `worker … terminated … SIGSEGV` on an unrelated suite is a local flake: rerun with `npx jest --ci --runInBand` before treating it as a failure.
   - Seeded E2E needs `.env.local`, which agents may not read. Rely on CI's seeded E2E matrix (chromium/firefox/webkit) and say so in the report.
4. **Freshness**: if the PR is behind `main` (`gh api repos/{owner}/{repo}/compare/main...<headRefOid> --jq .behind_by` > 0), comment `@dependabot rebase`, wait up to 3 minutes for the head SHA to change, and re-check. Each merge changes `package-lock.json`, so remaining PRs go stale; repeat per PR.
5. **Check CI**: `gh pr checks N`; everything must be `pass`. CodeQL `neutral`/`skipping` and Vercel "Canceled by Ignored Build Step" are fine. A native `Vercel` check failing with "Deployment rate limited" is Vercel's quota, not the code: ask the user before treating it as non-blocking. Don't trigger preview deploys (manual only, quota). If the failing step also fails on `main` (`gh run list --branch main --limit 5`), stop: that's systemic. `Deploy to Vercel` failing on main is a deploy problem, not a PR gate; report it, don't stop for it.
6. **Label** (not dry-run): `gh pr edit N --add-label merge-when-ready`, then confirm with `gh pr view N --json state,labels`. Move to the next PR only after this one merges.
7. Stop after 2 consecutive failures or 10 PRs.

## Diagnose a failing bump

Get the error: `gh run view <run-id> --log-failed | grep -iE "error|ERESOLVE|peer" | head -20`.

| Symptom                                                                                                                                                    | Cause                                                                                         | Action                                                                                                                      |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `npm ci` fails with `ERESOLVE … peer X@^old from Y`                                                                                                        | one family member bumped alone (e.g. #101: `@mui/material` 9 vs `@mui/icons-material` 7)      | **Supersede** (below). If it's a multi-major framework jump (MUI, Next, React), report "needs migration" instead.           |
| `tsc` error like `No overload matches this call` on a component from the bumped package                                                                    | sibling package left on the old major (e.g. #102: `ag-grid-react` 36, `ag-grid-community` 35) | Check `grep <family> package.json` first; usually fixed by **Supersede** with no code change.                               |
| Major bump where upstream isn't ready (plugins have only betas for the new major, or `typescript-eslint` can't load the new `typescript`, e.g. #115, #120) | not fixable here                                                                              | Report "needs human: upstream not ready" and suggest **Ignore a major** (below); post the commands only if the user agrees. |
| Same step fails on `main`                                                                                                                                  | systemic                                                                                      | Stop; fix `main` first.                                                                                                     |
| Only seeded E2E fails, after `tsc` failed                                                                                                                  | knock-on of the build failure                                                                 | Ignore until the type error is fixed.                                                                                       |

**Supersede** (not dry-run): branch `fix/<family>-<major>` from `origin/main` in a worktree, `npm install --ignore-scripts <pkgA>@^<v> <pkgB>@^<v>` (all family members, same version), `npm run verify`, commit `build(deps): bump <pkgA> and <pkgB> to <v>`, push, `gh pr create` naming the PR it supersedes. Once yours merges, check the Dependabot PR: it may **not** auto-close (#102 didn't). If it's still open and main already has the version, close it with a "Superseded by #M" comment. Your PR needs the **user** to merge it. With the groups in `dependabot.yml` this should be rare; if it recurs, add the family to `groups:` (ask first).

**Ignore a major** (only when the user asks): single-package PR → `@dependabot ignore this major version` (Dependabot closes it). Grouped PR → that command does nothing. Post `@dependabot ignore <package> major version` once per package that jumped a major, each in its own comment, then `@dependabot recreate` and confirm the new diff stays within the current major. Undo later with `@dependabot unignore <package>`.

## Report

A table: PR, title, outcome (labelled / superseded by #M / skipped: reason / failed: step) and the exact next action for every PR not labelled. List PRs that are waiting on the user to merge separately.
