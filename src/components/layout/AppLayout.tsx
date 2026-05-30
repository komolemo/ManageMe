import { useState, type ReactNode } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ProjectWikiSidebar } from "@/components/layout/ProjectWikiSidebar";
import { ProjectWikiSidebarProvider } from "@/components/layout/ProjectWikiSidebarContext";
import type { PageKey } from "@/pages/pageTypes";

type AppLayoutProps = {
  children: ReactNode;
  currentPage: PageKey;
  onNavigate: (page: PageKey) => void;
  onSearch: (query: string) => void;
};

const headerSearchSuggestionsByPage: Record<PageKey, boolean> = {
  search: false,
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
  children,
  currentPage,
  onNavigate,
  onSearch,
}: AppLayoutProps) {
  const [isProjectWikiSidebarOpen, setIsProjectWikiSidebarOpen] = useState(true);
  const showsProjectWikiSidebar =
    currentPage === "projectWikiList" || currentPage === "projectWiki";
  const toggleProjectWikiSidebar = () =>
    setIsProjectWikiSidebarOpen((isOpen) => !isOpen);

  const pageContent = (
    <main data-slot="app-main" className="box-border min-h-0 min-w-0 flex-1 overflow-hidden transition-opacity duration-100">
      <div className="mx-auto h-full w-full max-w-6xl overflow-hidden">{children}</div>
    </main>
  );

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground">
      <AppHeader
        onNavigate={onNavigate}
        onSearch={onSearch}
        showSearchSuggestions={headerSearchSuggestionsByPage[currentPage]}
      />
      <div className="flex h-[calc(100vh-48px)] min-h-0 min-w-0 overflow-hidden">
        <AppSidebar
          onNavigate={onNavigate}
        />
        {showsProjectWikiSidebar && (
          <ProjectWikiSidebar
            isOpen={isProjectWikiSidebarOpen}
          />
        )}
        {showsProjectWikiSidebar ? (
          <ProjectWikiSidebarProvider
            value={{
              isOpen: isProjectWikiSidebarOpen,
              onToggle: toggleProjectWikiSidebar,
            }}
          >
            {pageContent}
          </ProjectWikiSidebarProvider>
        ) : (
          pageContent
        )}
      </div>
    </div>
  );
}
