import { useEffect, useState } from "react";

export function usePersistentBooleanState(
  key: string,
  defaultValue: boolean
) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") {
      return defaultValue;
    }

    const savedValue = window.localStorage.getItem(key);

    if (savedValue === null) {
      return defaultValue;
    }

    return savedValue === "true";
  });

  useEffect(() => {
    window.localStorage.setItem(key, String(value));
  }, [key, value]);

  return [value, setValue] as const;
}
