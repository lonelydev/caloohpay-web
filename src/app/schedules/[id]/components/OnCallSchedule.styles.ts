/**
 * Styles for OnCallSchedule component
 * Extracted from page.styles.ts for better separation of concerns
 */

import type { SxProps, Theme } from '@mui/material';

// Main container styles
export const loadingContainer: SxProps<Theme> = {
  position: 'relative',
  minHeight: 300,
};

export const scheduleTitle: SxProps<Theme> = {
  mb: 3,
};

// UserScheduleCard styles
export const userCardHeader: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  mb: 2,
  flexWrap: 'wrap',
  gap: 2,
};

export const userInfoContainer: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
};

export const chipsContainer: SxProps<Theme> = {
  display: 'flex',
  gap: 1,
  flexWrap: 'wrap',
};

export const dividerStyle: SxProps<Theme> = {
  my: 2,
};

// PeriodEntry styles
export const periodEntryBox: SxProps<Theme> = {
  p: 1.5,
  bgcolor: 'action.hover',
  borderRadius: 1,
};

export const periodEntryInner: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  flexWrap: 'wrap',
  gap: 1,
};

export const periodDateContainer: SxProps<Theme> = {
  flex: 1,
  minWidth: '200px',
};

export const periodChipsContainer: SxProps<Theme> = {
  display: 'flex',
  gap: 0.5,
  flexWrap: 'wrap',
  alignItems: 'center',
};

export const walletIconStyle: SxProps<Theme> = {
  fontSize: '16px !important',
};

export const compensationChipStyle: SxProps<Theme> = {
  fontWeight: 'medium',
};
