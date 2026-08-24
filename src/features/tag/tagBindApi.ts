import { invoke } from "@tauri-apps/api/core";
import type { Tag } from "@/features/tag/types";

export const tagBindApi = {
  listByTask(taskId: string) {
    return invoke<Tag[]>("list_tags_by_task", { taskId });
  },

  listByDocument(documentId: string) {
    return invoke<Tag[]>("list_tags_by_document", { documentId });
  },

  replaceTask(taskId: string, tagIds: string[]) {
    return invoke<Tag[]>("replace_task_tags", { taskId, tagIds });
  },

  replaceDocument(documentId: string, tagIds: string[]) {
    return invoke<Tag[]>("replace_document_tags", { documentId, tagIds });
  },
};
