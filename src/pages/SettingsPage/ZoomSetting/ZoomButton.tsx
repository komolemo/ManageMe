import { Minus, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/button";
import { useSettings } from "@/hooks/useSettings";

export function ZoomButton() {
  const { t } = useTranslation();
  const zoomLevel = useSettings((state) => state.zoomLevel);
  const setZoomLevel = useSettings((state) => state.setZoomLevel);

  return (
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
  );
}
