import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { ArrowBack, CalendarMonth, Schedule } from '@mui/icons-material';

export interface MonthNavigationProps {
  /** Current month display text (e.g., "January 2025") */
  currentMonth: string;
  /** Whether the component is in loading state */
  isLoading?: boolean;
  /** Callback when user clicks Previous Month button */
  onPreviousMonth: () => void;
  /** Callback when user clicks Next Month button */
  onNextMonth: () => void;
}

/**
 * Memoized month navigation component for navigating between months.
 * Only re-renders when currentMonth, isLoading, or callbacks change.
 * Prevents unnecessary re-renders when parent component updates unrelated state.
 */
const MonthNavigation: React.FC<MonthNavigationProps> = React.memo(
  ({ currentMonth, isLoading = false, onPreviousMonth, onNextMonth }) => {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Button
          startIcon={<ArrowBack />}
          onClick={onPreviousMonth}
          variant="outlined"
          disabled={isLoading}
        >
          Previous Month
        </Button>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarMonth />
          <Typography variant="h5">{currentMonth}</Typography>
        </Box>
        <Button
          endIcon={<Schedule />}
          onClick={onNextMonth}
          variant="outlined"
          disabled={isLoading}
        >
          Next Month
        </Button>
      </Box>
    );
  }
);

MonthNavigation.displayName = 'MonthNavigation';

export default MonthNavigation;
