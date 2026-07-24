import { invoke } from "@tauri-apps/api/core";

import type {
  SearchDocumentLog,
  SearchSuggestion,
  SearchTaskLog,
  SearchWordLog,
} from "@/features/search/types";

export const searchLogApi = {
  createWord(searchWord: string) {
    return invoke<SearchWordLog>("create_search_word_log", {
      logId: crypto.randomUUID(),
      searchWord,
    });
  },

  createDocument(documentId: string) {
    return invoke<SearchDocumentLog>("create_search_document_log", {
      logId: crypto.randomUUID(),
      documentId,
    });
  },

  createTask(taskId: string) {
    return invoke<SearchTaskLog>("create_search_task_log", {
      logId: crypto.randomUUID(),
      taskId,
    });
  },

  listSuggestions(query: string, workspaceId?: string, limit = 10) {
    return invoke<SearchSuggestion[]>("list_search_suggestions", {
      query,
      workspaceId,
      limit,
    });
  },
};
