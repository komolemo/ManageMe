import type { ReactNode } from "react";
import { useState } from "react";
import { AIChat, AIChatToggle } from "@/components/app/AIChat";
import { Tabs } from "@/components/app/Tabs";
import type { AppTab } from "@/components/app/Tabs";
import { usePersistentBooleanState } from "@/hooks/usePersistentBooleanState";
import { AppHeader } from "@/layout/AppHeader";
import { AppSidebar } from "@/layout/AppSidebar";
import { DetailSidebar, DetailSidebarToggle } from "@/layout/DetailSidebar";
import { DetailSidebarProvider } from "@/layout/DetailSidebarContext";
import type { DetailSidebarConfig } from "@/layout/DetailSidebarContext";
import type { PageKey } from "@/pages/pageTypes";

export type { AppTab } from "@/components/app/Tabs";

type AppLayoutProps = {
  activeTabId: string;
  children: ReactNode;
  currentPage: PageKey;
  onCloseTab: (tabId: string) => void;
  onOpenInNewTab: (page: PageKey) => void;
  onNavigate: (page: PageKey) => void;
  onOpenDocument: (documentTitle: string) => void;
  onOpenDocumentInNewTab: (documentTitle: string) => void;
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
  projectDocumentList: true,
  projectDocument: true,
  taskDocument: true,
  tags: true,
  tagSetting: true,
  dictionary: true,
  settings: false,
};

export function AppLayout({
  activeTabId,
  children,
  currentPage,
  onCloseTab,
  onOpenInNewTab,
  onNavigate,
  onOpenDocument,
  onOpenDocumentInNewTab,
  onSearch,
  onSelectTab,
  tabs,
}: AppLayoutProps) {
  const [isDetailSidebarOpen, setIsDetailSidebarOpen] =
    usePersistentBooleanState("manage-me:detail-sidebar-open", true);
  const [detailSidebarConfig, setDetailSidebarConfig] =
    useState<DetailSidebarConfig | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(true);
  const toggleDetailSidebar = () =>
    setIsDetailSidebarOpen((isOpen) => !isOpen);

  const pageContent = (
    <main
      data-slot="app-main"
      className="box-border flex min-h-0 min-w-0 flex-1 overflow-hidden bg-header pr-1 pb-1"
    >
      <DetailSidebar
        addLabel={detailSidebarConfig?.addLabel}
        filterLabel={detailSidebarConfig?.filterLabel}
        onAddFile={detailSidebarConfig?.onAddFile}
        onFilterChange={detailSidebarConfig?.onFilterChange}
        onOpenProject={detailSidebarConfig?.onOpenProject}
      >
        {detailSidebarConfig?.children}
      </DetailSidebar>
      {isDetailSidebarOpen ? <div className="w-1 shrink-0" aria-hidden /> : null}
      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col border-shadow-line shadow-[0_0.3px_0.9px_var(--panel-shadow),0_1.6px_3.6px_var(--panel-shadow)]">
        <div className="flex min-w-0 shrink-0 px-1 pt-1 gap-1 bg-tab-background">
          <DetailSidebarToggle />
          <Tabs
            activeTabId={activeTabId}
            onCloseTab={onCloseTab}
            onCreateTab={() => onOpenInNewTab("top")}
            onSelectTab={onSelectTab}
            tabs={tabs}
          />
          <AIChatToggle onOpen={() => setIsAIChatOpen(true)} />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden">
          <div className="h-full w-full max-w-6xl overflow-hidden">{children}</div>
        </div>
      </div>
      {isAIChatOpen ? <div className="w-1 shrink-0" aria-hidden /> : null}
      <AIChat
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        onOpen={() => setIsAIChatOpen(true)}
      />
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
      <div className="flex h-[calc(100vh-40px)] min-h-0 min-w-0 overflow-hidden">
        <AppSidebar
          onNavigate={onNavigate}
          onOpenInNewTab={onOpenInNewTab}
          onOpenDocument={onOpenDocument}
          onOpenDocumentInNewTab={onOpenDocumentInNewTab}
        />
        <DetailSidebarProvider
          value={{
            isOpen: isDetailSidebarOpen,
            onConfigChange: setDetailSidebarConfig,
            onToggle: toggleDetailSidebar,
          }}
        >
          {pageContent}
        </DetailSidebarProvider>
      </div>
    </div>
  );
}
