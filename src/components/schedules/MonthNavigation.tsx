import React from 'react';
import { Button, Typography } from '@mui/material';
import { ArrowBack, CalendarMonth, ArrowForward } from '@mui/icons-material';
import { NavigationContainer, MonthDisplay } from './MonthNavigation.styles';

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
      <NavigationContainer>
        <Button
          startIcon={<ArrowBack />}
          onClick={onPreviousMonth}
          variant="outlined"
          disabled={isLoading}
          aria-label="Previous month"
        ></Button>
        <MonthDisplay>
          <CalendarMonth />
          <Typography variant="h5">{currentMonth}</Typography>
        </MonthDisplay>
        <Button
          endIcon={<ArrowForward />}
          onClick={onNextMonth}
          variant="outlined"
          disabled={isLoading}
          aria-label="Next month"
        ></Button>
      </NavigationContainer>
    );
  }
);

MonthNavigation.displayName = 'MonthNavigation';

export default MonthNavigation;
