---
name: triage-dependabot
description: Sort open Dependabot PRs into priority lanes (SECURITY, CLOSE, FAST, REVIEW, FIX, WAIT) with a time estimate, so a maintainer clears the cheap ones first and books the rest. Read-only. Use at the start of a weekly Dependabot slot, before handle-dependabot or merge-open-prs, or when asked "what should I do about these Dependabot PRs?".
---

# Triage Dependabot PRs

This skill only reads. It never comments, labels, closes or merges. The output is a prioritised plan that the maintainer (or `handle-dependabot` / `merge-open-prs`) acts on.

## 1. Run the script

```bash
REVIEW_PACKAGES='^(next|next-auth|react|react-dom|@mui/.*|caloohpay|typescript)$' \
  .claude/skills/triage-dependabot/triage.sh
```

- `REVIEW_PACKAGES` is this repo's human-only list (same as `handle-dependabot`).
- Don't set `IGNORE_CHECKS='^Vercel$'` on your own: a rate-limited Vercel check is the user's call (see `merge-open-prs`).
- `STRICT_PROD=1` sends production minors to REVIEW. Use it until the auto-merge policy in `docs/dependabot-automation-plan.md` is decided.
- `--json` gives the same data for further processing. `-R owner/repo` triages another repo.

## 2. Lanes

The script puts each PR in the first lane that matches, oldest first within a lane:

| Lane     | Means                                                                                                      | Budget  | When         |
| -------- | ---------------------------------------------------------------------------------------------------------- | ------- | ------------ |
| SECURITY | Fixes an open Dependabot alert (or is a grouped security update)                                           | ~10 min | today        |
| CLOSE    | `main` already has the target version, or a newer open PR covers every package in it                       | ~1 min  | this slot    |
| FAST     | CI green, no major, not on the review list, no maintainer change                                           | ~2 min  | this slot    |
| REVIEW   | CI green but a major (0.x minors count), on the review list, a new releaser, or versions it couldn't parse | ~15 min | monthly slot |
| FIX      | CI failing or conflicts. "also failing on main" means systemic: fix `main` first                           | ~30 min | monthly slot |
| WAIT     | CI still running                                                                                           | 0       | re-run later |

## 3. Add the judgement the script can't

Do these only for PRs in the lane named, and keep each one short:

- **SECURITY**: `gh api repos/{owner}/{repo}/dependabot/alerts?state=open` → name the advisory and severity. A failing security PR goes to the top of the report, not to the monthly slot.
- **CLOSE**: confirm with `grep '"<pkg>"' package.json` that `main` really has the version. Don't close it yourself: list the `gh pr close N --comment "Superseded by …"` command for the user.
- **REVIEW, major**: read the "Release notes" / "Changelog" `<details>` in the PR body (`gh pr view N --json body`) and quote the breaking changes that touch code we use (`grep -rn "<pkg>" src/`). Say "migration needed" or "no code change expected".
- **REVIEW, new releaser**: run the provenance check from `docs/dependabot-automation-plan.md` (Layer 2, step 3). Report "provenance OK: built from <repo>@<tag>" or "needs human: possible supply-chain risk".
- **FIX**: run `handle-dependabot`'s **Diagnose** table on the failing step. If the triage says "also failing on main", stop and report that `main` is broken; don't diagnose the PRs.
- **Open-PR limit**: if the open count for an ecosystem equals `open-pull-requests-limit` in `.github/dependabot.yml` (10 here), say so. Dependabot is holding updates back until the queue drains.

## 4. Report

```text
Do now (~N min)       SECURITY, CLOSE and FAST rows, with the exact next command
Book for the month    REVIEW and FIX rows, with your one-line finding for each
Waiting               WAIT rows; re-run triage after CI
```

Then offer the hand-off: FAST and green SECURITY → `handle-dependabot` (label) or `merge-open-prs` (merge), when the user says so. Never merge or label from this skill.
