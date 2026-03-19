import { Box, Paper, Typography } from '@mui/material';
import * as styles from '@/app/features/page.styles';

export function CalendarMockup() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeks = [
    [null, null, 1, 2, 3, 4, 5],
    [6, 7, 8, 9, 10, 11, 12],
    [13, 14, 15, 16, 17, 18, 19],
    [20, 21, 22, 23, 24, 25, 26],
    [27, 28, 29, 30, 31, null, null],
  ];
  const highlighted = new Set([8, 9, 10, 14, 15, 16, 17, 22, 23]);

  return (
    <Paper elevation={3} sx={styles.calendarPaperSx}>
      <Box sx={styles.calendarHeaderSx}>
        <Typography variant="subtitle1" fontWeight={700}>
          January 2025
        </Typography>
        <Box sx={styles.calendarNavSx}>
          {['‹', '›'].map((ch) => (
            <Box key={ch} sx={styles.calendarNavButtonSx}>
              {ch}
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={styles.calendarDayLabelsSx}>
        {days.map((d) => (
          <Typography key={d} variant="caption" align="center" sx={styles.calendarDayLabelTextSx}>
            {d}
          </Typography>
        ))}
      </Box>

      {weeks.map((week, wi) => (
        <Box key={wi} sx={styles.calendarWeekRowSx}>
          {week.map((day, di) => (
            <Box key={di} sx={styles.getCalendarDayCellSx(day, highlighted)}>
              {day ?? ''}
            </Box>
          ))}
        </Box>
      ))}

      <Box sx={styles.calendarLegendSx}>
        <Box sx={styles.calendarLegendItemSx}>
          <Box sx={styles.onCallLegendDotSx} />
          <Typography variant="caption" color="text.secondary">
            On-call
          </Typography>
        </Box>
        <Box sx={styles.calendarLegendItemSx}>
          <Box sx={styles.todayLegendDotSx} />
          <Typography variant="caption" color="text.secondary">
            Today
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
