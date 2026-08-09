import { useEffect } from "react";
import { Languages } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PlainIconTextItem } from "@/components/app/IconTextItem";
import { useSettings, type AppLanguage } from "@/hooks/useSettings";
import i18n, { resolveLanguage } from "@/i18n";

export function LanguageSetting() {
  const { t } = useTranslation();
  const language = useSettings((state) => state.language);
  const setLanguage = useSettings((state) => state.setLanguage);

  useEffect(() => {
    void i18n.changeLanguage(resolveLanguage(language));
  }, [language]);

  return (
    <label className="flex items-center justify-between gap-[8px] text-base font-medium">
      <PlainIconTextItem
        icon={<Languages className="size-6" />}
        text={t("settings.language")}
      />
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
