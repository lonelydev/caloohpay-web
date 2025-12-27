import { renderHook, act, waitFor } from '@testing-library/react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLoginForm } from '@/app/login/hooks/useLoginForm';
import { ERROR_MESSAGES } from '@/app/login/constants';

// Mock next-auth
jest.mock('next-auth/react');
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

const mockPush = jest.fn();
const mockGet = jest.fn();

describe('useLoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue({ get: mockGet });
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useLoginForm());

      expect(result.current.status).toBe('unauthenticated');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.authMethod).toBe('oauth');
      expect(result.current.apiToken).toBe('');
      expect(result.current.tokenError).toBe('');
      expect(result.current.error).toBeNull();
    });

    it('should parse error from URL params', () => {
      mockGet.mockReturnValue('OAuthCallback');

      const { result } = renderHook(() => useLoginForm());

      expect(result.current.error).toBe(ERROR_MESSAGES.OAuthCallback);
    });

    it('should handle unknown error codes with default message', () => {
      mockGet.mockReturnValue('UnknownError');

      const { result } = renderHook(() => useLoginForm());

      expect(result.current.error).toBe(ERROR_MESSAGES.Default);
    });
  });

  describe('Authentication redirect', () => {
    it('should redirect to schedules when authenticated', async () => {
      mockUseSession.mockReturnValue({
        data: { user: { name: 'Test User' } } as unknown as Parameters<typeof useSession>[0],
        status: 'authenticated',
        update: jest.fn(),
      });

      renderHook(() => useLoginForm());

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/schedules');
      });
    });

    it('should not redirect when unauthenticated', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'unauthenticated',
        update: jest.fn(),
      });

      renderHook(() => useLoginForm());

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should not redirect during loading', () => {
      mockUseSession.mockReturnValue({
        data: null,
        status: 'loading',
        update: jest.fn(),
      });

      renderHook(() => useLoginForm());

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('OAuth sign-in', () => {
    it('should trigger OAuth sign-in flow', async () => {
      const { result } = renderHook(() => useLoginForm());

      await act(async () => {
        await result.current.handleOAuthSignIn();
      });

      expect(mockSignIn).toHaveBeenCalledWith('pagerduty', {
        callbackUrl: '/schedules',
      });
    });

    it('should call signIn during OAuth sign-in', async () => {
      mockSignIn.mockResolvedValue({ error: null, ok: true, status: 200, url: null });
      const { result } = renderHook(() => useLoginForm());

      await act(async () => {
        await result.current.handleOAuthSignIn();
      });

      expect(mockSignIn).toHaveBeenCalledWith('pagerduty', {
        callbackUrl: '/schedules',
      });
    });

    it('should handle OAuth sign-in errors gracefully', async () => {
      mockSignIn.mockRejectedValue(new Error('OAuth error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useLoginForm());

      await act(async () => {
        await result.current.handleOAuthSignIn();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Sign in error:', expect.any(Error));
      expect(result.current.isLoading).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('Token sign-in', () => {
    it('should validate empty token', async () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.setApiToken('');
      });

      await act(async () => {
        await result.current.handleTokenSignIn();
      });

      expect(result.current.tokenError).toBe('Please enter your API token');
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('should validate whitespace-only token', async () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.setApiToken('   ');
      });

      await act(async () => {
        await result.current.handleTokenSignIn();
      });

      expect(result.current.tokenError).toBe('Please enter your API token');
      expect(mockSignIn).not.toHaveBeenCalled();
    });

    it('should trigger token sign-in with valid token', async () => {
      mockSignIn.mockResolvedValue({ error: null, ok: true, status: 200, url: null });
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.setApiToken('test-token-123');
      });

      await act(async () => {
        await result.current.handleTokenSignIn();
      });

      expect(mockSignIn).toHaveBeenCalledWith('pagerduty-token', {
        apiToken: 'test-token-123',
        callbackUrl: '/schedules',
        redirect: true,
      });
    });

    it('should trim token before sign-in', async () => {
      mockSignIn.mockResolvedValue({ error: null, ok: true, status: 200, url: null });
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.setApiToken('  test-token-123  ');
      });

      await act(async () => {
        await result.current.handleTokenSignIn();
      });

      expect(mockSignIn).toHaveBeenCalledWith('pagerduty-token', {
        apiToken: 'test-token-123',
        callbackUrl: '/schedules',
        redirect: true,
      });
    });

    it('should call signIn during token sign-in', async () => {
      mockSignIn.mockResolvedValue({ error: null, ok: true, status: 200, url: null });
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.setApiToken('test-token');
      });

      await act(async () => {
        await result.current.handleTokenSignIn();
      });

      expect(mockSignIn).toHaveBeenCalledWith('pagerduty-token', {
        apiToken: 'test-token',
        callbackUrl: '/schedules',
        redirect: true,
      });
    });

    it('should handle invalid token error', async () => {
      mockSignIn.mockResolvedValue({ error: 'Invalid token', ok: false, status: 401, url: null });
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.setApiToken('invalid-token');
      });

      await act(async () => {
        await result.current.handleTokenSignIn();
      });

      expect(result.current.tokenError).toBe('Invalid API token. Please check and try again.');
      expect(result.current.isLoading).toBe(false);
    });

    it('should clear token error on new attempt', async () => {
      const { result } = renderHook(() => useLoginForm());

      // First attempt - trigger error
      act(() => {
        result.current.setApiToken('');
      });

      await act(async () => {
        await result.current.handleTokenSignIn();
      });

      expect(result.current.tokenError).toBe('Please enter your API token');

      // Second attempt - error should clear
      mockSignIn.mockResolvedValue({ error: null, ok: true, status: 200, url: null });

      act(() => {
        result.current.setApiToken('valid-token');
      });

      await act(async () => {
        await result.current.handleTokenSignIn();
      });

      expect(result.current.tokenError).toBe('');
    });

    it('should handle token sign-in errors gracefully', async () => {
      mockSignIn.mockRejectedValue(new Error('Network error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.setApiToken('test-token');
      });

      await act(async () => {
        await result.current.handleTokenSignIn();
      });

      expect(consoleSpy).toHaveBeenCalledWith('Token sign in error:', expect.any(Error));
      expect(result.current.tokenError).toBe('An error occurred. Please try again.');
      expect(result.current.isLoading).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('Auth method change', () => {
    it('should switch to token auth method', () => {
      const { result } = renderHook(() => useLoginForm());

      act(() => {
        result.current.handleAuthMethodChange({}, 'token');
      });

      expect(result.current.authMethod).toBe('token');
    });

    it('should switch to OAuth auth method', () => {
      const { result } = renderHook(() => useLoginForm());

      // First switch to token
      act(() => {
        result.current.handleAuthMethodChange({}, 'token');
      });

      // Then switch back to OAuth
      act(() => {
        result.current.handleAuthMethodChange({}, 'oauth');
      });

      expect(result.current.authMethod).toBe('oauth');
    });

    it('should clear token error when switching auth methods', async () => {
      const { result } = renderHook(() => useLoginForm());

      // Set an error by attempting sign-in with empty token
      act(() => {
        result.current.setApiToken('');
      });

      await act(async () => {
        await result.current.handleTokenSignIn();
      });

      expect(result.current.tokenError).toBe('Please enter your API token');

      // Switch methods - error should clear
      act(() => {
        result.current.handleAuthMethodChange({}, 'oauth');
      });

      expect(result.current.tokenError).toBe('');
    });
  });

  describe('Error messages', () => {
    const errorCases = [
      { param: 'OAuthSignin', expected: ERROR_MESSAGES.OAuthSignin },
      { param: 'OAuthCallback', expected: ERROR_MESSAGES.OAuthCallback },
      { param: 'OAuthCreateAccount', expected: ERROR_MESSAGES.OAuthCreateAccount },
      { param: 'CredentialsSignin', expected: ERROR_MESSAGES.CredentialsSignin },
      { param: 'SessionRequired', expected: ERROR_MESSAGES.SessionRequired },
    ];

    errorCases.forEach(({ param, expected }) => {
      it(`should display correct message for ${param} error`, () => {
        // Create new mock for each test
        const localMockGet = jest.fn().mockReturnValue(param);
        (useSearchParams as jest.Mock).mockReturnValue({ get: localMockGet });

        const { result } = renderHook(() => useLoginForm());

        expect(result.current.error).toBe(expected);
      });
    });
  });
});
