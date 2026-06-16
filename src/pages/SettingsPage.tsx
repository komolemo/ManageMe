import { type Dispatch, type SetStateAction, type MouseEvent, useEffect, useState } from "react";
import { Fullscreen, SunMoon, ZoomIn, Plus, Minus, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  applyTheme,
  getPreferredTheme,
  themeStorageKey,
  type Theme,
} from "@/lib/theme";
import { PageShell } from "@/pages/PageShell";
import type { PageKey } from "@/pages/pageTypes";

type SettingsPageProps = {
  onNavigate: (page: PageKey) => void;
  onOpenInNewTab: (page: PageKey) => void;
};

export function SettingsPage({
  onNavigate,
  onOpenInNewTab,
}: SettingsPageProps) {
  const [theme, setTheme] = useState<Theme>(getPreferredTheme);
  const isDarkMode = theme === "dark";

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  return (
    <PageShell
      badge="Common / Settings"
      title="Settings"
      description="Dark / Light Mode and Zoom In / Out settings."
    >
      <div className="grid max-w-xl gap-[16px]">
        <ThemeToggle isDarkMode={isDarkMode} setTheme={setTheme} />
        <InputZoom />
        <LinkTagSetting
          onNavigate={onNavigate}
          onOpenInNewTab={onOpenInNewTab}
        />
      </div>
    </PageShell>
  );
}

type ThemeToggleProps = {
  isDarkMode: boolean;
  setTheme: Dispatch<SetStateAction<Theme>>;
};

function ThemeToggle({ isDarkMode, setTheme }: ThemeToggleProps) {
  return (
    <div className="flex items-center justify-between border-0 gap-[8px]">
      <span className="flex items-center gap-[8px] text-sm font-medium">
        <SunMoon className="size-4" />
        Theme
      </span>
      <button
        aria-checked={isDarkMode}
        aria-label="Dark / Light Mode"
        className={`
          flex h-[24px] w-[44px] rounded-full items-center border p-[2px] transition-colors
          ${isDarkMode
            ? "bg-toggle-background"
            : "border-input bg-white"
          }
        `}
        onClick={() => setTheme(isDarkMode ? "light" : "dark")}
        role="switch"
        type="button"
      >
        <span
          className={`block size-[18px] rounded-full transition-transform ${
            isDarkMode ? "translate-x-[20px] bg-foreground" : "translate-x-0 bg-background "
          }`}
        />
      </button>
    </div>
  );
}

function InputZoom() {
  return (
    <div className="flex items-center justify-between border-0 gap-[8px]">
      <span className="flex items-center gap-[8px] text-sm font-medium">
        <ZoomIn className="size-4" />
        Zoom
      </span>
      <div className="flex items-center gap-[8px]">
        <Button className="border-0 text-foreground bg-transparent hover:bg-muted p-[2px]" size="icon-sm">
          <Minus/>
        </Button>
        <span className="min-w-[48px] text-center text-sm">100%</span>
        <Button className="border-0 text-foreground bg-transparent hover:bg-muted p-[2px]" size="icon-sm">
          <Plus/>
        </Button>
        <Button aria-label="fullscreen" className="border-0 text-muted-foreground bg-transparent hover:bg-muted p-[2px]" size="icon-sm">
          <Fullscreen className="size-4" />
        </Button>
      </div>
    </div>
  );
}

type SettingsButtonProps = {
  onNavigate: (page: PageKey) => void;
  onOpenInNewTab: (page: PageKey) => void;
};

function LinkTagSetting({
  onNavigate,
  onOpenInNewTab,
}: SettingsButtonProps) {
  const openSettingsInNewTab = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.button !== 1) {
      return;
    }

    event.preventDefault();
    onOpenInNewTab("tags");
  };
  return (
    <Button
      aria-label="Tags Manager"
      className="
        flex items-center justify-start px-[2px] py-[4px] gap-[8px]
        border-0 bg-transparent text-foreground
        hover:bg-muted hover:text-foreground
        dark:bg-transparent dark:hover:bg-muted
      "
      onClick={() => onNavigate("tags")}
      onAuxClick={openSettingsInNewTab}
      size="icon-sm"
      type="button"
    >
      <span className="flex items-center gap-[8px] text-sm font-medium">
        <Tag className="size-4" />
        Tag Manager
      </span>
    </Button>
  );
}
