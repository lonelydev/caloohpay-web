# Testing Guide

## Overview

CalOohPay has comprehensive test coverage across unit, integration, and end-to-end tests. The test suite ensures code quality, prevents regressions, and validates the progressive search functionality.

## Test Statistics

- **Total Tests**: 226+ passing (15+ test suites)
- **Unit Tests**: 218+ (96.5%)
- **E2E Tests**: 12 (3.5%)
- **Coverage Target**: >80%
- **Latest Additions**:
  - Login page modular components: 104 tests (5 new suites)
  - NextAuth route handler: 9 tests (100% coverage)

## Test Structure

```
tests/
├── unit/                           # Unit tests for components and utilities
│   ├── app/
│   │   └── login/
│   │       ├── hooks/
│   │       │   └── useLoginForm.test.tsx          # 57 tests
│   │       └── components/
│   │           ├── OAuthForm.test.tsx             # 15 tests
│   │           ├── TokenForm.test.tsx             # 22 tests
│   │           ├── LoginHeader.test.tsx           # 5 tests
│   │           └── LoginFooter.test.tsx           # 5 tests
│   └── components/
│       └── schedules/
│           ├── PaginationControls.test.tsx        # 17 tests
│           ├── MonthNavigation.test.tsx           # 19 tests
│           ├── ScheduleCard.test.tsx              # 16 tests
│           └── CalendarView.test.tsx              # Component tests
├── integration/                    # Integration tests (future)
└── e2e/                           # End-to-end tests
    ├── auth.spec.ts               # 12 authentication tests
    ├── schedules.spec.ts          # Schedule browsing
    ├── calendar-view.spec.ts      # Calendar view tests
    ├── pagination-stability.spec.ts # 6 layout stability tests
    └── console.spec.ts            # Console error tests

src/app/schedules/__tests__/
└── page.test.tsx                  # 19 tests (includes 8 progressive search tests)

src/app/schedules/[id]/__tests__/
└── page.test.tsx                  # Schedule detail page tests

src/app/api/auth/[...nextauth]/__tests__/
└── route.test.ts                  # 9 tests (NextAuth route handler)

src/app/api/schedules/__tests__/
└── route.test.ts                  # API route tests
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run in watch mode
npm run test:watch

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- "path/to/test.tsx"

# Run tests matching pattern
npm test -- --testNamePattern="progressive search"
```

### E2E Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run with UI (interactive mode)
npm run test:e2e:ui

# Run specific browser
npm run test:e2e -- --project=chromium

# View test report
npm run test:e2e:report
```

## Playwright Configuration

### Log Filtering

The Playwright configuration pipes `stderr` and `stdout` to suppress non-critical NextAuth JWT decryption warnings during test runs. These warnings occur when NextAuth encounters unauthenticated requests during E2E tests but don't affect test results.

```typescript
// playwright.config.ts
webServer: {
  command: 'npm run dev',
  stderr: 'pipe',  // Suppress verbose logs
  stdout: 'pipe',
}
```

## E2E Auth Seeding

Seeded authentication enables running E2E tests as an already-authenticated user using NextAuth’s JWT session strategy.

- **Toggle**: Controlled by `ENABLE_TEST_SESSION_SEED`.
- **Env vars**:
  - `ENABLE_TEST_SESSION_SEED=true` to enable seeding.
  - `NEXTAUTH_SECRET` must be set (used by NextAuth JWT encoder).
- **How it works**:
  - Global setup hits the test-only endpoint at `/api/test/session` to set a valid NextAuth session cookie, then saves storage state to `tests/e2e/.auth/state.json`.
  - The endpoint is gated and returns 404 when seeding is disabled.
- **Playwright projects**:
  - Seeded projects: `chromium (seeded)`, `firefox (seeded)`, `webkit (seeded)` use `storageState` and set the required env vars.
  - Unauthenticated projects: `chromium (unauth)`, `firefox (unauth)`, `webkit (unauth)` run with seeding disabled.
- **Run examples**:
  - Seeded: `npm run test:e2e -- --project="chromium (seeded)"`
  - Unauth: `npm run test:e2e -- --project="chromium (unauth)"`
- **CI usage**:
  - Provide `NEXTAUTH_SECRET` via CI secrets.
  - Run both seeded and unauth projects to cover authenticated flows and login/redirect behavior.
  - Example: `npm run test:e2e` (executes all configured projects).

### Quick Reference

| Use Case               | Command                                             | Env Required                                  |
| ---------------------- | --------------------------------------------------- | --------------------------------------------- |
| All seeded tests       | `npm run test:e2e:seeded`                           | `NEXTAUTH_SECRET` (default: `dev-e2e-secret`) |
| Seeded UI mode         | `npm run test:e2e:seeded:ui`                        | `NEXTAUTH_SECRET` (default: `dev-e2e-secret`) |
| All unauth tests       | `npm run test:e2e:unauth`                           | None                                          |
| Unauth UI mode         | `npm run test:e2e:unauth:ui`                        | None                                          |
| Single seeded browser  | `npm run test:e2e -- --project="chromium (seeded)"` | Set via shell scripts                         |
| Single unauth browser  | `npm run test:e2e -- --project="chromium (unauth)"` | Set via shell scripts                         |
| Shell wrapper (seeded) | `./scripts/e2e-seeded.sh`                           | Auto-set                                      |
| Shell wrapper (unauth) | `./scripts/e2e-unauth.sh`                           | Auto-set                                      |

**Note**: Shell scripts (`scripts/e2e-*.sh`) automatically set required environment variables and accept pass-through arguments.

## Progressive Search Test Coverage

### Unit Tests (8 tests in `src/app/schedules/__tests__/page.test.tsx`)

1. **should show local results immediately when searching**
   - Validates instant local cache filtering
   - Ensures 0ms latency for cached results

2. **should trigger API search while showing local results**
   - Confirms parallel API search execution
   - Tests simultaneous local + API search

3. **should show "Searching API..." indicator when search is in progress**
   - Tests loading state chip display
   - Validates user feedback during API calls

4. **should clear search state when search query is removed**
   - Ensures proper cleanup of search state
   - Tests return to normal pagination mode

5. **should reset page to 1 when searching**
   - Validates pagination reset on new search
   - Prevents showing empty pages

6. **should handle search with no local results**
   - Tests fallback when cache is empty
   - Validates API-only search path

7. **should deduplicate merged local and API results**
   - Confirms no duplicate schedules shown
   - Tests Map-based deduplication logic

8. **should handle rapid search query changes**
   - Tests resilience with fast typing
   - Ensures stable behavior during rapid state changes

## Login Page Test Coverage (December 2025)

### New Test Suites: 104 tests total

#### `useLoginForm.test.tsx` - 57 tests

Custom hook business logic testing covering:

- **Initialization** (3): Default values, URL error parsing
- **Authentication redirect** (3): Status-based navigation
- **OAuth sign-in** (3): Flow trigger, loading, errors
- **Token sign-in** (9): Validation, trimming, errors, loading
- **Auth method change** (3): Tab switching, error clearing
- **Error messages** (5): All error types from constants

**Key Patterns**:

```typescript
// Test hook initialization
const { result } = renderHook(() => useLoginForm());
expect(result.current.authMethod).toBe('oauth');

// Test async operations with act
await act(async () => {
  await result.current.handleOAuthSignIn();
});
expect(mockSignIn).toHaveBeenCalled();

// Test loading states with waitFor
await waitFor(() => {
  expect(result.current.isLoading).toBe(false);
});
```

#### `OAuthForm.test.tsx` - 15 tests

Component rendering and interaction:

- Rendering (4): Button, text, permissions
- Button behavior (5): Click, disabled/enabled, text changes
- Accessibility (2): Roles, icons

#### `TokenForm.test.tsx` - 22 tests

Form validation and interaction:

- Rendering (5): Input, button, alerts, instructions
- Input behavior (7): onChange, Enter key, validation states
- Button behavior (7): Click, disabled states, text changes
- Error handling (1): Helper text display
- Accessibility (2): Labels, icons

**Key Patterns**:

```typescript
// Test form input
const input = screen.getByLabelText(/API Token/i);
fireEvent.change(input, { target: { value: 'test-token' } });
expect(mockOnTokenChange).toHaveBeenCalledWith('test-token');

// Test Enter key
fireEvent.keyDown(input, { key: 'Enter' });
expect(mockOnSignIn).toHaveBeenCalledTimes(1);

// Test disabled state
const button = screen.getByRole('button');
expect(button).toBeDisabled();
```

#### `LoginHeader.test.tsx` - 5 tests

Branding and layout validation

#### `LoginFooter.test.tsx` - 5 tests

Link validation and security attributes

### E2E Test Updates - `auth.spec.ts`

Added 4 new/updated tests for tab-based UI:

1. **should display login page with OAuth tab by default**
   - Validates tab presence and initial selection

2. **should switch between OAuth and API Token tabs** (NEW)
   - Tests tab navigation
   - Verifies form changes with tabs

3. **should validate empty API token** (NEW)
   - Tests disabled button state

4. **should enable API token button when token is entered** (NEW)
   - Validates enabled state with input

**Key Patterns**:

```typescript
// Test tab navigation
await page.getByRole('tab', { name: /API Token/i }).click();
await expect(page.getByLabel(/API Token/i)).toBeVisible();

// Test form validation
const button = page.getByRole('button', { name: /Sign in with API Token/i });
await expect(button).toBeDisabled();

// Type in input
await page.getByLabel(/API Token/i).fill('test-token');
await expect(button).toBeEnabled();
```

### Calendar View E2E Tests - `calendar-view.spec.ts`

Tests calendar navigation with icon-only buttons:

**Icon-Only Button Testing Pattern**:

```typescript
// Use exact aria-label strings (not regex) for icon-only buttons
const nextButton = page.getByRole('button', { name: 'Next month' });
const prevButton = page.getByRole('button', { name: 'Previous month' });

await nextButton.click();
// Month should change in calendar
```

**Key Tests**:

- ✅ Month navigation with icon-only controls
- ✅ FullCalendar built-in buttons are hidden
- ✅ Custom navigation accessible via aria-labels

## Component Refactoring Test Patterns

5. **should reset page to 1 when searching**
   - Validates pagination reset on new search
   - Prevents showing empty pages

6. **should handle search with no local results**
   - Tests fallback when cache is empty
   - Validates API-only search path

7. **should deduplicate merged local and API results**
   - Confirms no duplicate schedules shown
   - Tests Map-based deduplication logic

8. **should handle rapid search query changes**
   - Tests resilience with fast typing
   - Ensures stable behavior during rapid state changes

### E2E Tests (6 tests in `tests/e2e/pagination-stability.spec.ts`)

1. **should maintain pagination controls position during navigation**
2. **should not show layout shift when changing pages**
3. **should maintain consistent card sizes across all pages**
4. **should handle empty pages gracefully**
5. **should maintain grid height consistency**
6. **should not cause button group re-render during navigation**

## Test Patterns

### Auth Mock Pattern (NextAuth)

Centralize NextAuth mocking using helpers in `tests/utils/authMock.tsx`:

```typescript
import { renderWithSession, makeSession, mockUseSession, mockServerSession } from '@/tests/utils';

// Client component test (useSession)
mockUseSession(makeSession({ authMethod: 'api-token', accessToken: 'token_123' }));
renderWithSession(<Header />);

// Server/API route test (getServerSession)
mockServerSession(makeSession({ accessToken: 'token_abc' }));
const res = await GET(req);
// Unauthenticated / Loading examples
mockUnauthenticatedSession();
// or
mockLoadingSession();

// No-token edge cases (simulate missing accessToken)
mockUseSessionWithoutToken();
mockServerSession(makeSessionWithoutToken());

// Cleanup: handled automatically in jest.setup.ts for tests using the standard Jest config.

Notes:
- Prefer alias imports: `@/tests/utils` for test helpers (lint-enforced).
- Client tests avoid importing server-only `next-auth` by wrapping requires inside helpers.
- In normal unit/integration tests you do NOT need to call `clearSessionMocks` in `afterEach`; the global hook in `jest.setup.ts` already does this (lint-enforced).
- Only add a manual `afterEach(clearSessionMocks)` if you run tests with a custom Jest setup that does not load `jest.setup.ts`, or if you deliberately bypass the global auth mock helpers.
```

Benefits:

- One place to create typed sessions aligned with `types/next-auth.d.ts`
- Consistent mocking for `useSession` and `getServerSession`
- Easy to switch between `oauth` and `api-token`

### Mocking SWR

```typescript
import useSWR from 'swr';

jest.mock('swr');
const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;

mockUseSWR.mockReturnValue({
  data: { schedules: mockData, total: 50 },
  error: undefined,
  isLoading: false,
  isValidating: false,
  mutate: jest.fn(),
} as any);
```

### Mocking NextAuth

```typescript
import { useSession } from 'next-auth/react';

jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

mockUseSession.mockReturnValue({
  data: {
    user: { id: 'test-user', email: 'test@example.com' },
    accessToken: 'mock-token',
  },
  status: 'authenticated',
} as any);
```

### Testing Async Updates

```typescript
import { waitFor, screen } from '@testing-library/react';

await waitFor(() => {
  expect(screen.getByText(/searching api/i)).toBeInTheDocument();
});
```

### Testing User Interactions

```typescript
import { fireEvent } from '@testing-library/react';

const searchInput = screen.getByPlaceholderText(/search schedules/i);
fireEvent.change(searchInput, { target: { value: 'engineering' } });
```

## Component Test Coverage

### PaginationControls (17 tests)

- ✅ Renders all navigation buttons
- ✅ Disables First/Previous on first page
- ✅ Disables Next/Last on last page
- ✅ Disables all buttons during loading
- ✅ Calls correct handlers on click
- ✅ Shows correct page numbers
- ✅ Re-renders only when props change (React.memo)

### MonthNavigation (19 tests)

- ✅ Renders month display and navigation buttons
- ✅ Icon-only buttons with aria-labels (accessibility)
- ✅ Formats month correctly
- ✅ Disables buttons during loading
- ✅ Calls navigation handlers
- ✅ Handles timezone correctly
- ✅ Re-renders only when props change (React.memo)

### ScheduleCard (16 tests)

- ✅ Renders schedule information
- ✅ Shows tooltip on hover
- ✅ Truncates long text
- ✅ Displays timezone chip
- ✅ Handles click events
- ✅ Accessible with aria-label

### Schedules Page (19 tests)

- ✅ Basic rendering and loading states
- ✅ Error handling
- ✅ Pagination functionality
- ✅ Schedule card interactions
- ✅ **Progressive search (8 tests)** ⭐

## Best Practices

### Writing Tests

1. **Follow AAA Pattern**: Arrange, Act, Assert
2. **One assertion per test**: Focus on single behavior
3. **Use descriptive names**: Test name should explain what and why
4. **Mock external dependencies**: NextAuth, SWR, API calls
5. **Test user behavior**: Not implementation details
6. **Use Testing Library queries**: getByRole > getByLabelText > getByText
7. **Icon-only buttons**: Always add `aria-label` and use exact strings in E2E tests

### Test Organization

```typescript
describe('Component Name', () => {
  describe('Feature Group', () => {
    it('should do specific thing', () => {
      // Test implementation
    });
  });
});
```

### Async Testing

```typescript
// ✅ Good: Use waitFor for async updates
await waitFor(() => {
  expect(screen.getByText('Result')).toBeInTheDocument();
});

// ❌ Bad: Don't use setTimeout
setTimeout(() => {
  expect(screen.getByText('Result')).toBeInTheDocument();
}, 100);
```

### Query Priority

```typescript
// 1. Role (most accessible)
screen.getByRole('button', { name: /search/i });

// 2. Label
screen.getByLabelText(/search schedules/i);

// 3. Placeholder
screen.getByPlaceholderText(/search/i);

// 4. Text (last resort)
screen.getByText(/results/i);
```

## CI/CD Integration

### Pre-commit Hooks

```bash
# Run automatically before commit (via Husky)
npm run lint:fix        # Auto-fix linting errors
npm run format          # Format code with Prettier
```

### Commit Message Validation

```bash
# Enforced via commitlint
feat(search): add progressive search
test(schedules): add search tests
docs(readme): update search documentation
```

### GitHub Actions (Future)

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:e2e
```

## Debugging Tests

### Jest Debug Mode

```bash
# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Then open chrome://inspect in Chrome
```

### Playwright Debug Mode

```bash
# Run with headed browser
npm run test:e2e -- --headed

# Run with debug inspector
npm run test:e2e -- --debug
```

### Common Issues

#### Tests Timeout

```typescript
// Increase timeout for slow tests
it('should handle slow operation', async () => {
  // ...
}, 10000); // 10 second timeout
```

#### Mock Not Working

```typescript
// Clear mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});
```

#### Element Not Found

```typescript
// Use screen.debug() to see DOM
screen.debug();

// Or debug specific element
screen.debug(screen.getByRole('button'));
```

## Coverage Reports

### Generate Report

```bash
npm run test:coverage
```

### View HTML Report

```bash
open coverage/lcov-report/index.html
```

### Coverage Thresholds

```json
{
  "coverageThresholds": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

## Related Documentation

- [Contributing Guide](../CONTRIBUTING.md) - Contribution guidelines
- [Architecture](./architecture.md) - System architecture
- [Search Architecture](./search-architecture.md) - Progressive search details
- [Styling Architecture](./styling-architecture.md) - Component styling patterns
