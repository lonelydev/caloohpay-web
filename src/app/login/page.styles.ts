/**
 * Styles for Login page
 */

import type { SxProps, Theme } from '@mui/material';

export const pageContainer: SxProps<Theme> = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: (theme) =>
    theme.palette.mode === 'light'
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
};

export const cardContent: SxProps<Theme> = {
  p: 4,
};

export const authButton: SxProps<Theme> = {
  py: 1.5,
};

export const footer: SxProps<Theme> = {
  display: 'block',
  textAlign: 'center',
  mt: 3,
  opacity: 0.8,
};

export const footerLink = {
  color: 'white',
  textDecoration: 'underline',
};

export const tabsContainer: SxProps<Theme> = {
  width: '100%',
  borderBottom: 1,
  borderColor: 'divider',
};

export const tab: SxProps<Theme> = {
  flex: 1,
};

export const formContainer: SxProps<Theme> = {
  width: '100%',
};

export const permissionsSection: SxProps<Theme> = {
  pt: 1,
};

export const alertContainer: SxProps<Theme> = {
  width: '100%',
};
