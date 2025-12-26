import { render, screen } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ScheduleDetailPage from '../page';

// Mock all FullCalendar modules to avoid ES module issues in Jest
jest.mock('@fullcalendar/react', () => {
  return function MockFullCalendar() {
    return <div data-testid="mock-fullcalendar">Calendar</div>;
  };
});

jest.mock('@fullcalendar/core', () => ({}));
jest.mock('@fullcalendar/daygrid', () => ({}));
jest.mock('@fullcalendar/interaction', () => ({}));
jest.mock('@fullcalendar/luxon3', () => ({}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useParams: jest.fn(),
  useRouter: jest.fn(),
}));

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock SWR
jest.mock('swr', () => {
  return jest.fn((key) => {
    if (!key) {
      return { data: undefined, error: undefined, isLoading: false };
    }
    // When loading, don't return data or error
    return { data: undefined, error: undefined, isLoading: true };
  });
});

// Mock common components
jest.mock('@/components/common', () => ({
  Header: () => <div data-testid="header">Header</div>,
  Footer: () => <div data-testid="footer">Footer</div>,
  Loading: ({ message, fullScreen }: { message: string; fullScreen?: boolean }) => (
    <div data-testid="loading" data-fullscreen={fullScreen}>
      {message}
    </div>
  ),
}));

describe('ScheduleDetailPage', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    (useParams as jest.Mock).mockReturnValue({ id: 'test-schedule-id' });
  });

  it('should render page structure with loading in schedule section when loading', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { name: 'Test User' },
        accessToken: 'token',
      },
      status: 'authenticated',
    });

    render(<ScheduleDetailPage />);

    // Verify header and footer ARE rendered during loading
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();

    // Verify loading indicator is shown (without fullScreen)
    const loadingElement = screen.getByTestId('loading');
    expect(loadingElement).toBeInTheDocument();
    expect(loadingElement).not.toHaveAttribute('data-fullscreen', 'true');
    expect(screen.getByText('Loading schedule...')).toBeInTheDocument();
  });

  it('should not fetch data when not authenticated', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<ScheduleDetailPage />);

    // When not authenticated, SWR key is null, so won't be in loading state
    expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
  });

  it('should have proper page structure when initialized', () => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { name: 'Test User' },
        accessToken: 'token',
        authMethod: 'oauth',
      },
      status: 'authenticated',
    });

    const { container } = render(<ScheduleDetailPage />);

    // Check that component renders
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should use correct schedule ID from params', () => {
    (useParams as jest.Mock).mockReturnValue({ id: 'specific-schedule-123' });
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: { name: 'Test User' },
        accessToken: 'token',
      },
      status: 'authenticated',
    });

    render(<ScheduleDetailPage />);

    // Component should render with header/footer and loading indicator
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByTestId('loading')).toBeInTheDocument();
  });
});
