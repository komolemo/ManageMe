import { useRef, useState, type ReactElement } from "react";
import { AppLayout, type AppTab } from "@/layout/AppLayout";
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

type OpenTab = AppTab & {
  tagId?: string;
  wikiTitle?: string;
};

const pageTitles: Record<PageKey, string> = {
  search: "Search",
  projects: "Projects",
  project: "Project",
  projectWikiList: "Wiki List",
  projectWiki: "Wiki",
  taskWiki: "Task Wiki",
  tags: "Tags",
  tagSetting: "Tag Setting",
  settings: "Settings",
};

const initialTab: OpenTab = {
  id: "tab-1",
  page: "projects",
  title: pageTitles.projects,
};

function App() {
  const [tabs, setTabs] = useState<OpenTab[]>([initialTab]);
  const [activeTabId, setActiveTabId] = useState(initialTab.id);
  const [searchQuery, setSearchQuery] = useState("");
  const nextTabNumber = useRef(2);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const currentPage = activeTab.page;

  const createTabId = () => {
    const tabId = `tab-${nextTabNumber.current}`;
    nextTabNumber.current += 1;
    return tabId;
  };

  const updateActiveTab = (nextTab: Omit<OpenTab, "id">) => {
    setTabs((currentTabs) => {
      return currentTabs.map((tab) =>
        tab.id === activeTabId ? { id: tab.id, ...nextTab } : tab
      );
    });
  };

  const addTab = (nextTab: Omit<OpenTab, "id">) => {
    const tab = {
      id: createTabId(),
      ...nextTab,
    };

    setTabs((currentTabs) => [...currentTabs, tab]);
    setActiveTabId(tab.id);
  };

  const navigateToPage = (page: PageKey) => {
    updateActiveTab({
      page,
      title: pageTitles[page],
    });
  };

  const openPageInNewTab = (page: PageKey) => {
    addTab({
      page,
      title: pageTitles[page],
    });
  };

  const navigateToTag = (tagId: string) => {
    updateActiveTab({
      page: "tagSetting",
      tagId,
      title: "Tag Setting",
    });
  };

  const openTagInNewTab = (tagId: string) => {
    addTab({
      page: "tagSetting",
      tagId,
      title: "Tag Setting",
    });
  };

  const navigateToWiki = (wikiTitle: string) => {
    updateActiveTab({
      page: "projectWiki",
      title: wikiTitle,
      wikiTitle,
    });
  };

  const openWikiInNewTab = (wikiTitle: string) => {
    addTab({
      page: "projectWiki",
      title: wikiTitle,
      wikiTitle,
    });
  };

  const closeTab = (tabId: string) => {
    if (tabs.length === 1) {
      return;
    }

    const closingTabIndex = tabs.findIndex((tab) => tab.id === tabId);
    const nextTabs = tabs.filter((tab) => tab.id !== tabId);

    if (tabId === activeTabId) {
      const nextActiveTab =
        nextTabs[Math.max(0, closingTabIndex - 1)] ?? nextTabs[0];

      setActiveTabId(nextActiveTab.id);
    }

    setTabs(nextTabs);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    navigateToPage("search");
  };

  const pages: Record<PageKey, ReactElement> = {
    search: <SearchPage initialQuery={searchQuery} />,
    projects: (
      <ProjectListPage
        onNavigate={navigateToPage}
        onOpenInNewTab={openPageInNewTab}
      />
    ),
    project: (
      <ProjectPage
        onNavigate={navigateToPage}
        onOpenInNewTab={openPageInNewTab}
        onSearchTag={handleSearch}
      />
    ),
    projectWikiList: (
      <ProjectWikiListPage
        onOpenWiki={navigateToWiki}
        onOpenWikiInNewTab={openWikiInNewTab}
      />
    ),
    projectWiki: <ProjectWikiPage wikiTitle={activeTab.wikiTitle} />,
    taskWiki: <TaskWikiPage />,
    tags: (
      <TagsManager
        onOpenTagInNewTab={openTagInNewTab}
        onSelectTag={navigateToTag}
      />
    ),
    tagSetting: (
      <TagSetting
        tagId={activeTab.tagId ?? tags[0]?.id ?? ""}
        onBack={() => navigateToPage("tags")}
        onBackInNewTab={() => openPageInNewTab("tags")}
      />
    ),
    settings: <SettingsPage />,
  };

  return (
    <AppLayout
      activeTabId={activeTabId}
      currentPage={currentPage}
      onCloseTab={closeTab}
      onNavigate={navigateToPage}
      onOpenInNewTab={openPageInNewTab}
      onOpenWiki={navigateToWiki}
      onOpenWikiInNewTab={openWikiInNewTab}
      onSearch={handleSearch}
      onSelectTab={setActiveTabId}
      tabs={tabs}
    >
      {pages[currentPage]}
    </AppLayout>
  );
}

export default App;
