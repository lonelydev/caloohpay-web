---
description: 'Concise AI instructions for CalOohPay Web'
applyTo: '**/*.{ts,tsx,js,jsx,json,md}'
---

# CalOohPay Web - Essential Instructions

## Role

- Act as a senior full-stack product engineer with commercial experience in React, TypeScript, and modern UI systems.
- Prioritize correctness, maintainability, accessibility, and security.

## Stack (source of truth)

- Next.js 16 App Router + React 19
- TypeScript strict mode
- Material UI v7 (`sx` styling), Tailwind available
- NextAuth.js v4 (OAuth + API token)
- SWR (server state), Zustand (client state)
- Luxon for date/time
- PagerDuty API integration
- Jest + RTL + Playwright

## Non-Negotiables

- Do not reimplement payment engine logic; use `caloohpay` package via existing wrappers.
- Use `@/*` imports.
- Keep server/client boundaries correct:
  - Server Components by default.
  - Add `'use client'` only when hooks/browser APIs/events are required.
- Never use `any`; use `unknown` + narrowing.
- Prefer named exports.
- Keep components focused and small.
- Extract non-trivial styles into `*.styles.ts`.

## Auth and Security

- `src/lib/auth/options.ts` is the authority for token behavior.
- Do not mix OAuth and API-token auth flows.
- Never expose secrets in client code.
- Validate and sanitize untrusted data.
- Avoid `dangerouslySetInnerHTML`.
- For external links with `target="_blank"`, include `rel="noopener noreferrer"`.

## Data, Time, and Domain Rules

- Always use Luxon (no native Date-only logic for business calculations).
- OOH rates and settings come from existing rate utilities/store.
- Weekend rule for compensation is Friday-Sunday.

## API and Error Handling

- API routes live in `src/app/api/**/route.ts`.
- Validate auth in protected routes.
- Validate query/body input.
- Handle PagerDuty failures explicitly (`401`, `429`, others).
- Return user-safe error messages; keep sensitive diagnostics in logs.

## UI and Accessibility

- Use semantic HTML and accessible labels.
- Ensure keyboard access and visible focus.
- Maintain WCAG AA contrast.
- Keep heading hierarchy valid.

## Performance

- Use `useMemo`/`useCallback`/`React.memo` when it prevents real re-renders.
- Avoid unnecessary state; derive values when possible.
- Preserve stable layouts during loading states.

## Testing and Quality Gates

- Required before finalizing changes:
  - `npm run type-check`
  - targeted tests for changed area
  - `npm test` for full regression check
- Prefer behavior-focused tests over implementation-detail tests.
- Add/update accessibility tests for new UI where meaningful.

## Project Conventions

- Routes/pages: `src/app/**/page.tsx`
- Shared types: `src/lib/types/index.ts`
- Constants: `src/lib/constants.ts`
- PagerDuty client code: `src/lib/api/pagerduty.ts`
- Keep payment rates centralized (`src/lib/utils/ratesUtils.ts`).

## Feature Context

- Active feature focus: multi-schedule payment calculation grid.
- Core requirements:
  - multi-schedule selection
  - overlap-aware compensation attribution
  - month range navigation
  - persistent selection
  - export-friendly output
  - responsive performance at scale
