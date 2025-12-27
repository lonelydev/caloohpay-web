/**
 * Application constants
 */

/**
 * Payment rates for on-call compensation
 */
export const PAYMENT_RATES = {
  WEEKDAY: 50, // £50 per weekday (Mon-Thu)
  WEEKEND: 75, // £75 per weekend (Fri-Sun)
  CURRENCY: 'GBP',
  CURRENCY_SYMBOL: '£',
} as const;

/**
 * Working hours configuration
 */
export const WORKING_HOURS = {
  START: 9, // 9:00 AM
  END: 17.5, // 5:30 PM (17:30)
  MINIMUM_OOH_DURATION_HOURS: 6, // Minimum 6 hours to count as OOH
} as const;

/**
 * Day of week constants (0 = Sunday, 6 = Saturday)
 */
export const DAYS_OF_WEEK = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
} as const;

/**
 * Weekend days (Friday-Sunday for payment purposes)
 */
export const WEEKEND_DAYS = [
  DAYS_OF_WEEK.FRIDAY,
  DAYS_OF_WEEK.SATURDAY,
  DAYS_OF_WEEK.SUNDAY,
] as const;

/**
 * Weekday days (Monday-Thursday for payment purposes)
 */
export const WEEKDAY_DAYS = [
  DAYS_OF_WEEK.MONDAY,
  DAYS_OF_WEEK.TUESDAY,
  DAYS_OF_WEEK.WEDNESDAY,
  DAYS_OF_WEEK.THURSDAY,
] as const;

/**
 * API endpoints
 */
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    CALLBACK: '/api/auth/callback',
    SESSION: '/api/auth/session',
  },
  SCHEDULES: {
    LIST: '/api/schedules',
    DETAIL: (id: string) => `/api/schedules/${id}`,
    SEARCH: '/api/schedules/search',
  },
  PAYMENTS: {
    CALCULATE: '/api/payments/calculate',
    EXPORT: '/api/payments/export',
  },
} as const;

/**
 * Route paths
 */
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  SCHEDULES: '/schedules',
  SCHEDULE_DETAIL: (id: string) => `/schedules/${id}`,
  PAYMENTS: '/payments',
  DOCUMENTATION: 'https://github.com/lonelydev/caloohpay',
} as const;

/**
 * Local storage keys
 */
export const STORAGE_KEYS = {
  THEME_MODE: 'theme-mode',
  AUTH_TOKEN: 'auth-token',
  USER_PREFERENCES: 'user-preferences',
} as const;

/**
 * Default timezone fallback
 */
export const DEFAULT_TIMEZONE = 'UTC';

/**
 * Date format strings
 */
export const DATE_FORMATS = {
  DISPLAY: 'MMM d, yyyy',
  DISPLAY_WITH_TIME: 'MMM d, yyyy h:mm a',
  ISO: "yyyy-MM-dd'T'HH:mm:ss",
  API: 'yyyy-MM-dd',
} as const;

/**
 * Application metadata
 */
export const APP_METADATA = {
  NAME: 'CalOohPay Web',
  VERSION: '0.1.0',
  DESCRIPTION: 'Calculate out-of-hours on-call compensation',
  REPOSITORY: 'https://github.com/yourusername/caloohpay-web',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  AUTH_REQUIRED: 'Authentication required',
  INVALID_CREDENTIALS: 'Invalid credentials',
  SCHEDULE_NOT_FOUND: 'Schedule not found',
  CALCULATION_FAILED: 'Payment calculation failed',
  EXPORT_FAILED: 'Export failed',
  NETWORK_ERROR: 'Network error occurred',
  UNKNOWN_ERROR: 'An unknown error occurred',
} as const;

/**
 * Success messages
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Successfully logged in',
  LOGOUT_SUCCESS: 'Successfully logged out',
  CALCULATION_SUCCESS: 'Payment calculation completed',
  EXPORT_SUCCESS: 'Data exported successfully',
} as const;
