"use client";

import { useState, useEffect } from "react";

/**
 * A client-side hook for managing state synchronized with localStorage
 *
 * @template T - The type of the value stored in localStorage
 * @param key - The localStorage key to use
 * @param initialValue - The initial value to use if no value exists in localStorage
 * @returns A tuple containing the stored value and a setter function
 *
 * @example
 * const [theme, setTheme] = useLocalStorage<string>("theme", "light");
 * const [count, setCount] = useLocalStorage<number>("count", 0);
 * const [items, setItems] = useLocalStorage<string[]>("items", []);
 *
 * @remarks
 * - Handles SSR by checking for window availability
 * - Automatically serializes/deserializes JSON
 * - Includes error handling with console warnings
 * - Updates localStorage whenever the value changes
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  // State to store the value
  const [storedValue, setStoredValue] = useState<T>(() => {
    // SSR guard: return initialValue on server
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      // Get from localStorage by key
      const item = window.localStorage.getItem(key);
      // Parse stored JSON or return initialValue if null
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error reading localStorage, log warning and return initialValue
      console.warn(
        `Error reading localStorage key "${key}":`,
        error
      );
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value;

      // Save state
      setStoredValue(valueToStore);

      // Save to localStorage (client-side only)
      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // If error writing to localStorage, log warning
      console.warn(
        `Error setting localStorage key "${key}":`,
        error
      );
    }
  };

  return [storedValue, setValue];
}
