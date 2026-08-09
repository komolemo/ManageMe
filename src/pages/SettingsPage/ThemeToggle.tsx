import type { Dispatch, SetStateAction } from "react";
import { useTranslation } from "react-i18next";

import { ToggleButton } from "@/components/app/ToggleButton";
import type { Theme } from "@/hooks/useSettings";

type ThemeToggleProps = {
  isDarkMode: boolean;
  setTheme: Dispatch<SetStateAction<Theme>>;
};

export function ThemeToggle({ isDarkMode, setTheme }: ThemeToggleProps) {
  const { t } = useTranslation();

  return (
    <ToggleButton
      aria-label={t("settings.themeMode")}
      isOn={isDarkMode}
      onClick={() => setTheme(isDarkMode ? "light" : "dark")}
    />
  );
}
