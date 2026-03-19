import { Box, Paper, Typography } from '@mui/material';
import * as styles from '@/app/features/page.styles';

export function ListViewMockup() {
  const entries = [
    { date: 'Mon 6 Jan', from: '17:30', to: '09:00', hours: '15.5h', pay: '£50.00' },
    { date: 'Fri 10 Jan', from: '17:30', to: '09:00', hours: '15.5h', pay: '£75.00' },
    { date: 'Sat 11 Jan', from: '09:00', to: '09:00', hours: '24h', pay: '£75.00' },
    { date: 'Sun 12 Jan', from: '09:00', to: '17:30', hours: '8.5h', pay: '£75.00' },
  ];

  return (
    <Paper elevation={3} sx={styles.listPaperSx}>
      <Box sx={styles.listHeaderRowSx}>
        {['Date', 'OOH Hours', 'Duration', 'Pay'].map((h) => (
          <Typography key={h} variant="caption" fontWeight={700}>
            {h}
          </Typography>
        ))}
      </Box>

      {entries.map((e, i) => (
        <Box key={e.date} sx={styles.getListEntryRowSx(i)}>
          <Typography variant="body2" fontWeight={500}>
            {e.date}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {e.from}–{e.to}
          </Typography>
          <Typography variant="body2">{e.hours}</Typography>
          <Typography variant="body2" fontWeight={700} color="success.main">
            {e.pay}
          </Typography>
        </Box>
      ))}

      <Box sx={styles.listTotalRowSx}>
        <Typography variant="body2" fontWeight={700}>
          Total
        </Typography>
        <Typography variant="body2" fontWeight={700} color="success.main">
          £275.00
        </Typography>
      </Box>
    </Paper>
  );
}
