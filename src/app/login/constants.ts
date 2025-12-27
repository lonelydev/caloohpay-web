/**
 * Constants for Login page
 */

export const ERROR_MESSAGES: Record<string, string> = {
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
} as const;

export const AUTH_METHODS = {
  OAUTH: 'oauth',
  TOKEN: 'token',
} as const;

export const PERMISSIONS = [
  'Read access to schedules',
  'Read access to user information',
  'Read access to on-call schedules',
] as const;

export const TOKEN_INSTRUCTIONS = [
  'Log into PagerDuty',
  'Click your user icon → My Profile',
  'Go to User Settings tab',
  'Scroll to API Access section',
  'Create or copy your User API Token',
] as const;
