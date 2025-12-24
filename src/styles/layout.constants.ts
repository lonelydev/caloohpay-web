// Layout constants for schedule pages
export const SCHEDULE_LAYOUT = {
  // Cards per page
  ITEMS_PER_PAGE: 16,

  // Grid configuration
  GRID: {
    // Number of columns per breakpoint
    COLUMNS: {
      xs: 1,
      sm: 2,
      md: 4,
    },
    // Number of rows to accommodate ITEMS_PER_PAGE
    ROWS: {
      xs: 16, // All cards in single column
      sm: 8, // 8 rows x 2 columns = 16 cards
      md: 4, // 4 rows x 4 columns = 16 cards
    },
    // Fixed row height to prevent layout shifts
    ROW_HEIGHT: 250, // px
    // Gap between grid items
    GAP: 3, // theme spacing units (24px)
    GAP_PX: 24, // Actual pixel value for calculations
  },

  // Card dimensions
  CARD: {
    MIN_HEIGHT: 200,
    PADDING: 2, // theme spacing units
  },
} as const;

// Helper to calculate grid height
export const calculateGridHeight = (rows: number, rowHeight: number, gapPx: number) => {
  return `calc(${rows} * ${rowHeight}px + ${rows - 1} * ${gapPx}px)`;
};
