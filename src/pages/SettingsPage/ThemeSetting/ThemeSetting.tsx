import { SunMoon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { HighlightedIconTextItem } from "@/components/app/IconTextItem";
import { ThemeToggle } from "@/pages/SettingsPage/ThemeSetting/ThemeToggle";

export function ThemeSetting() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between border-0 gap-[8px]">
      <HighlightedIconTextItem
        colorScheme="highlight"
        icon={<SunMoon className="size-5 text-white" />}
        text={t("settings.theme")}
      />
      <ThemeToggle />
    </div>
  );
}
