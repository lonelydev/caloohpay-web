import React from 'react';
import { Button, Typography, Tooltip } from '@mui/material';
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
        <Tooltip title="Previous month" arrow>
          <span>
            <Button
              onClick={onPreviousMonth}
              variant="outlined"
              disabled={isLoading}
              aria-label="Previous month"
            >
              <ArrowBack />
            </Button>
          </span>
        </Tooltip>
        <MonthDisplay>
          <CalendarMonth />
          <Typography variant="h5">{currentMonth}</Typography>
        </MonthDisplay>
        <Tooltip title="Next month" arrow>
          <span>
            <Button
              onClick={onNextMonth}
              variant="outlined"
              disabled={isLoading}
              aria-label="Next month"
            >
              <ArrowForward />
            </Button>
          </span>
        </Tooltip>
      </NavigationContainer>
    );
  }
);

MonthNavigation.displayName = 'MonthNavigation';

export default MonthNavigation;
