# Dependabot Automation Plan

**Status**: 📝 PROPOSED, not started. Waiting on the [open decisions](#open-decisions)
**Started**: 2026-10-10
**Goal**: Dependabot PRs never pile up again, with close to zero developer (or agent) time for routine bumps.

> **Resuming this work?** Read [Where we are](#where-we-are), then answer the [open decisions](#open-decisions).
> The [implementation checklist](#implementation-checklist) is the work order. Repo facts this plan depends on are
> in [Facts checked](#facts-checked-2026-10-10), so re-check them first; settings drift.

---

## Background: how the backlog happened

On 2026-10-10 the repo had a backlog of Dependabot PRs. Clearing it showed the backlog wasn't caused by a missing
tool. `automerge.yml` already existed, but **it only fires when someone adds the `merge-when-ready` label, and
nobody did**. Several other problems made it worse:

| Problem                                                                                                                                    | Fix                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Peer families bumped one package at a time and failed CI (#101 `@mui/material` alone → ERESOLVE; #102 `ag-grid-react` alone → `tsc` error) | Dependabot `groups:` (#113); combined ag-grid bump (#111)                                         |
| Every Vercel deploy failed: `.vercelignore` excluded `.env.example`, which the prebuilt functions reference                                | #112                                                                                              |
| The `handle-dependabot` skill expected `chore(deps-dev)` titles, so it skipped every real PR                                               | Pinned `build(deps)`/`build(deps-dev)` titles; skills rewritten (#113, #123)                      |
| Majors where upstream isn't ready (TypeScript 7, fullcalendar 7 plugins)                                                                   | Ignored with Dependabot commands; see [ci-pipeline.md](./ci-pipeline.md#dependabot-dependabotyml) |

What got merged that day: #105, #106, #111, #112, #113, #115, #116, #121, #122. Closed as superseded: #101, #102,
#117, #118, #119. #120 was closed by the TS 7.x ignore.

## Where we are

| Item                                       | State                                                                                                                                                            |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #123 `docs(dependabot): …grouping behaves` | Green and mergeable; needs a maintainer merge (agents may not merge their own PRs)                                                                               |
| #114 mui group 7 → 9                       | Needs a code migration (`Typography` `component=` type errors in `features/page.tsx`, `LoginHeader.tsx`). **Next task**                                          |
| #43 Copilot draft into `feat/data-vis`     | Maintainer's call; probably close                                                                                                                                |
| E2E jobs have no `timeout-minutes`         | A hung `npm ci` blocked #115 for 9+ min (the default limit is 6 h). Fixed in Layer 1 below                                                                       |
| E2E as required checks                     | **Removed by the maintainer (2026-10-10).** Docs/config PRs now merge without bypass. E2E still gates automerge and deploys; see 1e                              |
| Ignored majors                             | `typescript` 7.x, `@fullcalendar/core` 7.x, `@fullcalendar/react` 7.x. Revisit when typescript-eslint supports TS 7 and the fullcalendar plugins ship a stable 7 |

---

## Discussion summary

**"Use a subagent so this never happens again": why not.** A Claude Code subagent only exists inside one Claude
session. It can't wake up on Monday when Dependabot runs. Ongoing automation needs something that runs on its own
schedule: **GitHub Actions** (deterministic, free, no AI) and, only for the judgement calls, a **scheduled cloud
agent** (`/schedule` routine).

**"Entirely automated, zero developer time": mostly yes, not entirely.**

| Kind of PR                                 | Fully automate?                                                                                                                                                                  |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Patch/minor with green CI (the majority)   | **Yes**, and no AI is needed                                                                                                                                                     |
| Major where upstream isn't ready           | **Mostly.** An agent can diagnose and suggest the ignore; deciding to wait on upstream is a judgement call                                                                       |
| Major that needs code changes (e.g. MUI 9) | **No.** An agent can write the migration PR, but merging its own code with no human review is the risky part. Claude Code's auto mode already blocks it ("merge without review") |

**Supply-chain risk.** Unattended auto-merge plus auto-deploy means a compromised patch release could reach
production within hours. Mitigations: Dependabot `cooldown` (wait N days before proposing a new release), the
existing CI Security Gate (dependency review and audit), and keeping majors behind human review.

**Not requiring Dependabot PRs to be up to date.** The only risk is a _semantic_ merge conflict: two bumps each
pass CI against an older `main`, merge without a textual conflict, then break together (e.g. lockfile or peer ranges
end up inconsistent). It's rare, because lockfile changes usually conflict textually, and then Dependabot rebases
itself. The safety net is already in place: CI and E2E run again on every push to `main`, and production only deploys
when both pass. Worst case, `main` goes red for a while; production is never affected. Accepted for Dependabot
patch/minor; see 1b.

**Target split**: Layer 1 (Actions) handles ~90% of PRs with zero human time. Layer 2 (agent) handles the rest
up to "PR ready for review". Layer 3 (human) spends ~10 min occasionally, only when a major lands.

---

## Proposed design

### Layer 1: deterministic automation (GitHub Actions, no AI)

**1a. Auto-label eligible Dependabot PRs.** New workflow, e.g. `.github/workflows/dependabot-auto-label.yml`:

```yaml
on: pull_request_target # metadata only; NEVER checks out or runs PR code
permissions: { contents: read, pull-requests: read }
jobs:
  label:
    if: github.event.pull_request.user.login == 'dependabot[bot]'
    runs-on: ubuntu-latest
    steps:
      - id: meta
        uses: dependabot/fetch-metadata@v2 # outputs update-type, dependency-type, dependency-names
      - id: app-token
        uses: actions/create-github-app-token@v3 # APP token, so the label fires automerge.yml
        with: { app-id: '${{ secrets.APP_ID }}', private-key: '${{ secrets.APP_PRIVATE_KEY }}' }
      - if: <policy, see open decision 1>
        env: { GH_TOKEN: '${{ steps.app-token.outputs.token }}' }
        run: gh pr edit ${{ github.event.pull_request.number }} --repo ${{ github.repository }} --add-label merge-when-ready
```

Two gotchas that would make a naive version silently do nothing:

1. **A label added with `GITHUB_TOKEN` does not trigger other workflows** (GitHub prevents loops).
   `automerge.yml` runs on `pull_request: labeled`, so the label **must** be added with the GitHub App token.
2. **Workflows triggered by Dependabot only see _Dependabot_ secrets**, and this repo has none. `APP_ID` and
   `APP_PRIVATE_KEY` are Actions secrets. Fix: **`pull_request_target`** (runs with the base branch's code and
   secrets; safe because the job never checks out PR code), or copy both secrets into Dependabot secrets
   (more to rotate; a maintainer must do it).

`automerge.yml` then takes over unchanged: it waits for `CI Security Gate` (required) and `E2E Tests` (optional),
then squash-merges with the App token.

**1b. Let automerged Dependabot PRs merge without being up to date. ✅ DECIDED (2026-10-10).** `strict: true`
stays for everyone, because rulesets can't scope `strict` by PR author (they target the base branch). Instead,
`automerge.yml` merges Dependabot PRs with **`--admin`** (the App is already a ruleset bypass actor) instead of
`--auto`, **after** its existing wait for `CI Security Gate` and `E2E Tests`. This removes the need for any rebase
mechanism. Rejected alternatives: a rebase-on-push workflow (fiddly: one PR at a time, identity Dependabot accepts,
re-labelling after each rebase); merge queue (probably unavailable for user-owned repos).

- Bypass only applies with an explicit `--admin`: a merge without it was refused as "Head branch is out of date"
  (seen 2026-10-10). Verify that `--admin` works for the App identity, and that `--admin` can't be combined with
  `--auto` (it's an immediate merge, which is fine because the workflow has already waited).
- `--admin` bypasses _all_ ruleset checks, so `automerge.yml`'s own CI wait becomes the real gate and must stay
  strict: no merge unless `CI Security Gate` is `success` and `E2E Tests` is `success` or absent.
- Only use `--admin` when the PR author is `dependabot[bot]`. Human PRs keep the normal `--auto` path.
- Residual risk: the semantic-conflict case in the [Discussion summary](#discussion-summary), caught by `main`'s CI.

**1c. `cooldown` in `dependabot.yml`**, e.g. patch/minor 3 days, major 7 days. Check the current syntax in the
Dependabot docs when implementing.

**1d. `timeout-minutes` on E2E jobs** (e.g. 20) and on the Quality Checks job, so a hang fails fast instead of
blocking the queue for up to 6 h.

**1e. E2E and docs/config-only PRs. ✅ RESOLVED (2026-10-10).** The six E2E jobs were required, but `e2e.yml` only
runs on code/package changes (its `paths:` include `package.json` and `package-lock.json`, so **every npm bump
still gets full E2E**). That meant docs/config PRs could never satisfy the required checks. The maintainer removed
the six E2E jobs from the ruleset's required checks. E2E is still enforced in two places:

- `automerge.yml` refuses to merge if E2E ran and failed.
- `deploy-vercel.yml` doesn't deploy a `main` commit whose E2E failed.

Remaining gap: a human _can_ merge a PR with red E2E. If that happens, `main` turns red and deploys pause until it's
fixed; it can't reach production. If it ever bites, add a single required **"E2E result"** aggregate job (runs on
every PR; passes immediately when no relevant paths changed, otherwise `needs:` the browser matrix).

### Layer 2: weekly scheduled cloud agent (judgement calls only)

A `/schedule` routine, e.g. Monday 10:00 UTC, a few hours after Dependabot's 06:00 run and Layer 1's merges.
Instructions:

1. Run the `handle-dependabot` skill over whatever Layer 1 didn't merge (majors, failures, unlabelled PRs).
2. Peer-family split → open a superseding PR (Supersede flow). Upstream not ready → **recommend** an ignore, don't
   post it. Code migration needed → open a draft migration PR with `npm run verify` passing.
3. **Never merge, never label its own PRs, never change workflows/rulesets.**
4. Report: one summary (issue or PR comment) listing what's waiting on a human, with links.

### Layer 3: human, with a review cadence

| When                                                                       | What                                                                                                  | Time    |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------- |
| **Weekly**, Monday afternoon/Tuesday (after the 06:00 UTC run and Layer 1) | Read the Layer 2 report; merge ready migration PRs or defer them                                      | ~15 min |
| **Monthly**                                                                | Review the ignore list (TS 7, fullcalendar 7); close or decide anything older than ~4 weeks           | ~15 min |
| **As they arrive**                                                         | Critical/high **security** alerts that automation can't merge (usually majors): same/next working day | varies  |

Conflicts can wait: Dependabot rebases its own PRs on conflict (unless someone else pushed to the branch). Two
reasons not to let things sit indefinitely:

- **Stuck PRs use up slots.** `open-pull-requests-limit: 10` caps open version-update PRs. Ten stuck PRs means no
  new ones arrive, without any warning. That's how this backlog formed unnoticed, so do the monthly sweep.
- **Majors compound.** MUI went 7 → 9 in one jump. Don't defer a major for more than a month or two.

---

## Open decisions

1. **Auto-merge policy (the `if:` in 1a).** Options:
   - (a) dev dependencies: patch + minor; production: patch only. **Safer.** Production minors (React, MUI, Next) go to Layer 2/human.
   - (b) all patch + minor, dev and production. **Faster.** Relies on CI + E2E to catch UI regressions in minors.
   - GitHub Actions group PRs: always auto-merge? (Proposed: yes for minor/patch, human for majors.)
2. **Secrets route for 1a**: `pull_request_target` (proposed) vs Dependabot secrets.
3. ~~Rebase mechanism for 1b~~ ✅ Decided: no rebase mechanism; automerge Dependabot PRs with `--admin` (see 1b).
4. **Cooldown days**: proposed 3 (patch/minor) / 7 (major).
5. **Layer 2 schedule and notification channel**: GitHub issue vs PR comment vs push notification.
6. ~~Required E2E vs docs PRs~~ ✅ Resolved: E2E removed from required checks by the maintainer (see 1e).

## Implementation checklist

Each item is its own PR (Conventional Commits; `ci:`/`build:` scope). Layer 1 PRs change workflows, so they need
the maintainer's review and are **not** agent-merged.

- [ ] Re-check [Facts](#facts-checked-2026-10-10) (rulesets, bypass actors, secrets, labels)
- [ ] 1d `timeout-minutes` on CI/E2E jobs (smallest; do first)
- [x] 1e E2E removed from required checks (maintainer, 2026-10-10)
- [ ] 1a auto-label workflow with the chosen policy; test on a real Dependabot patch PR
- [ ] 1b `automerge.yml`: `--admin` merge for `dependabot[bot]` PRs after the CI wait; test with 2+ labelled PRs open at once
- [ ] 1c `cooldown` in `dependabot.yml`
- [ ] Update `docs/ci-pipeline.md`, `handle-dependabot` and `merge-open-prs` skills (`docs-sync` skill)
- [ ] Layer 2 `/schedule` routine
- [ ] One full Monday cycle observed end-to-end; adjust

## Facts checked (2026-10-10)

- Ruleset `main-protection` (id 14392511): squash only, linear history, **`strict_required_status_checks_policy:
true`**, 0 required approvals, `copilot_code_review` on push. Required checks: `Quality Checks`,
  `Production Dependency Audit`, `Dependency Review`. (The six Seeded/Unauth E2E jobs were required until the
  maintainer removed them on 2026-10-10.)
- Bypass actors (mode `pull_request`): repository admin role and two Integrations (one is the automerge App).
  The App can merge despite the checks, which is why `automerge.yml` waits for CI itself.
- Repo settings: `allow_auto_merge: true`, `allow_squash_merge: true`, `delete_branch_on_merge: false`.
- Label `merge-when-ready` exists. Actions secrets: `APP_ID`, `APP_PRIVATE_KEY`, `NEXTAUTH_SECRET`, `VERCEL_*`.
  Dependabot secrets: none.
- `e2e.yml` has `paths:` filters on `pull_request` and `push`.
- Repo owner `lonelydev` is a user account (merge queue probably unavailable; no longer needed, see 1b).

## Related

- [ci-pipeline.md](./ci-pipeline.md): workflows, Dependabot grouping and ignore commands
- `.claude/skills/handle-dependabot/`, `.claude/skills/merge-open-prs/`: the manual/agent playbooks this automates
- `.github/workflows/automerge.yml`: the merge half of Layer 1, already in place
