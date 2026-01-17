/**
 * Validation utilities for payment rates
 *
 * This module provides validation constants and functions for payment rates.
 * It's intentionally kept separate from stores and other modules to avoid
 * circular dependencies during module initialization.
 */

/**
 * Validation constraints for payment rates
 *
 * These constants define the acceptable range for payment rates.
 * All rate values must fall within these bounds (inclusive).
 *
 * @remarks
 * These constraints are shared across:
 * - Form validation (SettingsForm.tsx via Zod schema)
 * - Store setters (settingsStore.ts)
 * - localStorage loading validation (settingsStore.ts)
 */
export const RATE_VALIDATION = {
  MIN: 25,
  MAX: 200,
} as const;

/**
 * Validates if a rate value meets the required constraints
 *
 * @param value - The value to validate (can be string, number, or any type)
 * @returns True if the value is a valid rate, false otherwise
 *
 * @remarks
 * This function checks:
 * - Value can be converted to a number
 * - Value is not NaN
 * - Value falls within MIN-MAX range (inclusive)
 *
 * Supports both string and numeric inputs to handle form submissions
 * and programmatic updates.
 *
 * @example
 * ```typescript
 * isValidRate(50)        // true
 * isValidRate('75')      // true
 * isValidRate(-10)       // false (below MIN)
 * isValidRate(300)       // false (above MAX)
 * isValidRate('invalid') // false (not a number)
 * isValidRate(NaN)       // false
 * ```
 */
export function isValidRate(value: unknown): boolean {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  return (
    typeof num === 'number' &&
    !isNaN(num) &&
    num >= RATE_VALIDATION.MIN &&
    num <= RATE_VALIDATION.MAX
  );
}
