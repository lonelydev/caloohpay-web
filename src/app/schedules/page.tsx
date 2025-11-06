'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  TextField,
  InputAdornment,
  Typography,
  Chip,
  Stack,
  Card as MUICard,
  CardContent,
} from '@mui/material';
import { Search as SearchIcon, CalendarMonth as CalendarIcon } from '@mui/icons-material';
import { Header, Footer, Loading, ErrorDisplay } from '@/components/common';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { PagerDutySchedule } from '@/lib/types';

interface SchedulesResponse {
  schedules: PagerDutySchedule[];
}

async function fetchSchedules(url: string, token: string): Promise<SchedulesResponse> {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch schedules');
  }

  return response.json();
}

export default function SchedulesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const { data, error, isLoading } = useSWR(
    session?.accessToken ? ['/api/schedules', session.accessToken] : null,
    ([url, token]) => fetchSchedules(url, token as string),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  // Filter schedules based on search query
  const filteredSchedules = data?.schedules?.filter((schedule) =>
    schedule.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'loading' || isLoading) {
    return <Loading message="Loading schedules..." fullScreen />;
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Header />
        <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
          <ErrorDisplay
            title="Failed to Load Schedules"
            message={error.message || 'Unable to fetch schedules from PagerDuty'}
            onRetry={() => window.location.reload()}
          />
        </Container>
        <Footer />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <Container maxWidth="lg" sx={{ flex: 1, py: 4 }}>
        <Stack spacing={4}>
          {/* Page Header */}
          <Box>
            <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
              On-Call Schedules
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Select a schedule to calculate on-call compensation for your team
            </Typography>
          </Box>

          {/* Search Bar */}
          <TextField
            fullWidth
            placeholder="Search schedules by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 600 }}
          />

          {/* Schedule Count */}
          {filteredSchedules && (
            <Box>
              <Chip
                label={`${filteredSchedules.length} schedule${filteredSchedules.length !== 1 ? 's' : ''} found`}
                color="primary"
                variant="outlined"
              />
            </Box>
          )}

          {/* Schedules Grid */}
          {filteredSchedules && filteredSchedules.length > 0 ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, 1fr)',
                  md: 'repeat(3, 1fr)',
                },
                gap: 3,
              }}
            >
              {filteredSchedules.map((schedule) => (
                <MUICard
                  key={schedule.id}
                  elevation={2}
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': {
                      elevation: 4,
                      transform: 'translateY(-4px)',
                      boxShadow: 8,
                    },
                  }}
                  onClick={() => router.push(`/schedules/${schedule.id}`)}
                  role="article"
                >
                  <CardContent>
                    <Stack spacing={2}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <CalendarIcon color="primary" />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" component="h3" fontWeight={600} noWrap>
                            {schedule.name}
                          </Typography>
                          {schedule.description && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {schedule.description}
                            </Typography>
                          )}
                        </Box>
                      </Box>

                      {schedule.time_zone && (
                        <Chip
                          label={schedule.time_zone}
                          size="small"
                          variant="outlined"
                          sx={{ alignSelf: 'flex-start' }}
                        />
                      )}
                    </Stack>
                  </CardContent>
                </MUICard>
              ))}
            </Box>
          ) : (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
              }}
            >
              <CalendarIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchQuery ? 'No schedules found' : 'No schedules available'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {searchQuery
                  ? 'Try adjusting your search query'
                  : 'Create schedules in PagerDuty to get started'}
              </Typography>
            </Box>
          )}
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}
