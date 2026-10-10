# AGENTS.md

Guide for AI coding agents (Claude Code, Copilot, Codex, Cursor, etc.) working in this repo.
Humans: see [CONTRIBUTING.md](CONTRIBUTING.md) and [docs/README.md](docs/README.md) — this file is the condensed, agent-oriented version.

## What this is

CalOohPay Web: a Next.js 16 (App Router, React 19) app that reads PagerDuty schedules and calculates
out-of-hours (OOH) on-call compensation. The payment engine is the npm package
[`caloohpay`](https://github.com/lonelydev/caloohpay), consumed via `src/lib/caloohpay.ts`
(`caloohpay/core`, browser-safe). This repo is the UI, auth and API layer around it.

## Commands

Node LTS, npm. Run from the repo root.

| Task                  | Command                                               | Notes                                                                                                |
| --------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Install               | `npm ci`                                              | `postinstall` downloads Playwright Chromium (skipped on Vercel)                                      |
| Dev server            | `npm run dev`                                         | needs `.env.local` (copy `.env.example`)                                                             |
| Typecheck             | `npm run type-check`                                  | `tsc --noEmit`                                                                                       |
| Lint                  | `npm run lint`                                        | CI runs `npm run lint -- --max-warnings=0`; autofix: `npm run lint:fix`                              |
| Format                | `npm run format:check` / `npm run format`             | Prettier                                                                                             |
| Unit tests            | `npm test`                                            | Jest + RTL, jsdom, no network or PagerDuty token needed                                              |
| One test file         | `npx jest src/lib/utils/__tests__/ratesUtils.test.ts` |                                                                                                      |
| One test by name      | `npx jest -t "should …"`                              |                                                                                                      |
| Build                 | `npm run build`                                       |                                                                                                      |
| Full gate             | `npm run verify`                                      | lint (no warnings) + type-check + tests + build — run before declaring done                          |
| E2E (seeded auth)     | `npm run test:e2e:seeded`                             | Playwright; see [docs/e2e-test-runner.md](docs/e2e-test-runner.md). Slow — only when UI flows change |
| E2E (unauthenticated) | `npm run test:e2e:unauth`                             |                                                                                                      |

## Layout

```text
src/
  app/                  # App Router. Server Components by default
    api/**/route.ts     # Route handlers: schedules, analytics, reports/multi-schedule, auth, health
    schedules/          # list, [id] (list + calendar views, analytics), payment-grid
    login/  settings/
  components/           # analytics/ common/ features/ schedules/ settings/
  hooks/  context/
  lib/
    api/                # pagerduty.ts (client), fetchers.ts (SWR fetchers)
    auth/options.ts     # NextAuth options — the authority for token behaviour
    stores/             # Zustand (settingsStore)
    utils/              # ratesUtils, scheduleUtils, calendarUtils, csvExport, pagerdutyAuth, validation, …
    caloohpay.ts        # re-exports from `caloohpay/core` — the only door to the payment engine
    constants.ts  types/
tests/                  # e2e/ (Playwright), utils/ (test helpers, auth mock)
docs/  product-specs/   # architecture, testing, CI; feature specs
```

Unit tests are colocated in `__tests__/` folders next to the code. Playwright specs are in `tests/e2e/`.

## Domain rules (don't change without being asked)

- **Never reimplement payment logic.** Use `OnCallPeriod` / `OnCallUser` / `OnCallPaymentsCalculator` from
  `@/lib/caloohpay`. If the rule itself is wrong, it is fixed upstream in `caloohpay`, not here.
- Weekend for compensation is **Friday–Sunday** (Mon–Thu are weekdays). This is intentional.
- Rates and settings come from `src/lib/utils/ratesUtils.ts` and the settings store — keep rates centralised.
- Business date/time logic uses **Luxon** with explicit IANA timezones, never bare `Date`.
- Multi-schedule reports must be overlap-aware (see [product-specs/multi-schedule-payment-calculation.md](product-specs/multi-schedule-payment-calculation.md)).

## Invariants

1. **Auth**: `src/lib/auth/options.ts` governs token behaviour. Support OAuth and API-token flows, never mix them.
   `getPagerDutyHeaders(accessToken, authMethod)` builds the correct `Authorization` header — don't hand-roll it.
2. **Secrets stay server-side.** Only `NEXT_PUBLIC_*` vars may reach the client. Never log, return or put in a URL
   the PagerDuty token, `PAGERDUTY_CLIENT_SECRET` or `NEXTAUTH_SECRET`. Never create or commit a real `.env*`
   (only `.env.example`; `.env.local` is gitignored).
3. **Route handlers** (`src/app/api/**/route.ts`): check `getServerSession(authOptions)` first and return 401 if
   missing; validate query/body input; map PagerDuty `401`/`429`/other failures explicitly; return user-safe
   messages and keep raw upstream errors out of responses. Use the `add-api-route` skill.
4. **Server/client boundary**: add `'use client'` only when hooks, browser APIs or event handlers need it.
5. **TypeScript strict, no `any`** — use `unknown` and narrow. Prefer named exports. Use `@/*` imports for `src/`.
6. **No `dangerouslySetInnerHTML`**; external `target="_blank"` links need `rel="noopener noreferrer"`.
7. **Tests must not hit the network.** Mock PagerDuty/`fetch`; use helpers in `tests/utils/` (e.g. `authMock`).

## Conventions

- **UI**: MUI v7 with `sx`; non-trivial styles go in a sibling `*.styles.ts` (see [docs/styling-architecture.md](docs/styling-architecture.md)).
  Semantic HTML, labelled controls, keyboard access, valid heading order, WCAG AA contrast.
- **State**: SWR for server state, Zustand for client state. Derive values instead of adding state.
- **Tests**: behaviour-focused (React Testing Library queries by role/label), AAA structure. A behaviour change needs a
  test that fails before and passes after. Add accessibility assertions for new UI where meaningful.
- **Style**: small focused components; comments explain _why_; no silent `catch`.
- **Commits**: Conventional Commits, enforced by commitlint (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:`,
  optional scope e.g. `fix(calendar): …`). Branches: `feat/…`, `fix/…`, `docs/…`, `chore/…`.

## Git hooks (Husky)

`pre-commit` runs `lint-staged` (eslint --fix + prettier on staged files — **may modify files**; re-stage if so).
`commit-msg` runs commitlint. Don't bypass with `--no-verify`.

## Don't

- Edit `package-lock.json` by hand, or commit `.next/`, `playwright-report/`, `test-results/`, `coverage/`.
- Add dependencies without a reason; don't bump `caloohpay` or major versions unless asked.
- Weaken CI, security workflows or `.github/dependabot.yml` to make something pass.
- Push to `main`, force-push, or merge PRs unless explicitly asked. CI is the gate: `.github/workflows/ci-security-gate.yml`.

## Definition of done

1. `npm run verify` passes (E2E additionally if you changed a user flow and can run it).
2. New or changed behaviour has tests.
3. Docs updated if commands, env vars, routes or invariants changed (`docs-sync` skill).

## Agent tooling in this repo

Skills in [.claude/skills/](.claude/skills/): `add-api-route`, `add-ui-component`, `calendar-shift-debug`, `multi-schedule-overlap-check`, `auth-change-review`, `secret-leak-review`, `e2e-triage`, `docs-sync`, `prepare-pr`, `handle-dependabot`.
Subagent in [.claude/agents/](.claude/agents/): `test-writer`. Shared permissions: [.claude/settings.json](.claude/settings.json).
