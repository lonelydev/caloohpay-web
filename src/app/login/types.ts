/**
 * Types for Login page components
 */

export type AuthMethod = 'oauth' | 'token';

export interface LoginFormProps {
  onSuccess?: () => void;
}

export interface OAuthFormProps {
  isLoading: boolean;
  onSignIn: () => void;
}

export interface TokenFormProps {
  isLoading: boolean;
  apiToken: string;
  tokenError: string;
  onTokenChange: (token: string) => void;
  onSignIn: () => void;
}
