import { useEffect, useState } from "react";
import { SunMoon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  applyTheme,
  getPreferredTheme,
  themeStorageKey,
  type Theme,
} from "@/lib/theme";
import { PageShell } from "@/pages/PageShell";

export function SettingsPage() {
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
      <div className="grid max-w-xl gap-4">
        <div className="flex items-center justify-between border p-[12px]">
          <span className="flex items-center gap-2 text-sm font-medium">
            <SunMoon className="size-4" />
            Dark / Light Mode
          </span>
          <button
            aria-checked={isDarkMode}
            aria-label="Dark / Light Mode"
            className={`
              flex h-[24px] w-[44px] rounded-full items-center border p-[2px] transition-colors
              ${isDarkMode
                ? "border-primary bg-primary"
                : "border-input bg-white"
              }
            `}
            onClick={() => setTheme(isDarkMode ? "light" : "dark")}
            role="switch"
            type="button"
          >
            <span
              className={`block size-[18px] rounded-full bg-background transition-transform ${
                isDarkMode ? "translate-x-[20px]" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        <div className="grid gap-2">
          <label className="text-xs font-medium">Zoom In / Out</label>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon-sm">
              -
            </Button>
            <Input value="100%" readOnly className="text-center" />
            <Button variant="outline" size="icon-sm">
              +
            </Button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
