# Styling Architecture

## Overview

This project follows MUI's best practices for styling with a structured, maintainable approach that separates concerns between component logic and presentation.

## Architecture Pattern

### 1. **Styled Components** (`*.styles.ts`)

All complex styling is extracted into dedicated `.styles.ts` files using MUI's `styled()` API.

```typescript
// components/schedules/ScheduleCard.styles.ts
export const ScheduleCard = styled(Card)(({ theme }) => ({
  height: '100%',
  cursor: 'pointer',
  transition: theme.transitions.create(['transform', 'box-shadow']),
  '&:hover': {
    transform: 'translateY(-4px)',
  },
}));
```

### 2. **Layout Constants** (`styles/layout.constants.ts`)

Magic numbers and layout values are centralized in constants:

```typescript
export const SCHEDULE_LAYOUT = {
  ITEMS_PER_PAGE: 16,
  GRID: {
    ROW_HEIGHT: 250,
    GAP: 3,
  },
} as const;
```

### 3. **Theme Configuration** (`styles/theme.ts`)

Global theme values, component overrides, and design tokens:

```typescript
export const lightTheme = createTheme({
  spacing: 8, // Base unit for all spacing
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' },
      },
    },
  },
});
```

### 4. **Component Files** (`*.tsx`)

Components use styled components and keep minimal inline `sx` props:

```typescript
// ✅ Good - Uses styled components
<ScheduleCard schedule={schedule} onClick={onClick} />

// ❌ Avoid - Inline complex styles
<Card sx={{ height: '100%', cursor: 'pointer', ... }} />
```

## File Organization

```
src/
├── styles/
│   ├── theme.ts                   # Global theme configuration
│   └── layout.constants.ts        # Layout constants & calculations
├── components/
│   └── schedules/
│       ├── ScheduleCard.tsx       # Component logic
│       ├── ScheduleCard.styles.ts # Styled components
│       └── ScheduleCard.test.tsx  # Tests
```

## When to Use What

### Use Styled Components When:

- ✅ Style is reused across multiple components
- ✅ Styling is complex (pseudo-selectors, media queries, theme access)
- ✅ Component has multiple style variations
- ✅ Need type-safe theme access

### Use `sx` Prop When:

- ✅ One-off, simple styling
- ✅ Quick overrides for specific instances
- ✅ Responsive values (`{ xs: 1, md: 2 }`)

### Use Layout Constants When:

- ✅ Magic numbers used in multiple places
- ✅ Values need to be calculated (grid heights, spacing)
- ✅ Layout dimensions that should stay consistent

## Benefits of This Approach

### 1. **Maintainability**

- Styles in dedicated files, easy to find and update
- Single source of truth for layout values
- Changes don't require editing JSX

### 2. **Reusability**

- Styled components exported and shared
- Layout constants prevent duplication
- Theme values automatically applied

### 3. **Type Safety**

- TypeScript checks theme values
- Autocomplete for styled components
- Compile-time error catching

### 4. **Performance**

- Styles generated at build time
- Memoization prevents re-renders
- Optimized CSS output

### 5. **Testability**

- Component logic separate from styling
- Easy to mock styled components
- Clear component responsibilities

## Migration Guide

### Before (Inline Styles):

```tsx
<Card
  sx={{
    height: '100%',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      transform: 'translateY(-4px)',
      boxShadow: 8,
    },
  }}
>
  {/* content */}
</Card>
```

### After (Styled Components):

```tsx
// ScheduleCard.styles.ts
export const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  cursor: 'pointer',
  transition: theme.transitions.create(['transform', 'box-shadow']),
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

// ScheduleCard.tsx
<StyledCard>{/* content */}</StyledCard>;
```

## Examples

### Schedule Card Styling

- **Logic**: `ScheduleCard.tsx`
- **Styles**: `ScheduleCard.styles.ts`
- **Constants**: `layout.constants.ts`
- **Tests**: `ScheduleCard.test.tsx`

### Pagination Controls

- **Logic**: `PaginationControls.tsx`
- **Styles**: Inline (simple, not reused)
- **Tests**: `PaginationControls.test.tsx`

## Best Practices

1. **Name styled components clearly**: `ScheduleCard`, not `StyledCard1`
2. **Document complex calculations**: Add comments for grid height formulas
3. **Use theme values**: `theme.spacing(2)` not `16px`
4. **Export styled components**: Make them reusable
5. **Group related styles**: Keep card header, content, footer together
6. **Avoid nesting too deep**: Max 2-3 levels in styled components

## Resources

- [MUI Styled Components](https://mui.com/system/styled/)
- [MUI Theme Configuration](https://mui.com/material-ui/customization/theming/)
- [MUI sx Prop](https://mui.com/system/getting-started/the-sx-prop/)
