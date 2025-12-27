'use client';

import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Button,
  Alert,
  Card,
  CardContent,
  Divider,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  ArrowBack,
  AccessTime,
  Person,
  Wallet,
  Work,
  WorkOff,
  ViewList,
  CalendarMonth,
} from '@mui/icons-material';
import { useState, useMemo, useCallback, memo } from 'react';
import { DateTime } from 'luxon';
import { OnCallPeriod, OnCallUser, OnCallPaymentsCalculator } from '@/lib/caloohpay';
import { PAYMENT_RATES } from '@/lib/constants';
import { getPagerDutyHeaders } from '@/lib/utils/pagerdutyAuth';
import { Header, Footer, Loading } from '@/components/common';
import MonthNavigation from '@/components/schedules/MonthNavigation';
import CalendarView from '@/components/schedules/CalendarView';
import { transformToCalendarEvents } from '@/lib/utils/calendarUtils';
import { sanitizeUrl } from '@/lib/utils/urlSanitization';
import ScheduleHeader from './components/ScheduleHeader';
import type { PagerDutySchedule, ScheduleEntry, User } from '@/lib/types';
import * as styles from './page.styles';

interface ScheduleResponse {
  schedule: PagerDutySchedule;
}

/**
 * Memoized schedule actions - only re-renders if htmlUrl or hasSchedules changes
 */
const ScheduleActions = memo<{
  htmlUrl: string;
  hasSchedules: boolean;
}>(({ htmlUrl, hasSchedules }) => (
  <Box sx={styles.actionsContainer}>
    <Button variant="contained" color="primary" size="large" disabled={!hasSchedules}>
      Calculate Payments
    </Button>
    <Button variant="outlined" href={htmlUrl} target="_blank" rel="noopener noreferrer">
      View in PagerDuty
    </Button>
  </Box>
));
ScheduleActions.displayName = 'ScheduleActions';

/**
 * Memoized on-call schedule display - only re-renders when schedule data changes
 */
const OnCallSchedule = memo<{
  userSchedules: Array<{
    user: User;
    entries: Array<
      ScheduleEntry & {
        duration: number;
        weekdayDays: number;
        weekendDays: number;
        compensation: number;
      }
    >;
    totalHours: number;
    totalWeekdays: number;
    totalWeekends: number;
    totalCompensation: number;
  }>;
  currentMonthDisplay: string;
  timeZone: string;
  isLoading: boolean;
}>(({ userSchedules, currentMonthDisplay, timeZone, isLoading }) => {
  // Show loading state only in this section
  if (isLoading) {
    return (
      <Box sx={styles.loadingContainer}>
        <Loading message="Loading schedule..." />
      </Box>
    );
  }

  if (userSchedules.length === 0) {
    return (
      <Alert severity="info">
        <Typography variant="h6" gutterBottom>
          No On-Call Periods
        </Typography>
        <Typography variant="body2">
          There are no on-call periods scheduled for {currentMonthDisplay}.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={styles.scheduleTitle}>
        On-Call Schedule ({userSchedules.length} {userSchedules.length === 1 ? 'person' : 'people'})
      </Typography>

      <Stack spacing={3}>
        {userSchedules.map(
          ({ user, entries, totalHours, totalWeekdays, totalWeekends, totalCompensation }) => (
            <Card key={user.id} variant="outlined">
              <CardContent>
                <Box sx={styles.userCardHeader}>
                  <Box sx={styles.userInfoContainer}>
                    <Person />
                    <Box>
                      <Typography variant="h6">{user.name || user.summary}</Typography>
                      {user.email && (
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box sx={styles.chipsContainer}>
                    <Chip
                      label={`${totalHours.toFixed(1)} hours`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      icon={<Work />}
                      label={`${totalWeekdays} weekdays`}
                      color="default"
                      variant="outlined"
                    />
                    <Chip
                      icon={<WorkOff />}
                      label={`${totalWeekends} weekends`}
                      color="secondary"
                      variant="outlined"
                    />
                    <Chip
                      icon={<Wallet />}
                      label={`${PAYMENT_RATES.CURRENCY_SYMBOL}${totalCompensation.toFixed(2)}`}
                      color="success"
                      variant="filled"
                    />
                  </Box>
                </Box>

                <Divider sx={styles.dividerStyle} />

                <Box>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    On-Call Periods ({entries.length})
                  </Typography>
                  <Stack spacing={1}>
                    {entries.map((entry, index) => {
                      const start = DateTime.fromISO(
                        typeof entry.start === 'string' ? entry.start : entry.start.toISOString(),
                        {
                          zone: timeZone,
                        }
                      );
                      const end = DateTime.fromISO(
                        typeof entry.end === 'string' ? entry.end : entry.end.toISOString(),
                        {
                          zone: timeZone,
                        }
                      );

                      return (
                        <Box key={index} sx={styles.periodEntryBox}>
                          <Box sx={styles.periodEntryInner}>
                            <Box sx={styles.periodDateContainer}>
                              <Typography variant="body2" fontWeight="medium">
                                {start.toFormat('EEE, MMM d, yyyy, HH:mm ZZZ')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {end.toFormat('EEE, MMM d, yyyy, HH:mm ZZZ')}
                              </Typography>
                            </Box>

                            <Box sx={styles.periodChipsContainer}>
                              <Chip
                                label={`${entry.duration.toFixed(1)}h`}
                                size="small"
                                variant="outlined"
                              />
                              {entry.weekdayDays > 0 && (
                                <Chip
                                  label={`${entry.weekdayDays} WD`}
                                  size="small"
                                  color="default"
                                  title={`${entry.weekdayDays} weekday${entry.weekdayDays > 1 ? 's' : ''} × ${PAYMENT_RATES.CURRENCY_SYMBOL}${PAYMENT_RATES.WEEKDAY}`}
                                />
                              )}
                              {entry.weekendDays > 0 && (
                                <Chip
                                  label={`${entry.weekendDays} WE`}
                                  size="small"
                                  color="secondary"
                                  title={`${entry.weekendDays} weekend${entry.weekendDays > 1 ? 's' : ''} × ${PAYMENT_RATES.CURRENCY_SYMBOL}${PAYMENT_RATES.WEEKEND}`}
                                />
                              )}
                              <Chip
                                icon={<Wallet sx={styles.walletIconStyle} />}
                                label={`${PAYMENT_RATES.CURRENCY_SYMBOL}${entry.compensation.toFixed(2)}`}
                                size="small"
                                color="success"
                                sx={styles.compensationChipStyle}
                              />
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              </CardContent>
            </Card>
          )
        )}
      </Stack>
    </Box>
  );
});
OnCallSchedule.displayName = 'OnCallSchedule';

const fetcher = async ([url, token, authMethod]: [string, string, string | undefined]) => {
  const response = await fetch(url, {
    headers: getPagerDutyHeaders(token, authMethod as 'oauth' | 'api-token'),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch schedule');
  }

  return response.json();
};

export default function ScheduleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const scheduleId = params?.id as string;

  // View mode state - 'list' or 'calendar'
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Stable back handler
  const handleBack = useCallback(() => {
    router.push('/schedules');
  }, [router]);

  // Date range state - default to current month
  const [dateRange, setDateRange] = useState(() => {
    const now = DateTime.now();
    return {
      since: now.startOf('month').toISO(),
      until: now.endOf('month').toISO(),
    };
  });

  // Construct API URL with date range
  const apiUrl = useMemo(() => {
    const params = new URLSearchParams();
    if (dateRange.since) params.append('since', dateRange.since);
    if (dateRange.until) params.append('until', dateRange.until);
    return `/api/schedules/${scheduleId}?${params.toString()}`;
  }, [scheduleId, dateRange]);

  const { data, error, isLoading } = useSWR<ScheduleResponse>(
    session?.accessToken ? [apiUrl, session.accessToken, session.authMethod] : null,
    fetcher
  );

  // Navigate to previous month - wrapped in useCallback for stable reference
  const handlePreviousMonth = useCallback(() => {
    const since = DateTime.fromISO(dateRange.since);
    const newSince = since.minus({ months: 1 });
    setDateRange({
      since: newSince.startOf('month').toISO() || '',
      until: newSince.endOf('month').toISO() || '',
    });
  }, [dateRange.since]);

  // Navigate to next month - wrapped in useCallback for stable reference
  const handleNextMonth = useCallback(() => {
    const since = DateTime.fromISO(dateRange.since);
    const newSince = since.plus({ months: 1 });
    setDateRange({
      since: newSince.startOf('month').toISO() || '',
      until: newSince.endOf('month').toISO() || '',
    });
  }, [dateRange.since]);

  // Get current month display
  const currentMonthDisplay = useMemo(() => {
    const since = DateTime.fromISO(dateRange.since);
    return since.toFormat('MMMM yyyy');
  }, [dateRange.since]);

  // Group schedule entries by user
  const userSchedules = useMemo(() => {
    if (!data?.schedule?.final_schedule?.rendered_schedule_entries) {
      return [];
    }

    const userMap = new Map<string, { user: User; entries: ScheduleEntry[] }>();

    data.schedule.final_schedule.rendered_schedule_entries.forEach((entry) => {
      const userId = entry.user.id;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          user: entry.user,
          entries: [],
        });
      }
      userMap.get(userId)!.entries.push(entry);
    });

    return Array.from(userMap.values()).map((item) => {
      const sortedEntries = item.entries.sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      );

      // Create OnCallPeriod instances for all entries
      const onCallPeriods = sortedEntries.map(
        (entry) =>
          new OnCallPeriod(new Date(entry.start), new Date(entry.end), data.schedule.time_zone)
      );

      // Calculate details for each entry
      const calculator = new OnCallPaymentsCalculator();
      const entriesWithCompensation = sortedEntries.map((entry, index) => {
        const start = DateTime.fromISO(
          typeof entry.start === 'string' ? entry.start : entry.start.toISOString()
        );
        const end = DateTime.fromISO(
          typeof entry.end === 'string' ? entry.end : entry.end.toISOString()
        );
        const duration = end.diff(start, 'hours').hours;

        const period = onCallPeriods[index];
        const weekdayDays = period.numberOfOohWeekDays;
        const weekendDays = period.numberOfOohWeekends;

        // Calculate compensation using OnCallPaymentsCalculator
        const onCallUser = new OnCallUser(entry.user.id, entry.user.name || entry.user.summary, [
          period,
        ]);
        const compensation = calculator.calculateOnCallPayment(onCallUser);

        return {
          ...entry,
          duration,
          weekdayDays,
          weekendDays,
          compensation,
        };
      });

      const totalHours = entriesWithCompensation.reduce((sum, e) => sum + e.duration, 0);
      const totalWeekdays = entriesWithCompensation.reduce((sum, e) => sum + e.weekdayDays, 0);
      const totalWeekends = entriesWithCompensation.reduce((sum, e) => sum + e.weekendDays, 0);
      const totalCompensation = entriesWithCompensation.reduce((sum, e) => sum + e.compensation, 0);

      return {
        user: item.user,
        entries: entriesWithCompensation,
        totalHours,
        totalWeekdays,
        totalWeekends,
        totalCompensation,
      };
    });
  }, [data]);

  // Transform schedule entries to calendar events
  const calendarEvents = useMemo(() => {
    if (!data?.schedule?.final_schedule?.rendered_schedule_entries || !data.schedule.time_zone) {
      return [];
    }
    return transformToCalendarEvents(
      data.schedule.final_schedule.rendered_schedule_entries,
      data.schedule.time_zone
    );
  }, [data]);

  // Handle view mode change
  const handleViewModeChange = useCallback(
    (_event: React.MouseEvent<HTMLElement>, newMode: 'list' | 'calendar' | null) => {
      if (newMode !== null) {
        setViewMode(newMode);
      }
    },
    []
  );

  // Error state
  if (error) {
    return (
      <Box sx={styles.pageContainer}>
        <Header />
        <Box sx={styles.errorContentContainer}>
          <Alert severity="error" sx={styles.errorAlert}>
            <Typography variant="h6" gutterBottom>
              Failed to Load Schedule
            </Typography>
            <Typography variant="body2">
              {error.message || 'Unable to fetch schedule details from PagerDuty.'}
            </Typography>
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => router.push('/schedules')}
          >
            Back to Schedules
          </Button>
        </Box>
        <Footer />
      </Box>
    );
  }

  const schedule = data?.schedule;

  // Show "not found" only if not loading and no schedule exists
  if (!schedule && !isLoading) {
    return (
      <Box sx={styles.pageContainer}>
        <Header />
        <Box sx={styles.errorContentContainer}>
          <Alert severity="warning">
            <Typography variant="h6">Schedule Not Found</Typography>
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBack />}
            onClick={() => router.push('/schedules')}
            sx={styles.backButtonStyle}
          >
            Back to Schedules
          </Button>
        </Box>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={styles.pageContainer}>
      <Header />
      <Box sx={styles.contentContainer}>
        {/* Header - Memoized to prevent re-renders */}
        <ScheduleHeader
          scheduleName={schedule?.name || ''}
          scheduleDescription={schedule?.description}
          timeZone={schedule?.time_zone || ''}
          onBack={handleBack}
        />

        {/* View Mode Toggle */}
        <Paper sx={styles.viewModeContainer}>
          <Box sx={styles.viewModeInner}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
              size="small"
            >
              <ToggleButton value="list" aria-label="list view">
                <ViewList sx={styles.toggleButtonIcon} />
                List View
              </ToggleButton>
              <ToggleButton value="calendar" aria-label="calendar view">
                <CalendarMonth sx={styles.toggleButtonIcon} />
                Calendar View
              </ToggleButton>
            </ToggleButtonGroup>
            <MonthNavigation
              currentMonth={currentMonthDisplay}
              isLoading={isLoading}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
            />
          </Box>
        </Paper>

        {/* Schedule Display - Toggle between list and calendar views */}
        {viewMode === 'calendar' ? (
          <Paper sx={styles.scheduleDisplayContainer}>
            <CalendarView
              events={calendarEvents}
              timezone={schedule?.time_zone || 'UTC'}
              initialDate={dateRange.since}
            />
          </Paper>
        ) : (
          <Paper sx={styles.scheduleDisplayContainer}>
            <OnCallSchedule
              userSchedules={userSchedules}
              currentMonthDisplay={currentMonthDisplay}
              timeZone={schedule?.time_zone || 'UTC'}
              isLoading={isLoading}
            />
          </Paper>
        )}

        {/* Actions - Memoized to prevent re-renders */}
        <ScheduleActions
          htmlUrl={sanitizeUrl(schedule?.html_url, '#') || '#'}
          hasSchedules={userSchedules.length > 0}
        />
      </Box>
      <Footer />
    </Box>
  );
}
