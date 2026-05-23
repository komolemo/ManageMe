import { useState, type ReactElement } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
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

  const pages: Record<PageKey, ReactElement> = {
    search: <SearchPage initialQuery={searchQuery} />,
    projects: <ProjectListPage onNavigate={setCurrentPage} />,
    project: <ProjectPage />,
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
