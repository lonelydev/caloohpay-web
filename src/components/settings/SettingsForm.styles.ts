import { SxProps, Theme } from '@mui/material';

export const formStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export const fieldsContainerStyles: SxProps<Theme> = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

export const buttonsContainerStyles: SxProps<Theme> = {
  display: 'flex',
  gap: 2,
  flexWrap: 'wrap',
};

export const submitButtonStyles: SxProps<Theme> = {
  flex: 1,
  minWidth: 120,
};

export const cancelButtonStyles: SxProps<Theme> = {
  flex: 1,
  minWidth: 120,
};

export const resetButtonStyles: SxProps<Theme> = {
  flex: 1,
  minWidth: 120,
};

export const loadingSpinnerStyles: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 1,
  marginTop: 2,
};
