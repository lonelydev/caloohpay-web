import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import ScheduleCard from '@/components/schedules/ScheduleCard';
import { PagerDutySchedule } from '@/lib/types';

describe('ScheduleCard', () => {
  const mockSchedule: PagerDutySchedule = {
    id: 'test-schedule-1',
    name: 'Test Schedule',
    description: 'This is a test schedule description',
    time_zone: 'America/New_York',
    html_url: 'https://example.pagerduty.com/schedules/test-schedule-1',
    final_schedule: {
      name: 'Test Schedule',
      rendered_schedule_entries: [],
    },
  };

  const mockOnClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render schedule name', () => {
      render(<ScheduleCard schedule={mockSchedule} onClick={mockOnClick} />);

      expect(screen.getByText('Test Schedule')).toBeInTheDocument();
    });

    it('should render schedule description when provided', () => {
      render(<ScheduleCard schedule={mockSchedule} onClick={mockOnClick} />);

      expect(screen.getByText('This is a test schedule description')).toBeInTheDocument();
    });

    it('should not render description when not provided', () => {
      const scheduleWithoutDesc = { ...mockSchedule, description: undefined };
      render(<ScheduleCard schedule={scheduleWithoutDesc} onClick={mockOnClick} />);

      expect(screen.queryByText('This is a test schedule description')).not.toBeInTheDocument();
    });

    it('should render timezone chip', () => {
      render(<ScheduleCard schedule={mockSchedule} onClick={mockOnClick} />);

      expect(screen.getByText('America/New_York')).toBeInTheDocument();
    });

    it('should not render timezone when not provided', () => {
      const scheduleWithoutTz = { ...mockSchedule, time_zone: '' };
      render(<ScheduleCard schedule={scheduleWithoutTz} onClick={mockOnClick} />);

      expect(screen.queryByText('America/New_York')).not.toBeInTheDocument();
    });

    it('should render calendar icon', () => {
      const { container } = render(<ScheduleCard schedule={mockSchedule} onClick={mockOnClick} />);

      // MUI CalendarMonth icon should be present
      const icons = container.querySelectorAll('svg');
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe('Interactions', () => {
    it('should call onClick when card is clicked', async () => {
      const user = userEvent.setup();
      render(<ScheduleCard schedule={mockSchedule} onClick={mockOnClick} />);

      const card = screen.getByRole('article');
      await user.click(card);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should call onClick for each click (not debounced)', async () => {
      const user = userEvent.setup();
      render(<ScheduleCard schedule={mockSchedule} onClick={mockOnClick} />);

      const card = screen.getByRole('article');

      // Click multiple times to verify no debouncing
      await user.click(card);
      await user.click(card);
      await user.click(card);

      expect(mockOnClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('Tooltip', () => {
    it('should have tooltip with schedule name', () => {
      render(<ScheduleCard schedule={mockSchedule} onClick={mockOnClick} />);

      // Tooltip is applied to the card element
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', 'Test Schedule');
    });

    it('should show full name in tooltip for truncated text', () => {
      const longNameSchedule = {
        ...mockSchedule,
        name: 'This is a very long schedule name that will definitely be truncated in the card view',
      };
      render(<ScheduleCard schedule={longNameSchedule} onClick={mockOnClick} />);

      // Tooltip should show full name via aria-label
      const card = screen.getByRole('article');
      expect(card).toHaveAttribute(
        'aria-label',
        'This is a very long schedule name that will definitely be truncated in the card view'
      );
    });
  });

  describe('Text Truncation', () => {
    it('should handle very long schedule names', () => {
      const longNameSchedule = {
        ...mockSchedule,
        name: 'A'.repeat(200), // Very long name
      };
      const { container } = render(
        <ScheduleCard schedule={longNameSchedule} onClick={mockOnClick} />
      );

      // Name should be truncated with CSS
      const nameElement = container.querySelector('h3');
      expect(nameElement).toHaveStyle({
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      });
    });

    it('should handle very long descriptions', () => {
      const longDescSchedule = {
        ...mockSchedule,
        description: 'B'.repeat(200), // Very long description
      };
      const { container } = render(
        <ScheduleCard schedule={longDescSchedule} onClick={mockOnClick} />
      );

      // Description should be truncated
      const descElement = container.querySelector('p');
      expect(descElement).toHaveStyle({
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      });
    });
  });

  describe('Accessibility', () => {
    it('should have article role for semantic HTML', () => {
      render(<ScheduleCard schedule={mockSchedule} onClick={mockOnClick} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should have accessible label from tooltip', () => {
      render(<ScheduleCard schedule={mockSchedule} onClick={mockOnClick} />);

      const card = screen.getByRole('article');
      expect(card).toHaveAttribute('aria-label', 'Test Schedule');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty strings gracefully', () => {
      const emptySchedule = {
        ...mockSchedule,
        name: '',
        description: '',
        time_zone: '',
      };
      render(<ScheduleCard schedule={emptySchedule} onClick={mockOnClick} />);

      // Should still render without errors
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('should handle special characters in name', () => {
      const specialCharSchedule = {
        ...mockSchedule,
        name: 'Test & Schedule <>&"\'',
      };
      render(<ScheduleCard schedule={specialCharSchedule} onClick={mockOnClick} />);

      expect(screen.getByText('Test & Schedule <>&"\'')).toBeInTheDocument();
    });

    it('should handle null-like values', () => {
      const minimalSchedule: PagerDutySchedule = {
        id: 'test-id',
        name: 'Test',
        time_zone: 'UTC',
        html_url: '',
        final_schedule: {
          name: 'Test',
          rendered_schedule_entries: [],
        },
      };
      render(<ScheduleCard schedule={minimalSchedule} onClick={mockOnClick} />);

      expect(screen.getByRole('article')).toBeInTheDocument();
      expect(screen.getByText('Test')).toBeInTheDocument();
    });
  });
});
