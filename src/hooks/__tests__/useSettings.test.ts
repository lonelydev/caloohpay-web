import { renderHook, act } from '@testing-library/react';
import { useSettings } from '@/hooks';
import { getSettingsStore } from '@/lib/stores';

describe('useSettings hook', () => {
  beforeEach(() => {
    // Reset store and localStorage before each test
    localStorage.clear();
    act(() => {
      getSettingsStore.setState({
        weekdayRate: 50,
        weekendRate: 75,
      });
    });
  });

  describe('default values', () => {
    it('should return default rates', () => {
      const { result } = renderHook(() => useSettings());
      // Hook returns current state
      expect(result.current.weekdayRate).toBe(50);
      expect(result.current.weekendRate).toBe(75);
    });

    it('should provide access to store methods via getSettingsStore', () => {
      renderHook(() => useSettings());
      const store = getSettingsStore;
      expect(typeof store.getState).toBe('function');
      expect(typeof store.setState).toBe('function');
      expect(typeof store.subscribe).toBe('function');
    });
  });

  describe('updating store through hook', () => {
    it('should update weekday rate through store', () => {
      renderHook(() => useSettings());

      act(() => {
        getSettingsStore.getState().setWeekdayRate(65);
      });

      expect(getSettingsStore.getState().weekdayRate).toBe(65);
    });

    it('should update weekend rate through store', () => {
      renderHook(() => useSettings());

      act(() => {
        getSettingsStore.getState().setWeekendRate(95);
      });

      expect(getSettingsStore.getState().weekendRate).toBe(95);
    });

    it('should reset rates to defaults through store', () => {
      renderHook(() => useSettings());

      // Set custom values
      act(() => {
        getSettingsStore.getState().setWeekdayRate(70);
        getSettingsStore.getState().setWeekendRate(100);
      });

      // Reset
      act(() => {
        getSettingsStore.getState().reset();
      });

      expect(getSettingsStore.getState().weekdayRate).toBe(50);
      expect(getSettingsStore.getState().weekendRate).toBe(75);
    });
  });

  describe('hook reflects store changes', () => {
    it('should re-render when store changes', () => {
      const { result, rerender } = renderHook(() => useSettings());

      expect(result.current.weekdayRate).toBe(50);

      act(() => {
        getSettingsStore.getState().setWeekdayRate(62);
      });

      // Force update to see new state
      rerender();

      expect(result.current.weekdayRate).toBe(62);
    });

    it('should reflect direct store updates on re-render', () => {
      const { result, rerender } = renderHook(() => useSettings());

      act(() => {
        getSettingsStore.setState({ weekdayRate: 68 });
      });

      rerender();

      expect(result.current.weekdayRate).toBe(68);
    });
  });

  describe('store subscriptions', () => {
    it('should allow subscription to store changes', () => {
      renderHook(() => useSettings());
      const listener = jest.fn();

      const unsubscribe = getSettingsStore.subscribe(listener);

      act(() => {
        getSettingsStore.getState().setWeekdayRate(55);
      });

      expect(listener).toHaveBeenCalled();
      unsubscribe();
    });

    it('should unsubscribe properly', () => {
      renderHook(() => useSettings());
      const listener = jest.fn();

      const unsubscribe = getSettingsStore.subscribe(listener);

      act(() => {
        getSettingsStore.getState().setWeekdayRate(55);
      });

      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      act(() => {
        getSettingsStore.getState().setWeekdayRate(60);
      });

      // Should not be called again after unsubscribe
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('store state consistency', () => {
    it('should maintain consistent state with direct store access', () => {
      const { result } = renderHook(() => useSettings());

      act(() => {
        getSettingsStore.setState({ weekdayRate: 72, weekendRate: 102 });
      });

      // Get fresh snapshot
      const hookState = result.current;
      const directState = getSettingsStore.getState();

      expect(hookState.weekdayRate).toBe(directState.weekdayRate);
      expect(hookState.weekendRate).toBe(directState.weekendRate);
    });
  });

  describe('store methods access', () => {
    it('should provide access to getDefaults through store', () => {
      renderHook(() => useSettings());
      const defaults = getSettingsStore.getState().getDefaults();

      expect(defaults).toEqual({
        weekdayRate: 50,
        weekendRate: 75,
      });
    });

    it('should persist changes through localStorage', () => {
      renderHook(() => useSettings());

      act(() => {
        getSettingsStore.getState().setWeekdayRate(78);
      });

      const saved = JSON.parse(localStorage.getItem('settings') || '{}');
      expect(saved.weekdayRate).toBe(78);
    });
  });

  describe('multiple hook instances', () => {
    it('should share the same store across multiple hook instances', () => {
      const { result: hook1 } = renderHook(() => useSettings());
      const { result: hook2 } = renderHook(() => useSettings());
      const { result: hook3 } = renderHook(() => useSettings());

      act(() => {
        getSettingsStore.getState().setWeekdayRate(75);
      });

      // All hooks share the same store, so they all have the same values
      expect(hook1.current.weekdayRate).toBe(75);
      expect(hook2.current.weekdayRate).toBe(75);
      expect(hook3.current.weekdayRate).toBe(75);
    });
  });
});
