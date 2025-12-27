/**
 * Login page header with branding and description
 */

import { Typography } from '@mui/material';

export function LoginHeader() {
  return (
    <>
      <Typography variant="h4" component="h1" fontWeight={700} textAlign="center" color="primary">
        CalOohPay Web
      </Typography>

      <Typography variant="body1" textAlign="center" color="text.secondary">
        Sign in with your PagerDuty account to calculate on-call compensation
      </Typography>
    </>
  );
}
