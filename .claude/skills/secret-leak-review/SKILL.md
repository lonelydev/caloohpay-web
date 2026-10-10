---
name: secret-leak-review
description: Review a diff or the codebase for leaks of the PagerDuty token, OAuth client secret or NextAuth secret through logs, API responses, client bundles, URLs or committed files. Use on any change touching auth, API routes, logging, env vars or error handling.
---

# Secret-leak review

Secrets: the PagerDuty access token (OAuth bearer or User API token, held in the NextAuth session/JWT),
`PAGERDUTY_CLIENT_SECRET`, `NEXTAUTH_SECRET`. Only `NEXT_PUBLIC_*` env vars are legitimately client-visible.
Safe paths: `src/lib/auth/options.ts`, `getPagerDutyHeaders` in `src/lib/utils/pagerdutyAuth.ts`,
`src/lib/utils/urlSanitization.ts`.

## Steps

1. **Scope**: review `git diff main...HEAD` (or the files the user names). For a full audit, review `src/`.
2. **Grep for risky sinks**:

   ```bash
   grep -rnE "console\.(log|error|warn|info|debug)" src --include=*.ts --include=*.tsx | grep -v __tests__
   grep -rnE "accessToken|process\.env|PAGERDUTY_CLIENT_SECRET|NEXTAUTH_SECRET" src | grep -v __tests__
   grep -rn "NEXT_PUBLIC_" src .env.example
   ```

3. **For each hit**, check that:
   - the token is not logged, interpolated into error messages, returned in a JSON response, or put in a URL/query string;
   - raw upstream PagerDuty errors/headers are logged server-side only and not forwarded to the client;
   - the token is only exposed to the client where the session type already does so deliberately — prefer server routes;
   - nothing secret has a `NEXT_PUBLIC_` prefix (it ships in the browser bundle);
   - client components (`'use client'`) don't import server-only modules or read non-public env vars;
   - CSV export (`src/lib/utils/csvExport.ts`) and analytics events contain no secrets.
4. **Committed files**: `git ls-files | grep -E "(^|/)\.env"` must list only `.env.example`, with empty or placeholder values.
   Scan the diff (including tests, docs, Playwright fixtures) for long opaque strings assigned to token/secret/key names.
5. **Report** findings as `file:line: sink → why it can leak → suggested fix`. For a broader pass also run `/security-review`.
