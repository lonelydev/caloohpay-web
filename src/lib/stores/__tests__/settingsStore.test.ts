import { renderHook, act } from '@testing-library/react';
import { getSettingsStore, reloadSettingsFromStorage } from '../settingsStore';

describe('settingsStore', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    // Reset store to initial state
    act(() => {
      getSettingsStore.setState({
        weekdayRate: 50,
        weekendRate: 75,
      });
    });
  });

  describe('initialization', () => {
    it('should initialize with default rates', () => {
      // Fresh store with clean localStorage
      localStorage.clear();
      const state = getSettingsStore.getState();
      expect(state.weekdayRate).toBe(50);
      expect(state.weekendRate).toBe(75);
    });

    it('should load rates from localStorage on init', () => {
      // Store custom rates in localStorage
      const customSettings = {
        weekdayRate: 60,
        weekendRate: 85,
      };
      localStorage.setItem('settings', JSON.stringify(customSettings));

      // Use reload helper to load from localStorage
      act(() => {
        reloadSettingsFromStorage();
      });

      const state = getSettingsStore.getState();
      expect(state.weekdayRate).toBe(60);
      expect(state.weekendRate).toBe(85);
    });
  });

  describe('updating rates', () => {
    it('should update weekday rate', () => {
      act(() => {
        getSettingsStore.getState().setWeekdayRate(60);
      });
      expect(getSettingsStore.getState().weekdayRate).toBe(60);
    });

    it('should update weekend rate', () => {
      act(() => {
        getSettingsStore.getState().setWeekendRate(90);
      });
      expect(getSettingsStore.getState().weekendRate).toBe(90);
    });

    it('should allow independent updates without affecting other rate', () => {
      act(() => {
        getSettingsStore.getState().setWeekdayRate(65);
      });
      expect(getSettingsStore.getState().weekdayRate).toBe(65);
      expect(getSettingsStore.getState().weekendRate).toBe(75);

      act(() => {
        getSettingsStore.getState().setWeekendRate(95);
      });
      expect(getSettingsStore.getState().weekdayRate).toBe(65);
      expect(getSettingsStore.getState().weekendRate).toBe(95);
    });
  });

  describe('localStorage persistence', () => {
    it('should persist weekday rate to localStorage when updated', () => {
      act(() => {
        getSettingsStore.getState().setWeekdayRate(70);
      });

      const saved = JSON.parse(localStorage.getItem('settings') || '{}');
      expect(saved.weekdayRate).toBe(70);
    });

    it('should persist weekend rate to localStorage when updated', () => {
      act(() => {
        getSettingsStore.getState().setWeekendRate(100);
      });

      const saved = JSON.parse(localStorage.getItem('settings') || '{}');
      expect(saved.weekendRate).toBe(100);
    });

    it('should persist both rates to localStorage together', () => {
      act(() => {
        getSettingsStore.getState().setWeekdayRate(62);
        getSettingsStore.getState().setWeekendRate(88);
      });

      const saved = JSON.parse(localStorage.getItem('settings') || '{}');
      expect(saved).toEqual({
        weekdayRate: 62,
        weekendRate: 88,
      });
    });
  });

  describe('resetting to defaults', () => {
    it('should reset rates to defaults', () => {
      act(() => {
        getSettingsStore.getState().setWeekdayRate(70);
        getSettingsStore.getState().setWeekendRate(95);
      });

      act(() => {
        getSettingsStore.getState().reset();
      });

      expect(getSettingsStore.getState().weekdayRate).toBe(50);
      expect(getSettingsStore.getState().weekendRate).toBe(75);
    });

    it('should persist defaults to localStorage after reset', () => {
      act(() => {
        getSettingsStore.getState().setWeekdayRate(70);
        getSettingsStore.getState().setWeekendRate(95);
      });

      act(() => {
        getSettingsStore.getState().reset();
      });

      const saved = JSON.parse(localStorage.getItem('settings') || '{}');
      expect(saved.weekdayRate).toBe(50);
      expect(saved.weekendRate).toBe(75);
    });
  });

  describe('getDefaults', () => {
    it('should return default rates', () => {
      const defaults = getSettingsStore.getState().getDefaults();
      expect(defaults).toEqual({
        weekdayRate: 50,
        weekendRate: 75,
      });
    });

    it('should return defaults even when custom rates are set', () => {
      act(() => {
        getSettingsStore.getState().setWeekdayRate(80);
        getSettingsStore.getState().setWeekendRate(110);
      });

      const defaults = getSettingsStore.getState().getDefaults();
      expect(defaults).toEqual({
        weekdayRate: 50,
        weekendRate: 75,
      });
    });
  });

  describe('store subscriptions', () => {
    it('should notify subscribers when state changes', () => {
      const listener = jest.fn();
      const unsubscribe = getSettingsStore.subscribe(listener);

      act(() => {
        getSettingsStore.getState().setWeekdayRate(55);
      });

      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });

    it('should pass new state to listeners', () => {
      const listener = jest.fn();
      getSettingsStore.subscribe(listener);

      const newState = { weekdayRate: 65, weekendRate: 85 };
      act(() => {
        getSettingsStore.setState(newState);
      });

      expect(listener).toHaveBeenCalled();
      expect(getSettingsStore.getState()).toMatchObject(newState);
    });
  });

  describe('edge cases', () => {
    it('should handle invalid localStorage JSON gracefully', () => {
      localStorage.setItem('settings', 'invalid json {');
      act(() => {
        reloadSettingsFromStorage();
      });
      // Store should fall back to defaults
      const state = getSettingsStore.getState();
      expect(state.weekdayRate).toBe(50);
      expect(state.weekendRate).toBe(75);
    });

    it('should handle missing localStorage gracefully', () => {
      localStorage.clear();
      act(() => {
        reloadSettingsFromStorage();
      });
      const state = getSettingsStore.getState();
      expect(state.weekdayRate).toBe(50);
      expect(state.weekendRate).toBe(75);
    });

    it('should handle partial localStorage data (missing fields)', () => {
      localStorage.setItem('settings', JSON.stringify({ weekdayRate: 60 }));
      act(() => {
        reloadSettingsFromStorage();
      });
      const state = getSettingsStore.getState();
      // Should have weekdayRate from storage and weekendRate from defaults
      expect(state.weekdayRate).toBe(60);
      expect(state.weekendRate).toBe(75);
    });

    it('should ignore invalid rate values and use defaults', () => {
      localStorage.setItem('settings', JSON.stringify({ weekdayRate: -5, weekendRate: 'invalid' }));
      act(() => {
        reloadSettingsFromStorage();
      });
      const state = getSettingsStore.getState();
      // Should use defaults for invalid values
      expect(state.weekdayRate).toBe(50);
      expect(state.weekendRate).toBe(75);
    });

    it('should accept valid numeric strings and convert them', () => {
      localStorage.setItem('settings', JSON.stringify({ weekdayRate: '60', weekendRate: '90' }));
      act(() => {
        reloadSettingsFromStorage();
      });
      const state = getSettingsStore.getState();
      expect(state.weekdayRate).toBe(60);
      expect(state.weekendRate).toBe(90);
    });
  });
});
