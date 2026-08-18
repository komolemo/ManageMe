import type { ReactNode } from "react";
import { useState } from "react";
import { AIChat } from "@/layout/AIChat";
import { AIChatOpenProvider } from "@/layout/AIChatContext";
import { Tabs } from "@/layout/Tabs";
import type { AppTab } from "@/layout/Tabs";
import { useSettings } from "@/hooks/useSettings";
import { AppSidebar } from "@/layout/AppSidebar/AppSidebar";
import { DetailSidebarProvider } from "@/layout/DetailSidebar/DetailSidebarContext";
import type { DetailSidebarConfig } from "@/layout/DetailSidebar/DetailSidebarContext";
import { AppSearchProvider } from "@/layout/AppSearchContext";
import { TitleBar } from "@/layout/TitleBar";
import type { PageKey } from "@/pages/pageTypes";

export type { AppTab } from "@/layout/Tabs";

type AppLayoutProps = {
  activeTabId: string;
  children: ReactNode;
  currentPage: PageKey;
  onCloseTab: (tabId: string) => void;
  onOpenInNewTab: (page: PageKey) => void;
  onNavigate: (page: PageKey) => void;
  onOpenDocument: (documentTitle: string) => void;
  onOpenDocumentInNewTab: (documentTitle: string) => void;
  onOpenSearchDocument: (documentId: string) => void;
  onOpenSearchTask: (taskId: string) => void;
  onSearch: (query: string) => void;
  onSelectTab: (tabId: string) => void;
  tabs: AppTab[];
};

export function AppLayout({
  activeTabId,
  children,
  onCloseTab,
  onOpenInNewTab,
  onNavigate,
  onOpenDocument,
  onOpenDocumentInNewTab,
  onSearch,
  onSelectTab,
  tabs,
}: AppLayoutProps) {
  const isDetailSidebarOpen = useSettings((state) => state.isDetailSidebarOpen);
  const setIsDetailSidebarOpen = useSettings((state) => state.setIsDetailSidebarOpen);
  const [, setDetailSidebarConfig] =
    useState<DetailSidebarConfig | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const toggleDetailSidebar = () =>
    setIsDetailSidebarOpen((isOpen) => !isOpen);

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
      <TitleBar />
      <DetailSidebarProvider
        value={{
          isOpen: isDetailSidebarOpen,
          onConfigChange: setDetailSidebarConfig,
          onToggle: toggleDetailSidebar,
        }}
      >
        <AppSearchProvider value={onSearch}>
          <AIChatOpenProvider value={() => setIsAIChatOpen(true)}>
            <div className="flex h-full min-h-0 min-w-0 overflow-hidden">
            <AppSidebar
              onNavigate={onNavigate}
              onOpenInNewTab={onOpenInNewTab}
              onOpenDocument={onOpenDocument}
              onOpenDocumentInNewTab={onOpenDocumentInNewTab}
            />
            <main
              data-slot="app-main"
              className="box-border flex min-h-0 min-w-0 flex-1 overflow-hidden bg-header pr-1 pb-1"
            >
              <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col border-shadow-lineshadow-[0_0.3px_0.9px_var(--panel-shadow),0_1.6px_3.6px_var(--panel-shadow)]">
                <div className="flex h-10 min-w-0 shrink-0 gap-1 bg-tab-backgrofund items-end pt-1 pr-36">
                  {/* <DetailSidebarToggle /> */}
                  <Tabs
                    activeTabId={activeTabId}
                    onCloseTab={onCloseTab}
                    onCreateTab={() => onOpenInNewTab("top")}
                    onSelectTab={onSelectTab}
                    tabs={tabs}
                  />
                </div>
                <div className="flex min-h-0 min-w-0 flex-1 overflow-hidden border-x-shadow-line shadow-[-4px_0_4px_-4px_var(--panel-shadow),4px_0_4px_-4px_var(--panel-shadow),0_4px_4px_-4px_var(--panel-shadow)]">
                  <div className="h-full w-full overflow-hidden">{children}</div>
                </div>
              </div>
              {isAIChatOpen ? <div className="w-1 shrink-0" aria-hidden /> : null}
              <AIChat
                isOpen={isAIChatOpen}
                onClose={() => setIsAIChatOpen(false)}
                onOpen={() => setIsAIChatOpen(true)}
              />
            </main>
            </div>
          </AIChatOpenProvider>
        </AppSearchProvider>
      </DetailSidebarProvider>
    </div>
  );
}
