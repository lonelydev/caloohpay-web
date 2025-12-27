/**
 * API Token Login Form Component
 */

import { Button, Stack, TextField, Typography, Alert } from '@mui/material';
import { VpnKey as ApiKeyIcon } from '@mui/icons-material';
import { TOKEN_INSTRUCTIONS } from '../constants';
import * as styles from '../page.styles';
import type { TokenFormProps } from '../types';

export function TokenForm({
  isLoading,
  apiToken,
  tokenError,
  onTokenChange,
  onSignIn,
}: TokenFormProps) {
  return (
    <Stack spacing={2} sx={styles.formContainer}>
      <TextField
        fullWidth
        type="password"
        label="PagerDuty User API Token"
        placeholder="Enter your API token"
        value={apiToken}
        onChange={(e) => onTokenChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSignIn();
          }
        }}
        disabled={isLoading}
        error={!!tokenError}
        helperText="Find your API token in PagerDuty > User Icon > My Profile > User Settings > API Access"
      />

      <Button
        variant="contained"
        size="large"
        fullWidth
        startIcon={<ApiKeyIcon />}
        onClick={onSignIn}
        disabled={isLoading || !apiToken.trim()}
        sx={styles.authButton}
      >
        {isLoading ? 'Verifying Token...' : 'Sign in with API Token'}
      </Button>

      <Alert severity="info" sx={styles.alertContainer}>
        <Typography variant="caption">
          Using an API token is simpler than OAuth but requires manual token management. Your token
          is stored securely and only used to access your PagerDuty data.
        </Typography>
      </Alert>

      <Stack spacing={1} sx={styles.permissionsSection}>
        <Typography variant="body2" fontWeight={600}>
          How to get your API Token:
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {TOKEN_INSTRUCTIONS.map((instruction, index) => (
            <span key={instruction}>
              {index + 1}. {instruction}
              <br />
            </span>
          ))}
        </Typography>
      </Stack>
    </Stack>
  );
}
