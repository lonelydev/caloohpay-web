/**
 * Styles for CalendarView component
 * Extracted for better separation of concerns
 */

import type { SxProps, Theme } from '@mui/material';

// Dialog header styles
export const dialogHeaderBox: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
};

export const dialogEmailText: SxProps<Theme> = {
  mt: 0.5,
};

// Time period styles
export const timePeriodBorder: SxProps<Theme> = {
  pl: 1,
  borderLeft: 3,
  borderColor: 'primary.main',
};

export const endDateText: SxProps<Theme> = {
  mt: 1,
};

// Duration chips container
export const chipsContainer: SxProps<Theme> = {
  display: 'flex',
  gap: 1,
  flexWrap: 'wrap',
  mt: 1,
};

// Compensation breakdown container
export const compensationBox: SxProps<Theme> = {
  p: 2,
  bgcolor: 'success.light',
  borderRadius: 1,
  color: 'success.contrastText',
};

export const compensationTitle: SxProps<Theme> = {
  opacity: 0.8,
};

export const paymentRow: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const compensationDivider: SxProps<Theme> = {
  my: 1,
  bgcolor: 'success.contrastText',
  opacity: 0.3,
};

export const totalRow: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

export const totalLabel: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 0.5,
};

// Calendar container styles factory (needs theme)
export const getCalendarStyles = (theme: Theme): SxProps<Theme> => ({
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
});
