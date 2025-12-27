/**
 * Styles for Schedule Detail Page
 * Extracted from inline sx props for better maintainability
 */

import type { SxProps, Theme } from '@mui/material';
import { SCHEDULE_DETAIL_LAYOUT as LAYOUT } from '@/lib/constants';

// Page layout styles
export const pageContainer: SxProps<Theme> = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
};

export const contentContainer: SxProps<Theme> = {
  width: LAYOUT.MAX_WIDTH_DESKTOP,
  maxWidth: '100%',
  mx: 'auto',
  py: LAYOUT.PADDING_VERTICAL,
  px: 2,
  flex: 1,
};

export const errorContentContainer: SxProps<Theme> = {
  maxWidth: LAYOUT.MAX_WIDTH_ERROR,
  mx: 'auto',
  mt: LAYOUT.MARGIN_VERTICAL_ERROR,
  mb: LAYOUT.MARGIN_VERTICAL_ERROR,
  flex: 1,
};

// Header styles
export const headerContainer: SxProps<Theme> = {
  mb: LAYOUT.MARGIN_BOTTOM_HEADER,
};

export const headerTopRow: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  mb: 2,
};

export const headerTitleContainer: SxProps<Theme> = {
  flex: 1,
};

// View mode toggle styles
export const viewModeContainer: SxProps<Theme> = {
  p: LAYOUT.PADDING_VIEW_MODE,
  mb: LAYOUT.MARGIN_BOTTOM_VIEW_MODE,
};

export const viewModeInner: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: 2,
};

export const toggleButtonIcon: SxProps<Theme> = {
  mr: 1,
};

// Schedule display styles
export const scheduleDisplayContainer: SxProps<Theme> = {
  p: LAYOUT.PADDING_CARD,
  mb: LAYOUT.MARGIN_BOTTOM_SCHEDULE,
};

// Actions styles
export const actionsContainer: SxProps<Theme> = {
  mt: LAYOUT.MARGIN_TOP_ACTIONS,
  display: 'flex',
  gap: 2,
};

// Error page styles
export const errorAlert: SxProps<Theme> = {
  mb: 2,
};

export const backButtonStyle: SxProps<Theme> = {
  mt: 2,
};
