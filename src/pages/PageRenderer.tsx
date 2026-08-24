import type { Dispatch, SetStateAction } from "react";
import type { AppNavigation } from "@/hooks/useAppNavigation";
import type { OpenTab } from "@/hooks/useAppTabs";
import type { ProjectStructure } from "@/hooks/useProjectStructure";
import type { SearchNavigation } from "@/hooks/useSearchNavigation";
import type { ProjectViewMode } from "@/hooks/useSettings";
import { DictionaryPage } from "@/pages/DictionaryPage/DictionaryPage";
import { DocumentPage } from "@/pages/DocumentPage/DocumentPage";
import { ProjectPage } from "@/pages/ProjectPage/ProjectPage";
import { ProjectSettingsPage } from "@/pages/ProjectSettingsPage/ProjectSettingsPage";
import { SearchPage } from "@/pages/Search/SearchPage";
import { SearchResult } from "@/pages/Search/SearchResult";
import { SettingsPage } from "@/pages/SettingsPage/SettingsPage";
import { TagSetting } from "@/pages/TagsManager/TagSetting";
import { TagsManager } from "@/pages/TagsManager/TagsManager";
import { TaskDocumentPage } from "@/pages/TaskDocumentPage";
import { TopPage } from "@/pages/TopPage/TopPage";
import { LibraryPage } from "@/pages/WorkspaceListPage/LibraryListPage";
import { ProjectListPage } from "@/pages/WorkspaceListPage/ProjectListPage";

type PageRendererProps = {
  activeTab: OpenTab;
  navigation: AppNavigation;
  projectStructure: ProjectStructure;
  projectViewMode: ProjectViewMode;
  searchNavigation: SearchNavigation;
  setProjectViewMode: Dispatch<SetStateAction<ProjectViewMode>>;
};

export function PageRenderer({
  activeTab,
  navigation,
  projectStructure,
  projectViewMode,
  searchNavigation,
  setProjectViewMode,
}: PageRendererProps) {
  const {
    navigateToDocumentRecord,
    navigateToLibraryDocument,
    navigateToPage,
    navigateToTag,
    navigateToTaskDocument,
    navigateToWorkspacePage,
    openDocumentRecordInNewTab,
    openLibraryDocumentInNewTab,
    openPageInNewTab,
    openTagInNewTab,
    openTaskDocumentInNewTab,
    openWorkspacePageInNewTab,
  } = navigation;
  const {
    addBucket,
    addMilestone,
    buckets,
    deleteBucket,
    deleteMilestone,
    milestones,
    projectTasks,
    renameBucket,
    renameMilestone,
    reorderBucket,
    reorderMilestone,
    setProjectTasks,
    updateBucketStatus,
  } = projectStructure;
  const { handleSearch, openSearchDocument, openSearchTask } = searchNavigation;

  switch (activeTab.page) {
    case "top":
      return (
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
      );
    case "search":
      return (
        <SearchPage
          initialQuery={activeTab.searchQuery ?? ""}
          onOpenDocument={openSearchDocument}
          onOpenTask={openSearchTask}
          onSearch={handleSearch}
        />
      );
    case "searchResult":
      return (
        <SearchResult
          onOpenDocument={openSearchDocument}
          onOpenTask={openSearchTask}
          query={activeTab.searchQuery ?? ""}
        />
      );
    case "projects":
      return (
        <ProjectListPage
          activeWorkspaceId={activeTab.workspaceId}
          onNavigate={navigateToWorkspacePage}
          onOpenInNewTab={openWorkspacePageInNewTab}
        />
      );
    case "project":
      return (
        <ProjectPage
          buckets={buckets}
          milestones={milestones}
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
          projectTitle={activeTab.title}
          projectTasks={projectTasks}
          setViewMode={setProjectViewMode}
          setProjectTasks={setProjectTasks}
          viewMode={projectViewMode}
          workspaceId={activeTab.workspaceId}
        />
      );
    case "projectSettings":
      return (
        <ProjectSettingsPage
          buckets={buckets}
          milestones={milestones}
          onAddBucket={addBucket}
          onAddMilestone={addMilestone}
          onDeleteBucket={deleteBucket}
          onDeleteMilestone={deleteMilestone}
          onNavigate={navigateToPage}
          onOpenProject={(workspace) =>
            navigateToWorkspacePage("project", workspace)
          }
          onOpenProjectInNewTab={(workspace) =>
            openWorkspacePageInNewTab("project", workspace)
          }
          onRenameBucket={renameBucket}
          onRenameMilestone={renameMilestone}
          onReorderBucket={reorderBucket}
          onReorderMilestone={reorderMilestone}
          onUpdateBucketStatus={updateBucketStatus}
          workspaceId={activeTab.workspaceId}
        />
      );
    case "library":
      return (
        <LibraryPage
          onOpenDocument={navigateToLibraryDocument}
          onOpenDocumentInNewTab={openLibraryDocumentInNewTab}
        />
      );
    case "projectDocument":
      return (
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
            projectTasks.find(
              (task) => task.subject === activeTab.documentTitle,
            )?.id
          }
          projectTasks={projectTasks}
          workspaceId={activeTab.workspaceId}
        />
      );
    case "taskDocument":
      return <TaskDocumentPage />;
    case "tags":
      return (
        <TagsManager
          onOpenTagInNewTab={openTagInNewTab}
          onSelectTag={navigateToTag}
        />
      );
    case "tagSetting":
      return (
        <TagSetting
          tagId={activeTab.tagId ?? ""}
          onBack={() => navigateToPage("tags")}
          onBackInNewTab={() => openPageInNewTab("tags")}
        />
      );
    case "dictionary":
      return <DictionaryPage />;
    case "settings":
      return (
        <SettingsPage
          onNavigate={navigateToPage}
          onOpenInNewTab={openPageInNewTab}
        />
      );
  }
}
