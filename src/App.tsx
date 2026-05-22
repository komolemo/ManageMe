import { useState, type ReactElement } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProjectListPage } from "@/pages/ProjectListPage";
import { ProjectPage } from "@/pages/ProjectPage";
import { ProjectWikiListPage } from "@/pages/ProjectWikiListPage";
import { ProjectWikiPage } from "@/pages/ProjectWikiPage";
import { SearchPage } from "@/pages/SearchPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { TaskWikiPage } from "@/pages/TaskWikiPage";
import type { PageKey } from "@/pages/pageTypes";

function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>("projects");
  const [searchQuery, setSearchQuery] = useState("");

  const pages: Record<PageKey, ReactElement> = {
    search: <SearchPage initialQuery={searchQuery} />,
    projects: <ProjectListPage />,
    project: <ProjectPage />,
    projectWikiList: <ProjectWikiListPage />,
    projectWiki: <ProjectWikiPage />,
    taskWiki: <TaskWikiPage />,
    settings: <SettingsPage />,
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage("search");
  };

  return (
    <AppLayout
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      onSearch={handleSearch}
    >
      {pages[currentPage]}
    </AppLayout>
  );
}

export default App;
