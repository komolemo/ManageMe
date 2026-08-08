import { type Dispatch, type SetStateAction, type MouseEvent, type ReactNode, useEffect } from "react";
import { BookOpen, Fullscreen, SunMoon, ZoomIn, Plus, Minus, Tag, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ToggleButton } from "@/components/app/ToggleButton";
import { Button } from "@/components/ui/button";
import { applyTheme } from "@/lib/theme";
import { PageShell } from "@/pages/PageShell";
import type { PageKey } from "@/pages/pageTypes";
import i18n, {
  resolveLanguage,
} from "@/i18n";
import { useSettings, type AppLanguage, type Theme } from "@/hooks/useSettings";

type SettingsPageProps = {
  onNavigate: (page: PageKey) => void;
  onOpenInNewTab: (page: PageKey) => void;
};

export function SettingsPage({
  onNavigate,
  onOpenInNewTab,
}: SettingsPageProps) {
  const { t } = useTranslation();
  const theme = useSettings((state) => state.theme);
  const setTheme = useSettings((state) => state.setTheme);
  const language = useSettings((state) => state.language);
  const setLanguage = useSettings((state) => state.setLanguage);
  const isDarkMode = theme === "dark";

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    void i18n.changeLanguage(resolveLanguage(language));
  }, [language]);

  return (
    <PageShell breadcrumbs={[{ label: t("pages.common") }, { label: t("pages.settings") }]}>
      <div
        className="grid min-h-0 gap-[8px]"
        style={{ marginInline: "auto", width: "min(100%, 520px)" }}
      >
        <ThemeToggle isDarkMode={isDarkMode} setTheme={setTheme} />
        <InputZoom />
        <LanguageSetting language={language} setLanguage={setLanguage} />
        <LinkTagSetting
          onNavigate={onNavigate}
          onOpenInNewTab={onOpenInNewTab}
        />
        <SettingsLink
          icon={<BookOpen className="size-6" />}
          label="用語辞典"
          onClick={() => onNavigate("dictionary")}
          onOpenInNewTab={() => onOpenInNewTab("dictionary")}
        />
      </div>
    </PageShell>
  );
}

function SettingsLink({
  icon,
  label,
  onClick,
  onOpenInNewTab,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  onOpenInNewTab: () => void;
}) {
  return (
    <Button
      className="flex items-center justify-start gap-[8px] border-0 bg-transparent px-[2px] py-[4px] text-foreground hover:bg-muted hover:text-foreground dark:bg-transparent dark:hover:bg-muted"
      onAuxClick={(event) => {
        if (event.button === 1) {
          event.preventDefault();
          onOpenInNewTab();
        }
      }}
      onClick={onClick}
      size="icon-sm"
      type="button"
    >
      <span className="flex items-center gap-[8px] text-base font-medium">
        {icon}
        {label}
      </span>
    </Button>
  );
}

type ThemeToggleProps = {
  isDarkMode: boolean;
  setTheme: Dispatch<SetStateAction<Theme>>;
};

function ThemeToggle({ isDarkMode, setTheme }: ThemeToggleProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between border-0 gap-[8px]">
      <span className="flex items-center gap-[8px] text-base font-medium">
        <SunMoon className="size-6" />
        {t("settings.theme")}
      </span>
      <ToggleButton
        aria-label={t("settings.themeMode")}
        isOn={isDarkMode}
        onClick={() => setTheme(isDarkMode ? "light" : "dark")}
      />
    </div>
  );
}

function InputZoom() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between border-0 gap-[8px]">
      <span className="flex items-center gap-[8px] text-base font-medium">
        <ZoomIn className="size-6" />
        {t("settings.zoom")}
      </span>
      <div className="flex items-center gap-[8px]">
        <Button className="border-0 text-foreground bg-transparent hover:bg-muted p-[2px]" size="icon-sm">
          <Minus/>
        </Button>
        <span className="min-w-[48px] text-center text-base">100%</span>
        <Button className="border-0 text-foreground bg-transparent hover:bg-muted p-[2px]" size="icon-sm">
          <Plus/>
        </Button>
        <Button aria-label={t("settings.fullscreen")} className="border-0 text-muted-foreground bg-transparent hover:bg-muted p-[2px]" size="icon-sm">
          <Fullscreen className="size-6" />
        </Button>
      </div>
    </div>
  );
}

type LanguageSettingProps = {
  language: AppLanguage;
  setLanguage: Dispatch<SetStateAction<AppLanguage>>;
};

function LanguageSetting({ language, setLanguage }: LanguageSettingProps) {
  const { t } = useTranslation();

  return (
    <label className="flex items-center justify-between gap-[8px] text-base font-medium">
      <span className="flex items-center gap-[8px]">
        <Languages className="size-6" />
        {t("settings.language")}
      </span>
      <select
        aria-label={t("settings.language")}
        className="h-8 rounded-md border bg-background px-2 text-sm"
        onChange={(event) => setLanguage(event.target.value as AppLanguage)}
        value={language}
      >
        <option value="system">{t("settings.systemDefault")}</option>
        <option value="ja">{t("settings.japanese")}</option>
        <option value="en">{t("settings.english")}</option>
      </select>
    </label>
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
  const { t } = useTranslation();
  const openSettingsInNewTab = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.button !== 1) {
      return;
    }

    event.preventDefault();
    onOpenInNewTab("tags");
  };
  return (
    <Button
      aria-label={t("settings.tagsManager")}
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
      <span className="flex items-center gap-[8px] text-base font-medium">
        <Tag className="size-6" />
        {t("settings.tagManager")}
      </span>
    </Button>
  );
}
