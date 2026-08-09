import type { MouseEvent } from "react";
import { Ellipsis, Minus, Plus, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { ToggleButton } from "@/components/app/ToggleButton";
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
  const zoomLevel = useSettings((state) => state.zoomLevel);
  const setZoomLevel = useSettings((state) => state.setZoomLevel);
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
      <DropdownMenuContent align="start" className="w-64 rounded-sm p-1 mr-1" sideOffset={6}>
        <DropdownMenuLabel className="font-semibold text-foreground">{t("settings.quickMenu")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="grid gap-3 px-2 py-2" onKeyDown={(event) => event.stopPropagation()}>
          <div className="flex items-center justify-between gap-[8px]">
            <span className="text-base font-medium">{t("settings.theme")}</span>
            <ToggleButton
              aria-label={t("settings.themeMode")}
              isOn={theme === "dark"}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            />
          </div>
          <div className="flex items-center justify-between gap-[8px]">
            <span className="text-base font-medium">{t("settings.zoom")}</span>
            <div className="flex items-center gap-[8px]">
              <Button
                aria-label={t("settings.zoomOut")}
                className="border-0 bg-transparent p-[2px] text-foreground hover:bg-muted"
                disabled={zoomLevel <= 50}
                onClick={() => setZoomLevel((value) => value - 10)}
                size="icon-sm"
                type="button"
              >
                <Minus />
              </Button>
              <span className="min-w-[48px] text-center text-base">{zoomLevel}%</span>
              <Button
                aria-label={t("settings.zoomIn")}
                className="border-0 bg-transparent p-[2px] text-foreground hover:bg-muted"
                disabled={zoomLevel >= 200}
                onClick={() => setZoomLevel((value) => value + 10)}
                size="icon-sm"
                type="button"
              >
                <Plus />
              </Button>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
            className="mt-1 rounded-sm"
            onAuxClick={openSettingsInNewTab}
            onSelect={() => onNavigate("settings")}
        >
          <Settings className="size-4" />
          {t("settings.openSettings")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
