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
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Divider,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  CalendarMonth,
  Schedule,
  AccessTime,
  Person,
  EventBusy,
  EventAvailable,
  AttachMoney,
} from '@mui/icons-material';
import { useState, useMemo } from 'react';
import { DateTime } from 'luxon';

// Caloohpay default rates
const WEEKDAY_RATE = 50; // £50 per weekday (Mon-Thu)
const WEEKEND_RATE = 75; // £75 per weekend day (Fri-Sun)

interface User {
  id: string;
  summary: string;
  email?: string;
  name?: string;
}

interface ScheduleEntry {
  start: string;
  end: string;
  user: User;
}

// OnCallPeriod class for calculating out-of-hours days
class OnCallPeriod {
  private static readonly WEEKDAY_START = 1; // Monday
  private static readonly WEEKDAY_END = 4; // Thursday
  private static readonly END_OF_WORK_HOUR = 17;
  private static readonly END_OF_WORK_MINUTE = 30;
  private static readonly MIN_SHIFT_HOURS = 6;

  readonly since: Date;
  readonly until: Date;
  readonly timeZone: string;
  private _numberOfOohWeekDays = 0;
  private _numberOfOohWeekends = 0;

  constructor(s: Date, u: Date, timeZone = 'UTC') {
    this.since = s;
    this.until = u;
    this.timeZone = timeZone;
    this.initializeOohWeekDayAndWeekendDayCount();
  }

  private initializeOohWeekDayAndWeekendDayCount() {
    const oohDays = this.getOohDaysInPeriod();
    this._numberOfOohWeekDays = oohDays.filter((dt) => OnCallPeriod.isWeekDay(dt.weekday)).length;
    this._numberOfOohWeekends = oohDays.filter((dt) => !OnCallPeriod.isWeekDay(dt.weekday)).length;
  }

  private getOohDaysInPeriod() {
    const oohDays = [];
    let current = DateTime.fromJSDate(this.since, { zone: this.timeZone }).startOf('day');
    const end = DateTime.fromJSDate(this.until, { zone: this.timeZone });

    while (current <= end) {
      const dayStart = current;
      const dayEnd = current.endOf('day');
      const shiftStart = DateTime.max(
        dayStart,
        DateTime.fromJSDate(this.since, { zone: this.timeZone })
      );
      const shiftEnd = DateTime.min(dayEnd, end);

      if (OnCallPeriod.wasPersonOnCallOOH(shiftStart, shiftEnd)) {
        oohDays.push(current);
      }
      current = current.plus({ days: 1 });
    }
    return oohDays;
  }

  get numberOfOohWeekDays() {
    return this._numberOfOohWeekDays;
  }
  get numberOfOohWeekends() {
    return this._numberOfOohWeekends;
  }

  private static isWeekDay(dayNum: number) {
    return dayNum >= OnCallPeriod.WEEKDAY_START && dayNum <= OnCallPeriod.WEEKDAY_END;
  }

  private static wasPersonOnCallOOH(since: DateTime, until: DateTime) {
    return (
      OnCallPeriod.doesShiftSpanEveningTillNextDay(since, until) &&
      OnCallPeriod.isShiftLongerThan6Hours(since, until)
    );
  }

  private static doesShiftSpanEveningTillNextDay(since: DateTime, until: DateTime) {
    const endOfWork = since.set({
      hour: OnCallPeriod.END_OF_WORK_HOUR,
      minute: OnCallPeriod.END_OF_WORK_MINUTE,
    });
    return until > endOfWork && OnCallPeriod.doesShiftSpanDays(since, until);
  }

  private static isShiftLongerThan6Hours(since: DateTime, until: DateTime) {
    return until.diff(since, 'hours').hours >= OnCallPeriod.MIN_SHIFT_HOURS;
  }

  private static doesShiftSpanDays(since: DateTime, until: DateTime) {
    return since.day !== until.day || since.month !== until.month || since.year !== until.year;
  }
}

interface Schedule {
  id: string;
  name: string;
  time_zone: string;
  description?: string;
  html_url: string;
  schedule_layers?: unknown[];
  final_schedule?: {
    name: string;
    rendered_schedule_entries: ScheduleEntry[];
  };
}

interface ScheduleResponse {
  schedule: Schedule;
}

const fetcher = async ([url, token]: [string, string]) => {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
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
    session?.accessToken ? [apiUrl, session.accessToken] : null,
    fetcher
  );

  // Navigate to previous month
  const handlePreviousMonth = () => {
    const since = DateTime.fromISO(dateRange.since);
    const newSince = since.minus({ months: 1 });
    setDateRange({
      since: newSince.startOf('month').toISO() || '',
      until: newSince.endOf('month').toISO() || '',
    });
  };

  // Navigate to next month
  const handleNextMonth = () => {
    const since = DateTime.fromISO(dateRange.since);
    const newSince = since.plus({ months: 1 });
    setDateRange({
      since: newSince.startOf('month').toISO() || '',
      until: newSince.endOf('month').toISO() || '',
    });
  };

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
      const entriesWithCompensation = sortedEntries.map((entry, index) => {
        const start = DateTime.fromISO(entry.start);
        const end = DateTime.fromISO(entry.end);
        const duration = end.diff(start, 'hours').hours;

        const period = onCallPeriods[index];
        const weekdayDays = period.numberOfOohWeekDays;
        const weekendDays = period.numberOfOohWeekends;

        // Calculate compensation for this single period
        const compensation = weekdayDays * WEEKDAY_RATE + weekendDays * WEEKEND_RATE;

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

  // Loading state
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading schedule...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
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
    );
  }

  const schedule = data?.schedule;

  if (!schedule) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Alert severity="warning">
          <Typography variant="h6">Schedule Not Found</Typography>
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => router.push('/schedules')}
          sx={{ mt: 2 }}
        >
          Back to Schedules
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={() => router.push('/schedules')} size="large">
            <ArrowBack />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {schedule.name}
            </Typography>
            {schedule.description && (
              <Typography variant="body1" color="text.secondary">
                {schedule.description}
              </Typography>
            )}
          </Box>
          <Chip
            icon={<AccessTime />}
            label={schedule.time_zone}
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>

      {/* Month Navigation */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Button startIcon={<ArrowBack />} onClick={handlePreviousMonth} variant="outlined">
            Previous Month
          </Button>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonth />
            <Typography variant="h5">{currentMonthDisplay}</Typography>
          </Box>
          <Button endIcon={<Schedule />} onClick={handleNextMonth} variant="outlined">
            Next Month
          </Button>
        </Box>
      </Paper>

      {/* On-Call Summary */}
      {userSchedules.length === 0 ? (
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            No On-Call Periods
          </Typography>
          <Typography variant="body2">
            There are no on-call periods scheduled for {currentMonthDisplay}.
          </Typography>
        </Alert>
      ) : (
        <Box>
          <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
            On-Call Schedule ({userSchedules.length}{' '}
            {userSchedules.length === 1 ? 'person' : 'people'})
          </Typography>

          <Stack spacing={3}>
            {userSchedules.map(
              ({ user, entries, totalHours, totalWeekdays, totalWeekends, totalCompensation }) => (
                <Card key={user.id} variant="outlined">
                  <CardContent>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        mb: 2,
                        flexWrap: 'wrap',
                        gap: 2,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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

                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        <Chip
                          label={`${totalHours.toFixed(1)} hours`}
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          icon={<EventBusy />}
                          label={`${totalWeekdays} weekdays`}
                          color="default"
                          variant="outlined"
                        />
                        <Chip
                          icon={<EventAvailable />}
                          label={`${totalWeekends} weekends`}
                          color="secondary"
                          variant="outlined"
                        />
                        <Chip
                          icon={<AttachMoney />}
                          label={`£${totalCompensation.toFixed(2)}`}
                          color="success"
                          variant="filled"
                        />
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        On-Call Periods ({entries.length})
                      </Typography>
                      <Stack spacing={1}>
                        {entries.map((entry, index) => {
                          const start = DateTime.fromISO(entry.start, {
                            zone: schedule.time_zone,
                          });
                          const end = DateTime.fromISO(entry.end, {
                            zone: schedule.time_zone,
                          });

                          return (
                            <Box
                              key={index}
                              sx={{
                                p: 1.5,
                                bgcolor: 'action.hover',
                                borderRadius: 1,
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'flex-start',
                                  flexWrap: 'wrap',
                                  gap: 1,
                                }}
                              >
                                <Box sx={{ flex: 1, minWidth: '200px' }}>
                                  <Typography variant="body2" fontWeight="medium">
                                    {start.toFormat('EEE, MMM d, yyyy, HH:mm ZZZ')}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    {end.toFormat('EEE, MMM d, yyyy, HH:mm ZZZ')}
                                  </Typography>
                                </Box>

                                <Box
                                  sx={{
                                    display: 'flex',
                                    gap: 0.5,
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                  }}
                                >
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
                                      title={`${entry.weekdayDays} weekday${entry.weekdayDays > 1 ? 's' : ''} × £${WEEKDAY_RATE}`}
                                    />
                                  )}
                                  {entry.weekendDays > 0 && (
                                    <Chip
                                      label={`${entry.weekendDays} WE`}
                                      size="small"
                                      color="secondary"
                                      title={`${entry.weekendDays} weekend${entry.weekendDays > 1 ? 's' : ''} × £${WEEKEND_RATE}`}
                                    />
                                  )}
                                  <Chip
                                    icon={<AttachMoney sx={{ fontSize: '16px !important' }} />}
                                    label={`£${entry.compensation.toFixed(2)}`}
                                    size="small"
                                    color="success"
                                    sx={{ fontWeight: 'medium' }}
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
      )}

      {/* Actions */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          size="large"
          disabled={userSchedules.length === 0}
        >
          Calculate Payments
        </Button>
        <Button
          variant="outlined"
          href={schedule.html_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          View in PagerDuty
        </Button>
      </Box>
    </Box>
  );
}
