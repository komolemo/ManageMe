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
};

export function AppLayout({ children, currentPage, onNavigate }: AppLayoutProps) {
  const [isProjectWikiSidebarOpen, setIsProjectWikiSidebarOpen] = useState(true);
  const showsProjectWikiSidebar =
    currentPage === "projectWikiList" || currentPage === "projectWiki";
  const toggleProjectWikiSidebar = () =>
    setIsProjectWikiSidebarOpen((isOpen) => !isOpen);
  const pageContent = (
    <main className="box-border min-w-0 flex-1">
      <div className="mx-auto w-full max-w-6xl">{children}</div>
    </main>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader onNavigate={onNavigate} />
      <div className="flex min-h-[calc(100vh-56px)]">
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
