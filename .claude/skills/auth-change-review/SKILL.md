---
name: auth-change-review
description: Review a change to authentication for correctness (OAuth vs API-token separation, token refresh, JWT/session callbacks, route protection, the E2E test-session endpoint). Use on any diff touching src/lib/auth, src/proxy.ts, src/app/api/auth, src/app/api/test/session or the login page.
---

# Auth change review

A bug here locks every user out or exposes data. This is a correctness review; for leaks also run `secret-leak-review`.

Code: `src/lib/auth/options.ts` (providers; `jwt`, `session` callbacks; `refreshAccessToken`), `src/lib/utils/pagerdutyAuth.ts`,
`src/proxy.ts` (route protection), `src/app/login/`, `src/app/api/test/session/route.ts`. Docs: `AUTHENTICATION.md`, `docs/configuration/nextauth-setup.md`.
Note the repo uses **next-auth v4** (some docs say v5).

## Checklist

1. **Flow separation.** `authMethod` is `'oauth'` or `'api-token'` end to end. API-token sessions never attempt a refresh or send a `Bearer` header; OAuth sessions never send `Token token=`. `getPagerDutyHeaders` is the only header builder.
2. **Refresh.** Only OAuth, only when `accessTokenExpires` has passed; failure yields an error state that signs the user out or prompts re-login instead of looping or leaving a stale token.
3. **Callbacks.** `jwt` stores only what's needed; `session` exposes `accessToken`/`authMethod` deliberately (route handlers need it). No new sensitive fields leak into the session.
4. **Protection.** Every non-public page and every `route.ts` except `/api/health` and `/api/auth/*` checks the session (page-level via `src/proxy.ts`, API via `getServerSession(authOptions)`). A new route without a check is a finding.
5. **Test session endpoint.** `src/app/api/test/session/route.ts` must stay 404 when `NODE_ENV === 'production'` or `ENABLE_TEST_SESSION_SEED !== 'true'`, and must only mint a fake token. Check nothing enables the flag in `vercel.json`, deploy workflows or `.env.example`.
6. **Config.** New env vars are in `.env.example` (placeholders only) and documented; none secret is `NEXT_PUBLIC_`.
7. **Tests.** `src/lib/auth/__tests__/` covers the changed branch: OAuth sign-in, API-token sign-in with a bad token, refresh success/failure, expired token.
8. **Run** `npm run verify` and `npm run test:e2e:unauth` plus `npm run test:e2e:seeded -- tests/e2e/auth.spec.ts`.

## Report

`file:line: issue → impact → fix`, ordered by severity, then the checklist items you could not verify.
