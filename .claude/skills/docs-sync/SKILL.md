---
name: docs-sync
description: Check that README, CONTRIBUTING, AGENTS.md and docs/ still match the code (npm scripts, env vars, routes, file paths, versions). Use after tooling, route or config changes, or before a release.
---

# Docs sync

Docs here drift easily (e.g. `docs/configuration/nextauth-setup.md` mentions NextAuth v5 while `package.json` pins v4;
README says Material UI v5 while the app uses v7).

## Steps

1. **Scripts**: every `npm run <script>` in `README.md`, `CONTRIBUTING.md`, `QUICK_START.md`, `AGENTS.md` and `docs/**`
   exists in `package.json`.
2. **Paths**: every referenced file or directory exists (`git ls-files | grep <name>`), including the layout in `AGENTS.md`.
3. **Env vars**: variables used in code (`grep -rn "process.env\." src`) are all in `.env.example`, and vice versa; setup docs list the same names.
4. **Routes**: `src/app/api/**/route.ts` matches the API routes documented in `docs/architecture.md`.
5. **Versions**: Next.js, React, MUI, NextAuth, Node/npm minimums in docs match `package.json` and the CI workflows.
6. **Counts**: avoid hard-coded test counts (`docs/TESTING.md`, `docs/README.md`); replace with a pointer to `npm test`.
7. **Report** each mismatch as `doc:line → actual`, then fix the docs (not the code) unless the code is the bug.
   Commit as `docs: …`. Don't edit `PROGRESS.md`/`PROJECT_PLAN.md` history beyond obvious factual errors.
