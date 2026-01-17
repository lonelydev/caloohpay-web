import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

/**
 * Container for the AG Grid compensation table
 */
export const GridContainer = styled(Box)({
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
});

/**
 * Global styles for AG Grid cells - applied as a styled component
 * instead of dangerouslySetInnerHTML
 */
export const GridStyleWrapper = styled(Box)({
  height: '100%',
  width: '100%',
  
  // Force vertical borders for grid-line effect
  '& .ag-theme-quartz .ag-cell': {
    borderRight: `1px solid var(--ag-border-color)`,
  },
  '& .ag-header-cell': {
    borderRight: `1px solid var(--ag-border-color)`,
  },
});
