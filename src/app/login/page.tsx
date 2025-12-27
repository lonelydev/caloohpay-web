'use client';

import { Suspense } from 'react';
import { Box, Card, CardContent, Container, Stack, Alert, Tab, Tabs } from '@mui/material';
import { Loading } from '@/components/common';
import { LoginHeader } from './components/LoginHeader';
import { LoginFooter } from './components/LoginFooter';
import { OAuthForm } from './components/OAuthForm';
import { TokenForm } from './components/TokenForm';
import { useLoginForm } from './hooks/useLoginForm';
import { AUTH_METHODS } from '@/lib/constants';
import * as styles from './page.styles';

function LoginForm() {
  const {
    status,
    isLoading,
    authMethod,
    apiToken,
    tokenError,
    error,
    setApiToken,
    handleOAuthSignIn,
    handleTokenSignIn,
    handleAuthMethodChange,
  } = useLoginForm();

  // Show loading while checking authentication status
  if (status === 'loading') {
    return <Loading message="Checking authentication..." fullScreen />;
  }

  // Don't show login form if already authenticated (will redirect)
  if (status === 'authenticated') {
    return <Loading message="Redirecting to schedules..." fullScreen />;
  }

  return (
    <Box sx={styles.pageContainer}>
      <Container maxWidth="sm">
        <Card elevation={8}>
          <CardContent sx={styles.cardContent}>
            <Stack spacing={3} alignItems="center">
              <LoginHeader />

              {/* Error Alerts */}
              {error && (
                <Alert severity="error" sx={styles.alertContainer}>
                  {error}
                </Alert>
              )}

              {tokenError && (
                <Alert severity="error" sx={styles.alertContainer}>
                  {tokenError}
                </Alert>
              )}

              {/* Auth Method Tabs */}
              <Tabs value={authMethod} onChange={handleAuthMethodChange} sx={styles.tabsContainer}>
                <Tab label="OAuth Login" value={AUTH_METHODS.OAUTH} sx={styles.tab} />
                <Tab label="API Token" value={AUTH_METHODS.TOKEN} sx={styles.tab} />
              </Tabs>

              {/* Auth Forms */}
              {authMethod === AUTH_METHODS.OAUTH ? (
                <OAuthForm isLoading={isLoading} onSignIn={handleOAuthSignIn} />
              ) : (
                <TokenForm
                  isLoading={isLoading}
                  apiToken={apiToken}
                  tokenError={tokenError}
                  onTokenChange={setApiToken}
                  onSignIn={handleTokenSignIn}
                />
              )}
            </Stack>
          </CardContent>
        </Card>

        <LoginFooter />
      </Container>
    </Box>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading message="Loading..." fullScreen />}>
      <LoginForm />
    </Suspense>
  );
}
