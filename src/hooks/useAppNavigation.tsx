import type { DocumentRecord } from "@/features/document/types";
import type { ProjectTask } from "@/features/task/projectTypes";
import type { Workspace } from "@/features/workspace/types";
import type { NavigationEntry } from "@/hooks/useAppTabs";
import type { PageKey } from "@/pages/pageTypes";

type UseAppNavigationOptions = {
  activeWorkspaceId?: string;
  addTab: (entry: NavigationEntry, activateTab?: boolean) => void;
  pageTitles: Record<PageKey, string>;
  updateActiveTab: (entry: NavigationEntry) => void;
};

export function useAppNavigation({
  activeWorkspaceId,
  addTab,
  pageTitles,
  updateActiveTab,
}: UseAppNavigationOptions) {
  const navigateToPage = (page: PageKey) => {
    updateActiveTab({
      page,
      title: pageTitles[page],
      workspaceId: activeWorkspaceId,
    });
  };

  const openPageInNewTab = (page: PageKey) => {
    addTab({
      page,
      title: pageTitles[page],
      workspaceId: activeWorkspaceId,
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
    addTab(
      {
        page: "projectDocument",
        taskId: task.id,
        title: task.subject,
        documentTitle: task.subject,
      },
      activateTab,
    );
  };

  const navigateToTaskDocument = (task: ProjectTask) => {
    updateActiveTab({
      page: "projectDocument",
      taskId: task.id,
      title: task.subject,
      documentTitle: task.subject,
    });
  };

  return {
    navigateToDocument,
    navigateToDocumentRecord,
    navigateToLibraryDocument,
    navigateToPage,
    navigateToTag,
    navigateToTaskDocument,
    navigateToWorkspacePage,
    openDocumentInNewTab,
    openDocumentRecordInNewTab,
    openLibraryDocumentInNewTab,
    openPageInNewTab,
    openTagInNewTab,
    openTaskDocumentInNewTab,
    openWorkspacePageInNewTab,
  };
}

export type AppNavigation = ReturnType<typeof useAppNavigation>;
