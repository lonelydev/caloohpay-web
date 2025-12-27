/**
 * Custom hook for login form logic
 */

import { useState, useEffect, useCallback } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES } from '@/lib/constants';
import { ERROR_MESSAGES, AUTH_METHODS } from '../constants';
import type { AuthMethod } from '../types';

export function useLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<AuthMethod>(AUTH_METHODS.OAUTH);
  const [apiToken, setApiToken] = useState('');
  const [tokenError, setTokenError] = useState('');

  const errorParam = searchParams.get('error');
  const error = errorParam ? ERROR_MESSAGES[errorParam] || ERROR_MESSAGES.Default : null;

  useEffect(() => {
    if (status === 'authenticated') {
      router.push(ROUTES.SCHEDULES);
    }
  }, [status, router]);

  const handleOAuthSignIn = useCallback(async () => {
    try {
      setIsLoading(true);
      await signIn('pagerduty', {
        callbackUrl: ROUTES.SCHEDULES,
      });
    } catch (err) {
      console.error('Sign in error:', err);
      setIsLoading(false);
    }
  }, []);

  const handleTokenSignIn = useCallback(async () => {
    if (!apiToken.trim()) {
      setTokenError('Please enter your API token');
      return;
    }

    try {
      setIsLoading(true);
      setTokenError('');

      const result = await signIn('pagerduty-token', {
        apiToken: apiToken.trim(),
        callbackUrl: ROUTES.SCHEDULES,
        redirect: true,
      });

      if (result?.error) {
        setTokenError('Invalid API token. Please check and try again.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Token sign in error:', err);
      setTokenError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  }, [apiToken]);

  const handleAuthMethodChange = useCallback((_: unknown, newValue: AuthMethod) => {
    setAuthMethod(newValue);
    setTokenError('');
  }, []);

  return {
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
  };
}
