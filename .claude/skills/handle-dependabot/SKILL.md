---
name: handle-dependabot
description: Triage open Dependabot PRs for this repo, verify each eligible dev-dependency bump against the full gate, and label safe ones for the merge-when-ready automerge workflow. Use to clear a backlog of Dependabot PRs. Pass "dry-run" to report only.
---

# Handle Dependabot PRs

Dependabot runs weekly (Mon, UTC) for npm and GitHub Actions (`.github/dependabot.yml`). Merging is done by `.github/workflows/automerge.yml`: applying the **`merge-when-ready`** label makes it wait for the `CI Security Gate` (required) and `E2E Tests` (optional) workflows and then merge. Applying that label is therefore the merge decision — only do it when this skill's criteria pass, and never when the argument is `dry-run`.

## Rules

- Never `--admin`, never force-push, never edit a Dependabot branch, never change rulesets, workflows or `dependabot.yml`.
- **Needs a human, never labelled by this skill**: production dependencies (`chore(deps):`), any major bump, GitHub Actions bumps (`ci(deps):`), anything touching `next`, `next-auth`, `react`, `react-dom`, `@mui/*`, `caloohpay` or `typescript`, and PRs whose changed files are not just `package.json` / `package-lock.json`.
- Don't use `gh run rerun` (stale merge commit). Comment `@dependabot rebase` instead.

## Steps

1. `gh auth status`; list oldest first:

   ```bash
   gh pr list --author "app/dependabot" --state open --json number,title,createdAt,labels \
     --jq 'sort_by(.createdAt) | .[] | [.number,.createdAt[:10],.title]|@tsv'
   ```

2. **Classify** each with `gh pr view N --json title,files,labels`. Eligible: dev-dependency bump (`chore(deps-dev)`), same major version, only `package.json` + `package-lock.json` changed, not in the human-only list above. Record the rest as "needs human: reason".
3. **Verify the eligible PR locally** in a throwaway worktree so your branch is untouched: `gh pr checkout N` in `git worktree add ../dep-N origin/main`-style isolation, then `npm ci && npm run verify`. A bump that passes CI but fails here is not eligible.
4. **Freshness**: if the PR is behind `main` (`gh api repos/{owner}/{repo}/compare/main...<headRefOid> --jq .behind_by` > 0), comment `@dependabot rebase`, wait up to 3 minutes for the head SHA to change, and re-check. Each merge changes `package-lock.json`, so remaining PRs go stale; repeat per PR.
5. **Check CI**: `gh pr checks N` — everything must be `pass` (CodeQL `neutral` is fine). If the failing step also fails on `main` (`gh run list --branch main --limit 3`), stop: that's systemic.
6. **Label** (not dry-run): `gh pr edit N --add-label merge-when-ready`, then confirm with `gh pr view N --json state,labels`. Move to the next PR only after this one merges.
7. Stop after 2 consecutive failures or 10 PRs.

## Report

A table: PR, title, outcome (labelled / skipped: reason / failed: step) and the exact next action for every PR not labelled.
