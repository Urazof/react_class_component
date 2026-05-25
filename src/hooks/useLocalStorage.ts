import { useState } from 'react';

function useLocalStorage(
  key: string,
  initialValue: string
): [string, (value: string) => void] {
  const [value, setValue] = useState<string>(
    () => localStorage.getItem(key) ?? initialValue
  );

  const setStoredValue = (newValue: string) => {
    setValue(newValue);
    localStorage.setItem(key, newValue);
  };

  return [value, setStoredValue];
}

export default useLocalStorage;
