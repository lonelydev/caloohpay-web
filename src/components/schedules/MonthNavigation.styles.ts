import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

/**
 * Container for month navigation with flex layout for navigation buttons and month display
 */
export const NavigationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: theme.spacing(3),
  padding: theme.spacing(2, 0),
}));

/**
 * Container for month display with icon and text
 */
export const MonthDisplay = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));
