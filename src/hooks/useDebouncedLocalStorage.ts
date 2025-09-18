// src/hooks/useDebouncedLocalStorage.ts
import { useState, useEffect, useRef } from 'react';

function useDebouncedLocalStorage<T>(key: string, initialValue: T, delay: number): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Use a ref to hold the timeout ID
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Clear any existing timeout
    if (timeoutIdRef.current) {
      clearTimeout(timeoutIdRef.current);
    }

    // Set a new timeout to save the data after the delay
    timeoutIdRef.current = setTimeout(() => {
      try {
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.error(error);
      }
    }, delay);

    // Cleanup function to clear the timeout if the component unmounts
    return () => {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [key, storedValue, delay]);

  return [storedValue, setStoredValue];
}

export default useDebouncedLocalStorage;