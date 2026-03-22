import { useState, useEffect, useCallback } from 'react';
import { SESSION_STORAGE_KEY } from '../utils/constants';

/**
 * Custom hook for auto-saving and restoring editor state from sessionStorage.
 * Data persists as long as the browser tab/window is open.
 * Clearing happens via clearSession() ("Start New" button).
 */
export const useSessionStorage = (initialState) => {
  const [state, setState] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Restore — images need to be reloaded (they're stored as dataURLs)
        return {
          ...initialState,
          ...parsed,
          // Images will be re-hydrated by the component
          _restored: true,
        };
      }
    } catch (e) {
      console.warn('Failed to restore session:', e);
    }
    return { ...initialState, _restored: false };
  });

  // Auto-save on every state change
  useEffect(() => {
    try {
      // Don't save image objects (they're not serializable)
      // Instead, save the image dataURL
      const toSave = {
        ...state,
        _restored: undefined,
      };
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Failed to save session:', e);
    }
  }, [state]);

  const updateState = useCallback((updates) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const clearSession = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setState({ ...initialState, _restored: false });
  }, [initialState]);

  return [state, updateState, clearSession, state._restored];
};
