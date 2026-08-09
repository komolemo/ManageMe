import { useTranslation } from "react-i18next";

import { ToggleButton } from "@/components/app/ToggleButton";
import { useSettings } from "@/hooks/useSettings";

export function ThemeToggle() {
  const { t } = useTranslation();
  const theme = useSettings((state) => state.theme);
  const setTheme = useSettings((state) => state.setTheme);
  const isDarkMode = theme === "dark";

  return (
    <ToggleButton
      aria-label={t("settings.themeMode")}
      isOn={isDarkMode}
      onClick={() => setTheme(isDarkMode ? "light" : "dark")}
    />
  );
}
