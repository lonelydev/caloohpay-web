# Calendar View Feature

## Overview

The Calendar View provides an interactive monthly calendar visualization of on-call schedules using FullCalendar. Users can click on calendar events to see detailed compensation information in a popup dialog.

## Features

### Interactive Monthly Calendar

- **FullCalendar Integration**: Enterprise-grade calendar component with native timezone support
- **Multi-day Events**: Automatically displays on-call periods spanning multiple days
- **Timezone Aware**: Respects schedule timezone for accurate date/time display
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Dark Mode Support**: Automatically adapts to Material-UI theme

### Event Detail Dialog

When clicking on a calendar event, users see:

- **User Information**: Name and email of the on-call person
- **Time Period**: Start and end dates/times with timezone
- **Duration**: Total hours of the on-call period
- **Coverage Breakdown**: Number of weekdays and weekends
- **Payment Calculation**: Detailed breakdown showing:
  - Weekday compensation (days × £50)
  - Weekend compensation (days × £75)
  - Total compensation amount

### View Toggle

Users can seamlessly switch between:

- **List View**: Traditional detailed breakdown by user
- **Calendar View**: Visual monthly calendar with clickable events

## Architecture

### Component Structure

```
src/components/schedules/
├── CalendarView.tsx          # Main calendar component
└── EventDetailDialog         # Memoized dialog component (internal)

src/lib/utils/
└── calendarUtils.ts          # Calendar data transformation utilities
```

### Data Flow

1. **Schedule Data** → PagerDuty API returns schedule entries
2. **Transform** → `transformToCalendarEvents()` converts to FullCalendar format
3. **Calculate** → Uses `caloohpay` package for payment calculations
4. **Render** → FullCalendar displays events
5. **Interact** → User clicks event → Dialog shows details

### Security Features

- **XSS Prevention**: All user inputs are sanitized before display
- **Input Validation**: Date and timezone validation prevents invalid data
- **Type Safety**: Full TypeScript coverage with strict type checking
- **Error Boundaries**: Graceful error handling for malformed data

## Usage

### Basic Implementation

```typescript
import CalendarView from '@/components/schedules/CalendarView';
import { transformToCalendarEvents } from '@/lib/utils/calendarUtils';

// Transform schedule entries to calendar events
const events = transformToCalendarEvents(scheduleEntries, timezone);

// Render calendar
<CalendarView
  events={events}
  timezone="America/New_York"
  onMonthChange={(year, month) => {
    // Optional: Handle month navigation
    console.log(`Navigated to ${year}-${month}`);
  }}
/>;
```

### Integration in Schedule Detail Page

The schedule detail page ([src/app/schedules/[id]/page.tsx](../src/app/schedules/[id]/page.tsx)) provides:

1. **View Mode State**: Toggle between 'list' and 'calendar'
2. **Unified Month Navigation**: Works for both views
3. **Data Sharing**: Same schedule data powers both views
4. **State Preservation**: View mode persists during month navigation

## API Reference

### `transformToCalendarEvents()`

Transforms PagerDuty schedule entries into FullCalendar-compatible events.

```typescript
function transformToCalendarEvents(entries: ScheduleEntry[], timezone: string): CalendarEvent[];
```

**Parameters:**

- `entries`: Array of PagerDuty schedule entries
- `timezone`: IANA timezone string (e.g., 'America/New_York')

**Returns:** Array of calendar events with extended payment props

**Throws:**

- `Error`: If timezone is invalid
- `Error`: If entries is not an array

**Security:**

- Sanitizes user names to prevent XSS attacks
- Validates date formats before processing
- Filters out malformed entries automatically

### `CalendarEvent` Type

```typescript
interface CalendarEvent {
  id: string; // Unique event identifier
  title: string; // User name (sanitized)
  start: string; // ISO8601 start date/time
  end: string; // ISO8601 end date/time
  extendedProps: {
    user: User; // Full user object
    duration: number; // Hours (from caloohpay)
    weekdayDays: number; // Count (from caloohpay)
    weekendDays: number; // Count (from caloohpay)
    compensation: number; // GBP amount
  };
}
```

### Helper Functions

#### `groupEventsByUser()`

Groups calendar events by user ID for filtering.

```typescript
function groupEventsByUser(events: CalendarEvent[]): Map<string, CalendarEvent[]>;
```

#### `calculateTotalCompensation()`

Calculates total compensation across all events.

```typescript
function calculateTotalCompensation(events: CalendarEvent[]): number;
```

#### `filterEventsByDateRange()`

Filters events within a specific date range.

```typescript
function filterEventsByDateRange(
  events: CalendarEvent[],
  startDate: string | Date,
  endDate: string | Date,
  timezone: string
): CalendarEvent[];
```

## Testing

### Unit Tests

- **Calendar Utils** (`tests/unit/lib/utils/calendarUtils.test.ts`)
  - Data transformation validation
  - XSS prevention verification
  - Edge case handling (empty data, invalid dates)
  - Payment calculation accuracy

- **CalendarView Component** (`tests/unit/components/schedules/CalendarView.test.tsx`)
  - Component rendering
  - Event click handling
  - Dialog display and interaction
  - Timezone handling

### E2E Tests

- **Calendar View** (`tests/e2e/calendar-view.spec.ts`)
  - View toggle functionality
  - Event interaction flow
  - Dialog content verification
  - Month navigation
  - Empty state handling

### Running Tests

```bash
# Unit tests
npm test calendarUtils
npm test CalendarView

# E2E tests
npm run test:e2e calendar-view.spec.ts

# All tests with coverage
npm run test:coverage
```

## Performance Optimization

### Memoization Strategy

- **Component Memoization**: `EventDetailDialog` only re-renders when event changes
- **Callback Memoization**: Event handlers wrapped in `useCallback`
- **Value Memoization**: Calendar styles computed once via `useMemo`
- **Data Transformation**: Events calculated once per schedule fetch

### Rendering Optimization

- **Virtual Rendering**: FullCalendar only renders visible month
- **Event Pooling**: Reuses event components during navigation
- **Lazy Loading**: Dialog content only loads when opened
- **Fixed Heights**: Prevents layout shifts during state changes

## Accessibility

- **Keyboard Navigation**: Full keyboard support via FullCalendar
- **Screen Readers**: Proper ARIA labels on all interactive elements
- **Focus Management**: Dialog traps focus when open
- **Color Contrast**: WCAG AA compliant color scheme
- **Mobile Touch**: Large touch targets for mobile users

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Mobile)

## Dependencies

```json
{
  "@fullcalendar/core": "^6.x",
  "@fullcalendar/react": "^6.x",
  "@fullcalendar/daygrid": "^6.x",
  "@fullcalendar/interaction": "^6.x",
  "@fullcalendar/luxon3": "^6.x",
  "luxon": "^3.x"
}
```

## Future Enhancements

- [ ] **Week View**: Add weekly calendar view option
- [ ] **User Filtering**: Filter calendar by specific users
- [ ] **Color Coding**: Different colors per user
- [ ] **Event Search**: Search/filter events in calendar
- [ ] **Drag & Drop**: Edit schedules via drag & drop (admin feature)
- [ ] **Recurring Events**: Support for recurring on-call patterns
- [ ] **Export**: Export calendar view as PDF/image
- [ ] **Print View**: Print-optimized calendar layout

## Troubleshooting

### Calendar Not Rendering

**Issue**: Calendar component doesn't appear after switching to calendar view.

**Solutions**:

1. Check browser console for FullCalendar errors
2. Verify `events` prop is valid array
3. Ensure timezone string is valid IANA format
4. Clear browser cache and reload

### Event Click Not Working

**Issue**: Clicking events doesn't open dialog.

**Solutions**:

1. Check that events have valid `id` property
2. Verify event data matches `CalendarEvent` interface
3. Check browser console for click handler errors
4. Ensure JavaScript is enabled

### Incorrect Dates/Times

**Issue**: Events show wrong dates or times.

**Solutions**:

1. Verify schedule timezone matches actual timezone
2. Check that schedule entries have valid ISO8601 dates
3. Ensure browser timezone detection is working
4. Test with explicit timezone parameter

### Performance Issues

**Issue**: Calendar is slow or laggy.

**Solutions**:

1. Reduce number of events (filter by date range)
2. Enable `dayMaxEvents` prop to limit events per day
3. Check for excessive re-renders in React DevTools
4. Verify memoization is working correctly

## Related Documentation

- [Search Architecture](./search-architecture.md) - Progressive search implementation
- [Styling Architecture](./styling-architecture.md) - MUI theming and styling
- [Testing Guide](./TESTING.md) - Testing strategies and best practices
- [Architecture Overview](./architecture.md) - Overall system architecture

## Support

For issues or questions about the calendar view:

1. Check this documentation
2. Review unit/E2E tests for examples
3. Search [GitHub Issues](https://github.com/lonelydev/caloohpay-web/issues)
4. Create new issue with "calendar" label
