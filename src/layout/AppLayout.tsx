import type { ReactNode } from "react";
import { useState } from "react";
import { AIChat } from "@/components/app/AIChat";
import { Tabs } from "@/components/app/Tabs";
import type { AppTab } from "@/components/app/Tabs";
import { usePersistentBooleanState } from "@/hooks/usePersistentBooleanState";
import { AppHeader } from "@/layout/AppHeader";
import { AppSidebar } from "@/layout/AppSidebar";
import { DetailSidebarProvider } from "@/layout/DetailSidebarContext";
import type { PageKey } from "@/pages/pageTypes";

export type { AppTab } from "@/components/app/Tabs";

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
  top: true,
  search: false,
  searchResult: false,
  projects: true,
  project: true,
  projectSettings: true,
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
  const [isAIChatOpen, setIsAIChatOpen] = useState(true);
  const toggleDetailSidebar = () =>
    setIsDetailSidebarOpen((isOpen) => !isOpen);

  const pageContent = (
    <main data-slot="app-main" className="box-border min-h-0 min-w-0 flex-1 overflow-hidden transition-opacity duration-100">
      <div className="flex h-full min-h-0 flex-col">
        <Tabs
          activeTabId={activeTabId}
          onCloseTab={onCloseTab}
          onCreateTab={() => onOpenInNewTab("top")}
          onOpenAIChat={() => setIsAIChatOpen(true)}
          onSelectTab={onSelectTab}
          tabs={tabs}
        />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="h-full w-full max-w-6xl overflow-hidden">{children}</div>
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
        <DetailSidebarProvider
          value={{
            isOpen: isDetailSidebarOpen,
            onToggle: toggleDetailSidebar,
          }}
        >
          {pageContent}
        </DetailSidebarProvider>
        <AIChat
          isOpen={isAIChatOpen}
          onClose={() => setIsAIChatOpen(false)}
          onOpen={() => setIsAIChatOpen(true)}
        />
      </div>
    </div>
  );
}
