import { documentApi } from "@/features/document/documentApi";
import { searchLogApi } from "@/features/search/searchLogApi";
import { taskApi } from "@/features/task/taskApi";
import type { AppNavigation } from "@/hooks/useAppNavigation";
import type { NavigationEntry } from "@/hooks/useAppTabs";
import type { PageKey } from "@/pages/pageTypes";

type UseSearchNavigationOptions = {
  activeWorkspaceId?: string;
  navigateToDocumentRecord: AppNavigation["navigateToDocumentRecord"];
  pageTitles: Record<PageKey, string>;
  updateActiveTab: (entry: NavigationEntry) => void;
};

export function useSearchNavigation({
  activeWorkspaceId,
  navigateToDocumentRecord,
  pageTitles,
  updateActiveTab,
}: UseSearchNavigationOptions) {
  const handleSearch = (query: string) => {
    void searchLogApi.createWord(query).catch(() => undefined);
    updateActiveTab({
      page: "searchResult",
      searchQuery: query,
      title: pageTitles.searchResult,
      workspaceId: activeWorkspaceId,
    });
  };

  const openSearchDocument = (documentId: string) => {
    void searchLogApi.createDocument(documentId).catch(() => undefined);
    void documentApi
      .getById(documentId)
      .then((document) => {
        if (document) navigateToDocumentRecord(document);
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

  return { handleSearch, openSearchDocument, openSearchTask };
}

export type SearchNavigation = ReturnType<typeof useSearchNavigation>;
