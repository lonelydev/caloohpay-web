'use client';

import { Box, CircularProgress, Typography, Stack } from '@mui/material';

interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({ message = 'Loading...', fullScreen = false }: LoadingProps) {
  const content = (
    <Stack spacing={2} alignItems="center" justifyContent="center">
      <CircularProgress size={fullScreen ? 60 : 40} />
      <Typography variant={fullScreen ? 'h6' : 'body1'} color="text.secondary">
        {message}
      </Typography>
    </Stack>
  );

  if (fullScreen) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
      }}
    >
      {content}
    </Box>
  );
}
