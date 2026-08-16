import { Plus } from "lucide-react";
import { XButton } from "@/components/app/XButton";
import { Button } from "@/components/ui/button";
import type { PageKey } from "@/pages/pageTypes";
import { useTranslation } from "react-i18next";

export type AppTab = {
  id: string;
  page: PageKey;
  title: string;
};

type TabsProps = {
  activeTabId: string;
  onCloseTab: (tabId: string) => void;
  onCreateTab: () => void;
  onSelectTab: (tabId: string) => void;
  tabs: AppTab[];
};

export function Tabs({
  activeTabId,
  onCloseTab,
  onCreateTab,
  onSelectTab,
  tabs,
}: TabsProps) {
  const { t } = useTranslation();
  return (
    <div
      aria-label={t("a11y.openPages")}
      className="flex min-h-[32px] min-w-0 items-center flex-1 overflow-x-hidden border-b-0 bg-mduted/30"
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        return (
          <div
            className={`
              group flex h-[32px] min-w-[120px] max-w-[220px] items-center rounded-t-md
              animate-in fade-in-0 slide-in-from-left-2 duration-200 ease-out
              pl-2 pr-1 text-xs motion-reduce:animate-none
              ${
                isActive
                  ? "bg-tab-primary text-foreground border-b-0"
                  : "bg-tab-secondary text-muted-foreground hover:bg-background/70 hover:text-foreground border-r-1 border-tab-background"
              }
            `}
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            role="presentation"
          >
            <button
              aria-selected={isActive}
              className="min-w-0 flex-1 border-0 bg-transparent p-[0px] text-left text-current"
              role="tab"
              type="button"
            >
              <span className="block min-w-0 truncate">{tab.title}</span>
            </button>
            <XButton
              label={t("a11y.closeTab", { tabTitle: tab.title })}
              className={`
                grid size-[20px] shrink-0 place-items-center rounded-sm border-0
                bg-transparent p-0 hover:opacity-100
                disabled:pointer-events-none disabled:opacity-20
                ${
                  isActive
                    ? "text-foreground opacity-100 hover:bg-white/20"
                    : "text-current opacity-60 hover:bg-foreground/10"
                }
              `}
              disabled={tabs.length === 1}
              onClick={(event) => {
                event.stopPropagation();
                onCloseTab(tab.id);
              }}
            />
          </div>
        );
      })}
      <Button
        aria-label={t("a11y.newTab")}
        className="w-8 rounded-full px-0"
        onClick={onCreateTab}
        type="button"
        variant="ghost"
      >
        <Plus className="size-4" />
      </Button>
      <div
        aria-hidden="true"
        className="h-[32px] min-w-[32px] flex-1 bg-tab-backgrofund"
      ></div>
    </div>
  );
}
