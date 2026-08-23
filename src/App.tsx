import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TabPageHistoryProvider } from "@/layout/TabHeader/TabPageHistoryContext";
import { useAppAppearance } from "@/hooks/useAppAppearance";
import { useAppNavigation } from "@/hooks/useAppNavigation";
import { useAppTabs } from "@/hooks/useAppTabs";
import { useProjectStructure } from "@/hooks/useProjectStructure";
import { useSearchNavigation } from "@/hooks/useSearchNavigation";
import { useSettings } from "@/hooks/useSettings";
import { AppLayout } from "@/layout/AppLayout";
import { PageRenderer } from "@/pages/PageRenderer";
import type { PageKey } from "@/pages/pageTypes";

const pageTitleKeys: Record<PageKey, string> = {
  top: "pages.top",
  search: "pages.search",
  searchResult: "pages.searchResults",
  projects: "pages.projects",
  project: "pages.project",
  projectSettings: "pages.projectSettings",
  library: "pages.library",
  projectDocument: "pages.document",
  taskDocument: "pages.taskDocument",
  tags: "pages.tags",
  tagSetting: "pages.tagSetting",
  dictionary: "pages.dictionary",
  settings: "pages.settings",
};

function App() {
  useAppAppearance();

  const { t, i18n } = useTranslation();
  const pageTitles = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(pageTitleKeys).map(([page, key]) => [page, t(key)]),
      ) as Record<PageKey, string>,
    [i18n.resolvedLanguage, t],
  );
  const {
    activeTab,
    activeTabId,
    addTab,
    closeTab,
    moveActiveTabHistory,
    setActiveTabId,
    tabs,
    updateActiveTab,
  } = useAppTabs(pageTitles);
  const projectViewMode = useSettings((state) => state.projectViewMode);
  const setProjectViewMode = useSettings((state) => state.setProjectViewMode);
  const projectStructure = useProjectStructure({
    workspaceId: activeTab.workspaceId,
  });
  const navigation = useAppNavigation({
    activeWorkspaceId: activeTab.workspaceId,
    addTab,
    pageTitles,
    updateActiveTab,
  });
  const searchNavigation = useSearchNavigation({
    activeWorkspaceId: activeTab.workspaceId,
    navigateToDocumentRecord: navigation.navigateToDocumentRecord,
    pageTitles,
    updateActiveTab,
  });

  return (
    <TabPageHistoryProvider
      canGoBack={activeTab.historyIndex > 0}
      canGoForward={activeTab.historyIndex < activeTab.history.length - 1}
      goBack={() => moveActiveTabHistory(-1)}
      goForward={() => moveActiveTabHistory(1)}
    >
      <AppLayout
        activeTabId={activeTabId}
        currentPage={activeTab.page}
        onCloseTab={closeTab}
        onNavigate={navigation.navigateToPage}
        onOpenInNewTab={navigation.openPageInNewTab}
        onOpenDocument={navigation.navigateToDocument}
        onOpenDocumentInNewTab={navigation.openDocumentInNewTab}
        onOpenSearchDocument={searchNavigation.openSearchDocument}
        onOpenSearchTask={searchNavigation.openSearchTask}
        onSearch={searchNavigation.handleSearch}
        onSelectTab={setActiveTabId}
        tabs={tabs}
      >
        <PageRenderer
          activeTab={activeTab}
          navigation={navigation}
          projectStructure={projectStructure}
          projectViewMode={projectViewMode}
          searchNavigation={searchNavigation}
          setProjectViewMode={setProjectViewMode}
        />
      </AppLayout>
    </TabPageHistoryProvider>
  );
}

export default App;
