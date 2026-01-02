import { SxProps, Theme } from '@mui/material';

/**
 * Container styles for the settings page
 */
export const containerStyles: SxProps<Theme> = {
  py: 4,
};

/**
 * Page header section styles
 */
export const headerSectionStyles: SxProps<Theme> = {
  mb: 4,
};

/**
 * Page title styles
 */
export const pageTitleStyles: SxProps<Theme> = {
  mb: 1,
  fontSize: '2rem',
};

/**
 * Alert message styles
 */
export const alertStyles: SxProps<Theme> = {
  mb: 3,
};

/**
 * Loading indicator container styles
 */
export const loadingContainerStyles: SxProps<Theme> = {
  display: 'flex',
  justifyContent: 'center',
  mb: 3,
};

/**
 * Information box styles with theme-aware background
 */
export const infoBoxStyles: SxProps<Theme> = {
  mt: 4,
  p: 2,
  backgroundColor: (theme) =>
    theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
  borderRadius: 1,
  border: (theme) => `1px solid ${theme.palette.divider}`,
};
