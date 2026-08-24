import { invoke } from "@tauri-apps/api/core";
import type { TaskRecord } from "@/features/task/types";

export const taskApi = {
  getById(taskId: string) {
    return invoke<TaskRecord | null>("get_task_by_id", { taskId });
  },

  list(workspaceId: string) {
    return invoke<TaskRecord[]>("list_tasks", { workspaceId });
  },
};
