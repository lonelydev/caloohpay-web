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
import { ArrowBack, CalendarMonth, Schedule, AccessTime, Person } from '@mui/icons-material';
import { useState, useMemo } from 'react';
import { DateTime } from 'luxon';

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

    return Array.from(userMap.values()).map((item) => ({
      user: item.user,
      entries: item.entries.sort(
        (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime()
      ),
      totalHours: item.entries.reduce((sum, entry) => {
        const start = DateTime.fromISO(entry.start);
        const end = DateTime.fromISO(entry.end);
        return sum + end.diff(start, 'hours').hours;
      }, 0),
    }));
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
            {userSchedules.map(({ user, entries, totalHours }) => (
              <Card key={user.id} variant="outlined">
                <CardContent>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
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
                    <Chip label={`${totalHours.toFixed(1)} hours`} color="primary" />
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
                        const duration = end.diff(start, 'hours').hours;

                        return (
                          <Box
                            key={index}
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              p: 1.5,
                              bgcolor: 'action.hover',
                              borderRadius: 1,
                            }}
                          >
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {start.toFormat('EEE, MMM d, yyyy')}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {start.toFormat('h:mm a')} - {end.toFormat('h:mm a')}
                              </Typography>
                            </Box>
                            <Chip
                              label={`${duration.toFixed(1)}h`}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        );
                      })}
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            ))}
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
