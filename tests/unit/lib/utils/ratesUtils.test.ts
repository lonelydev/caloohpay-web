/**
 * Tests for rate management utilities
 */

import {
  getCurrentRates,
  getDefaultRates,
  isValidRate,
  RATE_VALIDATION,
} from '@/lib/utils/ratesUtils';
import { getSettingsStore } from '@/lib/stores';
import { PAYMENT_RATES } from '@/lib/constants';

// Mock the settings store
jest.mock('@/lib/stores', () => ({
  getSettingsStore: {
    getState: jest.fn(),
  },
}));

describe('ratesUtils', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentRates', () => {
    it('should return rates from settings store when available', () => {
      const mockRates = { weekdayRate: 60, weekendRate: 85 };
      (getSettingsStore.getState as jest.Mock).mockReturnValue(mockRates);

      const rates = getCurrentRates();

      expect(rates).toEqual(mockRates);
      expect(getSettingsStore.getState).toHaveBeenCalledTimes(1);
    });

    it('should return default rates when store access fails', () => {
      (getSettingsStore.getState as jest.Mock).mockImplementation(() => {
        throw new Error('Store not initialized');
      });

      const rates = getCurrentRates();

      expect(rates).toEqual({
        weekdayRate: PAYMENT_RATES.WEEKDAY,
        weekendRate: PAYMENT_RATES.WEEKEND,
      });
    });

    it('should return valid PaymentRates interface', () => {
      (getSettingsStore.getState as jest.Mock).mockReturnValue({
        weekdayRate: 55,
        weekendRate: 80,
      });

      const rates = getCurrentRates();

      expect(rates).toHaveProperty('weekdayRate');
      expect(rates).toHaveProperty('weekendRate');
      expect(typeof rates.weekdayRate).toBe('number');
      expect(typeof rates.weekendRate).toBe('number');
    });
  });

  describe('getDefaultRates', () => {
    it('should return default rates from constants', () => {
      const rates = getDefaultRates();

      expect(rates).toEqual({
        weekdayRate: PAYMENT_RATES.WEEKDAY,
        weekendRate: PAYMENT_RATES.WEEKEND,
      });
    });

    it('should return consistent values across multiple calls', () => {
      const rates1 = getDefaultRates();
      const rates2 = getDefaultRates();

      expect(rates1).toEqual(rates2);
    });

    it('should match PAYMENT_RATES constants', () => {
      const rates = getDefaultRates();

      expect(rates.weekdayRate).toBe(50);
      expect(rates.weekendRate).toBe(75);
    });
  });

  describe('RATE_VALIDATION constants', () => {
    it('should define MIN and MAX boundaries', () => {
      expect(RATE_VALIDATION.MIN).toBe(25);
      expect(RATE_VALIDATION.MAX).toBe(200);
    });

    it('should have MIN less than MAX', () => {
      expect(RATE_VALIDATION.MIN).toBeLessThan(RATE_VALIDATION.MAX);
    });
  });

  describe('isValidRate', () => {
    describe('valid rates', () => {
      it('should accept valid numeric rates', () => {
        expect(isValidRate(50)).toBe(true);
        expect(isValidRate(75)).toBe(true);
        expect(isValidRate(100)).toBe(true);
      });

      it('should accept minimum boundary (25)', () => {
        expect(isValidRate(25)).toBe(true);
      });

      it('should accept maximum boundary (200)', () => {
        expect(isValidRate(200)).toBe(true);
      });

      it('should accept valid numeric strings', () => {
        expect(isValidRate('50')).toBe(true);
        expect(isValidRate('75.5')).toBe(true);
        expect(isValidRate('100')).toBe(true);
      });

      it('should accept rates with decimals', () => {
        expect(isValidRate(50.5)).toBe(true);
        expect(isValidRate(75.99)).toBe(true);
      });
    });

    describe('invalid rates', () => {
      it('should reject negative numbers', () => {
        expect(isValidRate(-1)).toBe(false);
        expect(isValidRate(-50)).toBe(false);
      });

      it('should reject zero', () => {
        expect(isValidRate(0)).toBe(false);
      });

      it('should reject rates below minimum (25)', () => {
        expect(isValidRate(24)).toBe(false);
        expect(isValidRate(24.99)).toBe(false);
      });

      it('should reject rates above maximum (200)', () => {
        expect(isValidRate(201)).toBe(false);
        expect(isValidRate(300)).toBe(false);
      });

      it('should reject NaN', () => {
        expect(isValidRate(NaN)).toBe(false);
      });

      it('should reject non-numeric strings', () => {
        expect(isValidRate('invalid')).toBe(false);
        expect(isValidRate('abc')).toBe(false);
        expect(isValidRate('')).toBe(false);
      });

      it('should reject null and undefined', () => {
        expect(isValidRate(null)).toBe(false);
        expect(isValidRate(undefined)).toBe(false);
      });

      it('should reject objects and arrays', () => {
        expect(isValidRate({})).toBe(false);
        expect(isValidRate([])).toBe(false);
      });

      it('should reject boolean values', () => {
        expect(isValidRate(true)).toBe(false);
        expect(isValidRate(false)).toBe(false);
      });
    });
  });
});
