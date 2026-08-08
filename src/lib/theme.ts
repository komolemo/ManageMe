import { useSettings, type Theme } from "@/hooks/useSettings";

export type { Theme } from "@/hooks/useSettings";

export function getPreferredTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  return useSettings.getState().theme;
}

export function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}
