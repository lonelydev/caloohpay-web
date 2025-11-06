/**
 * Type definitions for the CalOohPay Web application
 * Based on the original CalOohPay CLI tool
 */

/**
 * PagerDuty User information
 */
export interface User {
  id: string;
  summary: string;
  email?: string;
  name?: string;
  html_url?: string;
}

/**
 * A single schedule entry from PagerDuty
 */
export interface ScheduleEntry {
  start: Date | string;
  end: Date | string;
  user: User;
}

/**
 * PagerDuty Final Schedule structure
 */
export interface FinalSchedule {
  name: string;
  rendered_schedule_entries: ScheduleEntry[];
}

/**
 * Complete PagerDuty Schedule
 */
export interface PagerDutySchedule {
  id: string;
  name: string;
  html_url: string;
  time_zone: string;
  description?: string;
  final_schedule: FinalSchedule;
}

/**
 * On-call period for a user
 */
export interface OnCallPeriod {
  start: Date;
  end: Date;
  timezone: string;
}

/**
 * User with on-call periods
 */
export interface OnCallUser {
  id: string;
  name: string;
  email?: string;
  periods: OnCallPeriod[];
  totalOohWeekdays: number;
  totalOohWeekends: number;
}

/**
 * Compensation calculation result
 */
export interface OnCallCompensation {
  user: OnCallUser;
  totalCompensation: number;
  weekdayDays: number;
  weekendDays: number;
}

/**
 * Payment calculation summary for a schedule
 */
export interface SchedulePaymentSummary {
  schedule: PagerDutySchedule;
  compensations: OnCallCompensation[];
  totalAmount: number;
  calculatedAt: Date;
}

/**
 * CSV export data structure
 */
export interface CSVExportData {
  scheduleName: string;
  scheduleUrl: string;
  timezone: string;
  rows: CSVRow[];
}

export interface CSVRow {
  userName: string;
  totalCompensation: number;
  weekdayDays: number;
  weekendDays: number;
}

/**
 * Authentication session
 */
export interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  pagerDutyToken: string;
  expiresAt: Date;
}

/**
 * API error response
 */
export interface APIError {
  message: string;
  code?: string;
  statusCode?: number;
}

/**
 * Payment calculation options
 */
export interface PaymentCalculationOptions {
  scheduleIds: string[];
  since: string;
  until: string;
  timezone?: string;
}

/**
 * Compensation rates
 */
export interface CompensationRates {
  weekday: number; // Default: £50
  weekend: number; // Default: £75
  currency: string; // Default: 'GBP'
}
