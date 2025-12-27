/**
 * CalendarView Component
 * Displays on-call schedules in a monthly calendar format with FullCalendar
 * Includes interactive event cards showing compensation details
 */

'use client';

import { useCallback, useState, useMemo, memo } from 'react';
import { useTheme } from '@mui/material/styles';
import * as styles from './CalendarView.styles';
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
        <Box sx={styles.dialogHeaderBox}>
          <Person color="primary" />
          <Typography variant="h6" component="span">
            {user.name || user.summary}
          </Typography>
        </Box>
        {user.email && (
          <Typography variant="body2" color="text.secondary" sx={styles.dialogEmailText}>
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
            <Box sx={styles.timePeriodBorder}>
              <Typography variant="body1" fontWeight="medium">
                {startDateTime.toFormat('EEE yyyy/MM/dd, HH:mm ZZZ')} →{' '}
                {endDateTime.toFormat('EEE yyyy/MM/dd, HH:mm ZZZ')}
              </Typography>
            </Box>
          </Box>

          <Divider />

          {/* Duration and Days */}
          <Box>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Duration & Coverage
            </Typography>
            <Box sx={styles.chipsContainer}>
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
          <Box sx={styles.compensationBox}>
            <Typography
              variant="caption"
              sx={styles.compensationTitle}
              display="block"
              gutterBottom
              fontWeight="bold"
            >
              PAYMENT CALCULATION
            </Typography>

            <Stack spacing={1}>
              {weekdayDays > 0 && (
                <Box sx={styles.paymentRow}>
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
                <Box sx={styles.paymentRow}>
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

              <Divider sx={styles.compensationDivider} />

              <Box sx={styles.totalRow}>
                <Typography variant="h6" sx={styles.totalLabel}>
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
  const calendarStyles = useMemo(() => styles.getCalendarStyles(theme), [theme]);

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
              ? (() => {
                  const start = DateTime.fromISO(initialDate, { zone: timezone })
                    .startOf('month')
                    .toISO();
                  const end = DateTime.fromISO(initialDate, { zone: timezone })
                    .endOf('month')
                    .toISO();
                  return start && end ? { start, end } : undefined;
                })()
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
