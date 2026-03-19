import { Box, Paper, Typography } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';
import * as styles from '@/app/features/page.styles';

export function GridReportMockup() {
  const schedules = [
    { name: 'Backend On-Call', oncalls: 8, weekday: '£150', weekend: '£225', total: '£375' },
    { name: 'Platform SRE', oncalls: 5, weekday: '£100', weekend: '£150', total: '£250' },
    { name: 'Frontend Ops', oncalls: 6, weekday: '£100', weekend: '£225', total: '£325' },
    { name: 'Security Team', oncalls: 4, weekday: '£50', weekend: '£150', total: '£200' },
  ];

  return (
    <Paper elevation={3} sx={styles.gridPaperSx}>
      <Box sx={styles.gridToolbarSx}>
        <Typography variant="subtitle2" fontWeight={700}>
          January 2025 — Payment Grid
        </Typography>
        <Box sx={styles.gridToolbarExportSx}>
          <DownloadIcon sx={styles.gridToolbarIconSx} />
          <Typography variant="caption">Export CSV</Typography>
        </Box>
      </Box>

      <Box sx={styles.gridHeaderRowSx}>
        {['Schedule', 'On-Calls', 'Weekday', 'Weekend', 'Total'].map((h) => (
          <Typography key={h} variant="caption" fontWeight={600} color="text.secondary">
            {h}
          </Typography>
        ))}
      </Box>

      {schedules.map((s, i) => (
        <Box key={s.name} sx={styles.getGridEntryRowSx(i)}>
          <Typography variant="body2" fontWeight={500} noWrap>
            {s.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {s.oncalls}
          </Typography>
          <Typography variant="body2">{s.weekday}</Typography>
          <Typography variant="body2">{s.weekend}</Typography>
          <Typography variant="body2" fontWeight={700} color="success.main">
            {s.total}
          </Typography>
        </Box>
      ))}
    </Paper>
  );
}
