import type { MouseEvent } from "react";
import { Ellipsis, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSettings } from "@/hooks/useSettings";
import type { PageKey } from "@/pages/pageTypes";
import { ThemeSetting, ZoomSetting } from "@/pages/SettingsPage/SettingsPage";

export type SettingsButtonProps = {
  onNavigate: (page: PageKey) => void;
  onOpenInNewTab: (page: PageKey) => void;
};

export function SettingsButton({
  onNavigate,
  onOpenInNewTab,
}: SettingsButtonProps) {
  const { t } = useTranslation();
  const theme = useSettings((state) => state.theme);
  const setTheme = useSettings((state) => state.setTheme);
  const openSettingsInNewTab = (event: MouseEvent<HTMLElement>) => {
    if (event.button !== 1) {
      return;
    }

    event.preventDefault();
    onOpenInNewTab("settings");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          aria-label={t("header.settings")}
          className="border-0 bg-transparent text-foreground rounded-full w-8 h-8 hover:bg-muted hover:text-foreground dark:bg-transparent dark:hover:bg-muted"
          onAuxClick={openSettingsInNewTab}
          size="icon-sm"
          type="button"
          variant="outline"
        >
          <Ellipsis className="size-4 text-current" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64 rounded-lg p-1 mr-1" sideOffset={6}>
        <DropdownMenuLabel className="font-semibold text-foreground">{t("settings.quickMenu")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid gap-3 px-2 py-2" onKeyDown={(event) => event.stopPropagation()}>
          <ThemeSetting isDarkMode={theme === "dark"} setTheme={setTheme} />
          <ZoomSetting />
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onAuxClick={openSettingsInNewTab} onSelect={() => onNavigate("settings")}>
          <Settings className="size-4" />
          {t("settings.openSettings")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
