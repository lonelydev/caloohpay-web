'use client';

import { useEffect, useState } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Box, Button, Card, CardContent, Container, Stack, Typography, Alert } from '@mui/material';
import { Login as LoginIcon } from '@mui/icons-material';
import { Loading } from '@/components/common';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const errorParam = searchParams.get('error');

  // Compute error message from URL param
  const error = errorParam
    ? (() => {
        const errorMessages: Record<string, string> = {
          OAuthSignin: 'Error starting OAuth sign in',
          OAuthCallback: 'Error handling OAuth callback',
          OAuthCreateAccount: 'Error creating OAuth account',
          EmailCreateAccount: 'Error creating email account',
          Callback: 'Error in OAuth callback',
          OAuthAccountNotLinked: 'Account already exists with different provider',
          EmailSignin: 'Error sending email',
          CredentialsSignin: 'Invalid credentials',
          SessionRequired: 'Please sign in to access this page',
          Default: 'An error occurred during authentication',
        };
        return errorMessages[errorParam] || errorMessages.Default;
      })()
    : null;

  useEffect(() => {
    // Redirect if already authenticated
    if (status === 'authenticated') {
      router.push('/schedules');
    }
  }, [status, router]);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);

      await signIn('pagerduty', {
        callbackUrl: '/schedules',
      });
    } catch (err) {
      console.error('Sign in error:', err);
      // Error will be shown via URL params after redirect
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication status
  if (status === 'loading') {
    return <Loading message="Checking authentication..." fullScreen />;
  }

  // Don't show login form if already authenticated (will redirect)
  if (status === 'authenticated') {
    return <Loading message="Redirecting to schedules..." fullScreen />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: (theme) =>
          theme.palette.mode === 'light'
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Card elevation={8}>
          <CardContent sx={{ p: 4 }}>
            <Stack spacing={3} alignItems="center">
              {/* Logo/Title */}
              <Typography
                variant="h4"
                component="h1"
                fontWeight={700}
                textAlign="center"
                color="primary"
              >
                CalOohPay Web
              </Typography>

              <Typography variant="body1" textAlign="center" color="text.secondary">
                Sign in with your PagerDuty account to calculate on-call compensation
              </Typography>

              {/* Error Alert */}
              {error && (
                <Alert severity="error" sx={{ width: '100%' }}>
                  {error}
                </Alert>
              )}

              {/* Sign In Button */}
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<LoginIcon />}
                onClick={handleSignIn}
                disabled={isLoading}
                sx={{ py: 1.5 }}
              >
                {isLoading ? 'Connecting to PagerDuty...' : 'Sign in with PagerDuty'}
              </Button>

              {/* Info Text */}
              <Box sx={{ pt: 2 }}>
                <Typography variant="caption" color="text.secondary" textAlign="center">
                  By signing in, you authorize CalOohPay to access your PagerDuty schedules for
                  payment calculation purposes.
                </Typography>
              </Box>

              {/* Help Text */}
              <Stack spacing={1} sx={{ pt: 2, width: '100%' }}>
                <Typography variant="body2" fontWeight={600}>
                  Required Permissions:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  • Read access to schedules
                  <br />
                  • Read access to user information
                  <br />• Read access to on-call schedules
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Footer */}
        <Typography
          variant="caption"
          color="white"
          sx={{ display: 'block', textAlign: 'center', mt: 3, opacity: 0.8 }}
        >
          Need help? Contact your administrator or visit our{' '}
          <a
            href="https://github.com/lonelydev/caloohpay"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'white', textDecoration: 'underline' }}
          >
            documentation
          </a>
        </Typography>
      </Container>
    </Box>
  );
}
