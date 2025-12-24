# Search Architecture

## Overview

The schedules search implements a **progressive search strategy** that provides instant feedback while ensuring comprehensive results. This hybrid approach combines the speed of client-side filtering with the completeness of API search.

## Search Flow

```
User types search query
         │
         ├─► Show local results immediately (if available)
         │   - Filters from cached schedules
         │   - Instant feedback (0ms)
         │
         └─► Trigger API search in parallel
             - Queries PagerDuty API
             - Comprehensive results
             - Merges with local results
             - Deduplicates by schedule ID
```

## Implementation Details

### State Management

```typescript
// Search query entered by user
const [searchQuery, setSearchQuery] = useState('');

// Triggers SWR to fetch from API with search parameter
const [apiSearchQuery, setApiSearchQuery] = useState('');

// All schedules fetched so far (for client-side filtering)
const [allSchedules, setAllSchedules] = useState<PagerDutySchedule[]>([]);

// True when showing local results while API search is in progress
const [showingLocalResults, setShowingLocalResults] = useState(false);

// True when API search has completed
const [apiSearchComplete, setApiSearchComplete] = useState(false);
```

### Client-Side Filtering

```typescript
const clientFilteredSchedules = useMemo(() => {
  if (!searchQuery) return [];

  return allSchedules.filter((schedule) =>
    schedule.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
}, [allSchedules, searchQuery]);
```

**Characteristics:**

- ⚡ **Instant**: No network latency
- 📦 **Limited scope**: Only searches cached schedules
- 🎯 **Use case**: Quick feedback while API loads

### API Search

Triggered automatically when user searches:

```typescript
useEffect(() => {
  if (searchQuery && apiSearchQuery !== searchQuery) {
    setApiSearchQuery(searchQuery); // Triggers SWR refetch
    setApiSearchComplete(false);
  }
}, [searchQuery, apiSearchQuery]);
```

**Characteristics:**

- 🌐 **Comprehensive**: Searches all schedules in PagerDuty
- ⏱️ **Network latency**: 200-500ms typical
- 🎯 **Use case**: Complete results from entire dataset

### Result Merging

Local and API results are merged and deduplicated:

```typescript
const mergedSearchResults = useMemo(() => {
  if (!searchQuery) return [];

  // Start with local results (instant)
  const resultsMap = new Map(clientFilteredSchedules.map((s) => [s.id, s]));

  // Add API results when available (comprehensive)
  if (apiSearchComplete && data?.schedules && apiSearchQuery === searchQuery) {
    data.schedules.forEach((schedule) => {
      resultsMap.set(schedule.id, schedule);
    });
  }

  return Array.from(resultsMap.values());
}, [searchQuery, clientFilteredSchedules, apiSearchComplete, data?.schedules, apiSearchQuery]);
```

**Benefits:**

- 🚀 Shows results immediately from cache
- ✅ Adds API results when available
- 🔄 Deduplicates by schedule ID
- 📊 Always shows most comprehensive results

### Pagination

Search results are paginated client-side:

```typescript
const paginatedSearchResults = useMemo(() => {
  if (!searchQuery) return [];

  const start = (page - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  return mergedSearchResults.slice(start, end);
}, [mergedSearchResults, page, searchQuery]);
```

**Note:** When not searching, pagination uses API offset-based pagination for efficiency.

## User Experience

### Visual Indicators

The UI shows different chips based on search state:

#### 1. Local Results + API Search In Progress

```typescript
{searchQuery && showingLocalResults && !apiSearchComplete && (
  <Chip
    label="Searching API..."
    size="small"
    color="info"
    variant="outlined"
    icon={<CircularProgress size={12} />}
  />
)}
```

**Shows:** "Searching API..." with spinner
**Means:** Local results visible, API search ongoing

#### 2. Search Complete (Local + API)

```typescript
{searchQuery && showingLocalResults && apiSearchComplete && (
  <Chip
    label={`${clientFilteredSchedules.length} local, ${mergedSearchResults.length - clientFilteredSchedules.length} from API`}
    size="small"
    color="success"
    variant="outlined"
  />
)}
```

**Shows:** "X local, Y from API"
**Means:** All results loaded and merged

#### 3. API-Only Search

```typescript
{searchQuery && !showingLocalResults && !apiSearchComplete && (
  <Chip
    label="Searching..."
    size="small"
    color="info"
    variant="outlined"
  />
)}
```

**Shows:** "Searching..."
**Means:** No local cache, waiting for API

### Timeline Example

```
0ms   │ User types "engineering"
      │ ├─► Local cache: 3 results shown immediately
      │ └─► API search triggered
      │
      │ UI: Shows 3 cards + "Searching API..." chip
      │
250ms │ API returns: 7 additional results
      │
      │ UI: Shows 10 cards (3+7) + "3 local, 7 from API" chip
```

## Performance Considerations

### Cache Strategy

```typescript
// Accumulate schedules from pagination
useEffect(() => {
  if (data?.schedules && !apiSearchQuery) {
    setAllSchedules((prev) => {
      const existingIds = new Set(prev.map((s) => s.id));
      const newSchedules = data.schedules.filter((s) => !existingIds.has(s.id));
      return [...prev, ...newSchedules];
    });
  }
}, [data, apiSearchQuery]);
```

**Benefits:**

- 🚀 Faster subsequent searches
- 💾 No duplicate API calls for cached data
- 📈 Cache grows as user browses

### API Efficiency

- ✅ Only triggers API search when query changes
- ✅ Debouncing could be added if needed (currently instant)
- ✅ SWR handles caching and deduplication automatically

## Edge Cases

### No Local Results

If cache is empty or no local matches:

```
User searches → No local results → Shows "Searching..." → API returns → Shows results
```

**Benefit:** Still works seamlessly, just slightly slower (no intermediate results)

### Search Query Changes Rapidly

```
User types "eng" → Local: 10 results
User types "engi" → Local: 8 results
User types "engin" → Local: 5 results
API returns for "engin" → Merges: 12 results total
```

**Handled by:** `apiSearchQuery !== searchQuery` check ensures only latest query is active

### Clearing Search

```typescript
if (!searchQuery) {
  // Clear all search state
  if (apiSearchQuery) setApiSearchQuery('');
  if (showingLocalResults) setShowingLocalResults(false);
  if (!apiSearchComplete) setApiSearchComplete(true);
  return;
}
```

**Result:** Clean state reset, returns to normal pagination

## Testing Strategy

### Unit Tests

```typescript
it('should filter schedules using client-side search', async () => {
  // Arrange: Mock SWR with schedules
  // Act: Type in search box
  // Assert: Filtered results appear immediately
});
```

### Integration Tests (Recommended)

```typescript
it('should show local results then merge API results', async () => {
  // 1. Load initial schedules
  // 2. Navigate to build cache
  // 3. Search with term that matches cache
  // 4. Verify local results appear first
  // 5. Mock API response with additional results
  // 6. Verify merged results and chip updates
});
```

### E2E Tests (Future)

```typescript
test('Progressive search shows results seamlessly', async ({ page }) => {
  // 1. Navigate to schedules
  // 2. Scroll to build cache
  // 3. Search for term
  // 4. Verify immediate results
  // 5. Verify chip shows "Searching API..."
  // 6. Wait for API
  // 7. Verify additional results appear
  // 8. Verify chip shows result counts
});
```

## Future Enhancements

### 1. Search Debouncing

```typescript
const debouncedSearch = useDebouncedValue(searchQuery, 300);

useEffect(() => {
  // Trigger API search with debounced value
  if (debouncedSearch) {
    setApiSearchQuery(debouncedSearch);
  }
}, [debouncedSearch]);
```

**Benefit:** Reduces API calls while user is typing

### 2. Search Analytics

```typescript
// Track search performance
const searchStart = performance.now();
// ... search logic ...
const searchEnd = performance.now();
logSearchMetrics({
  query: searchQuery,
  localResults: clientFilteredSchedules.length,
  apiResults: mergedSearchResults.length - clientFilteredSchedules.length,
  duration: searchEnd - searchStart,
});
```

### 3. Fuzzy Matching

```typescript
import Fuse from 'fuse.js';

const fuse = new Fuse(allSchedules, {
  keys: ['name', 'description'],
  threshold: 0.3,
});

const results = fuse.search(searchQuery);
```

**Benefit:** Better match quality (handles typos, partial matches)

### 4. Search History

```typescript
const [searchHistory, setSearchHistory] = useLocalStorage('searchHistory', []);

const saveSearch = (query: string) => {
  setSearchHistory((prev) => [query, ...prev.filter((q) => q !== query)].slice(0, 5));
};
```

**Benefit:** Quick access to recent searches

## Best Practices

✅ **DO:**

- Show local results immediately when available
- Always trigger API search for comprehensive results
- Provide clear visual indicators of search state
- Merge and deduplicate results
- Reset page to 1 when searching

❌ **DON'T:**

- Block UI waiting for API response when local results exist
- Trigger multiple concurrent API searches for same query
- Show stale results after query changes
- Hide loading indicators (users should know search is in progress)

## Related Documentation

- [Architecture Overview](./architecture.md) - System design and component structure
- [Styling Architecture](./styling-architecture.md) - UI component patterns
- [API Integration](../src/lib/api/pagerduty.ts) - PagerDuty API client
- [SWR Configuration](../src/app/schedules/page.tsx) - Data fetching setup
