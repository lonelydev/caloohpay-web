'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  TextField,
  InputAdornment,
  Typography,
  Chip,
  Stack,
  Pagination,
  CircularProgress,
  Backdrop,
} from '@mui/material';
import { Search as SearchIcon, CalendarMonth as CalendarIcon } from '@mui/icons-material';
import { Header, Footer, Loading, ErrorDisplay } from '@/components/common';
import PaginationControls from '@/components/schedules/PaginationControls';
import ScheduleCard from '@/components/schedules/ScheduleCard';
import { ScheduleGrid, EmptyStateContainer } from '@/components/schedules/ScheduleCard.styles';
import { SCHEDULE_LAYOUT } from '@/styles/layout.constants';
import { useSession } from 'next-auth/react';
import useSWR from 'swr';
import { PagerDutySchedule } from '@/lib/types';

const ITEMS_PER_PAGE = SCHEDULE_LAYOUT.ITEMS_PER_PAGE;

interface SchedulesResponse {
  schedules: PagerDutySchedule[];
  total: number;
  limit: number;
  offset: number;
  more: boolean;
}

async function fetchSchedules(
  url: string,
  token: string,
  query: string,
  offset: number
): Promise<SchedulesResponse> {
  const params = new URLSearchParams({
    limit: ITEMS_PER_PAGE.toString(),
    offset: offset.toString(),
    ...(query && { query }),
  });

  const response = await fetch(`${url}?${params}`, {
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
  const [page, setPage] = useState(1);
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [allSchedules, setAllSchedules] = useState<PagerDutySchedule[]>([]);
  const [showingLocalResults, setShowingLocalResults] = useState(false);
  const [apiSearchComplete, setApiSearchComplete] = useState(false);

  // Calculate offset for API pagination
  const offset = (page - 1) * ITEMS_PER_PAGE;

  const { data, error, isLoading } = useSWR(
    session?.accessToken ? ['/api/schedules', session.accessToken, apiSearchQuery, offset] : null,
    ([url, token, query, offset]) =>
      fetchSchedules(url, token as string, query as string, offset as number),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // 1 minute
    }
  );

  // Store all schedules for client-side filtering and mark API search complete
  useEffect(() => {
    if (data?.schedules) {
      if (!apiSearchQuery) {
        // Regular pagination - add to cache
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setAllSchedules((prev) => {
          const existingIds = new Set(prev.map((s) => s.id));
          const newSchedules = data.schedules.filter((s) => !existingIds.has(s.id));
          return [...prev, ...newSchedules];
        });
      } else {
        // API search complete - mark it
        if (!apiSearchComplete) setApiSearchComplete(true);
      }
    }
  }, [data, apiSearchQuery, apiSearchComplete]);

  // Client-side filtering from cached schedules - always available for instant results
  const clientFilteredSchedules = useMemo(() => {
    if (!searchQuery) return [];

    return allSchedules.filter((schedule) =>
      schedule.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allSchedules, searchQuery]);

  // Enhanced search strategy: show local results immediately, search API in parallel
  useEffect(() => {
    if (!searchQuery) {
      // No search query - clear search state only if needed
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (apiSearchQuery !== '') setApiSearchQuery('');
      if (showingLocalResults !== false) setShowingLocalResults(false);
      if (apiSearchComplete !== true) setApiSearchComplete(true);
      return;
    }

    // Check for local results
    const clientResults = allSchedules.filter((schedule) =>
      schedule.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const hasLocalResults = clientResults.length > 0;

    // Always trigger API search for comprehensive results
    // This ensures we don't miss schedules not yet in local cache
    if (apiSearchQuery !== searchQuery) {
      setApiSearchQuery(searchQuery);
      setApiSearchComplete(false);
    }

    // Show local results immediately if available
    const shouldShowLocal = hasLocalResults;
    if (showingLocalResults !== shouldShowLocal) {
      setShowingLocalResults(shouldShowLocal);
    }

    // Reset to page 1 when search query changes
    if (page !== 1) setPage(1);
  }, [searchQuery, allSchedules, apiSearchQuery, showingLocalResults, apiSearchComplete, page]);

  // Merge and deduplicate local and API search results
  const mergedSearchResults = useMemo(() => {
    if (!searchQuery) return [];

    // Start with local results
    const resultsMap = new Map(clientFilteredSchedules.map((s) => [s.id, s]));

    // Add API results if search is complete
    if (apiSearchComplete && data?.schedules && apiSearchQuery === searchQuery) {
      data.schedules.forEach((schedule) => {
        resultsMap.set(schedule.id, schedule);
      });
    }

    return Array.from(resultsMap.values());
  }, [searchQuery, clientFilteredSchedules, apiSearchComplete, data, apiSearchQuery]);

  // Paginate merged search results
  const paginatedSearchResults = useMemo(() => {
    if (!searchQuery) return [];

    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return mergedSearchResults.slice(start, end);
  }, [mergedSearchResults, page, searchQuery]);

  // Final schedules to display
  // When searching: use merged local + API results
  // When not searching: use API pagination results
  const displaySchedules = searchQuery ? paginatedSearchResults : data?.schedules || [];

  // Total count and pages
  // When searching, use merged results count; otherwise use API total
  const totalCount = searchQuery ? mergedSearchResults.length : data?.total || 0;

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  // Show pagination controls if we have multiple pages or during loading
  // Use totalPages as primary condition to keep controls visible during navigation
  const showPagination = true;

  // Pagination handlers - wrapped in useCallback for stable references
  const handlePageChange = useCallback((_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleFirstPage = useCallback(() => {
    setPage(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleLastPage = useCallback(() => {
    setPage(totalPages);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [totalPages]);

  const handlePrevPage = useCallback(() => {
    if (page > 1) {
      setPage(page - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page]);

  const handleNextPage = useCallback(() => {
    if (page < totalPages) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page, totalPages]);

  // Only show full-screen loading on initial page load (auth check)
  // For data fetching, we'll show a loading overlay instead to prevent page re-render
  if (status === 'loading') {
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

          {/* Schedule Count & Pagination Info - Always rendered to maintain layout stability */}
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            {displaySchedules && totalCount > 0 && (
              <>
                <Chip
                  label={`${totalCount} schedule${totalCount !== 1 ? 's' : ''} found`}
                  color="primary"
                  variant="outlined"
                />
                {totalPages > 1 && (
                  <Typography variant="body2" color="text.secondary">
                    Page {page} of {totalPages} • Showing {displaySchedules.length} of {totalCount}
                  </Typography>
                )}
                {searchQuery && showingLocalResults && !apiSearchComplete && (
                  <Chip
                    label="Searching API..."
                    size="small"
                    color="info"
                    variant="outlined"
                    icon={<CircularProgress size={12} />}
                  />
                )}
                {searchQuery && showingLocalResults && apiSearchComplete && (
                  <Chip
                    label={`${clientFilteredSchedules.length} local, ${mergedSearchResults.length - clientFilteredSchedules.length} from API`}
                    size="small"
                    color="success"
                    variant="outlined"
                  />
                )}
                {searchQuery && !showingLocalResults && !apiSearchComplete && (
                  <Chip label="Searching..." size="small" color="info" variant="outlined" />
                )}
              </>
            )}
          </Stack>

          {/* Schedules Grid with Loading Overlay */}
          <Box
            sx={(theme) => ({
              position: 'relative',
              // Fixed height to prevent pagination controls from shifting
              // Responsive height based on breakpoint grid layout
              height: {
                xs: `calc(16 * 250px + 15 * 24px)`, // 16 rows (single column)
                sm: `calc(8 * 250px + 7 * 24px)`, // 8 rows (2 columns)
                md: `calc(4 * 250px + 3 * 24px)`, // 4 rows (4 columns)
              },
            })}
          >
            {/* Loading Overlay - Always render, visibility controlled by 'open' */}
            <Backdrop
              open={isLoading}
              sx={{
                position: 'absolute',
                zIndex: (theme) => theme.zIndex.drawer + 1,
                backgroundColor: 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(3px)',
              }}
            >
              <CircularProgress size={60} thickness={4} />
            </Backdrop>

            {/* Content below loading overlay */}
            {displaySchedules && displaySchedules.length > 0 ? (
              <ScheduleGrid>
                {displaySchedules.map((schedule) => (
                  <ScheduleCard
                    key={schedule.id}
                    schedule={schedule}
                    onClick={() => router.push(`/schedules/${schedule.id}`)}
                  />
                ))}
              </ScheduleGrid>
            ) : isLoading ? (
              // During loading, render empty grid to maintain layout stability
              <ScheduleGrid />
            ) : (
              <EmptyStateContainer>
                <CalendarIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {searchQuery ? 'No schedules found' : 'No schedules available'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchQuery
                    ? 'Try adjusting your search query'
                    : 'Create schedules in PagerDuty to get started'}
                </Typography>
              </EmptyStateContainer>
            )}
          </Box>

          {/* Pagination Controls - Outside conditional to persist during loading */}
          {showPagination && (
            <nav aria-label="pagination navigation">
              <Stack spacing={3} alignItems="center">
                {/* Navigation Buttons */}
                <PaginationControls
                  page={page}
                  totalPages={totalPages}
                  isLoading={isLoading}
                  onFirstPage={handleFirstPage}
                  onPrevPage={handlePrevPage}
                  onNextPage={handleNextPage}
                  onLastPage={handleLastPage}
                />

                {/* Page Number Pagination */}
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  showFirstButton
                  showLastButton
                  siblingCount={1}
                  boundaryCount={1}
                />
              </Stack>
            </nav>
          )}
        </Stack>
      </Container>

      <Footer />
    </Box>
  );
}
