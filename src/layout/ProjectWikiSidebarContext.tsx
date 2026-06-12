import { createContext, useContext, type ReactNode } from "react";

type ProjectWikiSidebarContextValue = {
  isOpen: boolean;
  onToggle: () => void;
};

const ProjectWikiSidebarContext =
  createContext<ProjectWikiSidebarContextValue | null>(null);

export function ProjectWikiSidebarProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: ProjectWikiSidebarContextValue;
}) {
  return (
    <ProjectWikiSidebarContext.Provider value={value}>
      {children}
    </ProjectWikiSidebarContext.Provider>
  );
}

export function useProjectWikiSidebar() {
  return useContext(ProjectWikiSidebarContext);
}
