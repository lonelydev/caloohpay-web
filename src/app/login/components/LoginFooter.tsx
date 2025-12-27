/**
 * Login page footer with help link
 */

import { Typography } from '@mui/material';
import { ROUTES } from '../constants';
import * as styles from '../page.styles';

export function LoginFooter() {
  return (
    <Typography variant="caption" color="white" sx={styles.footer}>
      Need help? Contact your administrator or visit our{' '}
      <a
        href={ROUTES.DOCUMENTATION}
        target="_blank"
        rel="noopener noreferrer"
        style={styles.footerLink}
      >
        documentation
      </a>
    </Typography>
  );
}
