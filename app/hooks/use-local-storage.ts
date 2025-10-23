"use client";

import { useState, useEffect } from "react";

/**
 * A client-side hook for managing state synchronized with localStorage
 *
 * @template T - The type of the value stored in localStorage
 * @param key - The localStorage key to use
 * @param initialValue - The initial value to use if no value exists in localStorage
 * @returns A tuple containing the stored value, a setter function, and a loaded flag
 *
 * @example
 * const [theme, setTheme, isLoaded] = useLocalStorage<string>("theme", "light");
 * const [count, setCount, isLoaded] = useLocalStorage<number>("count", 0);
 * const [items, setItems, isLoaded] = useLocalStorage<string[]>("items", []);
 *
 * @remarks
 * - Handles SSR by checking for window availability
 * - Automatically serializes/deserializes JSON
 * - Includes error handling with console warnings
 * - Updates localStorage whenever the value changes
 * - Setter accepts either a raw value or a functional updater, matching React's useState API
 * - Returns isLoaded flag to indicate when localStorage has been read (prevents hydration blocking)
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): readonly [T, (value: T | ((prev: T) => T)) => void, boolean] {
  // Initialize with server-safe value to prevent hydration mismatch
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [isLoaded, setIsLoaded] = useState(false);

  // Read from localStorage after mount to avoid blocking hydration
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    } finally {
      setIsLoaded(true);
    }
  }, [key]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (valueOrUpdater: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      try {
        const nextValue =
          typeof valueOrUpdater === "function"
            ? (valueOrUpdater as (prevState: T) => T)(prev)
            : valueOrUpdater;

        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(nextValue));
        }

        return nextValue;
      } catch (error) {
        // If writing to localStorage fails, log warning and return previous value to avoid state drift
        console.warn(
          `Error setting localStorage key "${key}":`,
          error
        );
        return prev;
      }
    });
  };

  return [storedValue, setValue, isLoaded] as const;
}
