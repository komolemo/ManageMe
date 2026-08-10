import { useEffect, useMemo, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout } from "@/layout/AppLayout";
import { ProjectListPage } from "@/pages/WorkspaceListPage/ProjectListPage";
import { ProjectPage } from "@/pages/ProjectPage/ProjectPage";
import { useSettings } from "@/hooks/useSettings";
import { applyTheme } from "@/lib/theme";
import { ProjectSettingsPage } from "@/pages/ProjectSettingsPage/ProjectSettingsPage";
import { LibraryPage } from "@/pages/WorkspaceListPage/LibraryListPage";
import { DocumentPage } from "@/pages/DocumentPage/DocumentPage";
import { SearchPage } from "@/pages/Search/SearchPage";
import { SearchResult } from "@/pages/Search/SearchResult";
import { SettingsPage } from "@/pages/SettingsPage/SettingsPage";
import { TagSetting } from "@/pages/TagsManager/TagSetting";
import { TagsManager } from "@/pages/TagsManager/TagsManager";
import { TaskDocumentPage } from "@/pages/TaskDocumentPage";
import { TopPage } from "@/pages/TopPage";
import { DictionaryPage } from "@/pages/DictionaryPage";
import type { PageKey } from "@/pages/pageTypes";
import { TabPageHistoryProvider } from "@/components/app/TabPageHistoryContext";
import type { ProjectTask } from "@/features/task/projectTypes";
import { useAppTabs } from "@/hooks/useAppTabs";
import { useProjectStructure } from "@/hooks/useProjectStructure";
import type { Workspace } from "@/features/workspace/types";
import type { DocumentRecord } from "@/features/document/types";
import { documentApi } from "@/features/document/documentApi";
import { searchLogApi } from "@/features/search/searchLogApi";
import { taskApi } from "@/features/task/taskApi";

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
  const { t, i18n } = useTranslation();
  const pageTitles = useMemo(
    () => Object.fromEntries(
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
  const theme = useSettings((state) => state.theme);
  const zoomLevel = useSettings((state) => state.zoomLevel);
  const setProjectViewMode = useSettings((state) => state.setProjectViewMode);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.style.zoom = `${zoomLevel}%`;
    return () => {
      document.documentElement.style.zoom = "";
    };
  }, [zoomLevel]);
  const currentPage = activeTab.page;
  const {
    addBucket: addProjectBucket,
    addMilestone: addProjectMilestone,
    buckets: sortedProjectBuckets,
    deleteBucket: deleteProjectBucket,
    deleteMilestone: deleteProjectMilestone,
    milestones: projectMilestones,
    projectTasks,
    renameBucket: renameProjectBucket,
    renameMilestone: renameProjectMilestone,
    reorderBucket: reorderProjectBucket,
    reorderMilestone: reorderProjectMilestone,
    setProjectTasks,
    updateBucketStatus: updateProjectBucketStatus,
  } = useProjectStructure({ workspaceId: activeTab.workspaceId });

  const navigateToPage = (page: PageKey) => {
    updateActiveTab({
      page,
      title: pageTitles[page],
      workspaceId: activeTab.workspaceId,
    });
  };

  const openPageInNewTab = (page: PageKey) => {
    addTab({
      page,
      title: pageTitles[page],
      workspaceId: activeTab.workspaceId,
    });
  };

  const navigateToWorkspacePage = (page: PageKey, workspace: Workspace) => {
    updateActiveTab({
      page,
      title: workspace.name,
      workspaceId: workspace.workspaceId,
    });
  };

  const openWorkspacePageInNewTab = (
    page: PageKey,
    workspace: Workspace,
  ) => {
    addTab({
      page,
      title: workspace.name,
      workspaceId: workspace.workspaceId,
    });
  };

  const navigateToTag = (tagId: string) => {
    updateActiveTab({
      page: "tagSetting",
      tagId,
      title: pageTitles.tagSetting,
    });
  };

  const openTagInNewTab = (tagId: string) => {
    addTab({
      page: "tagSetting",
      tagId,
      title: pageTitles.tagSetting,
    });
  };

  const navigateToDocument = (documentTitle: string) => {
    updateActiveTab({
      page: "projectDocument",
      title: documentTitle,
      documentTitle,
    });
  };

  const openDocumentInNewTab = (documentTitle: string) => {
    addTab({
      page: "projectDocument",
      title: documentTitle,
      documentTitle,
    });
  };

  const navigateToLibraryDocument = (workspace: Workspace) => {
    updateActiveTab({
      documentId: workspace.workspaceId,
      documentTitle: workspace.name,
      page: "projectDocument",
      title: workspace.name,
      workspaceId: workspace.workspaceId,
    });
  };

  const openLibraryDocumentInNewTab = (workspace: Workspace) => {
    addTab({
      documentId: workspace.workspaceId,
      documentTitle: workspace.name,
      page: "projectDocument",
      title: workspace.name,
      workspaceId: workspace.workspaceId,
    });
  };

  const navigateToDocumentRecord = (document: DocumentRecord) => {
    updateActiveTab({
      documentId: document.documentId,
      documentTitle: document.title,
      page: "projectDocument",
      title: document.title,
      workspaceId: document.workspaceId,
    });
  };

  const openDocumentRecordInNewTab = (document: DocumentRecord) => {
    addTab({
      documentId: document.documentId,
      documentTitle: document.title,
      page: "projectDocument",
      title: document.title,
      workspaceId: document.workspaceId,
    });
  };

  const openTaskDocumentInNewTab = (
    task: ProjectTask,
    activateTab = true,
  ) => {
    addTab({
      page: "projectDocument",
      taskId: task.id,
      title: task.subject,
      documentTitle: task.subject,
    }, activateTab);
  };

  const navigateToTaskDocument = (task: ProjectTask) => {
    updateActiveTab({
      page: "projectDocument",
      taskId: task.id,
      title: task.subject,
      documentTitle: task.subject,
    });
  };

  const handleSearch = (query: string) => {
    void searchLogApi.createWord(query).catch(() => undefined);
    updateActiveTab({
      page: "searchResult",
      searchQuery: query,
      title: pageTitles.searchResult,
      workspaceId: activeTab.workspaceId,
    });
  };

  const openSearchDocument = (documentId: string) => {
    void searchLogApi.createDocument(documentId).catch(() => undefined);
    void documentApi
      .getById(documentId)
      .then((document) => {
        if (document) {
          navigateToDocumentRecord(document);
        }
      })
      .catch(() => undefined);
  };

  const openSearchTask = (taskId: string) => {
    void searchLogApi.createTask(taskId).catch(() => undefined);
    void taskApi
      .getById(taskId)
      .then((task) => {
        const numericTaskId = task ? Number(task.taskId) : Number.NaN;
        if (task && Number.isSafeInteger(numericTaskId)) {
          updateActiveTab({
            documentTitle: task.title,
            page: "projectDocument",
            taskId: numericTaskId,
            title: task.title,
            workspaceId: task.workspaceId,
          });
        }
      })
      .catch(() => undefined);
  };

  const pages: Record<PageKey, ReactElement> = {
    top: (
      <TopPage
        onNavigate={navigateToPage}
        onOpenDocument={openSearchDocument}
        onOpenProject={(workspace) =>
          navigateToWorkspacePage("project", workspace)
        }
        onOpenProjectInNewTab={(workspace) =>
          openWorkspacePageInNewTab("project", workspace)
        }
        onOpenTask={openSearchTask}
      />
    ),
    search: (
      <SearchPage
        initialQuery={activeTab.searchQuery ?? ""}
        onOpenDocument={openSearchDocument}
        onOpenTask={openSearchTask}
        onSearch={handleSearch}
        workspaceId={activeTab.workspaceId}
      />
    ),
    searchResult: (
      <SearchResult
        onOpenDocument={openSearchDocument}
        onOpenTask={openSearchTask}
        query={activeTab.searchQuery ?? ""}
      />
    ),
    projects: (
      <ProjectListPage
        activeWorkspaceId={activeTab.workspaceId}
        onNavigate={navigateToWorkspacePage}
        onOpenInNewTab={openWorkspacePageInNewTab}
      />
    ),
    project: (
      <ProjectPage
        buckets={sortedProjectBuckets}
        milestones={projectMilestones}
        onNavigate={navigateToPage}
        onOpenInNewTab={openPageInNewTab}
        onOpenProject={(workspace) =>
          navigateToWorkspacePage("project", workspace)
        }
        onOpenProjectInNewTab={(workspace) =>
          openWorkspacePageInNewTab("project", workspace)
        }
        onOpenTaskInNewTab={openTaskDocumentInNewTab}
        onSearchTag={handleSearch}
        projectTasks={projectTasks}
        setViewMode={setProjectViewMode}
        setProjectTasks={setProjectTasks}
        viewMode={projectViewMode}
        workspaceId={activeTab.workspaceId}
      />
    ),
    projectSettings: (
      <ProjectSettingsPage
        buckets={sortedProjectBuckets}
        milestones={projectMilestones}
        onAddBucket={addProjectBucket}
        onAddMilestone={addProjectMilestone}
        onDeleteBucket={deleteProjectBucket}
        onDeleteMilestone={deleteProjectMilestone}
        onNavigate={navigateToPage}
        onOpenProject={(workspace) =>
          navigateToWorkspacePage("project", workspace)
        }
        onOpenProjectInNewTab={(workspace) =>
          openWorkspacePageInNewTab("project", workspace)
        }
        onRenameBucket={renameProjectBucket}
        onRenameMilestone={renameProjectMilestone}
        onReorderBucket={reorderProjectBucket}
        onReorderMilestone={reorderProjectMilestone}
        onUpdateBucketStatus={updateProjectBucketStatus}
        workspaceId={activeTab.workspaceId}
      />
    ),
    library: (
      <LibraryPage
        onOpenDocument={navigateToLibraryDocument}
        onOpenDocumentInNewTab={openLibraryDocumentInNewTab}
      />
    ),
    projectDocument: (
      <DocumentPage
        documentId={activeTab.documentId}
        documentTitle={activeTab.documentTitle}
        onOpenDocument={navigateToDocumentRecord}
        onOpenDocumentInNewTab={openDocumentRecordInNewTab}
        onOpenTask={navigateToTaskDocument}
        onOpenTaskInNewTab={(task) =>
          openTaskDocumentInNewTab(task, false)
        }
        taskId={
          activeTab.taskId ??
          projectTasks.find((task) => task.subject === activeTab.documentTitle)?.id
        }
        projectTasks={projectTasks}
        workspaceId={activeTab.workspaceId}
      />
    ),
    taskDocument: <TaskDocumentPage />,
    tags: (
      <TagsManager
        onOpenTagInNewTab={openTagInNewTab}
        onSelectTag={navigateToTag}
      />
    ),
    tagSetting: (
      <TagSetting
        tagId={activeTab.tagId ?? ""}
        onBack={() => navigateToPage("tags")}
        onBackInNewTab={() => openPageInNewTab("tags")}
      />
    ),
    dictionary: <DictionaryPage />,
    settings: (
      <SettingsPage
        onNavigate={navigateToPage}
        onOpenInNewTab={openPageInNewTab}
      />
    ),
  };

  return (
    <TabPageHistoryProvider
      canGoBack={activeTab.historyIndex > 0}
      canGoForward={activeTab.historyIndex < activeTab.history.length - 1}
      goBack={() => moveActiveTabHistory(-1)}
      goForward={() => moveActiveTabHistory(1)}
    >
      <AppLayout
        activeTabId={activeTabId}
        currentPage={currentPage}
        onCloseTab={closeTab}
        onNavigate={navigateToPage}
        onOpenInNewTab={openPageInNewTab}
        onOpenDocument={navigateToDocument}
        onOpenDocumentInNewTab={openDocumentInNewTab}
        onOpenSearchDocument={openSearchDocument}
        onOpenSearchTask={openSearchTask}
        onSearch={handleSearch}
        onSelectTab={setActiveTabId}
        tabs={tabs}
        workspaceId={activeTab.workspaceId}
      >
        {pages[currentPage]}
      </AppLayout>
    </TabPageHistoryProvider>
  );
}

export default App;
