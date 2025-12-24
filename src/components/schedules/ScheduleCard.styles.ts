import { styled } from '@mui/material/styles';
import { Box, Card, CardContent } from '@mui/material';
import { SCHEDULE_LAYOUT, calculateGridHeight } from '@/styles/layout.constants';

/**
 * Grid container for schedule cards with fixed height to prevent layout shifts
 */
export const ScheduleGrid = styled(Box)(({ theme }) => ({
  display: 'grid',
  gap: theme.spacing(SCHEDULE_LAYOUT.GRID.GAP),

  // Fixed row heights to prevent pagination controls from jumping
  gridAutoRows: SCHEDULE_LAYOUT.GRID.ROW_HEIGHT,

  // Responsive grid columns
  [theme.breakpoints.up('xs')]: {
    gridTemplateColumns: 'repeat(1, 1fr)',
  },
  [theme.breakpoints.up('sm')]: {
    gridTemplateColumns: 'repeat(2, 1fr)',
    gridTemplateRows: `repeat(${SCHEDULE_LAYOUT.GRID.ROWS.sm}, ${SCHEDULE_LAYOUT.GRID.ROW_HEIGHT}px)`,
  },
  [theme.breakpoints.up('md')]: {
    gridTemplateColumns: 'repeat(4, 1fr)',
    gridTemplateRows: `repeat(${SCHEDULE_LAYOUT.GRID.ROWS.md}, ${SCHEDULE_LAYOUT.GRID.ROW_HEIGHT}px)`,
  },
}));

/**
 * Individual schedule card with hover effects
 */
export const ScheduleCard = styled(Card)(({ theme }) => ({
  height: '100%',
  width: '100%',
  cursor: 'pointer',
  transition: theme.transitions.create(['transform', 'box-shadow'], {
    duration: theme.transitions.duration.short,
  }),

  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

/**
 * Card content with proper spacing and layout
 */
export const ScheduleCardContent = styled(CardContent)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  padding: theme.spacing(2),

  '&:last-child': {
    paddingBottom: theme.spacing(2),
  },
}));

/**
 * Container for card header (icon + text)
 */
export const CardHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  gap: theme.spacing(1),
  marginBottom: theme.spacing(2),
}));

/**
 * Text content area with proper overflow handling
 */
export const CardTextContent = styled(Box)({
  flex: 1,
  minWidth: 0,
  overflow: 'hidden',
});

/**
 * Schedule name with ellipsis for long text
 */
export const ScheduleName = styled('h3')(({ theme }) => ({
  margin: 0,
  fontSize: theme.typography.h6.fontSize,
  fontWeight: theme.typography.h6.fontWeight,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  wordBreak: 'break-word',
}));

/**
 * Schedule description with ellipsis
 */
export const ScheduleDescription = styled('p')(({ theme }) => ({
  margin: 0,
  marginTop: theme.spacing(0.5),
  fontSize: theme.typography.body2.fontSize,
  color: theme.palette.text.secondary,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
}));

/**
 * Spacer to push timezone chip to bottom
 */
export const CardSpacer = styled(Box)({
  flex: 1,
});

/**
 * Empty state container with consistent height
 */
export const EmptyStateContainer = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  padding: theme.spacing(8, 0),
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',

  // Match grid height to prevent pagination controls from moving
  [theme.breakpoints.up('xs')]: {
    minHeight: 400,
  },
  [theme.breakpoints.up('sm')]: {
    minHeight: calculateGridHeight(
      SCHEDULE_LAYOUT.GRID.ROWS.sm,
      SCHEDULE_LAYOUT.GRID.ROW_HEIGHT,
      SCHEDULE_LAYOUT.GRID.GAP_PX
    ),
  },
  [theme.breakpoints.up('md')]: {
    minHeight: calculateGridHeight(
      SCHEDULE_LAYOUT.GRID.ROWS.md,
      SCHEDULE_LAYOUT.GRID.ROW_HEIGHT,
      SCHEDULE_LAYOUT.GRID.GAP_PX
    ),
  },
}));
