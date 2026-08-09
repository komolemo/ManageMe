import { type Dispatch, type SetStateAction, type MouseEvent, type ReactNode, useEffect, useState } from "react";
import { BookOpen, SunMoon, ZoomIn, Tag, Languages, Settings, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SidebarItem } from "@/components/app/SidebarItem";
import {
  HighlightedIconTextItem,
  PlainIconTextItem,
} from "@/components/app/IconTextItem";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/pages/PageShell";
import type { PageKey } from "@/pages/pageTypes";
import i18n, {
  resolveLanguage,
} from "@/i18n";
import { useSettings, type AppLanguage, type Theme } from "@/hooks/useSettings";
import { ThemeToggle } from "@/pages/SettingsPage/ThemeToggle";
import { ZoomButton } from "@/pages/SettingsPage/ZoomButton";

type SettingsPageProps = {
  onNavigate: (page: PageKey) => void;
  onOpenInNewTab: (page: PageKey) => void;
};

type SettingsCategory = "app" | "management";

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
  const [selectedCategory, setSelectedCategory] = useState<SettingsCategory>("app");

  useEffect(() => {
    void i18n.changeLanguage(resolveLanguage(language));
  }, [language]);

  return (
    <PageShell
      breadcrumbs={[{ label: t("pages.common") }, { label: t("pages.settings") }]}
      detailSidebar={
        <SettingsCategoryList
          onSelect={setSelectedCategory}
          selectedCategory={selectedCategory}
        />
      }
    >
      <div
        className="grid min-h-0 gap-6"
        style={{ marginInline: "auto", width: "min(100%, 520px)" }}
      >
        {selectedCategory === "app" ? (
          <SettingsSection title={t("settings.appSettings")}>
            <ThemeSetting isDarkMode={isDarkMode} setTheme={setTheme} />
            <ZoomSetting />
            <LanguageSetting language={language} setLanguage={setLanguage} />
          </SettingsSection>
        ) : (
          <SettingsSection title={t("settings.administration")}>
            <LinkTagSetting onNavigate={onNavigate} onOpenInNewTab={onOpenInNewTab} />
            <SettingsLink
              icon={<BookOpen className="size-6" />}
              label={t("pages.dictionary")}
              onClick={() => onNavigate("dictionary")}
              onOpenInNewTab={() => onOpenInNewTab("dictionary")}
            />
          </SettingsSection>
        )}
      </div>
    </PageShell>
  );
}

function SettingsCategoryList({ onSelect, selectedCategory }: { onSelect: (category: SettingsCategory) => void; selectedCategory: SettingsCategory }) {
  const { t } = useTranslation();
  const categories = [
    { category: "app" as const, Icon: Settings, label: t("settings.appSettings") },
    { category: "management" as const, Icon: ShieldCheck, label: t("settings.administration") },
  ];

  return (
    <div className="grid gap-2 px-2 py-2">
      {categories.map(({ category, Icon, label }) => (
        <SidebarItem key={category} selected={selectedCategory === category}>
          <button
            className="flex min-w-0 flex-1 items-center gap-1.5 border-0 bg-transparent px-2 py-1.5 text-left text-sm text-current"
            onClick={() => onSelect(category)}
            type="button"
          >
            <Icon className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{label}</span>
          </button>
        </SidebarItem>
      ))}
    </div>
  );
}

function SettingsSection({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="grid gap-3" aria-labelledby={`settings-${title}`}>
      <h2 className="border-b pb-2 text-sm font-semibold text-muted-foreground" id={`settings-${title}`}>
        {title}
      </h2>
      <div className="grid gap-3">{children}</div>
    </section>
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
      <PlainIconTextItem icon={icon} text={label} />
    </Button>
  );
}

type ThemeSettingProps = {
  isDarkMode: boolean;
  setTheme: Dispatch<SetStateAction<Theme>>;
};

export function ThemeSetting({ isDarkMode, setTheme }: ThemeSettingProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between border-0 gap-[8px]">
      <HighlightedIconTextItem
        colorScheme="highlight"
        icon={<SunMoon className="size-5" />}
        text={t("settings.theme")}
      />
      <ThemeToggle isDarkMode={isDarkMode} setTheme={setTheme} />
    </div>
  );
}

export function ZoomSetting() {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between border-0 gap-[8px]">
      <PlainIconTextItem icon={<ZoomIn className="size-6" />} text={t("settings.zoom")} />
      <ZoomButton />
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
      <PlainIconTextItem icon={<Languages className="size-6" />} text={t("settings.language")} />
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
      <PlainIconTextItem icon={<Tag className="size-6" />} text={t("settings.tagManager")} />
    </Button>
  );
}
