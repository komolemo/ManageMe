import type { MouseEvent } from "react";
import { BookA } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PlainIconTextItem } from "@/components/app/IconTextItem";
import { Button } from "@/components/ui/button";
import type { PageKey } from "@/pages/pageTypes";

type LinkDictionaryProps = {
  onNavigate: (page: PageKey) => void;
  onOpenInNewTab: (page: PageKey) => void;
};

export function LinkDictionary({
  onNavigate,
  onOpenInNewTab,
}: LinkDictionaryProps) {
  const { t } = useTranslation();
  const openDictionaryInNewTab = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.button !== 1) {
      return;
    }

    event.preventDefault();
    onOpenInNewTab("dictionary");
  };

  return (
    <Button
      className="flex items-center justify-start gap-[8px] border-0 bg-transparent px-[2px] py-[4px] text-foreground hover:bg-muted hover:text-foreground dark:bg-transparent dark:hover:bg-muted"
      onAuxClick={openDictionaryInNewTab}
      onClick={() => onNavigate("dictionary")}
      size="icon-sm"
      type="button"
    >
      <PlainIconTextItem
        icon={<BookA className="size-6" />}
        text={t("pages.dictionary")}
      />
    </Button>
  );
}
