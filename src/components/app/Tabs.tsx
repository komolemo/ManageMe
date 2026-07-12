import { Plus, X, BotMessageSquare } from "lucide-react";
import type { PageKey } from "@/pages/pageTypes";

export type AppTab = {
  id: string;
  page: PageKey;
  title: string;
};

type TabsProps = {
  activeTabId: string;
  onCloseTab: (tabId: string) => void;
  onCreateTab: () => void;
  onOpenAIChat: () => void;
  onSelectTab: (tabId: string) => void;
  tabs: AppTab[];
};

export function Tabs({
  activeTabId,
  onCloseTab,
  onCreateTab,
  onOpenAIChat,
  onSelectTab,
  tabs,
}: TabsProps) {
  return (
    <div
      aria-label="Open pages"
      className="flex min-h-[32px] shrink-0 items-end overflow-x-auto border-b-0 bg-muted/30"
      role="tablist"
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;

        return (
          <div
            className={`
              group flex h-[32px] min-w-[120px] max-w-[220px] items-center
              animate-in fade-in-0 slide-in-from-left-2 duration-200 ease-out
              pl-[8px] pr-[4px] text-xs motion-reduce:animate-none
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
            <button
              aria-label={`Close ${tab.title}`}
              className="
                grid size-[20px] shrink-0 place-items-center border-0
                bg-transparent p-[0px] text-current opacity-60 hover:opacity-100
                disabled:pointer-events-none disabled:opacity-20
              "
              disabled={tabs.length === 1}
              onClick={(event) => {
                event.stopPropagation();
                onCloseTab(tab.id);
              }}
              type="button"
            >
              <X size={20} />
            </button>
          </div>
        );
      })}
      <button
        aria-label="New tab"
        className="
          grid h-[32px] w-[32px] shrink-0 place-items-center border-0
          bg-tab-background p-[0px] text-muted-foreground hover:bg-background/70
          hover:text-foreground
        "
        onClick={onCreateTab}
        type="button"
      >
        <Plus size={18} />
      </button>
      <div
        aria-hidden="true"
        className="h-[32px] min-w-[32px] flex-1 bg-tab-background"
      ></div>
      <button
        aria-label="AI Chat"
        className="
          grid h-[32px] w-[32px] shrink-0 place-items-center border-0
          bg-tab-background p-[0px] text-muted-foreground hover:bg-background/70
          hover:text-foreground
        "
        onClick={onOpenAIChat}
        type="button"
      >
        <BotMessageSquare size={24} />
      </button>
    </div>
  );
}
