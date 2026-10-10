---
name: add-ui-component
description: Add or change a React/MUI component following repo conventions (server vs client boundary, sibling styles file, named exports, accessible markup, RTL test). Use when creating a new component or page section under src/components or src/app.
---

# Add a UI component

Style reference: `docs/styling-architecture.md`. Neighbours to copy: `src/components/common/`, `src/components/schedules/`, `src/components/settings/`.

## Steps

1. **Place it**: shared → `src/components/<area>/`; page-specific → next to the page in `src/app/<route>/components/`. One component per file, **named export**, `@/` imports.
2. **Boundary**: Server Component by default. Add `'use client'` only for hooks, browser APIs or event handlers, and keep the client part as small as possible (push it to a leaf).
3. **Styles**: MUI v7 `sx`. Anything beyond a couple of properties goes in a sibling `<Name>.styles.ts`. Use theme tokens from `src/styles/theme.ts`, not hex literals.
4. **Data**: server state via SWR (fetchers in `src/lib/api/fetchers.ts`); client state via Zustand (`src/lib/stores`). Derive instead of storing. Rates come from `src/lib/utils/ratesUtils.ts` / the settings store. Dates use Luxon.
5. **Accessibility**: semantic elements, labels on every control, visible focus, full keyboard path, valid heading order, AA contrast, `aria-live` for async status. External `target="_blank"` links need `rel="noopener noreferrer"`. No `dangerouslySetInnerHTML`.
6. **Loading/empty/error states** keep the layout stable (skeletons of the same size) and show user-safe messages.
7. **Test** in `__tests__/<Name>.test.tsx` with React Testing Library: query by role/label, drive with `userEvent`, assert on visible behaviour, include loading/empty/error and one keyboard interaction. Mock `fetch`/SWR; no network. Use `tests/utils/` helpers.
8. `npm run verify`. If it changes a user flow covered by `tests/e2e/`, update or run the relevant spec (see `e2e-triage`).
