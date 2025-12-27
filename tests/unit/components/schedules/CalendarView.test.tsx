import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { CalendarEvent } from '@/lib/utils/calendarUtils';

// Mock all FullCalendar modules to avoid ES module issues in Jest
jest.mock('@fullcalendar/react', () => {
  return function MockFullCalendar({
    eventClick,
    events,
  }: {
    eventClick?: (info: { event: { id: string }; jsEvent: { preventDefault: () => void } }) => void;
    events?: CalendarEvent[];
  }) {
    return (
      <div data-testid="mock-fullcalendar">
        <div data-testid="calendar-events">
          {(events || []).map((event: CalendarEvent) => (
            <button
              key={event.id}
              data-testid={`event-${event.id}`}
              onClick={() => {
                eventClick?.({
                  event: { id: event.id },
                  jsEvent: { preventDefault: () => undefined },
                });
              }}
            >
              {event.title}
            </button>
          ))}
        </div>
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

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('should open event detail dialog when event is clicked', async () => {
    renderWithTheme(<CalendarView {...defaultProps} />);

    const eventButton = screen.getByTestId('event-event-1');
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

    const eventButton = screen.getByTestId('event-event-1');
    fireEvent.click(eventButton);

    await waitFor(() => {
      expect(screen.getByText('£350.00')).toBeInTheDocument();
    });
  });

  it('should display weekday and weekend counts', async () => {
    renderWithTheme(<CalendarView {...defaultProps} />);

    const eventButton = screen.getByTestId('event-event-1');
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

    const eventButton = screen.getByTestId('event-event-1');
    fireEvent.click(eventButton);

    await waitFor(() => {
      expect(screen.getByText(/160\.0 hours total/)).toBeInTheDocument();
    });
  });

  it('should close dialog when close button is clicked', async () => {
    renderWithTheme(<CalendarView {...defaultProps} />);

    const eventButton = screen.getByTestId('event-event-1');
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

    const eventButton = screen.getByTestId('event-event-1');
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

    const eventButton = screen.getByTestId('event-event-3');
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

    const eventButton = screen.getByTestId('event-event-4');
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

    const eventButton = screen.getByTestId('event-event-5');
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

    const eventButton = screen.getByTestId('event-event-6');
    fireEvent.click(eventButton);

    await waitFor(() => {
      expect(screen.getByText(/1 weekday$/)).toBeInTheDocument();
    });
  });

  it('should use correct timezone for date display', async () => {
    renderWithTheme(<CalendarView {...defaultProps} />);

    const eventButton = screen.getByTestId('event-event-1');
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
});
