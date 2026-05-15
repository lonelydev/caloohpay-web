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
    // Colours are set per-event via backgroundColor/borderColor props
    // No default background color - each event gets user-specific pastel color
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      opacity: 0.85,
      transform: 'scale(1.02)',
    },
  },
  '& .fc-daygrid-event': {
    // Outer event container is transparent — the bar lives inside eventContent
    backgroundColor: 'transparent !important',
    border: 'none !important',
    boxShadow: 'none !important',
    padding: '0 !important',
    marginTop: '2px',
  },
  // eventContent renders inside .fc-event-main; make it a positioned container
  '& .fc-event-main': {
    padding: 0,
    overflow: 'visible',
  },
  // cop-segment-outer is the positioned reference for the absolute bar
  '& .cop-segment-outer': {
    position: 'relative',
    width: '100%',
    height: '24px',
    overflow: 'visible',
  },
  // cop-segment-bar is absolutely positioned within cop-segment-outer.
  // left/width % resolve against cop-segment-outer (= 1 day column width). ✓
  '& .cop-segment-bar': {
    position: 'absolute',
    height: '100%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    paddingLeft: '5px',
    paddingRight: '4px',
    transition: 'opacity 0.15s ease, filter 0.15s ease',
    '&:hover': {
      opacity: 0.85,
      filter: 'brightness(1.1)',
    },
  },
  '& .cop-segment-label': {
    fontSize: '12px',
    fontWeight: 600,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: 1,
    userSelect: 'none',
  },
  '& .fc-event-title': {
    fontWeight: 600,
    // Text color is set per-event via textColor prop for optimal readability
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
