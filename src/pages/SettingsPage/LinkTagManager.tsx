import type { MouseEvent } from "react";
import { Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PlainIconTextItem } from "@/components/app/IconTextItem";
import { Button } from "@/components/ui/button";
import type { PageKey } from "@/pages/pageTypes";

export type SettingsButtonProps = {
  onNavigate: (page: PageKey) => void;
  onOpenInNewTab: (page: PageKey) => void;
};

export function LinkTagManager({
  onNavigate,
  onOpenInNewTab,
}: SettingsButtonProps) {
  const { t } = useTranslation();
  const openTagsInNewTab = (event: MouseEvent<HTMLButtonElement>) => {
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
      onAuxClick={openTagsInNewTab}
      onClick={() => onNavigate("tags")}
      size="icon-sm"
      type="button"
    >
      <PlainIconTextItem
        icon={<Tag className="size-6" />}
        text={t("settings.tagManager")}
      />
    </Button>
  );
}
