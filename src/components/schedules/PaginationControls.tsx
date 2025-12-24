import React from 'react';
import { Button, ButtonGroup } from '@mui/material';
import {
  FirstPage as FirstPageIcon,
  LastPage as LastPageIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
} from '@mui/icons-material';

export interface PaginationControlsProps {
  /** Current page number (1-indexed) */
  page: number;
  /** Total number of pages */
  totalPages: number;
  /** Whether the component is in loading state */
  isLoading?: boolean;
  /** Callback when user clicks First button */
  onFirstPage: () => void;
  /** Callback when user clicks Previous button */
  onPrevPage: () => void;
  /** Callback when user clicks Next button */
  onNextPage: () => void;
  /** Callback when user clicks Last button */
  onLastPage: () => void;
}

/**
 * Memoized pagination controls component for navigating through pages.
 * Only re-renders when page, totalPages, isLoading, or callbacks change.
 * Prevents unnecessary re-renders when parent component updates unrelated state.
 */
const PaginationControls: React.FC<PaginationControlsProps> = React.memo(
  ({ page, totalPages, isLoading = false, onFirstPage, onPrevPage, onNextPage, onLastPage }) => {
    const isFirstPage = page === 1;
    const isLastPage = page >= totalPages;

    return (
      <ButtonGroup variant="outlined" size="large">
        <Button
          onClick={onFirstPage}
          disabled={isFirstPage || isLoading}
          startIcon={<FirstPageIcon />}
        >
          First
        </Button>
        <Button onClick={onPrevPage} disabled={isFirstPage || isLoading} startIcon={<PrevIcon />}>
          Previous
        </Button>
        <Button onClick={onNextPage} disabled={isLastPage || isLoading} endIcon={<NextIcon />}>
          Next
        </Button>
        <Button onClick={onLastPage} disabled={isLastPage || isLoading} endIcon={<LastPageIcon />}>
          Last
        </Button>
      </ButtonGroup>
    );
  }
);

PaginationControls.displayName = 'PaginationControls';

export default PaginationControls;
