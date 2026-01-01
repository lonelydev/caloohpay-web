import { useCallback, useSyncExternalStore } from 'react';
import { getSettingsStore } from '@/lib/stores';

/**
 * Hook to access the settings store with automatic updates
 * Returns the current settings state and triggers re-renders when settings change
 *
 * For tests or direct store access, use getSettingsStore directly:
 * - getSettingsStore.getState() - get current state
 * - getSettingsStore.setState() - update state
 * - getSettingsStore.subscribe() - listen for changes
 *
 * @example
 * // In components:
 * const settings = useSettings();
 * const { weekdayRate, weekendRate } = settings;
 *
 * // In tests:
 * getSettingsStore.getState().setWeekdayRate(60);
 */
export const useSettings = () => {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const unsubscribe = getSettingsStore.subscribe(() => {
      onStoreChange();
    });
    return unsubscribe;
  }, []);

  const getSnapshot = useCallback(() => {
    return getSettingsStore.getState();
  }, []);

  const getServerSnapshot = useCallback(() => {
    return getSettingsStore.getState();
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
