import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout, type AppTab } from "@/layout/AppLayout";
import { ProjectListPage } from "@/pages/WorkspaceListPage/ProjectListPage";
import { ProjectPage } from "@/pages/ProjectPage/ProjectPage";
import { useSettings } from "@/hooks/useSettings";
import { applyTheme } from "@/lib/theme";
import { ProjectSettingsPage } from "@/pages/ProjectSettingsPage/ProjectSettingsPage";
import type { DropPosition } from "@/pages/ProjectSettingsPage/useSettingsListDragAndDrop";
import { LibraryPage } from "@/pages/WorkspaceListPage/LibraryListPage";
import { DocumentPage } from "@/pages/DocumentPage/DocumentPage";
import { SearchPage } from "@/pages/Search/SearchPage";
import { SearchResult } from "@/pages/Search/SearchResult";
import { SettingsPage } from "@/pages/SettingsPage/SettingsPage";
import { TagSetting } from "@/pages/TagSetting";
import { TagsManager } from "@/pages/TagsManager";
import { TaskDocumentPage } from "@/pages/TaskDocumentPage";
import { TopPage } from "@/pages/TopPage";
import { DictionaryPage } from "@/pages/DictionaryPage";
import type { PageKey } from "@/pages/pageTypes";
import { TabPageHistoryProvider } from "@/components/app/TabPageHistoryContext";
import {
  type BucketStatus,
  type ProjectBucket,
  type ProjectMilestone,
  type ProjectTask,
} from "@/features/task/projectTypes";
import { useWorkspaceTasks } from "@/hooks/useTasks";
import { useMilestoneStore } from "@/features/milestone/milestoneStore";
import { useBucketStore } from "@/features/bucket/bucketStore";
import type { Workspace } from "@/features/workspace/types";
import type { DocumentRecord } from "@/features/document/types";
import { documentApi } from "@/features/document/documentApi";
import { searchLogApi } from "@/features/search/searchLogApi";
import { taskApi } from "@/features/task/taskApi";

type NavigationEntry = {
  page: PageKey;
  title: string;
  tagId?: string;
  taskId?: ProjectTask["id"];
  documentId?: string;
  documentTitle?: string;
  searchQuery?: string;
  workspaceId?: string;
};

type OpenTab = AppTab &
  NavigationEntry & {
    history: NavigationEntry[];
    historyIndex: number;
  };

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

const initialEntry: NavigationEntry = {
  page: "top",
  title: "TOP",
};

const initialTab: OpenTab = {
  id: "tab-1",
  ...initialEntry,
  history: [initialEntry],
  historyIndex: 0,
};

function mapProjectTasks(
  currentTasks: ProjectTask[],
  updateTask: (task: ProjectTask) => ProjectTask
): ProjectTask[] {
  return currentTasks.map((task) => {
    const nextTask = updateTask(task);

    if (!nextTask.children?.length) {
      return nextTask;
    }

    return {
      ...nextTask,
      children: mapProjectTasks(nextTask.children, updateTask),
    };
  });
}

function hasDuplicateName(
  items: Array<{ id: string; name: string }>,
  name: string,
  ignoredId?: string
) {
  const normalizedName = name.trim().toLowerCase();

  return items.some(
    (item) =>
      item.id !== ignoredId && item.name.trim().toLowerCase() === normalizedName
  );
}

function App() {
  const { t, i18n } = useTranslation();
  const pageTitles = useMemo(
    () => Object.fromEntries(
      Object.entries(pageTitleKeys).map(([page, key]) => [page, t(key)]),
    ) as Record<PageKey, string>,
    [i18n.resolvedLanguage, t],
  );
  const [tabs, setTabs] = useState<OpenTab[]>([initialTab]);
  const [activeTabId, setActiveTabId] = useState(initialTab.id);
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
  const storedBuckets = useBucketStore((state) => state.buckets);
  const loadBuckets = useBucketStore((state) => state.loadBuckets);
  const createBucket = useBucketStore((state) => state.createBucket);
  const updateBucket = useBucketStore((state) => state.updateBucket);
  const reorderBuckets = useBucketStore((state) => state.reorderBuckets);
  const deleteBucket = useBucketStore((state) => state.deleteBucket);
  const storedMilestones = useMilestoneStore((state) => state.milestones);
  const loadMilestones = useMilestoneStore((state) => state.loadMilestones);
  const createMilestone = useMilestoneStore((state) => state.createMilestone);
  const updateMilestone = useMilestoneStore((state) => state.updateMilestone);
  const reorderMilestones = useMilestoneStore(
    (state) => state.reorderMilestones,
  );
  const deleteMilestone = useMilestoneStore((state) => state.deleteMilestone);
  const nextTabNumber = useRef(2);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const currentPage = activeTab.page;
  const projectMilestones = useMemo<ProjectMilestone[]>(
    () =>
      storedMilestones.map((milestone) => ({
        id: milestone.milestoneId,
        name: milestone.name,
      })),
    [storedMilestones],
  );
  const projectBuckets = useMemo<ProjectBucket[]>(
    () =>
      storedBuckets.map((bucket) => ({
        id: bucket.bucketId,
        name: bucket.name,
        order: bucket.displayOrder,
        status: bucket.statusType,
      })),
    [storedBuckets],
  );
  const { projectTasks, setProjectTasks } = useWorkspaceTasks(
    activeTab.workspaceId,
    projectBuckets,
    projectMilestones,
  );

  useEffect(() => {
    if (activeTab.workspaceId) {
      void loadMilestones(activeTab.workspaceId).catch(() => undefined);
      void loadBuckets(activeTab.workspaceId).catch(() => undefined);
    }
  }, [activeTab.workspaceId, loadBuckets, loadMilestones]);

  useEffect(() => {
    setTabs((currentTabs) =>
      currentTabs.map((tab) => {
        const history = tab.history.map((entry) =>
          entry.page === "projectDocument" && entry.documentTitle
            ? entry
            : { ...entry, title: pageTitles[entry.page] },
        );
        const currentEntry = history[tab.historyIndex];

        return {
          id: tab.id,
          ...currentEntry,
          history,
          historyIndex: tab.historyIndex,
        };
      }),
    );
  }, [pageTitles]);
  const sortedProjectBuckets = useMemo(
    () => [...projectBuckets].sort((a, b) => a.order - b.order),
    [projectBuckets]
  );

  const createTabId = () => {
    const tabId = `tab-${nextTabNumber.current}`;
    nextTabNumber.current += 1;
    return tabId;
  };

  const updateActiveTab = (nextEntry: NavigationEntry) => {
    setTabs((currentTabs) => {
      return currentTabs.map((tab) => {
        if (tab.id !== activeTabId) {
          return tab;
        }

        const history = [
          ...tab.history.slice(0, tab.historyIndex + 1),
          nextEntry,
        ];

        return {
          id: tab.id,
          ...nextEntry,
          history,
          historyIndex: history.length - 1,
        };
      });
    });
  };

  const addTab = (
    nextEntry: NavigationEntry,
    activateTab = true,
  ) => {
    const tab = {
      id: createTabId(),
      ...nextEntry,
      history: [nextEntry],
      historyIndex: 0,
    };

    setTabs((currentTabs) => [...currentTabs, tab]);
    if (activateTab) {
      setActiveTabId(tab.id);
    }
  };

  const moveActiveTabHistory = (offset: -1 | 1) => {
    setTabs((currentTabs) =>
      currentTabs.map((tab) => {
        if (tab.id !== activeTabId) {
          return tab;
        }

        const historyIndex = tab.historyIndex + offset;
        const entry = tab.history[historyIndex];

        if (!entry) {
          return tab;
        }

        return {
          id: tab.id,
          ...entry,
          history: tab.history,
          historyIndex,
        };
      }),
    );
  };

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

  const addProjectBucket = (name: string) => {
    const nextName = name.trim();

    if (
      !activeTab.workspaceId ||
      !nextName ||
      hasDuplicateName(projectBuckets, nextName)
    ) {
      return false;
    }

    void createBucket({
      bucketId: crypto.randomUUID(),
      workspaceId: activeTab.workspaceId,
      name: nextName,
      statusType: 0,
    }).catch(() => undefined);

    return true;
  };

  const renameProjectBucket = (bucketId: string, name: string) => {
    const nextName = name.trim();
    const bucket = projectBuckets.find(
      (currentBucket) => currentBucket.id === bucketId
    );

    if (
      !bucket ||
      !nextName ||
      hasDuplicateName(projectBuckets, nextName, bucketId)
    ) {
      return false;
    }

    void updateBucket(bucketId, {
      name: nextName,
      statusType: bucket.status,
    })
      .then((updated) => {
        if (updated) {
          setProjectTasks((currentTasks) =>
            mapProjectTasks(currentTasks, (task) =>
              task.bucket === bucket.name ? { ...task, bucket: nextName } : task
            )
          );
        }
      })
      .catch(() => undefined);

    return true;
  };

  const deleteProjectBucket = (bucketId: string) => {
    if (sortedProjectBuckets.length <= 1) {
      return false;
    }

    const deletedBucket = sortedProjectBuckets.find(
      (bucket) => bucket.id === bucketId
    );
    const fallbackBucket = sortedProjectBuckets.find(
      (bucket) => bucket.id !== bucketId
    );

    if (!deletedBucket || !fallbackBucket) {
      return false;
    }

    void deleteBucket(bucketId)
      .then((deleted) => {
        if (deleted) {
          setProjectTasks((currentTasks) =>
            mapProjectTasks(currentTasks, (task) =>
              (task.bucket ?? sortedProjectBuckets[0]?.name ?? "") ===
              deletedBucket.name
                ? { ...task, bucket: fallbackBucket.name }
                : task
            )
          );
        }
      })
      .catch(() => undefined);

    return true;
  };

  const reorderProjectBucket = (
    sourceBucketId: string,
    targetBucketId: string,
    position: DropPosition
  ) => {
    if (!activeTab.workspaceId) {
      return;
    }
    const nextBuckets = [...sortedProjectBuckets];
    const sourceIndex = nextBuckets.findIndex(
      (bucket) => bucket.id === sourceBucketId
    );
    const targetIndex = nextBuckets.findIndex(
      (bucket) => bucket.id === targetBucketId
    );
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
      return;
    }
    const [sourceBucket] = nextBuckets.splice(sourceIndex, 1);
    const adjustedTargetIndex =
      sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    nextBuckets.splice(
      position === "after" ? adjustedTargetIndex + 1 : adjustedTargetIndex,
      0,
      sourceBucket,
    );
    void reorderBuckets(
      activeTab.workspaceId,
      nextBuckets.map((bucket) => bucket.id),
    ).catch(() => undefined);
  };

  const updateProjectBucketStatus = (
    bucketId: string,
    status: BucketStatus
  ) => {
    const bucket = projectBuckets.find((item) => item.id === bucketId);
    if (!bucket) {
      return;
    }
    void updateBucket(bucketId, {
      name: bucket.name,
      statusType: status,
    }).catch(() => undefined);
  };

  const addProjectMilestone = (name: string) => {
    const nextName = name.trim();

    if (
      !activeTab.workspaceId ||
      !nextName ||
      hasDuplicateName(projectMilestones, nextName)
    ) {
      return false;
    }

    void createMilestone({
      milestoneId: crypto.randomUUID(),
      workspaceId: activeTab.workspaceId,
      name: nextName,
    }).catch(() => undefined);

    return true;
  };

  const reorderProjectMilestone = (
    sourceMilestoneId: string,
    targetMilestoneId: string,
    position: DropPosition
  ) => {
    if (!activeTab.workspaceId) {
      return;
    }
    const nextMilestones = [...projectMilestones];
    const sourceIndex = nextMilestones.findIndex(
      (milestone) => milestone.id === sourceMilestoneId
    );
    const targetIndex = nextMilestones.findIndex(
      (milestone) => milestone.id === targetMilestoneId
    );
    if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
      return;
    }
    const [sourceMilestone] = nextMilestones.splice(sourceIndex, 1);
    const adjustedTargetIndex =
      sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
    nextMilestones.splice(
      position === "after" ? adjustedTargetIndex + 1 : adjustedTargetIndex,
      0,
      sourceMilestone,
    );
    void reorderMilestones(
      activeTab.workspaceId,
      nextMilestones.map((milestone) => milestone.id),
    ).catch(() => undefined);
  };

  const renameProjectMilestone = (milestoneId: string, name: string) => {
    const nextName = name.trim();
    const milestone = projectMilestones.find(
      (currentMilestone) => currentMilestone.id === milestoneId
    );

    if (
      !milestone ||
      !nextName ||
      hasDuplicateName(projectMilestones, nextName, milestoneId)
    ) {
      return false;
    }

    void updateMilestone(milestoneId, nextName)
      .then((updated) => {
        if (updated) {
          setProjectTasks((currentTasks) =>
            mapProjectTasks(currentTasks, (task) =>
              task.milestone === milestone.name
                ? { ...task, milestone: nextName }
                : task
            )
          );
        }
      })
      .catch(() => undefined);

    return true;
  };

  const deleteProjectMilestone = (milestoneId: string) => {
    if (projectMilestones.length <= 1) {
      return false;
    }

    const deletedMilestone = projectMilestones.find(
      (milestone) => milestone.id === milestoneId
    );
    const fallbackMilestone = projectMilestones.find(
      (milestone) => milestone.id !== milestoneId
    );

    if (!deletedMilestone || !fallbackMilestone) {
      return false;
    }

    void deleteMilestone(milestoneId)
      .then((deleted) => {
        if (deleted) {
          setProjectTasks((currentTasks) =>
            mapProjectTasks(currentTasks, (task) =>
              task.milestone === deletedMilestone.name
                ? { ...task, milestone: fallbackMilestone.name }
                : task
            )
          );
        }
      })
      .catch(() => undefined);

    return true;
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
