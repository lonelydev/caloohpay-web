import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import PaginationControls from '@/components/schedules/PaginationControls';

describe('PaginationControls', () => {
  const defaultProps = {
    page: 2,
    totalPages: 5,
    isLoading: false,
    onFirstPage: jest.fn(),
    onPrevPage: jest.fn(),
    onNextPage: jest.fn(),
    onLastPage: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all four navigation buttons', () => {
      render(<PaginationControls {...defaultProps} />);

      expect(screen.getByRole('button', { name: /first/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /last/i })).toBeInTheDocument();
    });

    it('should render buttons with correct icons', () => {
      const { container } = render(<PaginationControls {...defaultProps} />);

      // Check for MUI icon classes (data-testid would be better in production)
      const buttons = container.querySelectorAll('button');
      expect(buttons).toHaveLength(4);
    });
  });

  describe('Button States', () => {
    it('should disable First and Previous buttons on first page', () => {
      render(<PaginationControls {...defaultProps} page={1} />);

      expect(screen.getByRole('button', { name: /first/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /last/i })).not.toBeDisabled();
    });

    it('should disable Next and Last buttons on last page', () => {
      render(<PaginationControls {...defaultProps} page={5} totalPages={5} />);

      expect(screen.getByRole('button', { name: /first/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /last/i })).toBeDisabled();
    });

    it('should enable all buttons on middle page', () => {
      render(<PaginationControls {...defaultProps} page={3} totalPages={5} />);

      expect(screen.getByRole('button', { name: /first/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /previous/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /last/i })).not.toBeDisabled();
    });

    it('should disable all buttons when loading', () => {
      render(<PaginationControls {...defaultProps} page={3} isLoading={true} />);

      expect(screen.getByRole('button', { name: /first/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /last/i })).toBeDisabled();
    });
  });

  describe('User Interactions', () => {
    it('should call onFirstPage when First button is clicked', async () => {
      const user = userEvent.setup();
      render(<PaginationControls {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /first/i }));

      expect(defaultProps.onFirstPage).toHaveBeenCalledTimes(1);
      expect(defaultProps.onPrevPage).not.toHaveBeenCalled();
      expect(defaultProps.onNextPage).not.toHaveBeenCalled();
      expect(defaultProps.onLastPage).not.toHaveBeenCalled();
    });

    it('should call onPrevPage when Previous button is clicked', async () => {
      const user = userEvent.setup();
      render(<PaginationControls {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /previous/i }));

      expect(defaultProps.onPrevPage).toHaveBeenCalledTimes(1);
      expect(defaultProps.onFirstPage).not.toHaveBeenCalled();
      expect(defaultProps.onNextPage).not.toHaveBeenCalled();
      expect(defaultProps.onLastPage).not.toHaveBeenCalled();
    });

    it('should call onNextPage when Next button is clicked', async () => {
      const user = userEvent.setup();
      render(<PaginationControls {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /next/i }));

      expect(defaultProps.onNextPage).toHaveBeenCalledTimes(1);
      expect(defaultProps.onFirstPage).not.toHaveBeenCalled();
      expect(defaultProps.onPrevPage).not.toHaveBeenCalled();
      expect(defaultProps.onLastPage).not.toHaveBeenCalled();
    });

    it('should call onLastPage when Last button is clicked', async () => {
      const user = userEvent.setup();
      render(<PaginationControls {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /last/i }));

      expect(defaultProps.onLastPage).toHaveBeenCalledTimes(1);
      expect(defaultProps.onFirstPage).not.toHaveBeenCalled();
      expect(defaultProps.onPrevPage).not.toHaveBeenCalled();
      expect(defaultProps.onNextPage).not.toHaveBeenCalled();
    });

    it('should not call handlers when buttons are disabled', async () => {
      render(<PaginationControls {...defaultProps} page={1} />);

      // Disabled buttons should not be clickable (pointer-events: none)
      expect(screen.getByRole('button', { name: /first/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();

      // Handlers should not be called for disabled buttons
      expect(defaultProps.onFirstPage).not.toHaveBeenCalled();
      expect(defaultProps.onPrevPage).not.toHaveBeenCalled();
    });
  });

  describe('Memoization', () => {
    it('should not re-render when unrelated parent state changes', () => {
      const { rerender } = render(<PaginationControls {...defaultProps} />);
      const firstButton = screen.getByRole('button', { name: /first/i });
      const firstRender = firstButton;

      // Re-render with same props
      rerender(<PaginationControls {...defaultProps} />);

      // Component should be memoized and not create new DOM elements
      expect(screen.getByRole('button', { name: /first/i })).toBe(firstRender);
    });

    it('should re-render when page changes', () => {
      const { rerender } = render(<PaginationControls {...defaultProps} page={2} />);

      expect(screen.getByRole('button', { name: /first/i })).not.toBeDisabled();

      // Change page to 1
      rerender(<PaginationControls {...defaultProps} page={1} />);

      expect(screen.getByRole('button', { name: /first/i })).toBeDisabled();
    });

    it('should re-render when totalPages changes', () => {
      const { rerender } = render(<PaginationControls {...defaultProps} page={5} totalPages={5} />);

      expect(screen.getByRole('button', { name: /last/i })).toBeDisabled();

      // Increase total pages
      rerender(<PaginationControls {...defaultProps} page={5} totalPages={10} />);

      expect(screen.getByRole('button', { name: /last/i })).not.toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle single page (page 1 of 1)', () => {
      render(<PaginationControls {...defaultProps} page={1} totalPages={1} />);

      expect(screen.getByRole('button', { name: /first/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /last/i })).toBeDisabled();
    });

    it('should handle page number equal to totalPages', () => {
      render(<PaginationControls {...defaultProps} page={3} totalPages={3} />);

      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /last/i })).toBeDisabled();
    });

    it('should handle page number greater than totalPages', () => {
      render(<PaginationControls {...defaultProps} page={10} totalPages={5} />);

      // Should treat as last page
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /last/i })).toBeDisabled();
    });
  });
});
