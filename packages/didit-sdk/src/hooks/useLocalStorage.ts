import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from 'react';

export default function useLocalStorage<T>(
  key: string,
  defaultValue?: T
): [T | undefined, Dispatch<SetStateAction<T>>, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState(() => {
    let currentValue;

    if (typeof window === 'undefined') {
      return defaultValue;
    }

    try {
      currentValue = localStorage.getItem(key);
      return currentValue ? (parseJSON(currentValue) as T) : defaultValue;
    } catch (error) {
      console.error(error);
      return defaultValue;
    }
  });

  const setItem = useCallback(
    (_value: any) => {
      if (_value === undefined || _value === null) {
        setValue(undefined);
        localStorage.removeItem(key);
      }
      setValue(_value);
      if (typeof window !== 'undefined') {
        try {
          window.localStorage.setItem(key, JSON.stringify(_value));
        } catch (error) {
          console.error(error);
        }
      }
    },
    [key]
  );

  const removeItem = useCallback(() => {
    localStorage.removeItem(key);
  }, [key]);

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setItem, removeItem];
}

// A wrapper for "JSON.parse()"" to support "undefined" value
function parseJSON<T>(value: string | null): T | undefined {
  try {
    return value === 'undefined' ? undefined : JSON.parse(value ?? '');
  } catch {
    console.warn('parsing error on', { value });
    return undefined;
  }
}
