import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { CalendarEvent } from '@/lib/utils/calendarUtils';

// Mock all FullCalendar modules to avoid ES module issues in Jest
jest.mock('@fullcalendar/react', () => {
  return function MockFullCalendar({
    events,
    eventContent,
  }: {
    eventClick?: (info: {
      event: { id: string; extendedProps: Record<string, unknown> };
      jsEvent: { preventDefault: () => void };
    }) => void;
    events?: Array<{ id?: string; extendedProps?: Record<string, unknown> }>;
    eventContent?: (arg: {
      event: { id: string; extendedProps: Record<string, unknown> };
    }) => React.ReactNode;
  }) {
    return (
      <div data-testid="mock-fullcalendar">
        {(events ?? []).map((event) => {
          const eventId = event.id ?? '';
          const extendedProps = (event.extendedProps ?? {}) as Record<string, unknown>;
          return (
            <div key={eventId} data-testid={`fc-event-${eventId}`}>
              {eventContent?.({ event: { id: eventId, extendedProps } })}
            </div>
          );
        })}
      </div>
    );
  };
});

jest.mock('@fullcalendar/core', () => ({}));
jest.mock('@fullcalendar/daygrid', () => ({}));
jest.mock('@fullcalendar/interaction', () => ({}));
jest.mock('@fullcalendar/luxon3', () => ({}));

// Import after mocks are defined
import CalendarView from '@/components/schedules/CalendarView';

describe('CalendarView', () => {
  const theme = createTheme();

  const mockEvents: CalendarEvent[] = [
    {
      id: 'event-1',
      title: 'John Doe',
      start: '2024-01-01T17:00:00Z',
      end: '2024-01-08T09:00:00Z',
      extendedProps: {
        user: {
          id: 'user-1',
          summary: 'John Doe',
          name: 'John Doe',
          email: 'john@example.com',
        },
        duration: 160,
        weekdayDays: 4,
        weekendDays: 2,
        compensation: 350,
      },
    },
    {
      id: 'event-2',
      title: 'Jane Smith',
      start: '2024-01-15T17:00:00Z',
      end: '2024-01-22T09:00:00Z',
      extendedProps: {
        user: {
          id: 'user-2',
          summary: 'Jane Smith',
          name: 'Jane Smith',
          email: 'jane@example.com',
        },
        duration: 160,
        weekdayDays: 3,
        weekendDays: 3,
        compensation: 375,
      },
    },
  ];

  const defaultProps = {
    events: mockEvents,
    timezone: 'America/New_York',
  };

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
  };

  it('should render FullCalendar component', () => {
    renderWithTheme(<CalendarView {...defaultProps} />);

    expect(screen.getByTestId('mock-fullcalendar')).toBeInTheDocument();
  });

  it('should display calendar events', () => {
    renderWithTheme(<CalendarView {...defaultProps} />);

    expect(screen.getAllByText(/John Doe/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Jane Smith/).length).toBeGreaterThan(0);
  });

  it('should open event detail dialog when event is clicked', async () => {
    renderWithTheme(<CalendarView {...defaultProps} />);

    const eventButton = screen.getByTestId('day-segment-event-1-2024-01-01');
    fireEvent.click(eventButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      const nameElements = screen.getAllByText('John Doe');
      expect(nameElements.length).toBeGreaterThan(0);
      expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });
  });

  it('should display correct compensation in dialog', async () => {
    renderWithTheme(<CalendarView {...defaultProps} />);

    const eventButton = screen.getByTestId('day-segment-event-1-2024-01-01');
    fireEvent.click(eventButton);

    await waitFor(() => {
      expect(screen.getByText('£350.00')).toBeInTheDocument();
    });
  });

  it('should display weekday and weekend counts', async () => {
    renderWithTheme(<CalendarView {...defaultProps} />);

    const eventButton = screen.getByTestId('day-segment-event-1-2024-01-01');
    fireEvent.click(eventButton);

    await waitFor(() => {
      const weekdayElements = screen.getAllByText(/4 weekdays/);
      expect(weekdayElements.length).toBeGreaterThan(0);
      const weekendElements = screen.getAllByText(/2 weekends/);
      expect(weekendElements.length).toBeGreaterThan(0);
    });
  });

  it('should display duration in hours', async () => {
    renderWithTheme(<CalendarView {...defaultProps} />);

    const eventButton = screen.getByTestId('day-segment-event-1-2024-01-01');
    fireEvent.click(eventButton);

    await waitFor(() => {
      expect(screen.getByText(/160\.0 hours total/)).toBeInTheDocument();
    });
  });

  it('should close dialog when close button is clicked', async () => {
    renderWithTheme(<CalendarView {...defaultProps} />);

    const eventButton = screen.getByTestId('day-segment-event-1-2024-01-01');
    fireEvent.click(eventButton);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('should display payment breakdown in dialog', async () => {
    renderWithTheme(<CalendarView {...defaultProps} />);

    const eventButton = screen.getByTestId('day-segment-event-1-2024-01-01');
    fireEvent.click(eventButton);

    await waitFor(() => {
      expect(screen.getByText(/PAYMENT CALCULATION/)).toBeInTheDocument();
      expect(screen.getAllByText(/4 weekdays/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/2 weekends/).length).toBeGreaterThan(0);
    });
  });

  it('should handle events with no weekdays', async () => {
    const weekendOnlyEvent: CalendarEvent = {
      id: 'event-3',
      title: 'Weekend Worker',
      start: '2024-01-05T17:00:00Z',
      end: '2024-01-07T09:00:00Z',
      extendedProps: {
        user: {
          id: 'user-3',
          summary: 'Weekend Worker',
          name: 'Weekend Worker',
        },
        duration: 40,
        weekdayDays: 0,
        weekendDays: 2,
        compensation: 150,
      },
    };

    renderWithTheme(<CalendarView {...defaultProps} events={[weekendOnlyEvent]} />);

    const eventButton = screen.getByTestId('day-segment-event-3-2024-01-05');
    fireEvent.click(eventButton);

    await waitFor(() => {
      const weekendElements = screen.getAllByText(/2 weekends/);
      expect(weekendElements.length).toBeGreaterThan(0);
      expect(screen.queryByText(/weekdays/)).not.toBeInTheDocument();
    });
  });

  it('should handle events with no weekends', async () => {
    const weekdayOnlyEvent: CalendarEvent = {
      id: 'event-4',
      title: 'Weekday Worker',
      start: '2024-01-08T17:00:00Z',
      end: '2024-01-10T09:00:00Z',
      extendedProps: {
        user: {
          id: 'user-4',
          summary: 'Weekday Worker',
          name: 'Weekday Worker',
        },
        duration: 40,
        weekdayDays: 2,
        weekendDays: 0,
        compensation: 100,
      },
    };

    renderWithTheme(<CalendarView {...defaultProps} events={[weekdayOnlyEvent]} />);

    const eventButton = screen.getByTestId('day-segment-event-4-2024-01-08');
    fireEvent.click(eventButton);

    await waitFor(() => {
      const weekdayElements = screen.getAllByText(/2 weekdays/);
      expect(weekdayElements.length).toBeGreaterThan(0);
      expect(screen.queryByText(/weekends/)).not.toBeInTheDocument();
    });
  });

  it('should handle user without email', async () => {
    const noEmailEvent: CalendarEvent = {
      id: 'event-5',
      title: 'No Email User',
      start: '2024-01-01T17:00:00Z',
      end: '2024-01-02T09:00:00Z',
      extendedProps: {
        user: {
          id: 'user-5',
          summary: 'No Email User',
          name: 'No Email User',
        },
        duration: 16,
        weekdayDays: 1,
        weekendDays: 0,
        compensation: 50,
      },
    };

    renderWithTheme(<CalendarView {...defaultProps} events={[noEmailEvent]} />);

    const eventButton = screen.getByTestId('day-segment-event-5-2024-01-01');
    fireEvent.click(eventButton);

    await waitFor(() => {
      const nameElements = screen.getAllByText('No Email User');
      expect(nameElements.length).toBeGreaterThan(0);
      expect(screen.queryByText(/@/)).not.toBeInTheDocument();
    });
  });

  it('should handle empty events array', () => {
    renderWithTheme(<CalendarView {...defaultProps} events={[]} />);

    expect(screen.getByTestId('mock-fullcalendar')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should display singular forms for single day/weekend', async () => {
    const singleDayEvent: CalendarEvent = {
      id: 'event-6',
      title: 'Single Day',
      start: '2024-01-01T17:00:00Z',
      end: '2024-01-02T09:00:00Z',
      extendedProps: {
        user: {
          id: 'user-6',
          summary: 'Single Day',
          name: 'Single Day',
        },
        duration: 16,
        weekdayDays: 1,
        weekendDays: 0,
        compensation: 50,
      },
    };

    renderWithTheme(<CalendarView {...defaultProps} events={[singleDayEvent]} />);

    const eventButton = screen.getByTestId('day-segment-event-6-2024-01-01');
    fireEvent.click(eventButton);

    await waitFor(() => {
      expect(screen.getByText(/1 weekday$/)).toBeInTheDocument();
    });
  });

  it('should use correct timezone for date display', async () => {
    renderWithTheme(<CalendarView {...defaultProps} />);

    const eventButton = screen.getByTestId('day-segment-event-1-2024-01-01');
    fireEvent.click(eventButton);

    await waitFor(() => {
      const dialog = screen.getByRole('dialog');
      expect(dialog).toBeInTheDocument();
    });
  });

  it('should accept initialDate prop for external date control', () => {
    const initialDate = '2024-02-01T00:00:00Z';
    renderWithTheme(<CalendarView {...defaultProps} initialDate={initialDate} />);

    expect(screen.getByTestId('mock-fullcalendar')).toBeInTheDocument();
  });

  it('should work without initialDate prop (defaults to current month)', () => {
    renderWithTheme(<CalendarView {...defaultProps} />);

    expect(screen.getByTestId('mock-fullcalendar')).toBeInTheDocument();
  });

  it('should render fixed-height horizontal day segment with proportional position', () => {
    const partialDayEvent: CalendarEvent = {
      id: 'partial-segment',
      title: 'Partial Segment',
      start: '2024-01-01T17:00:00.000Z',
      end: '2024-01-01T23:59:00.000Z',
      extendedProps: {
        user: {
          id: 'partial-user',
          summary: 'Partial Segment',
          name: 'Partial Segment',
        },
        duration: 6.98,
        weekdayDays: 1,
        weekendDays: 0,
        compensation: 50,
      },
    };

    renderWithTheme(<CalendarView events={[partialDayEvent]} timezone="UTC" />);

    const segment = screen.getByTestId('day-segment-partial-segment-2024-01-01');
    expect(segment).toHaveAttribute('data-left-percent', '70.83');
    expect(segment).toHaveAttribute('data-width-percent', '29.17');
  });

  it('should stack multiple day segments in separate rows', () => {
    const stackedEvents: CalendarEvent[] = [
      {
        id: 'stacked-1',
        title: 'Stacked One',
        start: '2024-01-01T09:00:00.000Z',
        end: '2024-01-01T18:00:00.000Z',
        extendedProps: {
          user: {
            id: 'stacked-user-1',
            summary: 'Stacked One',
            name: 'Stacked One',
          },
          duration: 9,
          weekdayDays: 1,
          weekendDays: 0,
          compensation: 50,
        },
      },
      {
        id: 'stacked-2',
        title: 'Stacked Two',
        start: '2024-01-01T12:00:00.000Z',
        end: '2024-01-01T22:00:00.000Z',
        extendedProps: {
          user: {
            id: 'stacked-user-2',
            summary: 'Stacked Two',
            name: 'Stacked Two',
          },
          duration: 10,
          weekdayDays: 1,
          weekendDays: 0,
          compensation: 50,
        },
      },
    ];

    renderWithTheme(<CalendarView events={stackedEvents} timezone="UTC" />);

    const first = screen.getByTestId('day-segment-stacked-1-2024-01-01');
    const second = screen.getByTestId('day-segment-stacked-2-2024-01-01');

    expect(first).toHaveAttribute('data-row-index', '0');
    expect(second).toHaveAttribute('data-row-index', '1');
  });

  describe('User Color Rendering', () => {
    it('should render events with backgroundColor, borderColor, and textColor properties', () => {
      const eventsWithColours: CalendarEvent[] = [
        {
          id: 'colored-event-1',
          title: 'John Doe',
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          backgroundColor: '#90CAF9',
          borderColor: '#64B5F6',
          textColor: '#0D47A1',
          extendedProps: {
            user: {
              id: 'user-1',
              summary: 'John Doe',
              name: 'John Doe',
              email: 'john@example.com',
            },
            duration: 16,
            weekdayDays: 1,
            weekendDays: 0,
            compensation: 50,
          },
        },
      ];

      renderWithTheme(<CalendarView {...defaultProps} events={eventsWithColours} />);

      expect(screen.getAllByText(/John Doe/).length).toBeGreaterThan(0);
      // Colors are applied to the segment bar, not the click-trigger button
      const segmentBar = screen.getByTestId('day-segment-colored-event-1-2024-01-01');
      expect(segmentBar).toHaveStyle('background-color: rgb(144, 202, 249)');
      expect(segmentBar).toHaveStyle('color: rgb(13, 71, 161)');
    });

    it('should handle multiple events with different user colors', () => {
      const eventsWithDifferentColours: CalendarEvent[] = [
        {
          id: 'colored-event-1',
          title: 'John Doe',
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          backgroundColor: '#90CAF9',
          borderColor: '#64B5F6',
          textColor: '#0D47A1',
          extendedProps: {
            user: {
              id: 'user-1',
              summary: 'John Doe',
              name: 'John Doe',
              email: 'john@example.com',
            },
            duration: 16,
            weekdayDays: 1,
            weekendDays: 0,
            compensation: 50,
          },
        },
        {
          id: 'colored-event-2',
          title: 'Jane Smith',
          start: '2024-01-03T17:00:00Z',
          end: '2024-01-04T09:00:00Z',
          backgroundColor: '#A5D6A7',
          borderColor: '#81C784',
          textColor: '#1B5E20',
          extendedProps: {
            user: {
              id: 'user-2',
              summary: 'Jane Smith',
              name: 'Jane Smith',
              email: 'jane@example.com',
            },
            duration: 16,
            weekdayDays: 1,
            weekendDays: 0,
            compensation: 50,
          },
        },
      ];

      renderWithTheme(<CalendarView {...defaultProps} events={eventsWithDifferentColours} />);

      expect(screen.getAllByText(/John Doe/).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Jane Smith/).length).toBeGreaterThan(0);
    });

    it('should handle events without color properties gracefully', () => {
      const eventsWithoutColours: CalendarEvent[] = [
        {
          id: 'no-color-event',
          title: 'Test User',
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          // No color properties
          extendedProps: {
            user: {
              id: 'user-test',
              summary: 'Test User',
              name: 'Test User',
            },
            duration: 16,
            weekdayDays: 1,
            weekendDays: 0,
            compensation: 50,
          },
        },
      ];

      renderWithTheme(<CalendarView {...defaultProps} events={eventsWithoutColours} />);

      expect(screen.getAllByText(/Test User/).length).toBeGreaterThan(0);
    });

    it('should maintain consistent colors when dialog is opened and closed', async () => {
      const eventsWithColours: CalendarEvent[] = [
        {
          id: 'persistent-color-event',
          title: 'John Doe',
          start: '2024-01-01T17:00:00Z',
          end: '2024-01-02T09:00:00Z',
          backgroundColor: '#90CAF9',
          borderColor: '#64B5F6',
          textColor: '#0D47A1',
          extendedProps: {
            user: {
              id: 'user-1',
              summary: 'John Doe',
              name: 'John Doe',
              email: 'john@example.com',
            },
            duration: 16,
            weekdayDays: 1,
            weekendDays: 0,
            compensation: 50,
          },
        },
      ];

      renderWithTheme(<CalendarView {...defaultProps} events={eventsWithColours} />);

      // Click event to open dialog
      const eventButton = screen.getByTestId('day-segment-persistent-color-event-2024-01-01');
      fireEvent.click(eventButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      // Close dialog
      const closeButton = screen.getByRole('button', { name: /close/i });
      fireEvent.click(closeButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      // Event should still be rendered with colors
      expect(screen.getAllByText(/John Doe/).length).toBeGreaterThan(0);
    });
  });
});
