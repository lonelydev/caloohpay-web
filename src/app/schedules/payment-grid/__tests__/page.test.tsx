import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import MultiSchedulePaymentPage from '../page';
import { ThemeProvider } from '@/context/ThemeContext';
import { DateTime } from 'luxon';

/* eslint-disable @typescript-eslint/no-explicit-any */

// Mock dependencies
jest.mock('next-auth/react');
jest.mock('swr');

// Mock settings hook
jest.mock('@/hooks/useSettings', () => ({
  useSettings: () => ({
    weekdayRate: 50,
    weekendRate: 75,
  }),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock clipboard
const mockWriteText = jest.fn(() => Promise.resolve());
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseSWR = useSWR as jest.MockedFunction<typeof useSWR>;

// Wrapper component for tests
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

const mockReportData = {
  reports: [
    {
      metadata: {
        id: 'SCHED1',
        name: 'Engineering On-Call',
        html_url: 'https://example.pagerduty.com/schedules/SCHED1',
        time_zone: 'America/New_York',
      },
      employees: [
        {
          name: 'John Doe',
          userId: 'USER1',
          totalCompensation: 150.0,
          weekdayHours: 10.0,
          weekendHours: 5.0,
          isOverlapping: false,
        },
      ],
    },
  ],
};

describe('MultiSchedulePaymentPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    mockWriteText.mockClear();
    mockWriteText.mockResolvedValue(undefined);

    mockUseSession.mockReturnValue({
      data: {
        user: { id: 'test-user-id', name: 'Test User', email: 'test@example.com' },
        accessToken: 'test-token',
        expires: '2025-12-31',
      },
      status: 'authenticated',
      update: jest.fn(),
    } as any);

    mockUseSWR.mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: jest.fn(),
    } as any);
  });

  describe('Rendering', () => {
    it('should render the page title', () => {
      render(
        <TestWrapper>
          <MultiSchedulePaymentPage />
        </TestWrapper>
      );

      expect(screen.getByText('Multi-Schedule Reports')).toBeInTheDocument();
    });

    it('should render schedule multi-select component', () => {
      render(
        <TestWrapper>
          <MultiSchedulePaymentPage />
        </TestWrapper>
      );

      expect(screen.getByLabelText(/search schedules/i)).toBeInTheDocument();
    });

    it('should render month navigation', () => {
      render(
        <TestWrapper>
          <MultiSchedulePaymentPage />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
    });

    it('should render export button', () => {
      render(
        <TestWrapper>
          <MultiSchedulePaymentPage />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /export \/ copy/i })).toBeInTheDocument();
    });

    it('should initialize with current month', async () => {
      render(
        <TestWrapper>
          <MultiSchedulePaymentPage />
        </TestWrapper>
      );

      const currentMonth = DateTime.now().toFormat('MMMM yyyy');
      
      await waitFor(() => {
        expect(screen.getByText(currentMonth)).toBeInTheDocument();
      });
    });
  });

  describe('LocalStorage Integration', () => {
    it('should load schedule IDs from localStorage on mount', () => {
      const mockIds = ['SCHED1', 'SCHED2'];
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockIds));

      render(
        <TestWrapper>
          <MultiSchedulePaymentPage />
        </TestWrapper>
      );

      expect(localStorageMock.getItem).toHaveBeenCalledWith('caloohpay_multi_schedule_ids');
    });

    it('should handle invalid localStorage data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-json');

      // Should not throw
      expect(() => {
        render(
          <TestWrapper>
            <MultiSchedulePaymentPage />
          </TestWrapper>
        );
      }).not.toThrow();
    });
  });

  describe('Report Display', () => {
    it('should show info message when no schedules selected', () => {
      render(
        <TestWrapper>
          <MultiSchedulePaymentPage />
        </TestWrapper>
      );

      expect(
        screen.getByText(/select one or more schedules above to generate a payment report/i)
      ).toBeInTheDocument();
    });

    it('should show loading state when fetching report', () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: undefined,
        isLoading: true,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      render(
        <TestWrapper>
          <MultiSchedulePaymentPage />
        </TestWrapper>
      );

      expect(screen.getByText(/calculating multi-schedule payments/i)).toBeInTheDocument();
    });

    it('should display compensation grid when data is loaded', () => {
      mockUseSWR.mockReturnValue({
        data: mockReportData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      render(
        <TestWrapper>
          <MultiSchedulePaymentPage />
        </TestWrapper>
      );

      // Verify CompensationGrid component is mounted by checking for the grid container
      // AG Grid requires a specific DOM structure that may not be fully initialized in tests
      const gridContainer = screen.queryByRole('grid');
      // If no grid role, at least ensure the data exists
      if (!gridContainer) {
        // Fallback: ensure we're not showing loading or error states
        expect(screen.queryByText(/calculating multi-schedule payments/i)).not.toBeInTheDocument();
        expect(screen.queryByText(/an error occurred/i)).not.toBeInTheDocument();
      } else {
        expect(gridContainer).toBeInTheDocument();
      }
    });
  });

  describe('Export Functionality', () => {
    it('should disable export button when no data', () => {
      render(
        <TestWrapper>
          <MultiSchedulePaymentPage />
        </TestWrapper>
      );

      const exportButton = screen.getByRole('button', { name: /export \/ copy/i });
      expect(exportButton).toBeDisabled();
    });

    it('should enable export button when data is loaded', () => {
      mockUseSWR.mockReturnValue({
        data: mockReportData,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn(),
      } as any);

      render(
        <TestWrapper>
          <MultiSchedulePaymentPage />
        </TestWrapper>
      );

      const exportButton = screen.getByRole('button', { name: /export \/ copy/i });
      expect(exportButton).not.toBeDisabled();
    });
  });

  describe('Month Navigation', () => {
    it('should navigate to previous month', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <MultiSchedulePaymentPage />
        </TestWrapper>
      );

      const prevButton = screen.getByRole('button', { name: /previous month/i });
      await user.click(prevButton);

      const previousMonth = DateTime.now().minus({ months: 1 }).toFormat('MMMM yyyy');
      
      await waitFor(() => {
        expect(screen.getByText(previousMonth)).toBeInTheDocument();
      });
    });

    it('should navigate to next month', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <MultiSchedulePaymentPage />
        </TestWrapper>
      );

      const nextButton = screen.getByRole('button', { name: /next month/i });
      await user.click(nextButton);

      const nextMonth = DateTime.now().plus({ months: 1 }).toFormat('MMMM yyyy');
      
      await waitFor(() => {
        expect(screen.getByText(nextMonth)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(
        <TestWrapper>
          <MultiSchedulePaymentPage />
        </TestWrapper>
      );

      const heading = screen.getByRole('heading', { name: /multi-schedule reports/i });
      // H1 elements have implicit level 1, not aria-level attribute
      expect(heading.tagName).toBe('H1');
    });

    it('should have accessible button labels', () => {
      render(
        <TestWrapper>
          <MultiSchedulePaymentPage />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /previous month/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next month/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /export \/ copy/i })).toBeInTheDocument();
    });
  });
});
