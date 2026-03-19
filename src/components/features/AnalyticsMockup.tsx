import { Box, Paper, Typography } from '@mui/material';
import * as styles from '@/app/features/page.styles';

export function AnalyticsMockup() {
  const bars = [
    { month: 'Sep', value: 60, color: 'primary.main' },
    { month: 'Oct', value: 45, color: 'primary.main' },
    { month: 'Nov', value: 80, color: 'primary.main' },
    { month: 'Dec', value: 95, color: 'secondary.main' },
    { month: 'Jan', value: 70, color: 'primary.main' },
  ];

  const donutSegments = [
    { label: 'Weekday', pct: 42, color: 'primary.main' },
    { label: 'Weekend', pct: 58, color: 'secondary.main' },
  ];

  return (
    <Paper elevation={3} sx={styles.analyticsPaperSx}>
      <Typography variant="subtitle2" fontWeight={700} mb={2}>
        Payment Analytics
      </Typography>

      <Box sx={styles.analyticsBarChartWrapSx}>
        <Typography variant="caption" color="text.secondary" mb={1} display="block">
          Monthly OOH Pay (£)
        </Typography>
        <Box sx={styles.analyticsBarsRowSx}>
          {bars.map((b) => (
            <Box key={b.month} sx={styles.analyticsBarItemSx}>
              <Box sx={styles.getAnalyticsBarSx(b.color, b.value)} />
              <Typography variant="caption" color="text.secondary" mt={0.5}>
                {b.month}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={styles.analyticsBreakdownSx}>
        <Typography variant="caption" color="text.secondary" mb={1} display="block">
          Weekday vs Weekend Split
        </Typography>
        <Box sx={styles.analyticsLegendRowSx}>
          {donutSegments.map((s) => (
            <Box key={s.label} sx={styles.analyticsLegendItemSx}>
              <Box sx={styles.getAnalyticsLegendDotSx(s.color)} />
              <Typography variant="caption" fontWeight={600}>
                {s.pct}% {s.label}
              </Typography>
            </Box>
          ))}
        </Box>
        <Box sx={styles.analyticsSplitBarSx}>
          {donutSegments.map((s) => (
            <Box key={s.label} sx={styles.getAnalyticsSplitSegmentSx(s.pct, s.color)} />
          ))}
        </Box>
      </Box>
    </Paper>
  );
}
