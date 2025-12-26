/**
 * CalendarView Component
 * Displays on-call schedules in a monthly calendar format with FullCalendar
 * Includes interactive event cards showing compensation details
 */

'use client';

import { useCallback, useState, useMemo, memo } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Chip,
  Stack,
  Divider,
  useMediaQuery,
} from '@mui/material';
import { Wallet, AccessTime, Work, WorkOff, Person } from '@mui/icons-material';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import luxon3Plugin from '@fullcalendar/luxon3';
import type { EventClickArg } from '@fullcalendar/core';
import { DateTime } from 'luxon';
import { PAYMENT_RATES } from '@/lib/constants';
import type { CalendarEvent } from '@/lib/utils/calendarUtils';

interface CalendarViewProps {
  events: CalendarEvent[];
  timezone: string;
  initialDate?: string; // ISO string for the current month to display
}

/**
 * Memoized event detail dialog - only re-renders when selected event changes
 */
const EventDetailDialog = memo<{
  event: CalendarEvent | null;
  timezone: string;
  open: boolean;
  onClose: () => void;
}>(({ event, timezone, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));

  if (!event) return null;

  const startDateTime = DateTime.fromISO(event.start, { zone: timezone });
  const endDateTime = DateTime.fromISO(event.end, { zone: timezone });

  if (!startDateTime.isValid || !endDateTime.isValid) {
    console.error('Invalid date format in calendar event:', {
      event,
      start: event.start,
      end: event.end,
    });
    return null;
  }
  const { user, duration, weekdayDays, weekendDays, compensation } = event.extendedProps;

  const weekdayPayment = weekdayDays * PAYMENT_RATES.WEEKDAY;
  const weekendPayment = weekendDays * PAYMENT_RATES.WEEKEND;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={fullScreen}
      aria-labelledby="event-detail-dialog-title"
    >
      <DialogTitle id="event-detail-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person color="primary" />
          <Typography variant="h6" component="span">
            {user.name || user.summary}
          </Typography>
        </Box>
        {user.email && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {user.email}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3}>
          {/* Time Period */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              On-Call Period
            </Typography>
            <Box sx={{ pl: 1, borderLeft: 3, borderColor: 'primary.main' }}>
              <Typography variant="body1" fontWeight="medium">
                {startDateTime.toFormat('EEE, MMM d, yyyy')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {startDateTime.toFormat('HH:mm ZZZ')} → {endDateTime.toFormat('HH:mm ZZZ')}
              </Typography>
              <Typography variant="body1" fontWeight="medium" sx={{ mt: 1 }}>
                {endDateTime.toFormat('EEE, MMM d, yyyy')}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Duration and Days */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Duration & Coverage
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              <Chip
                icon={<AccessTime />}
                label={`${duration.toFixed(1)} hours total`}
                color="primary"
                variant="outlined"
              />
              {weekdayDays > 0 && (
                <Chip
                  icon={<Work />}
                  label={`${weekdayDays} weekday${weekdayDays > 1 ? 's' : ''}`}
                  color="default"
                  variant="outlined"
                />
              )}
              {weekendDays > 0 && (
                <Chip
                  icon={<WorkOff />}
                  label={`${weekendDays} weekend${weekendDays > 1 ? 's' : ''}`}
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>

          <Divider />

          {/* Compensation Breakdown */}
          <Box
            sx={{
              p: 2,
              bgcolor: 'success.light',
              borderRadius: 1,
              color: 'success.contrastText',
            }}
          >
            <Typography
              variant="caption"
              sx={{ opacity: 0.8 }}
              display="block"
              gutterBottom
              fontWeight="bold"
            >
              PAYMENT CALCULATION
            </Typography>

            <Stack spacing={1}>
              {weekdayDays > 0 && (
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="body2">
                    {weekdayDays} weekday{weekdayDays > 1 ? 's' : ''} ×{' '}
                    {PAYMENT_RATES.CURRENCY_SYMBOL}
                    {PAYMENT_RATES.WEEKDAY}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {PAYMENT_RATES.CURRENCY_SYMBOL}
                    {weekdayPayment.toFixed(2)}
                  </Typography>
                </Box>
              )}
              {weekendDays > 0 && (
                <Box
                  sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Typography variant="body2">
                    {weekendDays} weekend{weekendDays > 1 ? 's' : ''} ×{' '}
                    {PAYMENT_RATES.CURRENCY_SYMBOL}
                    {PAYMENT_RATES.WEEKEND}
                  </Typography>
                  <Typography variant="body2" fontWeight="medium">
                    {PAYMENT_RATES.CURRENCY_SYMBOL}
                    {weekendPayment.toFixed(2)}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 1, bgcolor: 'success.contrastText', opacity: 0.3 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Wallet /> Total Compensation
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {PAYMENT_RATES.CURRENCY_SYMBOL}
                  {compensation.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
});
EventDetailDialog.displayName = 'EventDetailDialog';

/**
 * Main calendar view component
 * Renders on-call schedules in a monthly calendar with FullCalendar
 * Navigation is handled externally via the parent component
 */
export default function CalendarView({ events, timezone, initialDate }: CalendarViewProps) {
  const theme = useTheme();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Handle event click - open detail dialog
  const handleEventClick = useCallback(
    (clickInfo: EventClickArg) => {
      // Prevent default behavior
      clickInfo.jsEvent.preventDefault();

      // Find the full event data from our events array
      const eventId = clickInfo.event.id;
      const fullEvent = events.find((e) => e.id === eventId);

      if (fullEvent) {
        setSelectedEvent(fullEvent);
      }
    },
    [events]
  );

  // Handle dialog close
  const handleCloseDialog = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  // Memoize calendar styling to prevent unnecessary re-renders
  const calendarStyles = useMemo(
    () => ({
      '& .fc': {
        '--fc-border-color': theme.palette.divider,
        '--fc-button-bg-color': theme.palette.primary.main,
        '--fc-button-border-color': theme.palette.primary.main,
        '--fc-button-hover-bg-color': theme.palette.primary.dark,
        '--fc-button-active-bg-color': theme.palette.primary.dark,
        '--fc-today-bg-color': theme.palette.action.hover,
        '--fc-neutral-bg-color': theme.palette.background.paper,
        '--fc-page-bg-color': theme.palette.background.default,
      },
      '& .fc-theme-standard td, & .fc-theme-standard th': {
        borderColor: theme.palette.divider,
      },
      '& .fc-event': {
        backgroundColor: theme.palette.primary.main,
        borderColor: theme.palette.primary.dark,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: theme.palette.primary.dark,
          transform: 'scale(1.02)',
        },
      },
      '& .fc-daygrid-event': {
        padding: '2px 4px',
        fontSize: '0.85rem',
      },
      '& .fc-button': {
        textTransform: 'none',
        fontWeight: 500,
      },
      '& .fc-toolbar-title': {
        fontSize: '1.5rem',
        fontWeight: 600,
        color: theme.palette.text.primary,
        padding: '0 20px',
      },
      '& .fc-toolbar-chunk': {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
      },
    }),
    [theme]
  );

  return (
    <>
      <Box sx={calendarStyles}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin, luxon3Plugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: '',
            center: 'title',
            right: '',
          }}
          timeZone={timezone}
          initialDate={initialDate}
          events={events}
          eventClick={handleEventClick}
          height="auto"
          validRange={
            initialDate
              ? {
                  start:
                    DateTime.fromISO(initialDate, { zone: timezone }).startOf('month').toISO() ||
                    undefined,
                  end:
                    DateTime.fromISO(initialDate, { zone: timezone }).endOf('month').toISO() ||
                    undefined,
                }
              : undefined
          }
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
          }}
          displayEventTime={true}
          eventDisplay="block"
          dayMaxEvents={3}
          moreLinkText="more"
          moreLinkClick="popover"
          fixedWeekCount={false}
          showNonCurrentDates={false}
        />
      </Box>

      <EventDetailDialog
        event={selectedEvent}
        timezone={timezone}
        open={!!selectedEvent}
        onClose={handleCloseDialog}
      />
    </>
  );
}
