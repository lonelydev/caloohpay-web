---
name: merge-open-prs
description: Work through every open pull request oldest-first — bring each branch up to date with main, resolve conflicts, wait for all CI and checks, then squash-merge it — before moving to the next. Use when the user asks to clear, drain or merge all open PRs. Pass "dry-run" to report the plan without pushing, commenting or merging.
---

# Merge open PRs

The user has authorised this loop: **squash-merging a PR that passes every gate in step 5 is in scope**. Nothing else is: no `--admin`, no ruleset or workflow changes, no pushing to `main`.

`main` requires a PR and linear history, so merges are `--squash`. Squash merges mean a merge commit on the PR branch (step 2 fallback) is fine.

## Rules

- **Oldest first, ready first.** Every merge changes `main` (and usually `package-lock.json`), so the remaining PRs must be re-synced after each one. Never batch. Exception: if a newer PR is already `CLEAN` (up to date, all checks green) while the older one is `BEHIND` or still running CI, merge the ready one first. The older one needs a re-sync either way, so this saves a whole CI cycle.
- **Never merge with a failing, pending or missing required check.** `neutral`/`skipped` is fine only for CodeQL and push-only jobs. You are the gate; GitHub may not be.
- If GitHub says the merge is blocked by branch policy (e.g. a required review), **stop and report**. Never `--admin`, never retry with another route. The user merges or approves.
- Force-push only with `--force-with-lease`, only to the PR's own head branch, never to `main`. `.claude/settings.json` denies force pushes; if denied, use the merge-main fallback, don't change the setting.
- Skip drafts, PRs from forks, PRs whose base isn't `main` (e.g. a Copilot PR into a feature branch), and PRs labelled `do-not-merge`/`wip`; list them as "needs human".
- **Never merge a PR you authored** (including a superseding PR from `handle-dependabot`). Auto mode denies it as "merge without review"; don't retry. Get it green, then list it as "awaiting user merge" with the exact `gh pr merge` command.
- Do not hand-edit generated files to make a conflict disappear; regenerate them (`package-lock.json` via `npm install`).
- Stop after 2 consecutive failures, a systemic failure (the same step fails on `main`), or 20 PRs.

## Steps (per PR, oldest first)

0. **Preconditions** (once): `gh auth status`, clean working tree, `git switch main && git pull --ff-only`. List the queue:

   ```bash
   gh pr list --state open --json number,title,author,isDraft,createdAt,headRefName,labels,mergeStateStatus \
     --jq 'sort_by(.createdAt) | .[] | [.number,.createdAt[:10],.author.login,.isDraft,.mergeStateStatus,.title]|@tsv'
   ```

   Re-run it after every merge: Dependabot closes PRs that become redundant and opens new ones. With `dry-run`, print the queue and per-PR plan, then stop.

1. **Sync with `main`.** `git fetch origin`; check `gh api repos/{owner}/{repo}/compare/main...<headRefOid> --jq .behind_by`. If `0` and not `DIRTY`, go to step 3.
   - **Dependabot PR, no conflict**: comment `@dependabot rebase`, poll every 30 s (3 min max) for `headRefOid` to change. A new Dependabot comment means it could not rebase: read it.
   - **Any other PR**: `git switch -c tmp-pr-N origin/<head>` then `git rebase origin/main`, then `git push --force-with-lease origin HEAD:<head>`. In this repo the force-push is normally denied: go straight to the step 2 **fallback** (`git merge origin/main`, normal push). Use a worktree (`git worktree add ../pr-N origin/<head>`) so the main checkout stays on `main`.

2. **Resolve conflicts** (if the rebase stops, or `mergeStateStatus` is `DIRTY`, or Dependabot cannot rebase):
   - `git diff --name-only --diff-filter=U` to list them.
   - `package-lock.json`: take main's (`git checkout origin/main -- package-lock.json`), then `npm install --ignore-scripts` to re-apply the PR's `package.json` change. Check `git diff origin/main --stat` is only what the PR is meant to change.
   - Source/doc conflicts: read both sides, keep both intents, never blindly choose `--ours`/`--theirs`. If the intent is unclear, stop and ask.
   - Rebase: `git rebase --continue`. If the force-push is not permitted (Dependabot branches, or denied by settings), abort and use the **fallback**: `git merge origin/main` on the PR branch, resolve the same way, commit, and push normally (no force). Note: a human commit stops Dependabot auto-rebasing that PR.
   - Re-verify locally after any manual resolution: `npm run verify` (or `npm run lint -- --max-warnings=0 && npm run type-check && npm test -- --ci --runInBand && npm run build` if `verify` doesn't exist on that branch).
   - Push, then delete the temporary local branch.

3. **Wait for all checks.** Run this in the background (macOS has no `timeout`, and `gh pr checks --watch` can exit early). `gh pr checks` exits `8` while anything is pending:

   ```bash
   for i in $(seq 1 40); do gh pr checks N >/dev/null 2>&1; [ $? -ne 8 ] && break; sleep 30; done; gh pr checks N
   ```

   After 20 minutes, mark it "needs human: CI timed out". Only checks started _after_ the sync count; a green run on an older head does not. Then confirm with `gh pr checks N` that every check is `pass`. Vercel's "Canceled by Ignored Build Step" counts as pass (native Vercel builds are disabled on purpose).
   - On failure, get the failing step: `gh run view <run-id> --json jobs --jq '.jobs[].steps[]|select(.conclusion=="failure")|.name'` (logs older than ~90 days are gone; rerun by pushing, not `gh run rerun`).
   - If the same step fails on `main`'s latest run, it is **systemic**: stop the whole loop and report. Fixing `main` comes first (see how #108 fixed the audit gate).
   - `Deploy to Vercel` runs on `main` after merges and isn't a PR check. If it fails, report it, but it isn't systemic for this loop.
   - A failing Dependabot bump (ERESOLVE, or a type error after a major bump): diagnose with the `handle-dependabot` skill's **Diagnose** table. A peer-family split is fixed by a superseding PR, which the user merges.
   - Otherwise mark the PR failed with the step name and continue to the next PR.

4. **Gate for merging.** All of: head is up to date with `main` (`behind_by` is `0`), all checks `pass`, `mergeable` is `MERGEABLE`, no changes requested, title is a Conventional Commit (commitlint runs on the squash commit: fix the PR title with `gh pr edit` if not).
   Major-version bumps of `next`, `next-auth`, `react`, `@mui/*`, `caloohpay`, `typescript` or any `eslint` major are merged **only if** CI is green _and_ `npm run verify` passes locally on the PR head; note them in the report so the user can eyeball them.

5. **Squash-merge.** `gh pr merge N --squash --delete-branch`. If this fails with a policy message, stop and report (see Rules). Confirm `gh pr view N --json state --jq .state` is `MERGED`.

6. **Next.** `git switch main && git pull --ff-only`, then return to step 0's list (re-sorted) and take the oldest remaining PR.

## Report

Finish with a table: PR, title, outcome (merged / superseded by #M / awaiting user merge / skipped: reason / failed: step / blocked: policy), and the exact next action for every PR not merged. Clean up any worktrees you created. After a run that merged anything, confirm `main`'s CI and `npm audit --omit=dev` are still green.
