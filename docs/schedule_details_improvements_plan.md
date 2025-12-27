# Schedule Details Page - Maintainability Improvements Plan

**File**: `src/app/schedules/[id]/page.tsx`  
**Current State**: 552 lines, monolithic structure  
**Target**: Modular, testable, maintainable architecture

---

## 🔴 Critical Issues

### 1. Monolithic Component (552 lines)

**Problem**: Everything is in one file - component definitions, business logic, data fetching, and rendering.

**Current State**:

- ScheduleHeader component (lines 40-63)
- ScheduleActions component (lines 69-81)
- OnCallSchedule component (lines 87-268)
- Fetcher function (lines 270-282)
- Main page component with all business logic (lines 284-552)

**Impact**:

- Hard to test individual pieces
- Difficult to reuse components
- Changes affect entire file
- Cognitive overload when reading
- New developers need to understand entire context

**Solution**: Extract to separate files with clear boundaries

**Estimated Effort**: 4-6 hours

---

### 2. Complex Business Logic in useMemo (100+ lines)

**Problem**: The `userSchedules` calculation (lines 335-405) contains multiple responsibilities:

```typescript
// Current: All logic mixed together
const userSchedules = useMemo(() => {
  // 1. Data validation
  // 2. User grouping
  // 3. Entry sorting
  // 4. OnCallPeriod instantiation
  // 5. Duration calculations
  // 6. Payment calculations
  // 7. Aggregation (totals)
}, [data]);
```

**Impact**:

- Impossible to unit test in isolation
- Hard to debug when calculations fail
- Performance characteristics unclear
- Can't reuse logic elsewhere
- Violates Single Responsibility Principle
- Error in one part breaks everything

**Solution**: Extract to pure utility functions:

```typescript
// Proposed structure
export function groupSchedulesByUser(entries: ScheduleEntry[]): Map<string, UserEntries>;
export function sortScheduleEntries(entries: ScheduleEntry[]): ScheduleEntry[];
export function calculateEntryCompensation(entry: ScheduleEntry, timezone: string): EnrichedEntry;
export function aggregateUserTotals(entries: EnrichedEntry[]): UserTotals;
```

**Estimated Effort**: 3-4 hours (including tests)

---

### 3. Component Definitions in Page File

**Problem**: Three memoized components are defined inside page.tsx:

- `ScheduleHeader` (24 lines)
- `ScheduleActions` (13 lines)
- `OnCallSchedule` (181 lines)

**Impact**:

- Can't reuse these components elsewhere
- Can't test them independently with proper fixtures
- Page file becomes bloated
- Breaks component composition pattern
- Props types are inline, not shared
- Hard to maintain component-specific logic

**Solution**: Extract to separate component files

**Benefits**:

- Each component can be tested with full Jest/RTL setup
- Components can be imported by other pages
- Easier to add Storybook stories
- Clear prop interfaces
- Component-level optimizations possible

**Estimated Effort**: 2-3 hours (including tests)

---

### 4. Fetcher Function Mixed with Component

**Problem**: `fetcher` function (lines 270-282) is defined in component file

```typescript
const fetcher = async ([url, token, authMethod]: [string, string, string | undefined]) => {
  const response = await fetch(url, {
    headers: getPagerDutyHeaders(token, authMethod as 'oauth' | 'api-token'),
  });
  // ... error handling
};
```

**Impact**:

- Can't reuse for other API calls
- Can't test independently
- Duplicate logic if needed elsewhere
- Tight coupling to component
- No centralized error handling

**Solution**: Move to shared utility:

```typescript
// src/lib/api/fetchers.ts
export async function fetchWithAuth<T>(
  url: string,
  token: string,
  authMethod?: 'oauth' | 'api-token'
): Promise<T>;
```

**Estimated Effort**: 1 hour

---

### 5. No Custom Hooks for State Management

**Problem**: All state logic is inline in the main component:

- Date range state + navigation (lines 298-330)
- View mode toggle (lines 296, 421-428)
- Data transformation logic (lines 335-415)

**Impact**:

- Logic is not reusable
- Can't test state transitions independently
- Component is too aware of implementation details
- Hard to add new features (e.g., URL-based date selection)
- Difficult to add analytics/tracking

**Solution**: Extract custom hooks:

```typescript
// hooks/useScheduleData.ts
export function useScheduleData(scheduleId: string) {
  // Encapsulates SWR, error handling, loading states
  // Returns: { schedule, entries, isLoading, error }
}

// hooks/useDateRangeNavigation.ts
export function useDateRangeNavigation(initialDate?: string) {
  // Encapsulates date range state and navigation
  // Returns: { dateRange, goToNextMonth, goToPreviousMonth, setMonth }
}

// hooks/useViewMode.ts
export function useViewMode(defaultMode: 'list' | 'calendar' = 'list') {
  // Encapsulates view toggle with localStorage persistence
  // Returns: { viewMode, setViewMode, toggleView }
}
```

**Benefits**:

- Hooks can be tested with `@testing-library/react-hooks`
- Logic is reusable across pages
- Easy to add URL sync or localStorage
- Clear separation of concerns

**Estimated Effort**: 2-3 hours (including tests)

---

### 6. Tight Coupling to API Response Shape

**Problem**: Component directly accesses deeply nested API structure:

```typescript
data?.schedule?.final_schedule?.rendered_schedule_entries;
data?.schedule?.time_zone;
data?.schedule?.name;
```

**Impact**:

- If PagerDuty API changes, must update component
- Hard to mock for testing (need exact API shape)
- Violates dependency inversion principle
- Can't easily switch to different data source
- Duplicate null checks everywhere

**Solution**: Create adapter/mapper layer:

```typescript
// src/lib/api/adapters/scheduleAdapter.ts
export interface AdaptedSchedule {
  id: string;
  name: string;
  description?: string;
  timezone: string;
  entries: ScheduleEntry[];
  htmlUrl: string;
}

export function adaptScheduleResponse(response: ScheduleResponse): AdaptedSchedule {
  return {
    id: response.schedule.id,
    name: response.schedule.name,
    description: response.schedule.description,
    timezone: response.schedule.time_zone,
    entries: response.schedule.final_schedule?.rendered_schedule_entries || [],
    htmlUrl: response.schedule.html_url,
  };
}
```

**Benefits**:

- Component doesn't know about PagerDuty API
- Easy to mock for tests
- API changes isolated to adapter
- Can add data transformations/enrichment
- Type safety at boundary

**Estimated Effort**: 2 hours (including tests)

---

### 7. Multiple Responsibilities

**Problem**: Main component handles:

1. **Routing/Navigation** - useRouter, useParams, handleBack
2. **Authentication** - useSession, auth method handling
3. **Data Fetching** - SWR, API calls, error handling
4. **State Management** - dateRange, viewMode
5. **Business Logic** - payment calculations, grouping, sorting
6. **Data Transformation** - calendar events, user schedules
7. **UI Rendering** - multiple layouts (error, loading, success)
8. **View Toggling** - list vs calendar view

**Impact**:

- Violates Single Responsibility Principle
- Changes to one concern affect others
- Difficult to reason about component behavior
- Hard to add new features without breaking existing ones
- Testing requires mocking everything

**Solution**: Each concern should be separate:

```
page.tsx           → Orchestration only
useScheduleData    → Data fetching
useDateNavigation  → Date state
useViewMode        → View state
scheduleTransforms → Business logic
ScheduleHeader     → Header UI
OnCallSchedule     → List view UI
CalendarView       → Calendar UI (already separate)
```

**Estimated Effort**: Covered by other refactorings

---

## 🟡 Medium Priority Issues

### 8. Type Duplication

**Problem**: The `userSchedules` array type is defined inline (lines 89-102) and repeated in `OnCallSchedule` props:

```typescript
// Defined inline in component
const OnCallSchedule = memo<{
  userSchedules: Array<{
    user: User;
    entries: Array<ScheduleEntry & { ... }>;
    totalHours: number;
    // ... repeated structure
  }>;
}>;
```

**Impact**:

- Type changes require updates in multiple places
- Harder to maintain consistency
- Verbose prop definitions

**Solution**: Define shared types:

```typescript
// types.ts
export interface EnrichedEntry extends ScheduleEntry {
  duration: number;
  weekdayDays: number;
  weekendDays: number;
  compensation: number;
}

export interface UserSchedule {
  user: User;
  entries: EnrichedEntry[];
  totalHours: number;
  totalWeekdays: number;
  totalWeekends: number;
  totalCompensation: number;
}

export type UserSchedules = UserSchedule[];
```

**Estimated Effort**: 1 hour

---

### 9. Magic Numbers and Strings

**Problem**: Hard-coded values without explanation:

```typescript
maxWidth: 1200; // Why 1200?
minHeight: 300; // Arbitrary?
py: 4; // Why 4?
('list', 'calendar'); // String literals repeated
```

**Impact**:

- Hard to maintain consistent spacing
- Unclear why values were chosen
- Can't easily theme or configure
- String typos not caught by TypeScript

**Solution**: Extract to constants or enums:

```typescript
// constants.ts
export const LAYOUT = {
  MAX_WIDTH_DESKTOP: 1200,
  MIN_HEIGHT_LOADING: 300,
  PADDING_VERTICAL: 4,
} as const;

export enum ViewMode {
  List = 'list',
  Calendar = 'calendar',
}
```

**Estimated Effort**: 30 minutes

---

### 10. No Error Boundaries

**Problem**: If `OnCallSchedule` or `CalendarView` throws during render, entire page crashes.

**Impact**:

- Poor user experience (white screen)
- No error recovery
- Can't track which component failed
- Loss of context (user needs to refresh)

**Solution**: Wrap sections in `<ErrorBoundary>`:

```typescript
<ErrorBoundary fallback={<ScheduleErrorFallback />}>
  {viewMode === 'calendar' ? (
    <CalendarView ... />
  ) : (
    <OnCallSchedule ... />
  )}
</ErrorBoundary>
```

**Estimated Effort**: 1 hour

---

### 11. No Loading Skeleton

**Problem**: Shows generic `<Loading />` component, no skeleton UI.

**Impact**:

- Poor perceived performance
- Layout shift when data loads
- No progressive disclosure

**Solution**: Add skeleton components:

```typescript
{isLoading ? (
  <ScheduleSkeleton viewMode={viewMode} />
) : (
  // actual content
)}
```

**Estimated Effort**: 2 hours

---

### 12. DateTime Conversion Duplication

**Problem**: ISO string to DateTime conversion repeated multiple times:

```typescript
const start = DateTime.fromISO(
  typeof entry.start === 'string' ? entry.start : entry.start.toISOString()
);
```

**Impact**:

- Duplicate code
- Error-prone
- Hard to change date library

**Solution**: Create helper function:

```typescript
// utils/dateHelpers.ts
export function toDateTime(date: string | Date, timezone?: string): DateTime {
  const isoString = typeof date === 'string' ? date : date.toISOString();
  return DateTime.fromISO(isoString, { zone: timezone });
}
```

**Estimated Effort**: 30 minutes

---

## 🟢 Suggested Refactoring Plan

### Phase 1: Extract Components (4 hours)

**Goal**: Move component definitions to separate files

**Tasks**:

1. Create `components/ScheduleHeader.tsx`
   - Move component definition
   - Export props interface
   - Add prop-types documentation
   - Add tests (3-5 test cases)

2. Create `components/ScheduleActions.tsx`
   - Move component definition
   - Export props interface
   - Add tests (2-3 test cases)

3. Create `components/OnCallSchedule/`
   - Move to subfolder (large component)
   - Extract period entry rendering to sub-component
   - Add `OnCallSchedule.tsx` and `OnCallSchedule.styles.ts`
   - Add tests (10+ test cases)

**Deliverables**:

- 3 new component files
- 3 new test files
- Updated imports in page.tsx
- All tests passing

---

### Phase 2: Extract Business Logic (4 hours)

**Goal**: Move calculations to testable utility functions

**Tasks**:

1. Create `utils/scheduleTransforms.ts`:

   ```typescript
   export function groupSchedulesByUser(entries: ScheduleEntry[]): Map<string, UserEntries>;
   export function sortScheduleEntries(entries: ScheduleEntry[]): ScheduleEntry[];
   export function calculateEntryCompensation(
     entry: ScheduleEntry,
     timezone: string
   ): EnrichedEntry;
   export function enrichEntriesWithPayments(
     entries: ScheduleEntry[],
     timezone: string
   ): EnrichedEntry[];
   export function aggregateUserTotals(entries: EnrichedEntry[]): UserTotals;
   ```

2. Create `utils/fetcher.ts`:

   ```typescript
   export async function fetchWithAuth<T>(
     url: string,
     token: string,
     authMethod?: string
   ): Promise<T>;
   ```

3. Add comprehensive unit tests:
   - Edge cases (empty arrays, null values)
   - Date boundary cases
   - Timezone handling
   - Payment calculations
   - Target: 90%+ coverage

**Deliverables**:

- 2 new utility files
- 2 new test files with 90%+ coverage
- Refactored useMemo to use utilities
- All tests passing

---

### Phase 3: Custom Hooks (3 hours)

**Goal**: Extract state management to reusable hooks

**Tasks**:

1. Create `hooks/useScheduleData.ts`:
   - Encapsulate SWR logic
   - Handle error states
   - Return normalized data
   - Add tests with `@testing-library/react-hooks`

2. Create `hooks/useDateRangeNavigation.ts`:
   - Manage date range state
   - Provide navigation functions
   - Add tests for month transitions
   - Handle edge cases (DST, year boundaries)

3. Create `hooks/useViewMode.ts`:
   - Manage view toggle state
   - Optional: localStorage persistence
   - Add tests for state changes

**Deliverables**:

- 3 new hook files
- 3 new test files
- Updated page.tsx to use hooks
- All tests passing

---

### Phase 4: Types & Adapters (2 hours)

**Goal**: Improve type safety and decouple from API

**Tasks**:

1. Create `types.ts`:
   - Define shared interfaces
   - Export all types used across files
   - Document complex types with JSDoc

2. Create `adapters/scheduleAdapter.ts`:
   - Create adapter interface
   - Implement PagerDuty adapter
   - Add null safety
   - Add tests for edge cases

3. Update all imports to use shared types

**Deliverables**:

- 1 types file
- 1 adapter file
- 1 adapter test file
- Updated imports across all files
- All tests passing

---

### Phase 5: Constants & Configuration (1 hour)

**Goal**: Extract magic values to constants

**Tasks**:

1. Create `constants.ts`:
   - Layout constants
   - View mode enum
   - Configuration values

2. Update all files to use constants

3. Add TypeScript enum for ViewMode

**Deliverables**:

- 1 constants file
- Updated references across files
- Type-safe enums in use

---

### Phase 6: Error Handling & Polish (2 hours)

**Goal**: Improve error handling and UX

**Tasks**:

1. Add error boundaries
2. Create error fallback components
3. Add loading skeletons
4. Improve error messages

**Deliverables**:

- Better error UX
- No white screens on errors
- Progressive loading

---

## 📊 Final Structure

```
src/app/schedules/[id]/
├── page.tsx                          (~150 lines - orchestration only)
├── page.styles.ts                    ✅ (already done)
│
├── components/
│   ├── ScheduleHeader.tsx            (~60 lines)
│   ├── ScheduleActions.tsx           (~40 lines)
│   ├── OnCallSchedule/
│   │   ├── OnCallSchedule.tsx        (~100 lines)
│   │   ├── OnCallSchedule.styles.ts  (~50 lines)
│   │   ├── PeriodEntry.tsx           (~60 lines)
│   │   └── index.ts
│   └── __tests__/
│       ├── ScheduleHeader.test.tsx
│       ├── ScheduleActions.test.tsx
│       └── OnCallSchedule.test.tsx
│
├── hooks/
│   ├── useScheduleData.ts            (~50 lines)
│   ├── useDateRangeNavigation.ts     (~40 lines)
│   ├── useViewMode.ts                (~20 lines)
│   └── __tests__/
│       ├── useScheduleData.test.ts
│       ├── useDateRangeNavigation.test.ts
│       └── useViewMode.test.ts
│
├── utils/
│   ├── scheduleTransforms.ts         (~100 lines)
│   ├── fetcher.ts                    (~30 lines)
│   ├── dateHelpers.ts                (~40 lines)
│   └── __tests__/
│       ├── scheduleTransforms.test.ts
│       ├── fetcher.test.ts
│       └── dateHelpers.test.ts
│
├── adapters/
│   ├── scheduleAdapter.ts            (~60 lines)
│   └── __tests__/
│       └── scheduleAdapter.test.ts
│
├── types.ts                          (~80 lines)
└── constants.ts                      (~40 lines)
```

---

## 📈 Success Metrics

### Code Quality

- ✅ All files < 150 lines
- ✅ Each function < 30 lines
- ✅ Cyclomatic complexity < 10 per function
- ✅ No duplicate code (DRY principle)

### Testing

- ✅ 90%+ test coverage on utilities
- ✅ 80%+ test coverage on hooks
- ✅ 70%+ test coverage on components
- ✅ All edge cases covered

### Maintainability

- ✅ Clear separation of concerns
- ✅ Easy to add new features
- ✅ New developer onboarding < 1 hour
- ✅ Can explain any file in 5 minutes

### Performance

- ✅ No performance degradation
- ✅ Proper memoization maintained
- ✅ Bundle size not increased significantly

---

## 🎯 Total Effort Estimate

| Phase     | Description             | Hours        |
| --------- | ----------------------- | ------------ |
| 1         | Extract Components      | 4            |
| 2         | Extract Business Logic  | 4            |
| 3         | Custom Hooks            | 3            |
| 4         | Types & Adapters        | 2            |
| 5         | Constants & Config      | 1            |
| 6         | Error Handling & Polish | 2            |
| **Total** |                         | **16 hours** |

**Recommended Approach**: Tackle phases sequentially over 2-3 days, with full test suite passing after each phase.

---

## 🚀 Priority Order

1. **Phase 2 first** - Extract business logic for testability
2. **Phase 1 second** - Extract components for modularity
3. **Phase 3 third** - Extract hooks for reusability
4. **Phase 4, 5, 6** - Polish and improve

This order ensures the most critical issues (testability and maintainability) are addressed first, with UI/UX improvements following.
