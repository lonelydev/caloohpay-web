---
name: add-api-route
description: Add or change a Next.js route handler under src/app/api that proxies PagerDuty, following the repo's auth, validation and error-handling pattern. Use when creating a new /api endpoint or modifying an existing one.
---

# Add an API route

Reference implementation: `src/app/api/schedules/route.ts` and its test in `src/app/api/schedules/__tests__/`.

## Steps

1. Create `src/app/api/<name>/route.ts` exporting named handlers (`GET`, `POST`, …).
2. **Authenticate first**: `const session = await getServerSession(authOptions)`; if `!session?.accessToken` return
   `NextResponse.json({ error: 'Unauthorized' }, { status: 401 })`.
3. **Validate input** (`searchParams` / body) explicitly (Zod is a dependency; `src/lib/utils/validation.ts` has existing helpers); return 400 with a
   user-safe message on failure. Clamp pagination/limits. Never interpolate unvalidated input into upstream URLs —
   build them with `URLSearchParams` / `encodeURIComponent`.
4. **Call PagerDuty** with `getPagerDutyHeaders(session.accessToken, session.authMethod)` from `@/lib/utils/pagerdutyAuth`.
5. **Map failures explicitly**: upstream 401 → 401 "Invalid or expired PagerDuty token"; 429 → 429 (pass `Retry-After`
   if present); other → upstream status with a generic message. Log diagnostics server-side only, never the token or raw headers.
6. **Shape the response** to match existing types in `src/lib/types/`; add a fetcher in `src/lib/api/fetchers.ts` if the UI uses SWR.
7. **Test** (`__tests__/route.test.ts`): 401 without session, 400 on bad input, each upstream failure mapping, happy path.
   Mock `next-auth` and `fetch`; no network.
8. Run `npm run verify`, then the `secret-leak-review` skill on the diff. Document the route in `docs/architecture.md` if it's public-facing.
