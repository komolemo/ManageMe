import { useState, type ReactElement } from "react";
import { AppLayout } from "@/layout/AppLayout";
import { ProjectListPage } from "@/pages/ProjectListPage";
import { ProjectPage } from "@/pages/ProjectPage";
import { ProjectWikiListPage } from "@/pages/ProjectWikiListPage";
import { ProjectWikiPage } from "@/pages/ProjectWikiPage";
import { SearchPage } from "@/pages/SearchPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { TagSetting } from "@/pages/TagSetting";
import { TagsManager } from "@/pages/TagsManager";
import { TaskWikiPage } from "@/pages/TaskWikiPage";
import type { PageKey } from "@/pages/pageTypes";
import { tags } from "@/pages/tagsData";

function App() {
  const [currentPage, setCurrentPage] = useState<PageKey>("projects");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTagId, setSelectedTagId] = useState(tags[0]?.id ?? "");

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage("search");
  };

  const pages: Record<PageKey, ReactElement> = {
    search: <SearchPage initialQuery={searchQuery} />,
    projects: <ProjectListPage onNavigate={setCurrentPage} />,
    project: <ProjectPage onNavigate={setCurrentPage} onSearchTag={handleSearch} />,
    projectWikiList: <ProjectWikiListPage />,
    projectWiki: <ProjectWikiPage />,
    taskWiki: <TaskWikiPage />,
    tags: (
      <TagsManager
        onSelectTag={(tagId) => {
          setSelectedTagId(tagId);
          setCurrentPage("tagSetting");
        }}
      />
    ),
    tagSetting: (
      <TagSetting
        tagId={selectedTagId}
        onBack={() => setCurrentPage("tags")}
      />
    ),
    settings: <SettingsPage />,
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
