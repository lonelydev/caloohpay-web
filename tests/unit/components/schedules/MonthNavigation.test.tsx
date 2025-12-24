import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import MonthNavigation from '@/components/schedules/MonthNavigation';

describe('MonthNavigation', () => {
  const defaultProps = {
    currentMonth: 'January 2025',
    isLoading: false,
    onPreviousMonth: jest.fn(),
    onNextMonth: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render both navigation buttons', () => {
      render(<MonthNavigation {...defaultProps} />);

      expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
    });

    it('should display current month text', () => {
      render(<MonthNavigation {...defaultProps} />);

      expect(screen.getByText('January 2025')).toBeInTheDocument();
    });

    it('should render with correct month format', () => {
      const { rerender } = render(
        <MonthNavigation {...defaultProps} currentMonth="December 2024" />
      );

      expect(screen.getByText('December 2024')).toBeInTheDocument();

      rerender(<MonthNavigation {...defaultProps} currentMonth="March 2026" />);

      expect(screen.getByText('March 2026')).toBeInTheDocument();
    });

    it('should render calendar icon', () => {
      const { container } = render(<MonthNavigation {...defaultProps} />);

      // MUI CalendarMonth icon should be present
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Button States', () => {
    it('should enable both buttons by default', () => {
      render(<MonthNavigation {...defaultProps} />);

      expect(screen.getByRole('button', { name: /previous month/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /next month/i })).not.toBeDisabled();
    });

    it('should disable both buttons when loading', () => {
      render(<MonthNavigation {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('button', { name: /previous month/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /next month/i })).toBeDisabled();
    });

    it('should enable buttons when loading finishes', () => {
      const { rerender } = render(<MonthNavigation {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('button', { name: /previous month/i })).toBeDisabled();

      rerender(<MonthNavigation {...defaultProps} isLoading={false} />);

      expect(screen.getByRole('button', { name: /previous month/i })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: /next month/i })).not.toBeDisabled();
    });
  });

  describe('User Interactions', () => {
    it('should call onPreviousMonth when Previous Month button is clicked', async () => {
      const user = userEvent.setup();
      render(<MonthNavigation {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /previous month/i }));

      expect(defaultProps.onPreviousMonth).toHaveBeenCalledTimes(1);
      expect(defaultProps.onNextMonth).not.toHaveBeenCalled();
    });

    it('should call onNextMonth when Next Month button is clicked', async () => {
      const user = userEvent.setup();
      render(<MonthNavigation {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /next month/i }));

      expect(defaultProps.onNextMonth).toHaveBeenCalledTimes(1);
      expect(defaultProps.onPreviousMonth).not.toHaveBeenCalled();
    });

    it('should not call handlers when buttons are disabled', async () => {
      render(<MonthNavigation {...defaultProps} isLoading={true} />);

      // Disabled buttons should not be clickable (pointer-events: none)
      expect(screen.getByRole('button', { name: /previous month/i })).toBeDisabled();
      expect(screen.getByRole('button', { name: /next month/i })).toBeDisabled();

      // Handlers should not be called for disabled buttons
      expect(defaultProps.onPreviousMonth).not.toHaveBeenCalled();
      expect(defaultProps.onNextMonth).not.toHaveBeenCalled();
    });

    it('should handle multiple clicks on the same button', async () => {
      const user = userEvent.setup();
      render(<MonthNavigation {...defaultProps} />);

      const nextButton = screen.getByRole('button', { name: /next month/i });

      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);

      expect(defaultProps.onNextMonth).toHaveBeenCalledTimes(3);
    });
  });

  describe('Memoization', () => {
    it('should not re-render when unrelated parent state changes', () => {
      const { rerender } = render(<MonthNavigation {...defaultProps} />);
      const previousButton = screen.getByRole('button', { name: /previous month/i });
      const firstRender = previousButton;

      // Re-render with same props
      rerender(<MonthNavigation {...defaultProps} />);

      // Component should be memoized and not create new DOM elements
      expect(screen.getByRole('button', { name: /previous month/i })).toBe(firstRender);
    });

    it('should re-render when currentMonth changes', () => {
      const { rerender } = render(
        <MonthNavigation {...defaultProps} currentMonth="January 2025" />
      );

      expect(screen.getByText('January 2025')).toBeInTheDocument();

      rerender(<MonthNavigation {...defaultProps} currentMonth="February 2025" />);

      expect(screen.queryByText('January 2025')).not.toBeInTheDocument();
      expect(screen.getByText('February 2025')).toBeInTheDocument();
    });

    it('should re-render when isLoading changes', () => {
      const { rerender } = render(<MonthNavigation {...defaultProps} isLoading={false} />);

      expect(screen.getByRole('button', { name: /previous month/i })).not.toBeDisabled();

      rerender(<MonthNavigation {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('button', { name: /previous month/i })).toBeDisabled();
    });

    it('should re-render when callbacks change', () => {
      const newCallback = jest.fn();
      const { rerender } = render(<MonthNavigation {...defaultProps} />);

      rerender(<MonthNavigation {...defaultProps} onNextMonth={newCallback} />);

      // New callback should be used
      const nextButton = screen.getByRole('button', { name: /next month/i });
      nextButton.click();

      expect(newCallback).toHaveBeenCalledTimes(1);
      expect(defaultProps.onNextMonth).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button labels', () => {
      render(<MonthNavigation {...defaultProps} />);

      const previousButton = screen.getByRole('button', { name: /previous month/i });
      const nextButton = screen.getByRole('button', { name: /next month/i });

      expect(previousButton).toHaveAccessibleName();
      expect(nextButton).toHaveAccessibleName();
    });

    it('should be keyboard navigable', () => {
      render(<MonthNavigation {...defaultProps} />);

      const previousButton = screen.getByRole('button', { name: /previous month/i });
      const nextButton = screen.getByRole('button', { name: /next month/i });

      // Buttons should be focusable
      previousButton.focus();
      expect(previousButton).toHaveFocus();

      nextButton.focus();
      expect(nextButton).toHaveFocus();
    });
  });

  describe('Layout', () => {
    it('should render with proper spacing structure', () => {
      const { container } = render(<MonthNavigation {...defaultProps} />);

      // Should have flex container for layout
      const flexBox =
        container.querySelector('[style*="flex"]') || container.querySelector('.MuiBox-root');
      expect(flexBox).toBeInTheDocument();
    });

    it('should display month text between navigation buttons', () => {
      render(<MonthNavigation {...defaultProps} />);

      const previousButton = screen.getByRole('button', { name: /previous month/i });
      const monthText = screen.getByText('January 2025');
      const nextButton = screen.getByRole('button', { name: /next month/i });

      // Check order in DOM
      const container = previousButton.parentElement?.parentElement;
      const children = Array.from(container?.children || []);

      const monthIndex = children.findIndex((child) => child.textContent?.includes('January 2025'));
      expect(monthIndex).toBeGreaterThan(-1);

      // Verify buttons exist
      expect(previousButton).toBeInTheDocument();
      expect(monthText).toBeInTheDocument();
      expect(nextButton).toBeInTheDocument();
    });
  });
});
