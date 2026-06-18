import type { ReactNode } from "react";
import { X } from "lucide-react";
import { usePersistentBooleanState } from "@/hooks/usePersistentBooleanState";
import { AppHeader } from "@/layout/AppHeader";
import { AppSidebar } from "@/layout/AppSidebar";
import { DetailSidebar } from "@/layout/DetailSidebar";
import { DetailSidebarProvider } from "@/layout/DetailSidebarContext";
import type { PageKey } from "@/pages/pageTypes";

export type AppTab = {
  id: string;
  page: PageKey;
  title: string;
};

type AppLayoutProps = {
  activeTabId: string;
  children: ReactNode;
  currentPage: PageKey;
  onCloseTab: (tabId: string) => void;
  onOpenInNewTab: (page: PageKey) => void;
  onNavigate: (page: PageKey) => void;
  onOpenWiki: (wikiTitle: string) => void;
  onOpenWikiInNewTab: (wikiTitle: string) => void;
  onSearch: (query: string) => void;
  onSelectTab: (tabId: string) => void;
  tabs: AppTab[];
};

const headerSearchSuggestionsByPage: Record<PageKey, boolean> = {
  search: false,
  searchResult: false,
  projects: true,
  project: true,
  projectWikiList: true,
  projectWiki: true,
  taskWiki: true,
  tags: true,
  tagSetting: true,
  settings: false,
};

export function AppLayout({
  activeTabId,
  children,
  currentPage,
  onCloseTab,
  onOpenInNewTab,
  onNavigate,
  onOpenWiki,
  onOpenWikiInNewTab,
  onSearch,
  onSelectTab,
  tabs,
}: AppLayoutProps) {
  const [isDetailSidebarOpen, setIsDetailSidebarOpen] =
    usePersistentBooleanState("manage-me:detail-sidebar-open", true);
  const showsDetailSidebar =
    currentPage === "projectWikiList" || currentPage === "projectWiki";
  const toggleDetailSidebar = () =>
    setIsDetailSidebarOpen((isOpen) => !isOpen);

  const pageContent = (
    <main data-slot="app-main" className="box-border min-h-0 min-w-0 flex-1 overflow-hidden transition-opacity duration-100">
      <div className="flex h-full min-h-0 flex-col">
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
                  pl-[8px] pr-[4px] text-xs
                  ${
                    isActive
                      ? "bg-tab-primary text-foreground border-b-0"
                      : "bg-tab-secondary text-muted-foreground hover:bg-background/70 hover:text-foreground border-r-1 border-tab-background"
                  }
                `}
                key={tab.id}
                role="presentation"
              >
                <button
                  aria-selected={isActive}
                  className="min-w-0 flex-1 border-0 bg-transparent p-[0px] text-left text-current"
                  onClick={() => onSelectTab(tab.id)}
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
                  onClick={() => onCloseTab(tab.id)}
                  type="button"
                >
                  <X size={20} />
                </button>
              </div>
            );
          })}
          <div aria-hidden="true" className="h-[32px] flex-1 bg-tab-background"></div>
        </div>
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <DetailSidebar
            isOpen={isDetailSidebarOpen}
          />
          <div className="mx-auto h-full w-full max-w-6xl overflow-hidden">{children}</div>
        </div>
      </div>
    </main>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
      <AppHeader
        onNavigate={onNavigate}
        onOpenInNewTab={onOpenInNewTab}
        onSearch={onSearch}
        showSearchSuggestions={headerSearchSuggestionsByPage[currentPage]}
      />
      <div className="flex h-[calc(100vh-48px)] min-h-0 min-w-0 overflow-hidden">
        <AppSidebar
          onNavigate={onNavigate}
          onOpenInNewTab={onOpenInNewTab}
          onOpenWiki={onOpenWiki}
          onOpenWikiInNewTab={onOpenWikiInNewTab}
        />
        {showsDetailSidebar ? (
          <DetailSidebarProvider
            value={{
              isOpen: isDetailSidebarOpen,
              onToggle: toggleDetailSidebar,
            }}
          >
            {pageContent}
          </DetailSidebarProvider>
        ) : (
          pageContent
        )}
      </div>
    </div>
  );
}
