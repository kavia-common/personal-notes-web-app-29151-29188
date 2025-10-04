import { useEffect, useRef, useState } from 'react';
import { safeParse, safeStringify } from '../utils/storage';

/**
 * PUBLIC_INTERFACE
 * useLocalStorage
 * A generic hook to persist state in localStorage with safe JSON handling.
 * - Handles parse/stringify errors
 * - SSR/No-window guard
 * @param {string} key
 * @param {any|Function} initialValue
 * @returns {[any, Function]}
 */
export function useLocalStorage(key, initialValue) {
  const isFirstRun = useRef(true);

  const readValue = () => {
    if (typeof window === 'undefined') return valueFrom(initialValue);
    try {
      const item = window.localStorage.getItem(key);
      if (item === null || item === undefined) return valueFrom(initialValue);
      const parsed = safeParse(item);
      return typeof parsed === 'undefined' ? valueFrom(initialValue) : parsed;
    } catch {
      return valueFrom(initialValue);
    }
  };

  const [storedValue, setStoredValue] = useState(readValue);

  useEffect(() => {
    // Sync to localStorage whenever value changes (skip first render if same)
    if (typeof window === 'undefined') return;
    try {
      const serialized = safeStringify(storedValue);
      if (typeof serialized !== 'string') return;
      window.localStorage.setItem(key, serialized);
    } catch {
      // no-op
    }
  }, [key, storedValue]);

  // Helper to support functional initial values
  function valueFrom(v) {
    return typeof v === 'function' ? v() : v;
  }

  return [storedValue, setStoredValue];
}
