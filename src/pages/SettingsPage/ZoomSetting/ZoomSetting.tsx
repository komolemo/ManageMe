import { ZoomIn } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PlainIconTextItem } from "@/components/app/IconTextItem";
import { ZoomButton } from "@/pages/SettingsPage/ZoomSetting/ZoomButton";

export function ZoomSetting() {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-between border-0 gap-[8px]">
      <PlainIconTextItem
        icon={<ZoomIn className="size-6" />}
        text={t("settings.zoom")}
      />
      <ZoomButton />
    </div>
  );
}
