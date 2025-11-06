'use client';

import { Alert, AlertTitle, Box, Button, Stack } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon } from '@mui/icons-material';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  fullScreen?: boolean;
}

export function ErrorDisplay({
  title = 'Error',
  message,
  onRetry,
  fullScreen = false,
}: ErrorDisplayProps) {
  const content = (
    <Stack spacing={2} alignItems="center" justifyContent="center">
      <Alert severity="error" icon={<ErrorIcon />} sx={{ maxWidth: '600px', width: '100%' }}>
        <AlertTitle>{title}</AlertTitle>
        {message}
      </Alert>
      {onRetry && (
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRetry}>
          Try Again
        </Button>
      )}
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
          p: 2,
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
