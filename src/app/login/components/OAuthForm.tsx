/**
 * OAuth Login Form Component
 */

import { Button, Stack, Typography } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { PERMISSIONS } from '../constants';
import * as styles from '../page.styles';
import type { OAuthFormProps } from '../types';

export function OAuthForm({ isLoading, onSignIn }: OAuthFormProps) {
  return (
    <Stack spacing={2} sx={styles.formContainer}>
      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={<LoginIcon />}
        onClick={onSignIn}
        disabled={isLoading}
        sx={styles.authButton}
      >
        {isLoading ? 'Connecting to PagerDuty...' : 'Sign in with PagerDuty'}
      </Button>

      <Typography variant="caption" color="text.secondary" textAlign="center">
        By signing in, you authorize CalOohPay to access your PagerDuty schedules for payment
        calculation purposes.
      </Typography>

      <Stack spacing={1} sx={styles.permissionsSection}>
        <Typography variant="body2" fontWeight={600}>
          Required Permissions:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {PERMISSIONS.map((permission, index) => (
            <span key={index}>
              • {permission}
              {index < PERMISSIONS.length - 1 && <br />}
            </span>
          ))}
        </Typography>
      </Stack>
    </Stack>
  );
}
