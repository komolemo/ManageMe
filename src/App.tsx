import { useEffect, useMemo, useRef, useState, type ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { AppLayout, type AppTab } from "@/layout/AppLayout";
import { ProjectListPage } from "@/pages/ProjectWorkplaceListPage";
import { ProjectPage } from "@/pages/ProjectPage";
import { ProjectSettingsPage } from "@/pages/ProjectSettingsPage/ProjectSettingsPage";
import type { DropPosition } from "@/pages/ProjectSettingsPage/useSettingsListDragAndDrop";
import { ProjectDocumentListPage } from "@/pages/DocumentWorkplaceListPage";
import { DocumentPage } from "@/pages/DocumentPage/DocumentPage";
import { SearchPage } from "@/pages/Search/SearchPage";
import { SearchResult } from "@/pages/Search/SearchResult";
import { SettingsPage } from "@/pages/SettingsPage";
import { TagSetting } from "@/pages/TagSetting";
import { TagsManager } from "@/pages/TagsManager";
import { TaskDocumentPage } from "@/pages/TaskDocumentPage";
import { TopPage } from "@/pages/TopPage";
import { DictionaryPage } from "@/pages/DictionaryPage";
import type { PageKey } from "@/pages/pageTypes";
import {
  defaultProjectBuckets,
  defaultProjectMilestones,
  tasks as initialProjectTasks,
  type BucketStatus,
  type ProjectBucket,
  type ProjectMilestone,
  type ProjectTask,
} from "@/pages/projectData";
import { tags } from "@/pages/tagsData";

type OpenTab = AppTab & {
  tagId?: string;
  taskId?: ProjectTask["id"];
  documentTitle?: string;
};

const pageTitleKeys: Record<PageKey, string> = {
  top: "pages.top",
  search: "pages.search",
  searchResult: "pages.searchResults",
  projects: "pages.projects",
  project: "pages.project",
  projectSettings: "pages.projectSettings",
  projectDocumentList: "pages.documentList",
  projectDocument: "pages.document",
  taskDocument: "pages.taskDocument",
  tags: "pages.tags",
  tagSetting: "pages.tagSetting",
  dictionary: "pages.dictionary",
  settings: "pages.settings",
};

const initialTab: OpenTab = {
  id: "tab-1",
  page: "top",
  title: "TOP",
};

function flattenProjectTasks(tasks: ProjectTask[]): ProjectTask[] {
  return tasks.flatMap((task) => [
    task,
    ...flattenProjectTasks(task.children ?? []),
  ]);
}

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

function createSettingId(name: string) {
  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [projectTasks, setProjectTasks] =
    useState<ProjectTask[]>(initialProjectTasks);
  const [projectBuckets, setProjectBuckets] =
    useState<ProjectBucket[]>(defaultProjectBuckets);
  const [projectMilestones, setProjectMilestones] =
    useState<ProjectMilestone[]>(defaultProjectMilestones);
  const nextTabNumber = useRef(2);
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const currentPage = activeTab.page;

  useEffect(() => {
    setTabs((currentTabs) => currentTabs.map((tab) =>
      tab.page === "projectDocument" && tab.documentTitle
        ? tab
        : { ...tab, title: pageTitles[tab.page] }
    ));
  }, [pageTitles]);
  const flatProjectTasks = useMemo(
    () => flattenProjectTasks(projectTasks),
    [projectTasks]
  );
  const sortedProjectBuckets = useMemo(
    () => [...projectBuckets].sort((a, b) => a.order - b.order),
    [projectBuckets]
  );

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

  const addTab = (
    nextTab: Omit<OpenTab, "id">,
    activateTab = true,
  ) => {
    const tab = {
      id: createTabId(),
      ...nextTab,
    };

    setTabs((currentTabs) => [...currentTabs, tab]);
    if (activateTab) {
      setActiveTabId(tab.id);
    }
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
    setSearchQuery(query);
    navigateToPage("searchResult");
  };

  const addProjectBucket = (name: string) => {
    const nextName = name.trim();

    if (!nextName || hasDuplicateName(projectBuckets, nextName)) {
      return false;
    }

    setProjectBuckets((currentBuckets) => [
      ...currentBuckets,
      {
        id: createSettingId(nextName),
        name: nextName,
        order: currentBuckets.length + 1,
        status: 0,
      },
    ]);

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

    setProjectBuckets((currentBuckets) =>
      currentBuckets.map((currentBucket) =>
        currentBucket.id === bucketId
          ? { ...currentBucket, name: nextName }
          : currentBucket
      )
    );
    setProjectTasks((currentTasks) =>
      mapProjectTasks(currentTasks, (task) =>
        task.bucket === bucket.name ? { ...task, bucket: nextName } : task
      )
    );

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

    const deletedBucketTaskExists = flatProjectTasks.some(
      (task) =>
        (task.bucket ?? sortedProjectBuckets[0]?.name ?? "") ===
        deletedBucket.name
    );

    const deleteBucketMessage = deletedBucketTaskExists
      ? t("projectSettings.moveBucketTasks", {
          bucketName: deletedBucket.name,
          fallbackBucketName: fallbackBucket.name,
        })
      : t("projectSettings.confirmDeleteBucket", { bucketName: deletedBucket.name });

    if (!window.confirm(deleteBucketMessage)) {
      return true;
    }

    setProjectBuckets((currentBuckets) =>
      currentBuckets
        .filter((bucket) => bucket.id !== bucketId)
        .sort((a, b) => a.order - b.order)
        .map((bucket, index) => ({ ...bucket, order: index + 1 }))
    );
    setProjectTasks((currentTasks) =>
      mapProjectTasks(currentTasks, (task) =>
        (task.bucket ?? sortedProjectBuckets[0]?.name ?? "") ===
        deletedBucket.name
          ? { ...task, bucket: fallbackBucket.name }
          : task
      )
    );

    return true;
  };

  const reorderProjectBucket = (
    sourceBucketId: string,
    targetBucketId: string,
    position: DropPosition
  ) => {
    setProjectBuckets((currentBuckets) => {
      const nextBuckets = [...currentBuckets].sort((a, b) => a.order - b.order);
      const sourceIndex = nextBuckets.findIndex(
        (bucket) => bucket.id === sourceBucketId
      );
      const targetIndex = nextBuckets.findIndex(
        (bucket) => bucket.id === targetBucketId
      );

      if (
        sourceIndex < 0 ||
        targetIndex < 0 ||
        sourceIndex === targetIndex
      ) {
        return currentBuckets;
      }

      const [sourceBucket] = nextBuckets.splice(sourceIndex, 1);
      const adjustedTargetIndex = sourceIndex < targetIndex
        ? targetIndex - 1
        : targetIndex;
      const nextTargetIndex =
        position === "after" ? adjustedTargetIndex + 1 : adjustedTargetIndex;
      nextBuckets.splice(nextTargetIndex, 0, sourceBucket);

      return nextBuckets.map((bucket, index) => ({
        ...bucket,
        order: index + 1,
      }));
    });
  };

  const updateProjectBucketStatus = (
    bucketId: string,
    status: BucketStatus
  ) => {
    setProjectBuckets((currentBuckets) =>
      currentBuckets.map((bucket) =>
        bucket.id === bucketId ? { ...bucket, status } : bucket
      )
    );
  };

  const addProjectMilestone = (name: string) => {
    const nextName = name.trim();

    if (!nextName || hasDuplicateName(projectMilestones, nextName)) {
      return false;
    }

    setProjectMilestones((currentMilestones) => [
      ...currentMilestones,
      { id: createSettingId(nextName), name: nextName },
    ]);

    return true;
  };

  const reorderProjectMilestone = (
    sourceMilestoneId: string,
    targetMilestoneId: string,
    position: DropPosition
  ) => {
    setProjectMilestones((currentMilestones) => {
      const nextMilestones = [...currentMilestones];
      const sourceIndex = nextMilestones.findIndex(
        (milestone) => milestone.id === sourceMilestoneId
      );
      const targetIndex = nextMilestones.findIndex(
        (milestone) => milestone.id === targetMilestoneId
      );

      if (
        sourceIndex < 0 ||
        targetIndex < 0 ||
        sourceIndex === targetIndex
      ) {
        return currentMilestones;
      }

      const [sourceMilestone] = nextMilestones.splice(sourceIndex, 1);
      const adjustedTargetIndex = sourceIndex < targetIndex
        ? targetIndex - 1
        : targetIndex;
      const nextTargetIndex =
        position === "after" ? adjustedTargetIndex + 1 : adjustedTargetIndex;
      nextMilestones.splice(nextTargetIndex, 0, sourceMilestone);

      return nextMilestones;
    });
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

    setProjectMilestones((currentMilestones) =>
      currentMilestones.map((currentMilestone) =>
        currentMilestone.id === milestoneId
          ? { ...currentMilestone, name: nextName }
          : currentMilestone
      )
    );
    setProjectTasks((currentTasks) =>
      mapProjectTasks(currentTasks, (task) =>
        task.milestone === milestone.name
          ? { ...task, milestone: nextName }
          : task
      )
    );

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

    const deletedMilestoneTaskExists = flatProjectTasks.some(
      (task) => task.milestone === deletedMilestone.name
    );

    if (
      deletedMilestoneTaskExists &&
      !window.confirm(
        t("projectSettings.moveMilestoneTasks", {
          milestoneName: deletedMilestone.name,
          fallbackMilestoneName: fallbackMilestone.name,
        })
      )
    ) {
      return true;
    }

    setProjectMilestones((currentMilestones) =>
      currentMilestones.filter((milestone) => milestone.id !== milestoneId)
    );
    setProjectTasks((currentTasks) =>
      mapProjectTasks(currentTasks, (task) =>
        task.milestone === deletedMilestone.name
          ? { ...task, milestone: fallbackMilestone.name }
          : task
      )
    );

    return true;
  };

  const pages: Record<PageKey, ReactElement> = {
    top: <TopPage onNavigate={navigateToPage} tasks={projectTasks} />,
    search: <SearchPage initialQuery={searchQuery} onSearch={handleSearch} />,
    searchResult: <SearchResult query={searchQuery} />,
    projects: (
      <ProjectListPage
        onNavigate={navigateToPage}
        onOpenInNewTab={openPageInNewTab}
      />
    ),
    project: (
      <ProjectPage
        buckets={sortedProjectBuckets}
        milestones={projectMilestones}
        onNavigate={navigateToPage}
        onOpenInNewTab={openPageInNewTab}
        onOpenTask={navigateToTaskDocument}
        onOpenTaskInNewTab={openTaskDocumentInNewTab}
        onSearchTag={handleSearch}
        projectTasks={projectTasks}
        setProjectTasks={setProjectTasks}
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
        onRenameBucket={renameProjectBucket}
        onRenameMilestone={renameProjectMilestone}
        onReorderBucket={reorderProjectBucket}
        onReorderMilestone={reorderProjectMilestone}
        onUpdateBucketStatus={updateProjectBucketStatus}
      />
    ),
    projectDocumentList: (
      <ProjectDocumentListPage
        onOpenDocument={navigateToDocument}
        onOpenDocumentInNewTab={openDocumentInNewTab}
      />
    ),
    projectDocument: (
      <DocumentPage
        documentTitle={activeTab.documentTitle}
        onOpenProject={() => navigateToPage("project")}
        onOpenTask={navigateToTaskDocument}
        onOpenTaskInNewTab={(task) =>
          openTaskDocumentInNewTab(task, false)
        }
        taskId={
          activeTab.taskId ??
          projectTasks.find((task) => task.subject === activeTab.documentTitle)?.id
        }
        projectTasks={projectTasks}
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
        tagId={activeTab.tagId ?? tags[0]?.id ?? ""}
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
    <AppLayout
      activeTabId={activeTabId}
      currentPage={currentPage}
      onCloseTab={closeTab}
      onNavigate={navigateToPage}
      onOpenInNewTab={openPageInNewTab}
      onOpenDocument={navigateToDocument}
      onOpenDocumentInNewTab={openDocumentInNewTab}
      onSearch={handleSearch}
      onSelectTab={setActiveTabId}
      tabs={tabs}
    >
      {pages[currentPage]}
    </AppLayout>
  );
}

export default App;
