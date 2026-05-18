import { useState, type ReactElement } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectListPage } from "@/pages/ProjectListPage";
import { ProjectPage } from "@/pages/ProjectPage";
import { ProjectWikiListPage } from "@/pages/ProjectWikiListPage";
import { ProjectWikiPage } from "@/pages/ProjectWikiPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { TaskWikiPage } from "@/pages/TaskWikiPage";
import type { PageKey } from "@/pages/pageTypes";

const pages: Record<PageKey, ReactElement> = {
  projects: <ProjectListPage />,
  project: <ProjectPage />,
  projectWikiList: <ProjectWikiListPage />,
  projectWiki: <ProjectWikiPage />,
  taskWiki: <TaskWikiPage />,
  settings: <SettingsPage />,
};

function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>("projects");

  return (
    <AppLayout currentPage={currentPage} onNavigate={setCurrentPage}>
      {pages[currentPage]}
    </AppLayout>
  );
}

export default App;
